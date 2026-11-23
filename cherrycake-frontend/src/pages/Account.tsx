import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';

import { api } from '../api/client';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import Loader from '../components/ui/Loader';
import { clearAuth, getAuthEmail, getAuthToken, isRole, saveAuth, type Role } from '../utils/auth';
import { useTranslation } from '../i18n/useTranslation';
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
  const { t } = useTranslation();
  // The cart and checkout send customers who are not signed in here and remember where they came from.
  const location = useLocation();
  const cameFrom = (location.state as { from?: unknown } | null)?.from;
  const from = typeof cameFrom === 'string' && cameFrom.startsWith('/') ? cameFrom : null;

  const [orders, setOrders] = useState<HistoryOrder[] | null>(null);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [reloadKey, setReloadKey] = useState(0);

  // Sign-in by email code: orders then follow the email on any device.
  const [authEmail, setAuthEmail] = useState<string | null>(getAuthToken() ? getAuthEmail() : null);
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [loginOpen, setLoginOpen] = useState(from !== null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginCode, setLoginCode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginMessage, setLoginMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    setOrders(null);
    setError('');

    // Order history is private: never request it without a current session token.
    if (!getAuthToken()) {
      setOrders([]);
      return () => {
        active = false;
      };
    }

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
        setError(t('account.loadError', 'Unable to load your orders. Please try again.'));
      });

    return () => {
      active = false;
    };
    // `t` is stable per language; only reloadKey must re-request the history.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setLoginError(t('account.errorEmail', 'Please enter a valid email address.'));
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
        setLoginMessage(
          t('account.codeSent', 'We sent a 6-digit code to {email}. It is valid for 10 minutes.', { email }),
        );
      })
      .catch((err) =>
        setLoginError(errorMessage(err, t('account.sendCodeError', 'Unable to send the code. Please try again.'))),
      )
      .finally(() => setBusy(false));
  };

  const verifyCode = (event: FormEvent) => {
    event.preventDefault();
    const code = loginCode.trim();
    if (!/^[0-9]{6}$/.test(code)) {
      setLoginError(t('account.errorCode', 'Enter the 6-digit code from the email.'));
      return;
    }

    setLoginError('');
    setBusy(true);
    api
      .post<{ token: string; email: string; role?: Role }>('/auth/verify-code', { email: loginEmail.trim(), code })
      .then(({ data }) => {
        saveAuth(data.token, data.email, isRole(data.role) ? data.role : 'CUSTOMER');
        setAuthEmail(data.email);
        setLoginOpen(false);
        setStep('email');
        setLoginEmail('');
        setLoginCode('');
        setLoginMessage('');
        setReloadKey((key) => key + 1);
      })
      .catch((err) =>
        setLoginError(errorMessage(err, t('account.verifyCodeError', 'Unable to verify the code. Please try again.'))),
      )
      .finally(() => setBusy(false));
  };

  const signOut = () => {
    // Hide private data immediately; the backend logout request may take time or fail.
    clearAuth();
    setAuthEmail(null);
    setOrders([]);
    setExpanded(new Set());
    setError('');
    setReloadKey((key) => key + 1);
    api.post('/auth/logout').catch(() => undefined);
  };

  // No registration: contact details are taken from the most recent order.
  const latest = orders && orders.length > 0 ? orders[0] : null;

  // Signed in (right after entering the code): go back to the cart or checkout.
  if (from && authEmail) {
    return <Navigate to={from} replace />;
  }

  // Sent here from the cart: show only the sign-in, the order history is not needed yet.
  const focusLogin = from !== null && !authEmail;

  // Extracted below so it can be shown on top (focused) or at the bottom of the page.
  const loginCard = !authEmail && (focusLogin || (!error && orders !== null)) ? (
<section className={`account-login ${focusLogin ? 'is-focused' : ''}`}>
          <div className="account-login-top">
            <div>
              <h3>
                {focusLogin
                  ? t('account.signInWithYourEmail', 'Sign in with your email')
                  : t('account.signInAnyDevice', 'Sign in to see your orders on any device')}
              </h3>
              <p>
                {t(
                  'account.noPassword',
                  'No password: we email you a 6-digit code. You will see every order made with that email.',
                )}
              </p>
            </div>
            <button
              type="button"
              className="checkout-button secondary"
              aria-expanded={loginOpen}
              onClick={() => setLoginOpen((open) => !open)}
            >
              {loginOpen ? t('account.close', 'Close') : t('account.signInWithEmail', 'Sign in with email')}
            </button>
          </div>

          {loginOpen && (
            <form onSubmit={step === 'email' ? sendCode : verifyCode} noValidate>
              {loginMessage && <p role="status" className="account-login-message">{loginMessage}</p>}

              <div className="checkout-fields two-columns">
                <div className="checkout-field">
                  <label htmlFor="account-login-email">{t('account.emailAddress', 'Email address')}</label>
                  <input
                    id="account-login-email"
                    type="email"
                    value={loginEmail}
                    disabled={step === 'code'}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder={t('account.emailPlaceholder', 'you@example.com')}
                  />
                </div>
                {step === 'code' && (
                  <div className="checkout-field">
                    <label htmlFor="account-login-code">{t('account.codeLabel', '6-digit code')}</label>
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
                      {t('account.changeEmail', 'Change email')}
                    </button>
                    <button type="button" className="checkout-button secondary" disabled={busy} onClick={() => sendCode()}>
                      {t('account.sendAgain', 'Send again')}
                    </button>
                  </>
                )}
                <button type="submit" className="checkout-button primary" disabled={busy}>
                  {step === 'email'
                    ? (busy ? t('account.sending', 'Sending...') : t('account.sendCode', 'Send code'))
                    : (busy ? t('account.checking', 'Checking...') : t('account.signIn', 'Sign in'))}{' '}
                  <span>→</span>
                </button>
              </div>
            </form>
          )}
        </section>
  ) : null;

  return (
    <div className="checkout-page account-page">
      <div className="checkout-heading">
        <div>
          <p className="checkout-eyebrow">{focusLogin
              ? t('account.eyebrowAlmostThere', 'CHERRY CAKE · ALMOST THERE')
              : t('account.eyebrowMyAccount', 'CHERRY CAKE · MY ACCOUNT')}</p>
          <h2>{focusLogin ? t('account.signInToOrder', 'Sign in to order') : t('account.title', 'My account')}</h2>
          <p className="checkout-subtitle">
            {focusLogin
              ? t('account.oneQuickStep', 'One quick step before your cart.')
              : t('account.signInToView', 'Sign in to view your private order history.')}
          </p>
        </div>
        <Link to="/menu" className="checkout-back-link">{t('account.browseMenu', '← Browse the menu')}</Link>
      </div>

      {focusLogin && (
        <div className="account-welcome">
          <span className="account-welcome-icon" aria-hidden="true">🍒</span>
          <div>
            <h3>{t('account.welcomeTitle', 'Sweet things take a moment ♡')}</h3>
            <p>
              {t(
                'account.welcomeText',
                'Confirm your email with a one-time code first. Then we will take you straight back to your cart, and your orders will wait for you here.',
              )}
            </p>
          </div>
        </div>
      )}

      {focusLogin && loginCard}

      {authEmail && (
        <div className="account-signed">
          <span>
            {t('account.signedInAs', 'Signed in as')} <strong>{authEmail}</strong>
          </span>
          <button type="button" className="account-toggle" onClick={signOut}>
            {t('account.signOut', 'Sign out')}
          </button>
        </div>
      )}

      {!focusLogin && error && (
        <ErrorState
          title={t('account.ordersUnavailable', 'Orders are unavailable')}
          message={error}
          onRetry={() => setReloadKey((key) => key + 1)}
        />
      )}

      {!focusLogin && authEmail && !error && orders === null && <Loader />}

      {!focusLogin && !authEmail && (
        <div className="account-login-required">
          <p>{t('account.signInToView', 'Sign in to view your private order history.')}</p>
        </div>
      )}

      {!focusLogin && authEmail && !error && orders !== null && orders.length === 0 && (
        <EmptyState
          title={t('account.noOrdersTitle', 'No orders yet')}
          description={t('account.noOrdersText', 'Orders associated with your signed-in email will appear here.')}
          action={<Link to="/menu" className="account-empty-link">{t('account.orderSomethingSweet', 'Order something sweet')}</Link>}
        />
      )}

      {!focusLogin && authEmail && !error && orders !== null && orders.length > 0 && latest && (
        <div className="checkout-layout">
          <section className="account-main">
            <div className="account-list-top">
              <h3>{t('account.orderHistory', 'Order history')}</h3>
              <span className="checkout-summary-count">
                {orders.length === 1
                  ? t('account.orderCountOne', '{count} order', { count: orders.length })
                  : t('account.orderCount', '{count} orders', { count: orders.length })}
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
                        <span>
                          {t('account.placedFor', 'Placed {placed} · For {date}', {
                            placed: formatDate(order.createdAt),
                            date: formatDate(order.orderDate),
                          })}
                        </span>
                      </div>
                      <div className="account-order-side">
                        {order.fulfillmentType && (
                          <Badge>
                            {order.fulfillmentType === 'DELIVERY'
                              ? t('account.delivery', 'Delivery')
                              : t('account.pickup', 'Pickup')}
                          </Badge>
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
                      {isOpen ? t('account.hideDetails', 'Hide details') : t('account.showDetails', 'Show details')}
                    </button>

                    {isOpen && (
                      <div className="account-order-details" id={detailsId}>
                        {order.items.map((item, index) => (
                          <div className="checkout-summary-product" key={`${item.productId}-${index}`}>
                            <div className="checkout-product-info">
                              <strong>{item.productName}</strong>
                              <span>
                                {t('account.itemLine', '× {quantity} · {price} each', {
                                  quantity: item.quantity,
                                  price: formatMoney(item.unitPrice, order.currencyCode),
                                })}
                              </span>
                              {item.modifiersPrice > 0 && (
                                <small>
                                  {t('account.optionsLine', 'Options: +{price} each', {
                                    price: formatMoney(item.modifiersPrice, order.currencyCode),
                                  })}
                                </small>
                              )}
                            </div>
                            <strong className="checkout-product-price">
                              {formatMoney(item.lineTotal, order.currencyCode)}
                            </strong>
                          </div>
                        ))}
                        <div className="checkout-summary-line"><span>{t('account.subtotal', 'Subtotal')}</span><strong>{formatMoney(order.subtotal, order.currencyCode)}</strong></div>
                        <div className="checkout-summary-line"><span>{t('account.vat', 'VAT ({rate}%)', { rate: Math.round(order.vatRate * 100) })}</span><strong>{formatMoney(order.vatAmount, order.currencyCode)}</strong></div>
                        {order.discountAmount > 0 && (
                          <div className="checkout-summary-line"><span>{t('account.discount', 'Discount ({rate}%)', { rate: Math.round(order.discountRate * 100) })}</span><strong>-{formatMoney(order.discountAmount, order.currencyCode)}</strong></div>
                        )}
                        {order.deliveryFee > 0 && (
                          <div className="checkout-summary-line"><span>{t('account.delivery', 'Delivery')}</span><strong>{formatMoney(order.deliveryFee, order.currencyCode)}</strong></div>
                        )}
                        <div className="checkout-summary-total"><span>{t('account.total', 'Total')}</span><strong>{formatMoney(order.total, order.currencyCode)}</strong></div>
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
                <span>{orders.length === 1 ? t('account.statOrder', 'Order') : t('account.statOrders', 'Orders')}</span>
              </div>
              <div>
                <strong>{formatDate(latest.createdAt)}</strong>
                <span>{t('account.lastOrder', 'Last order')}</span>
              </div>
            </div>

            <div className="checkout-summary-note">
              <span>♡</span>
              <p>{t('account.historyNote', 'Your order history is available only while you are signed in.')}</p>
            </div>
            <Link to="/menu" className="checkout-edit-cart">{t('account.orderAgain', 'Order again')}</Link>
          </aside>
        </div>
      )}

      {!focusLogin && loginCard}
    </div>
  );
}
