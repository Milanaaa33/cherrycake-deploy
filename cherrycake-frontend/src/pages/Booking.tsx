import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";

import { api } from "../api/client";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { getAuthEmail } from "../utils/auth";
import { useTranslation } from "../i18n/useTranslation";
import Input from "../components/ui/Input";
import CustomSelect from "../components/ui/CustomSelect";
import DatePicker from "../components/ui/DatePicker";
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
  const [guestsCount, setGuestsCount] = useState("2");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(() => getAuthEmail() ?? "");

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

  return (
    <section
      className="booking-page"
      style={{
        padding: "var(--space-6) var(--space-4)",
        maxWidth: "660px",
        margin: "0 auto",
      }}
    >
      {/* Page Header */}
      <div style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>
        <span
          style={{
            fontSize: "var(--font-size-xs)",
            textTransform: "uppercase",
            letterSpacing: "0.25em",
            color: "var(--sakura-pink)",
            fontWeight: 700,
            display: "block",
            marginBottom: "6px",
          }}
        >
          {t("booking.eyebrow", "Flagship Hospitality")}
        </span>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(2rem, 3.5vw, 2.6rem)",
            color: "var(--cheesecake-cream)",
            margin: "0 0 8px",
          }}
        >
          {t("booking.title", "Table Reservation")}
        </h1>
        <p style={{ color: "var(--text-dim)", fontSize: "0.95rem", margin: 0 }}>
          {t("booking.subtitle", "Reserve your table at Cherry Café for an enchanting pastry & barista experience.")}
        </p>
      </div>

      {confirmation ? (
        <div
          className="booking-card"
          style={{
            background: "var(--cherry-card)",
            border: "2px solid var(--cherry-border-glow)",
            borderRadius: "20px",
            padding: "36px 28px",
            textAlign: "center",
            boxShadow: "0 16px 40px rgba(0, 0, 0, 0.3)",
          }}
        >
          <div style={{ marginBottom: "16px", display: "flex", justifyContent: "center" }}>
            <img
              src="/TransparentSakuraFlower.png"
              alt="Sakura"
              style={{
                width: "60px",
                height: "60px",
                objectFit: "contain",
                filter: "drop-shadow(0 4px 12px rgba(230, 57, 96, 0.4))",
              }}
            />
          </div>
          <span
            style={{
              backgroundColor: "rgba(56, 193, 114, 0.2)",
              color: "var(--mint-fresh)",
              padding: "4px 14px",
              borderRadius: "999px",
              fontWeight: 700,
              fontSize: "0.85rem",
              display: "inline-block",
              marginBottom: "14px",
            }}
          >
            {t("booking.confirmedTitle", "Booking confirmed!")}
          </span>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "var(--cheesecake-cream)",
              fontSize: "1.8rem",
              margin: "0 0 10px",
            }}
          >
            {t("booking.confirmedText", "Your table has been successfully booked.")}
          </h2>
          <p style={{ color: "var(--text-dim)", fontSize: "0.95rem", marginBottom: "20px" }}>
            {t("booking.bookingNumber", "Booking number:")}{" "}
            <strong data-testid="booking-number" style={{ color: "var(--sakura-pink)", fontSize: "1.1rem" }}>
              {confirmation.bookingNumber}
            </strong>
          </p>

          <div
            style={{
              background: "var(--color-surface-soft)",
              border: "2px solid var(--cherry-border)",
              borderRadius: "14px",
              padding: "16px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: "12px",
              marginBottom: "24px",
              textAlign: "center",
            }}
          >
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                {t("booking.tableNumber", "Table number:")}
              </div>
              <strong style={{ color: "var(--crust-gold)", fontSize: "0.98rem" }}>
                #{confirmation.tableNumber}
              </strong>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                {t("booking.dateLabel", "Date:")} &amp; {t("booking.timeLabel", "Time:")}
              </div>
              <strong style={{ color: "var(--text-main)", fontSize: "0.98rem" }}>
                {confirmation.date} · {confirmation.time}
              </strong>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                {t("booking.guestsLabel", "Guests:")}
              </div>
              <strong style={{ color: "var(--text-main)", fontSize: "0.98rem" }}>
                {confirmation.guestsCount}
              </strong>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => {
              setConfirmation(null);
              setTimeSlotId("");
            }}
          >
            {t("booking.bookAnother", "Book Another Table")}
          </Button>
        </div>
      ) : (
        <div
          className="booking-card"
          style={{
            background: "var(--cherry-card)",
            border: "2px solid var(--cherry-border)",
            borderRadius: "20px",
            padding: "32px 28px",
            boxShadow: "0 16px 40px rgba(0, 0, 0, 0.25)",
          }}
        >
          {submitError && (
            <div
              role="alert"
              data-testid="booking-conflict-error"
              style={{
                padding: "14px",
                backgroundColor: "rgba(230, 57, 96, 0.15)",
                border: "2px solid var(--raspberry-coulis)",
                color: "var(--color-error)",
                borderRadius: "10px",
                marginBottom: "20px",
                fontSize: "0.9rem",
                fontWeight: 600,
              }}
            >
              {submitError}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            noValidate
            style={{
              display: "grid",
              gap: 18,
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
              <DatePicker
                label={t("booking.date", "Booking date")}
                value={date}
                min={todayLocal()}
                error={errors.date}
                onChange={(nextDate) => {
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

              <CustomSelect
                label={t("booking.availableTime", "Available time")}
                value={timeSlotId}
                options={timeOptions}
                disabled={slotsLoading || Boolean(slotsError)}
                error={errors.timeSlotId}
                onChange={(value) => setTimeSlotId(value)}
              />
            </div>

            {slotsError && (
              <p role="alert" style={{ color: "var(--color-error)", margin: 0 }}>
                {slotsError}
              </p>
            )}

            {!slotsLoading &&
              !slotsError &&
              slots.every((slot) => !slot.isAvailable) && (
                <p role="status" style={{ margin: 0, color: "var(--text-dim)" }}>
                  {t("booking.noSlots", "No available time slots for this date.")}
                </p>
              )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
              <CustomSelect
                label={t("booking.guests", "Number of guests")}
                value={guestsCount}
                options={guestOptions}
                error={errors.guestsCount}
                onChange={(value) => setGuestsCount(value)}
              />

              <Input
                label={t("booking.fullName", "Full name")}
                value={name}
                required
                error={errors.name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
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
            </div>

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
        </div>
      )}
    </section>
  );
}
