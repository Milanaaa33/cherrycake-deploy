// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { AxiosResponse } from "axios";

import Booking from "./Booking";
import { api } from "../api/client";

vi.mock("../api/client", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const slots = [
  { timeSlotId: 7, time: "16:00", isAvailable: true },
  { timeSlotId: 8, time: "17:00", isAvailable: false },
];

async function fillValidForm() {
  await screen.findByRole("option", { name: "16:00" });

  fireEvent.change(screen.getByLabelText("Available time"), {
    target: { value: "7" },
  });

  fireEvent.change(screen.getByLabelText("Full name"), {
    target: { value: "Test User" },
  });

  fireEvent.change(screen.getByLabelText("Phone number"), {
    target: { value: "+998901234567" },
  });

  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "test@example.com" },
  });
}

describe("Booking page", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    vi.mocked(api.get).mockResolvedValue({
      data: slots,
    } as AxiosResponse);
  });

  afterEach(() => {
    cleanup();
  });

  it("blocks unavailable time slots", async () => {
    render(<Booking />);

    const unavailable = await screen.findByRole("option", {
      name: "17:00 (unavailable)",
    });

    expect(unavailable.hasAttribute("disabled")).toBe(true);
  });

  it("prevents submitting an incomplete form", async () => {
    render(<Booking />);

    await screen.findByRole("option", { name: "16:00" });

    fireEvent.click(
      screen.getByRole("button", { name: "Confirm Booking" }),
    );

    expect(await screen.findByText("Name is required.")).toBeTruthy();
    expect(api.post).not.toHaveBeenCalled();
  });

  it("displays booking confirmation after successful POST", async () => {
    vi.mocked(api.post).mockResolvedValue({
      status: 201,
      data: {
        bookingNumber: "BK-123",
        tableNumber: 4,
        date: "2099-12-10",
        time: "16:00",
        guestsCount: 1,
      },
    } as AxiosResponse);

    render(<Booking />);
    await fillValidForm();

    fireEvent.click(
      screen.getByRole("button", { name: "Confirm Booking" }),
    );

    expect(await screen.findByText("Booking confirmed!")).toBeTruthy();
    expect(screen.getByText("BK-123")).toBeTruthy();

    expect(api.post).toHaveBeenCalledWith(
      "/bookings",
      expect.objectContaining({
        timeSlotId: 7,
        guestsCount: 1,
        customer: {
          name: "Test User",
          phone: "+998901234567",
          email: "test@example.com",
        },
      }),
    );
  });

  it("handles 409 Conflict without creating a confirmation", async () => {
    vi.mocked(api.post).mockRejectedValue({
      isAxiosError: true,
      response: { status: 409 },
    });

    render(<Booking />);
    await fillValidForm();

    fireEvent.click(
      screen.getByRole("button", { name: "Confirm Booking" }),
    );

    expect(
      await screen.findByText(
        "Selected time slot is no longer available. Please choose another time.",
      ),
    ).toBeTruthy();

    expect(screen.queryByText("Booking confirmed!")).toBeNull();

    const unavailable = screen.getByRole("option", {
      name: "16:00 (unavailable)",
    });

    expect(unavailable.hasAttribute("disabled")).toBe(true);
  });
});
