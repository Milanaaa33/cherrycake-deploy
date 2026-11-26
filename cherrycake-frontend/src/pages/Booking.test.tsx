import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render as rtlRender, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { AxiosError, AxiosHeaders } from 'axios';
import type { ReactElement } from 'react';
import Booking from './Booking';
import { store } from '../store';

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}));

vi.mock('../api/client', () => ({
  api: {
    get: mocks.get,
    post: mocks.post,
  },
}));

const render = (ui: ReactElement) => rtlRender(<Provider store={store}>{ui}</Provider>);

const sampleSlots = [
  { id: 1, startTime: '12:00', endTime: '13:00', capacity: 5, remaining: 4, isAvailable: true },
  { id: 2, startTime: '14:00', endTime: '15:00', capacity: 5, remaining: 0, isAvailable: false },
];

describe('CC-74: Table Booking page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.get.mockResolvedValue({ data: sampleSlots });
  });

  afterEach(() => {
    cleanup();
  });

  it('loads available and unavailable time slots cleanly', async () => {
    render(<Booking />);

    const openOption = (await screen.findByRole('option', { name: '12:00–13:00' })) as HTMLOptionElement;
    const closedOption = screen.getByRole('option', { name: '14:00–15:00 (unavailable)' }) as HTMLOptionElement;

    expect(openOption.disabled).toBe(false);
    expect(closedOption.disabled).toBe(true);
  });

  it('shows inline validation errors for empty and malformed fields', async () => {
    render(<Booking />);
    await screen.findByRole('option', { name: '12:00–13:00' });

    fireEvent.change(screen.getByLabelText('Phone number'), { target: { value: 'abc' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'bad-email' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Booking' }));

    expect(screen.getByText('Choose an available time.')).toBeTruthy();
    expect(screen.getByText('Name is required.')).toBeTruthy();
    expect(screen.getByText('Enter a valid phone number.')).toBeTruthy();
    expect(screen.getByText('Enter a valid email address.')).toBeTruthy();
    expect(mocks.post).not.toHaveBeenCalled();
  });

  it('submits valid booking and displays confirmation details', async () => {
    mocks.post.mockResolvedValue({
      data: {
        bookingNumber: 'BK-2026-0007',
        tableNumber: 3,
        date: '2026-12-31',
        time: '12:00–13:00',
        guestsCount: 4,
      },
    });

    render(<Booking />);
    await screen.findByRole('option', { name: '12:00–13:00' });

    fireEvent.change(screen.getByLabelText('Available time'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Number of guests'), { target: { value: '4' } });
    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Leyla Mammadova' } });
    fireEvent.change(screen.getByLabelText('Phone number'), { target: { value: '+995555123456' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'leyla@example.com' } });

    fireEvent.click(screen.getByRole('button', { name: 'Confirm Booking' }));

    await screen.findByText('Booking confirmed!');
    expect(screen.getByText('BK-2026-0007')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
  });

  it('handles 409 slot conflict by displaying alert and disabling taken slot', async () => {
    mocks.post.mockRejectedValue(
      new AxiosError('Slot taken', 'ERR_BAD_REQUEST', undefined, undefined, {
        status: 409,
        statusText: 'Conflict',
        headers: new AxiosHeaders(),
        config: { headers: new AxiosHeaders() },
        data: { message: 'No tables available' },
      }),
    );

    render(<Booking />);
    await screen.findByRole('option', { name: '12:00–13:00' });

    fireEvent.change(screen.getByLabelText('Available time'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Leyla Mammadova' } });
    fireEvent.change(screen.getByLabelText('Phone number'), { target: { value: '+995555123456' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'leyla@example.com' } });

    fireEvent.click(screen.getByRole('button', { name: 'Confirm Booking' }));

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain('no longer available');
    });
    expect(
      (screen.getByRole('option', { name: '12:00–13:00 (unavailable)' }) as HTMLOptionElement).disabled,
    ).toBe(true);
  });
});
