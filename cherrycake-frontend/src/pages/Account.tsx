import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { api } from '../api/client';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import Loader from '../components/ui/Loader';
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

  // "Find my earlier orders": orders placed before the history existed are matched by email + phone.
  const [claimOpen, setClaimOpen] = useState(false);
  const [claimEmail, setClaimEmail] = useState('');
  const [claimPhone, setClaimPhone] = useState('');
  const [claimError, setClaimError] = useState('');
  const [claimMessage, setClaimMessage] = useState('');
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    let active = true;
    setOrders(null);
    setError('');

    api
      .get<HistoryOrder[]>('/orders/my')
      .then(({ data }) => {
        if (active) setOrders(data);
      })
      .catch(() => {
        if (active) setError('Unable to load your orders. Please try again.');
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

  const claimEarlierOrders = (event: FormEvent) => {
    event.preventDefault();
    setClaimMessage('');

    const email = claimEmail.trim();
    const phone = claimPhone.replace(/[\s()-]/g, '');
    // Same rules as the backend.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setClaimError('Please enter a valid email address.');
      return;
    }
    if (!/^\+?[1-9][0-9]{6,14}$/.test(phone)) {
      setClaimError('Phone must contain 7 to 15 digits, with an optional leading +.');
      return;
    }

    setClaimError('');
    setClaiming(true);
    const before = orders?.length ?? 0;

    api
      .post<HistoryOrder[]>('/orders/my/claim', { email, phone })
      .then(({ data }) => {
        setOrders(data);
        const added = data.length - before;
        if (added > 0) {
          setClaimMessage(`Added ${added} earlier ${added === 1 ? 'order' : 'orders'} to your history.`);
          setClaimOpen(false);
          setClaimEmail('');
          setClaimPhone('');
        } else {
          setClaimMessage('No earlier orders found for these details.');
        }
      })
      .catch(() => {
        setClaimError('Unable to search for your orders. Please try again.');
      })
      .finally(() => setClaiming(false));
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
            <p className="account-profile-line">{latest.customer.email}</p>

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

      {!error && orders !== null && (
        <section className="account-claim">
          <div className="account-claim-top">
            <div>
              <h3>Missing an older order?</h3>
              <p>Orders made earlier on this device appear automatically after your next order. To see them right now, enter the email and phone you used.</p>
            </div>
            <button
              type="button"
              className="checkout-button secondary"
              aria-expanded={claimOpen}
              onClick={() => setClaimOpen((open) => !open)}
            >
              {claimOpen ? 'Close' : 'Find my earlier orders'}
            </button>
          </div>

          {claimMessage && <p role="status" className="account-claim-message">{claimMessage}</p>}

          {claimOpen && (
            <form onSubmit={claimEarlierOrders} noValidate>
              <div className="checkout-fields two-columns">
                <div className="checkout-field">
                  <label htmlFor="account-claim-email">Email address</label>
                  <input
                    id="account-claim-email"
                    type="email"
                    value={claimEmail}
                    onChange={(e) => setClaimEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <div className="checkout-field">
                  <label htmlFor="account-claim-phone">Phone number</label>
                  <input
                    id="account-claim-phone"
                    type="tel"
                    value={claimPhone}
                    onChange={(e) => setClaimPhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                  />
                </div>
              </div>
              {claimError && <p role="alert" className="checkout-field-error account-claim-error">{claimError}</p>}
              <div className="checkout-form-actions">
                <button type="submit" className="checkout-button primary" disabled={claiming}>
                  {claiming ? 'Searching...' : 'Find orders'} <span>→</span>
                </button>
              </div>
            </form>
          )}
        </section>
      )}
    </div>
  );
}
