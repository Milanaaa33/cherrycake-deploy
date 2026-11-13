import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { api } from '../api/client';
import { clearCart, isCartItem } from '../store';
import type { AppDispatch, RootState } from '../store';
import './Checkout.css';

type CheckoutForm = {
  name: string;
  phone: string;
  email: string;
  orderDate: string;
};

type CalculatedItem = {
  productId: number;
  unitPrice: number;
  modifiersPrice: number;
  quantity: number;
  lineTotal: number;
};

type Calculation = {
  items: CalculatedItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  amountInclVat: number;
  discountRate: number;
  discountAmount: number;
  deliveryFee: number;
  total: number;
  currencyCode: string;
};

export type PlacedOrder = {
  orderNumber: string;
  orderDate: string;
  region: string;
  customer: { name: string; phone: string; email: string };
  total: number;
  currencyCode: string;
};

const steps = ['Contact', 'Order date', 'Confirm'];

function todayString(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function formatMoney(value: number, currencyCode: string) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currencyCode,
  }).format(value);
}

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const storedItems = useSelector((state: RootState) => state.cart.items);
  const items = storedItems.filter(isCartItem);
  const region = useSelector((state: RootState) => state.region.code);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CheckoutForm>({
    name: '',
    phone: '',
    email: '',
    orderDate: todayString(),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [calculation, setCalculation] = useState<Calculation | null>(null);
  const [calcError, setCalcError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Totals always come from the backend, the frontend never calculates them itself.
  useEffect(() => {
    if (items.length === 0) {
      setCalculation(null);
      return;
    }

    let active = true;
    setCalcError('');

    api
      .post<Calculation>('/cart/calculate', {
        region,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          modifierIds: item.modifierIds,
        })),
      })
      .then(({ data }) => {
        if (active) setCalculation(data);
      })
      .catch(() => {
        if (active) setCalcError('Unable to calculate your order. Please try again.');
      });

    return () => {
      active = false;
    };
  }, [region, storedItems]);

  const update = (key: keyof CheckoutForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: '' }));
  };

  const validateContact = () => {
    const next: Record<string, string> = {};

    const name = form.name.trim();
    if (!name) next.name = 'Please enter your name.';
    else if (name.length < 2) next.name = 'Name must contain at least 2 characters.';

    // Same rule as the backend: 7 to 15 digits with an optional leading +.
    const phone = form.phone.replace(/[\s()-]/g, '');
    if (!form.phone.trim()) next.phone = 'Please enter your phone number.';
    else if (!/^\+?[1-9][0-9]{6,14}$/.test(phone)) {
      next.phone = 'Phone must contain 7 to 15 digits, with an optional leading +.';
    }

    const email = form.email.trim();
    if (!email) next.email = 'Please enter your email address.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = 'Please enter a valid email address.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateDate = () => {
    const next: Record<string, string> = {};
    if (!form.orderDate) next.orderDate = 'Please choose the order date.';
    else if (form.orderDate < todayString()) {
      next.orderDate = 'The order date must not be in the past.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const placeOrder = () => {
    setSubmitting(true);
    setSubmitError('');

    api
      .post<PlacedOrder>('/orders', {
        region,
        customer: {
          name: form.name.trim(),
          phone: form.phone.replace(/[\s()-]/g, ''),
          email: form.email.trim(),
        },
        orderDate: form.orderDate,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          modifierIds: item.modifierIds,
        })),
      })
      .then(({ data }) => {
        navigate('/order-success', { state: { order: data } });
        dispatch(clearCart());
      })
      .catch((error: { response?: { data?: { message?: string } } }) => {
        setSubmitError(
          error.response?.data?.message ?? 'Unable to place the order. Please try again.',
        );
      })
      .finally(() => setSubmitting(false));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (step === 0 && validateContact()) setStep(1);
    else if (step === 1 && validateDate()) setStep(2);
    else if (step === 2 && calculation && !submitting) placeOrder();
  };

  if (items.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-heading">
          <div>
            <p className="checkout-eyebrow">CHERRY CAKE · YOUR ORDER</p>
            <h2>Your cart is empty</h2>
            <p className="checkout-subtitle">Add something sweet to your cart before checking out.</p>
          </div>
          <Link to="/menu" className="checkout-back-link">← Browse the menu</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-heading">
        <div>
          <p className="checkout-eyebrow">CHERRY CAKE · YOUR ORDER</p>
          <h2>Checkout</h2>
          <p className="checkout-subtitle">A few details, then your sweet moment is on its way.</p>
        </div>
        <Link to="/cart" className="checkout-back-link">← Back to cart</Link>
      </div>

      <div className="checkout-layout">
        <section className="checkout-main">
          <div className="checkout-stepper" aria-label="Checkout progress">
            {steps.map((label, index) => (
              <div className={`checkout-step ${index === step ? 'is-active' : ''} ${index < step ? 'is-done' : ''}`} key={label}>
                <span className="checkout-step-number">{index < step ? '✓' : index + 1}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {step === 0 && (
              <div className="checkout-section">
                <div className="checkout-section-title">
                  <span className="checkout-section-icon">♡</span>
                  <div>
                    <h3>Contact information</h3>
                    <p>Who should we contact about your order?</p>
                  </div>
                </div>
                <div className="checkout-fields two-columns">
                  <Field label="Full name" value={form.name} error={errors.name} onChange={(v) => update('name', v)} placeholder="Your full name" wide />
                  <Field label="Phone number" value={form.phone} error={errors.phone} onChange={(v) => update('phone', v)} placeholder="+998 90 123 45 67" type="tel" />
                  <Field label="Email address" value={form.email} error={errors.email} onChange={(v) => update('email', v)} placeholder="you@example.com" type="email" />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="checkout-section">
                <div className="checkout-section-title">
                  <span className="checkout-section-icon">⌖</span>
                  <div>
                    <h3>Order date</h3>
                    <p>Choose the date of your order.</p>
                  </div>
                </div>
                <div className="checkout-fields">
                  <Field label="Order date" value={form.orderDate} error={errors.orderDate} onChange={(v) => update('orderDate', v)} type="date" min={todayString()} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="checkout-section">
                <div className="checkout-section-title">
                  <span className="checkout-section-icon">♡</span>
                  <div>
                    <h3>Confirm your order</h3>
                    <p>Check your details and place the order.</p>
                  </div>
                </div>
                <div className="checkout-review">
                  <span className="checkout-review-check">✓</span>
                  <div>
                    <strong>{form.name.trim()}</strong>
                    <p>{form.phone.trim()} · {form.email.trim()}</p>
                    <p>Order date: {form.orderDate} · Country: {region}</p>
                  </div>
                </div>
                {submitError && <p role="alert" className="checkout-field-error">{submitError}</p>}
              </div>
            )}

            <div className="checkout-form-actions">
              {step > 0 && (
                <button type="button" className="checkout-button secondary" onClick={() => { setErrors({}); setSubmitError(''); setStep(step - 1); }}>
                  Back
                </button>
              )}
              <button type="submit" className="checkout-button primary" disabled={submitting || (step === 2 && !calculation)}>
                {step === 2 ? (submitting ? 'Placing order...' : 'Place order') : 'Continue'} <span>→</span>
              </button>
            </div>
          </form>
        </section>

        <aside className="checkout-summary">
          <div className="checkout-summary-top">
            <h3>Order summary</h3>
            <span className="checkout-summary-count">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
          </div>

          {calcError && <p role="alert" className="checkout-field-error">{calcError}</p>}
          {!calculation && !calcError && <p>Calculating...</p>}

          {calculation && (
            <>
              {items.map((item) => {
                const line = calculation.items.find((entry) => entry.productId === item.productId);
                return (
                  <div className="checkout-summary-product" key={item.id}>
                    <div className="checkout-product-info">
                      <strong>{item.name}</strong>
                      <span>× {item.quantity}</span>
                    </div>
                    {line && (
                      <strong className="checkout-product-price">
                        {formatMoney(line.lineTotal, calculation.currencyCode)}
                      </strong>
                    )}
                  </div>
                );
              })}
              <div className="checkout-summary-line"><span>Subtotal</span><strong>{formatMoney(calculation.subtotal, calculation.currencyCode)}</strong></div>
              <div className="checkout-summary-line"><span>VAT ({Math.round(calculation.vatRate * 100)}%)</span><strong>{formatMoney(calculation.vatAmount, calculation.currencyCode)}</strong></div>
              <div className="checkout-summary-line"><span>Amount including VAT</span><strong>{formatMoney(calculation.amountInclVat, calculation.currencyCode)}</strong></div>
              {calculation.discountAmount > 0 && (
                <div className="checkout-summary-line"><span>Discount ({Math.round(calculation.discountRate * 100)}%)</span><strong>-{formatMoney(calculation.discountAmount, calculation.currencyCode)}</strong></div>
              )}
              {calculation.deliveryFee > 0 && (
                <div className="checkout-summary-line"><span>Delivery</span><strong>{formatMoney(calculation.deliveryFee, calculation.currencyCode)}</strong></div>
              )}
              <div className="checkout-summary-total"><span>Total</span><strong>{formatMoney(calculation.total, calculation.currencyCode)}</strong></div>
            </>
          )}

          <div className="checkout-summary-note"><span>♡</span><p>Freshly made with love. Thank you for choosing Cherry Cake!</p></div>
          <Link to="/menu" className="checkout-edit-cart">Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label, value, error, onChange, placeholder, type = 'text', wide = false, min,
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  wide?: boolean;
  min?: string;
}) {
  const id = `checkout-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={`checkout-field ${wide ? 'field-wide' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
      />
      {error && <small className="checkout-field-error">{error}</small>}
    </div>
  );
}
