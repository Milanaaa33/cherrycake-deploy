import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";

import { api } from "../api/client";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { useTranslation } from "../i18n/useTranslation";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Button from "../components/ui/Button";

// Response of GET /api/time-slots?date=YYYY-MM-DD (the same slots are used for orders).
type TimeSlot = {
  id: number;
  startTime: string;
  endTime: string;
  capacity: number;
  remaining: number;
  isAvailable: boolean;
};

function slotLabel(slot: TimeSlot): string {
  return `${slot.startTime}–${slot.endTime}`;
}

type BookingResponse = {
  bookingNumber: string;
  tableNumber: number;
  date: string;
  time: string;
  guestsCount: number;
};

type Field = "date" | "timeSlotId" | "guestsCount" | "name" | "phone" | "email";

type FormErrors = Partial<Record<Field, string>>;

function todayLocal(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);

  return local.toISOString().slice(0, 10);
}

export default function Booking() {
  const { t } = useTranslation();
  const region = useSelector((state: RootState) => state.region.code);
  const [date, setDate] = useState(todayLocal);
  const [timeSlotId, setTimeSlotId] = useState("");
  const [guestsCount, setGuestsCount] = useState("1");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [slotsError, setSlotsError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const [confirmation, setConfirmation] = useState<BookingResponse | null>(
    null,
  );

  useEffect(() => {
    const controller = new AbortController();

    if (!date || date < todayLocal()) {
      return () => controller.abort();
    }

    async function loadSlots() {
      try {
        const response = await api.get<TimeSlot[]>("/time-slots", {
          params: { date },
          signal: controller.signal,
        });

        if (!Array.isArray(response.data)) {
          throw new Error("Invalid time slots response");
        }

        if (!controller.signal.aborted) {
          setSlots(response.data);
        }
      } catch (error) {
        if (controller.signal.aborted || axios.isCancel(error)) {
          return;
        }

        setSlotsError(
          t("booking.slotsLoadError", "Could not load available times. Please try again."),
        );
      } finally {
        if (!controller.signal.aborted) {
          setSlotsLoading(false);
        }
      }
    }

    void loadSlots();

    return () => controller.abort();
    // Only the date triggers a reload; `t` is stable per language and must not refetch the slots.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const timeOptions = [
    {
      value: "",
      label: slotsLoading
        ? t("booking.loadingTimes", "Loading available times...")
        : t("booking.chooseTime", "Choose a time"),
      disabled: true,
    },
    ...slots.map((slot) => ({
      value: String(slot.id),
      label: slot.isAvailable
        ? slotLabel(slot)
        : t("booking.slotUnavailable", "{slot} (unavailable)", { slot: slotLabel(slot) }),
      disabled: !slot.isAvailable,
    })),
  ];

  const guestOptions = Array.from({ length: 12 }, (_, index) => ({
    value: String(index + 1),
    label: String(index + 1),
  }));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FormErrors = {};
    const guests = Number(guestsCount);
    const selectedSlot = slots.find((slot) => String(slot.id) === timeSlotId);

    if (!date || date < todayLocal()) {
      nextErrors.date = t("booking.errorDate", "Choose today or a future date.");
    }

    if (!selectedSlot || !selectedSlot.isAvailable) {
      nextErrors.timeSlotId = t("booking.errorTime", "Choose an available time.");
    }

    if (!Number.isInteger(guests) || guests < 1 || guests > 12) {
      nextErrors.guestsCount = t("booking.errorGuests", "Choose 1 to 12 guests.");
    }

    if (!name.trim()) {
      nextErrors.name = t("booking.errorName", "Name is required.");
    }

    if (!/^\+?[\d\s()-]{7,20}$/.test(phone.trim())) {
      nextErrors.phone = t("booking.errorPhone", "Enter a valid phone number.");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = t("booking.errorEmail", "Enter a valid email address.");
    }

    setErrors(nextErrors);
    setSubmitError("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.post<BookingResponse>("/bookings", {
        date,
        timeSlotId: Number(timeSlotId),
        guestsCount: guests,
        customer: {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
        },
        region,
      });

      setConfirmation(response.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setSubmitError(
          t(
            "booking.slotTaken",
            "Selected time slot is no longer available. Please choose another time.",
          ),
        );

        setSlots((previous) =>
          previous.map((slot) =>
            String(slot.id) === timeSlotId
              ? { ...slot, isAvailable: false }
              : slot,
          ),
        );

        setTimeSlotId("");
      } else {
        setSubmitError(t("booking.failed", "Booking failed. Please try again."));
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmation) {
    return (
      <section
        style={{
          maxWidth: 600,
          margin: "32px auto",
          padding: 24,
        }}
      >
        <h1>{t("booking.confirmedTitle", "Booking confirmed!")}</h1>
        <p>{t("booking.confirmedText", "Your table has been successfully booked.")}</p>

        <p>
          <strong>{t("booking.bookingNumber", "Booking number:")}</strong> {confirmation.bookingNumber}
        </p>

        <p>
          <strong>{t("booking.tableNumber", "Table number:")}</strong> {confirmation.tableNumber}
        </p>

        <p>
          <strong>{t("booking.dateLabel", "Date:")}</strong> {confirmation.date}
        </p>

        <p>
          <strong>{t("booking.timeLabel", "Time:")}</strong> {confirmation.time}
        </p>

        <p>
          <strong>{t("booking.guestsLabel", "Guests:")}</strong> {confirmation.guestsCount}
        </p>
      </section>
    );
  }

  return (
    <section
      style={{
        maxWidth: 600,
        margin: "32px auto",
        padding: 24,
      }}
    >
      <h1>{t("booking.title", "Book a Table")}</h1>
      <p>{t("booking.subtitle", "Choose your preferred date and time.")}</p>

      <form
        onSubmit={handleSubmit}
        noValidate
        style={{
          display: "grid",
          gap: 18,
          marginTop: 24,
        }}
      >
        <Input
          label={t("booking.date", "Booking date")}
          type="date"
          value={date}
          min={todayLocal()}
          required
          error={errors.date}
          onChange={(event) => {
            const nextDate = event.target.value;
            const validDate = Boolean(nextDate) && nextDate >= todayLocal();

            setDate(nextDate);
            setTimeSlotId("");
            setSlots([]);
            setSlotsError(
              validDate ? "" : t("booking.invalidDate", "Please choose a valid date."),
            );
            setSlotsLoading(validDate);
            setErrors({});
            setSubmitError("");
          }}
        />

        <Select
          label={t("booking.availableTime", "Available time")}
          value={timeSlotId}
          options={timeOptions}
          disabled={slotsLoading || Boolean(slotsError)}
          error={errors.timeSlotId}
          onChange={(event) => setTimeSlotId(event.target.value)}
        />

        {slotsError && (
          <p role="alert" style={{ color: "crimson" }}>
            {slotsError}
          </p>
        )}

        {!slotsLoading &&
          !slotsError &&
          slots.every((slot) => !slot.isAvailable) && (
            <p role="status">
              {t("booking.noSlots", "No available time slots for this date.")}
            </p>
          )}

        <Select
          label={t("booking.guests", "Number of guests")}
          value={guestsCount}
          options={guestOptions}
          error={errors.guestsCount}
          onChange={(event) => setGuestsCount(event.target.value)}
        />

        <Input
          label={t("booking.fullName", "Full name")}
          value={name}
          required
          error={errors.name}
          onChange={(event) => setName(event.target.value)}
        />

        <Input
          label={t("booking.phone", "Phone number")}
          type="tel"
          value={phone}
          required
          error={errors.phone}
          onChange={(event) => setPhone(event.target.value)}
        />

        <Input
          label={t("booking.email", "Email")}
          type="email"
          value={email}
          required
          error={errors.email}
          onChange={(event) => setEmail(event.target.value)}
        />

        {submitError && (
          <p role="alert" style={{ color: "crimson" }}>
            {submitError}
          </p>
        )}

        <Button
          type="submit"
          loading={submitting}
          disabled={
            slotsLoading ||
            Boolean(slotsError) ||
            !slots.some((slot) => slot.isAvailable)
          }
        >
          {t("booking.confirm", "Confirm Booking")}
        </Button>
      </form>
    </section>
  );
}
