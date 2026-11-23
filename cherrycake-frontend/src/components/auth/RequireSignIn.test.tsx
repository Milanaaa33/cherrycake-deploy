import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

import RequireSignIn from './RequireSignIn';

function AccountStub() {
  const { state } = useLocation();
  return <p>account page, back to {(state as { from?: string } | null)?.from}</p>;
}

function renderCart() {
  render(
    <MemoryRouter initialEntries={['/cart']}>
      <Routes>
        <Route path="/cart" element={<RequireSignIn><p>cart page</p></RequireSignIn>} />
        <Route path="/account" element={<AccountStub />} />
      </Routes>
    </MemoryRouter>,
  );
}

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('RequireSignIn', () => {
  it('sends a signed-out customer to My Account and remembers the page to come back to', () => {
    renderCart();
    expect(screen.getByText('account page, back to /cart')).toBeTruthy();
    expect(screen.queryByText('cart page')).toBeNull();
  });

  it('shows the page to a signed-in customer', () => {
    localStorage.setItem('cc_auth_token', 'token');
    renderCart();
    expect(screen.getByText('cart page')).toBeTruthy();
  });
});
