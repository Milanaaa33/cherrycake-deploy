import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render as rtlRender, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import type { ReactElement } from 'react';
import Checkout from './Checkout';
import { addToCart, clearCart, store } from '../store';

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock('../api/client', () => ({
  api: {
    get: mocks.get,
    post: mocks.post,
  },
}));

vi.mock('../utils/auth', () => ({
  getAuthEmail: () => null,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mocks.navigate,
  };
});

const render = (ui: ReactElement) =>
  rtlRender(
    <Provider store={store}>
      <MemoryRouter>{ui}</MemoryRouter>
    </Provider>,
  );

const sampleCalc = {
  items: [{ productId: 1, unitPrice: 360000, modifiersPrice: 120000, quantity: 1, lineTotal: 480000 }],
  subtotal: 480000,
  vatRate: 0.15,
  vatAmount: 72000,
  amountInclVat: 552000,
  discountRate: 0.03,
  discountAmount: 16560,
  deliveryFee: 0,
  total: 535440,
  currencyCode: 'UZS',
};

describe('CC-48: Checkout form validation & order placement', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
    store.dispatch(clearCart());
    store.dispatch(
      addToCart({
        productId: 1,
        name: 'Cherry Cake',
        quantity: 1,
        modifierIds: [2],
        photoUrl: null,
      }),
    );

    mocks.get.mockImplementation((url: string) => {
      if (url === '/pickup-points') {
        return Promise.resolve({
          data: [{ id: 1, name: 'Cherry Cake City', address: 'Amir Temur 15', openingHours: '09:00-21:00' }],
        });
      }
      if (url === '/delivery-zones') {
        return Promise.resolve({
          data: [{ id: 1, name: 'Center', deliveryFee: 15000, currencyCode: 'UZS' }],
        });
      }
      if (url === '/time-slots') {
        return Promise.resolve({
          data: [{ id: 1, startTime: '12:00', endTime: '14:00', remaining: 4, isAvailable: true }],
        });
      }
      return Promise.resolve({ data: [] });
    });

    mocks.post.mockImplementation((url: string) => {
      if (url === '/cart/calculate') {
        return Promise.resolve({ data: sampleCalc });
      }
      if (url === '/orders') {
        return Promise.resolve({
          data: {
            orderNumber: 'CC-2026-000101',
            orderDate: '2026-12-31',
            region: 'UZB',
            customer: { name: 'Malika Karimova', phone: '+998901234567', email: 'malika@example.com' },
            total: 550440,
            currencyCode: 'UZS',
          },
        });
      }
      return Promise.resolve({ data: {} });
    });
  });

  afterEach(() => {
    cleanup();
    store.dispatch(clearCart());
    localStorage.clear();
  });

  it('shows inline validation errors for empty and malformed contact fields', async () => {
    render(<Checkout />);
    await screen.findByText('Cherry Cake');

    // Empty submission
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }));
    expect(screen.getByText('Please enter your name.')).toBeTruthy();
    expect(screen.getByText('Please enter your phone number.')).toBeTruthy();
    expect(screen.getByText('Please enter your email address.')).toBeTruthy();

    // Invalid formats
    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'A' } });
    fireEvent.change(screen.getByLabelText('Phone number'), { target: { value: '12' } });
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'bad-email' } });
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }));

    expect(screen.getByText('Name must contain at least 2 characters.')).toBeTruthy();
    expect(screen.getByText('Phone must contain 7 to 15 digits, with an optional leading +.')).toBeTruthy();
    expect(screen.getByText('Please enter a valid email address.')).toBeTruthy();
  });

  it('completes full checkout flow and handles 409 API error cleanly', async () => {
    render(<Checkout />);
    await screen.findByText(/15%/);

    // Step 1: Contact
    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Malika Karimova' } });
    fireEvent.change(screen.getByLabelText('Phone number'), { target: { value: '+998 90 123 45 67' } });
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'malika@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }));

    // Step 2: Fulfillment & Slot
    await screen.findByLabelText('Delivery area');
    fireEvent.change(screen.getByLabelText('Delivery area'), { target: { value: '1' } });
    const slotBtn = await screen.findByRole('radio', { name: /12:00–14:00/ });
    fireEvent.click(slotBtn);
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }));

    // Step 3: API 409 error shows explicit alert instead of blank screen
    await screen.findByText('Confirm your order');
    mocks.post.mockImplementationOnce((url: string) => {
      if (url === '/orders') {
        return Promise.reject({ response: { status: 409, data: { message: 'Time slot is full' } } });
      }
      return Promise.resolve({ data: sampleCalc });
    });

    fireEvent.click(screen.getByRole('button', { name: /Place order/ }));
    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain('Time slot is full');
    });

    // Retry succeeds and navigates to order-success
    fireEvent.click(screen.getByRole('button', { name: /Place order/ }));
    await waitFor(() => {
      expect(mocks.navigate).toHaveBeenCalledWith('/order-success', expect.anything());
    });
  });
});
