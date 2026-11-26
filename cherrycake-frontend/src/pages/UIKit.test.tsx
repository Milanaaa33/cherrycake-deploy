import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import UIKit from './UIKit';

describe('CC-17: UI Kit component showcase', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders all design-system component sections and interactive states', () => {
    render(<UIKit />);

    expect(screen.getByText('Cherry Cake - UI Kit')).toBeTruthy();

    // Buttons & loading state
    const loadingBtn = screen.getByRole('button', { name: 'Loading...' }) as HTMLButtonElement;
    expect(loadingBtn.disabled).toBe(true);
    expect(loadingBtn.getAttribute('aria-busy')).toBe('true');
    expect((screen.getByRole('button', { name: 'Disabled' }) as HTMLButtonElement).disabled).toBe(true);

    // Inputs & Selects with error states
    expect(screen.getByText('Invalid email')).toBeTruthy();
    expect(screen.getByText('Please select a valid country')).toBeTruthy();

    // Badges, Empty State & Error State
    expect(screen.getByText('In stock')).toBeTruthy();
    expect(screen.getByText('Out of stock')).toBeTruthy();
    expect(screen.getByText('Your cart is empty')).toBeTruthy();
  });

  it('opens modal via trigger and closes via Escape key', () => {
    render(<UIKit />);

    fireEvent.click(screen.getByRole('button', { name: 'Open Modal' }));
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText('This is a reusable modal component.')).toBeTruthy();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('triggers toast notifications and supports radio/checkbox toggles', () => {
    render(<UIKit />);

    fireEvent.click(screen.getByRole('button', { name: 'Success Toast' }));
    expect(screen.getByText('Success notification!')).toBeTruthy();

    const extraCream = screen.getByLabelText('Extra cream') as HTMLInputElement;
    expect(extraCream.checked).toBe(false);
    fireEvent.click(extraCream);
    expect(extraCream.checked).toBe(true);

    const largeCake = screen.getByLabelText('Large cake') as HTMLInputElement;
    fireEvent.click(largeCake);
    expect(largeCake.checked).toBe(true);
  });
});
