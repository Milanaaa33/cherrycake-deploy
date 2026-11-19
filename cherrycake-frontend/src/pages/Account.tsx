import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { api } from '../api/client';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import Loader from '../components/ui/Loader';
import { clearAuth, getAuthEmail, saveAuth } from '../utils/auth';
import '../components/ui/ExtraComponents.css';
import './Checkout.css';
import './Account.css';

// Response of GET /api/orders/my (same shape as the order returned by POST /api/orders).
type HistoryOrderItem = {
  productId: number;
  productName: string;
  unitPrice: number;
  modifiersPrice: number;
  quantity: number;
  lineTotal: number;
};

type HistoryOrder = {
  orderNumber: string;
  orderDate: string;
  region: string;
  customer: { name: string; phone: string; email: string };
  items: HistoryOrderItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  amountInclVat: number;
  discountRate: number;
  discountAmount: number;
  deliveryFee: number;
  total: number;
  currencyCode: string;
  createdAt: string;
  fulfillmentType?: 'PICKUP' | 'DELIVERY' | null;
};

function formatMoney(value: number, currencyCode: string) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currencyCode,
  }).format(value);
}

// Works for "2026-11-17" and "2026-11-17T10:30:00"; avoids the UTC shift of new Date('YYYY-MM-DD').
function formatDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month - 1, day));
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export default function Account() {
  const [orders, setOrders] = useState<HistoryOrder[] | null>(null);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [reloadKey, setReloadKey] = useState(0);

  // Sign-in by email code: orders then follow the email on any device.
  const [authEmail, setAuthEmail] = useState<string | null>(getAuthEmail());
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginCode, setLoginCode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginMessage, setLoginMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    setOrders(null);
    setError('');

    api
      .get<HistoryOrder[]>('/orders/my')
      .then(({ data }) => {
        if (active) setOrders(data);
      })
      .catch((err: { response?: { status?: number } }) => {
        if (!active) return;
        if (err.response?.status === 401) {
          // The saved session expired: fall back to this browser's history.
          clearAuth();
          setAuthEmail(null);
          setReloadKey((key) => key + 1);
          return;
        }
        setError('Unable to load your orders. Please try again.');
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const toggle = (orderNumber: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(orderNumber)) next.delete(orderNumber);
      else next.add(orderNumber);
      return next;
    });
  };

  const errorMessage = (err: { response?: { data?: { message?: string } } }, fallback: string) =>
    err.response?.data?.message ?? fallback;

  const sendCode = (event?: FormEvent) => {
    event?.preventDefault();
    const email = loginEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLoginError('Please enter a valid email address.');
      return;
    }

    setLoginError('');
    setLoginMessage('');
    setBusy(true);
    api
      .post('/auth/request-code', { email })
      .then(() => {
        setStep('code');
        setLoginCode('');
        setLoginMessage(`We sent a 6-digit code to ${email}. It is valid for 10 minutes.`);
      })
      .catch((err) => setLoginError(errorMessage(err, 'Unable to send the code. Please try again.')))
      .finally(() => setBusy(false));
  };

  const verifyCode = (event: FormEvent) => {
    event.preventDefault();
    const code = loginCode.trim();
    if (!/^[0-9]{6}$/.test(code)) {
      setLoginError('Enter the 6-digit code from the email.');
      return;
    }

    setLoginError('');
    setBusy(true);
    api
      .post<{ token: string; email: string }>('/auth/verify-code', { email: loginEmail.trim(), code })
      .then(({ data }) => {
        saveAuth(data.token, data.email);
        setAuthEmail(data.email);
        setLoginOpen(false);
        setStep('email');
        setLoginEmail('');
        setLoginCode('');
        setLoginMessage('');
        setReloadKey((key) => key + 1);
      })
      .catch((err) => setLoginError(errorMessage(err, 'Unable to verify the code. Please try again.')))
      .finally(() => setBusy(false));
  };

  const signOut = () => {
    api.post('/auth/logout').catch(() => undefined).finally(() => {
      clearAuth();
      setAuthEmail(null);
      setReloadKey((key) => key + 1);
    });
  };

  // No registration: contact details are taken from the most recent order.
  const latest = orders && orders.length > 0 ? orders[0] : null;

  return (
    <div className="checkout-page account-page">
      <div className="checkout-heading">
        <div>
          <p className="checkout-eyebrow">CHERRY CAKE · MY ACCOUNT</p>
          <h2>My account</h2>
          <p className="checkout-subtitle">Your details and everything you have ordered so far.</p>
        </div>
        <Link to="/menu" className="checkout-back-link">← Browse the menu</Link>
      </div>

      {authEmail && (
        <div className="account-signed">
          <span>Signed in as <strong>{authEmail}</strong></span>
          <button type="button" className="account-toggle" onClick={signOut}>Sign out</button>
        </div>
      )}

      {error && (
        <ErrorState
          title="Orders are unavailable"
          message={error}
          onRetry={() => setReloadKey((key) => key + 1)}
        />
      )}

      {!error && orders === null && <Loader />}

      {!error && orders !== null && orders.length === 0 && (
        <EmptyState
          title="No orders yet"
          description="Orders you place will appear here automatically, no registration needed."
          action={<Link to="/menu" className="account-empty-link">Order something sweet</Link>}
        />
      )}

      {!error && orders !== null && orders.length > 0 && latest && (
        <div className="checkout-layout">
          <section className="account-main">
            <div className="account-list-top">
              <h3>Order history</h3>
              <span className="checkout-summary-count">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'}
              </span>
            </div>

            <div className="account-orders">
              {orders.map((order) => {
                const isOpen = expanded.has(order.orderNumber);
                const detailsId = `account-order-${order.orderNumber}`;
                return (
                  <article className="account-order" key={order.orderNumber}>
                    <div className="account-order-head">
                      <div className="account-order-id">
                        <strong>{order.orderNumber}</strong>
                        <span>Placed {formatDate(order.createdAt)} · For {formatDate(order.orderDate)}</span>
                      </div>
                      <div className="account-order-side">
                        {order.fulfillmentType && (
                          <Badge>{order.fulfillmentType === 'DELIVERY' ? 'Delivery' : 'Pickup'}</Badge>
                        )}
                        <Badge>{order.region}</Badge>
                        <strong className="account-order-total">
                          {formatMoney(order.total, order.currencyCode)}
                        </strong>
                      </div>
                    </div>

                    <p className="account-order-preview">
                      {order.items.map((item) => `${item.productName} × ${item.quantity}`).join(', ')}
                    </p>

                    <button
                      type="button"
                      className="account-toggle"
                      aria-expanded={isOpen}
                      aria-controls={detailsId}
                      onClick={() => toggle(order.orderNumber)}
                    >
                      {isOpen ? 'Hide details' : 'Show details'}
                    </button>

                    {isOpen && (
                      <div className="account-order-details" id={detailsId}>
                        {order.items.map((item, index) => (
                          <div className="checkout-summary-product" key={`${item.productId}-${index}`}>
                            <div className="checkout-product-info">
                              <strong>{item.productName}</strong>
                              <span>
                                × {item.quantity} · {formatMoney(item.unitPrice, order.currencyCode)} each
                              </span>
                              {item.modifiersPrice > 0 && (
                                <small>
                                  Options: +{formatMoney(item.modifiersPrice, order.currencyCode)} each
                                </small>
                              )}
                            </div>
                            <strong className="checkout-product-price">
                              {formatMoney(item.lineTotal, order.currencyCode)}
                            </strong>
                          </div>
                        ))}
                        <div className="checkout-summary-line"><span>Subtotal</span><strong>{formatMoney(order.subtotal, order.currencyCode)}</strong></div>
                        <div className="checkout-summary-line"><span>VAT ({Math.round(order.vatRate * 100)}%)</span><strong>{formatMoney(order.vatAmount, order.currencyCode)}</strong></div>
                        {order.discountAmount > 0 && (
                          <div className="checkout-summary-line"><span>Discount ({Math.round(order.discountRate * 100)}%)</span><strong>-{formatMoney(order.discountAmount, order.currencyCode)}</strong></div>
                        )}
                        {order.deliveryFee > 0 && (
                          <div className="checkout-summary-line"><span>Delivery</span><strong>{formatMoney(order.deliveryFee, order.currencyCode)}</strong></div>
                        )}
                        <div className="checkout-summary-total"><span>Total</span><strong>{formatMoney(order.total, order.currencyCode)}</strong></div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>

          <aside className="checkout-summary account-profile">
            <div className="account-avatar" aria-hidden="true">{initials(latest.customer.name) || '♡'}</div>
            <h3>{latest.customer.name}</h3>
            <p className="account-profile-line">{latest.customer.phone}</p>
            <p className="account-profile-line">{authEmail ?? latest.customer.email}</p>

            <div className="account-stats">
              <div>
                <strong>{orders.length}</strong>
                <span>{orders.length === 1 ? 'Order' : 'Orders'}</span>
              </div>
              <div>
                <strong>{formatDate(latest.createdAt)}</strong>
                <span>Last order</span>
              </div>
            </div>

            <div className="checkout-summary-note">
              <span>♡</span>
              <p>No sign-up needed: your orders are saved in this browser, using the details from your latest order.</p>
            </div>
            <Link to="/menu" className="checkout-edit-cart">Order again</Link>
          </aside>
        </div>
      )}

      {!error && orders !== null && !authEmail && (
        <section className="account-login">
          <div className="account-login-top">
            <div>
              <h3>Sign in to see your orders on any device</h3>
              <p>No password: we email you a 6-digit code. You will see every order made with that email.</p>
            </div>
            <button
              type="button"
              className="checkout-button secondary"
              aria-expanded={loginOpen}
              onClick={() => setLoginOpen((open) => !open)}
            >
              {loginOpen ? 'Close' : 'Sign in with email'}
            </button>
          </div>

          {loginOpen && (
            <form onSubmit={step === 'email' ? sendCode : verifyCode} noValidate>
              {loginMessage && <p role="status" className="account-login-message">{loginMessage}</p>}

              <div className="checkout-fields two-columns">
                <div className="checkout-field">
                  <label htmlFor="account-login-email">Email address</label>
                  <input
                    id="account-login-email"
                    type="email"
                    value={loginEmail}
                    disabled={step === 'code'}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                {step === 'code' && (
                  <div className="checkout-field">
                    <label htmlFor="account-login-code">6-digit code</label>
                    <input
                      id="account-login-code"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={loginCode}
                      onChange={(e) => setLoginCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                    />
                  </div>
                )}
              </div>

              {loginError && <p role="alert" className="checkout-field-error account-login-error">{loginError}</p>}

              <div className="checkout-form-actions">
                {step === 'code' && (
                  <>
                    <button
                      type="button"
                      className="checkout-button secondary"
                      onClick={() => { setStep('email'); setLoginError(''); setLoginMessage(''); }}
                    >
                      Change email
                    </button>
                    <button type="button" className="checkout-button secondary" disabled={busy} onClick={() => sendCode()}>
                      Send again
                    </button>
                  </>
                )}
                <button type="submit" className="checkout-button primary" disabled={busy}>
                  {step === 'email' ? (busy ? 'Sending...' : 'Send code') : (busy ? 'Checking...' : 'Sign in')} <span>→</span>
                </button>
              </div>
            </form>
          )}
        </section>
      )}
    </div>
  );
}
