import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Checkout.css';

type CheckoutForm = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  apartment: string;
  notes: string;
};

const initialForm: CheckoutForm = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  address: '',
  apartment: '',
  notes: '',
};

const steps = ['Contact', 'Delivery', 'Payment'];

export default function Checkout() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [delivery, setDelivery] = useState<'delivery' | 'pickup'>('delivery');
  const [payment, setPayment] = useState<'cash' | 'card'>('cash');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (key: keyof CheckoutForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: '' }));
  };


const validateContact = () => {
  const next: Record<string, string> = {};

  // First name
  const firstName = form.firstName.trim();

  if (!firstName) {
    next.firstName = 'Please enter your first name.';
  } else if (firstName.length < 2) {
    next.firstName = 'First name must contain at least 2 characters.';
  } else if (!/^[\p{L}\p{M}][\p{L}\p{M} '\u2019-]*$/u.test(firstName)) {
    next.firstName = 'First name must contain only letters.';
  }

  // Last name
  const lastName = form.lastName.trim();

  if (!lastName) {
    next.lastName = 'Please enter your last name.';
  } else if (lastName.length < 2) {
    next.lastName = 'Last name must contain at least 2 characters.';
  } else if (!/^[\p{L}\p{M}][\p{L}\p{M} '\u2019-]*$/u.test(lastName)) {
    next.lastName = 'Last name must contain only letters.';
  }

  // Uzbekistan phone number
  const phoneDigits = form.phone.replace(/\D/g, '');
  const normalizedPhone = phoneDigits.startsWith('998')
    ? phoneDigits.slice(3)
    : phoneDigits;

  if (!form.phone.trim()) {
    next.phone = 'Please enter your phone number.';
  } else if (normalizedPhone.length !== 9) {
    next.phone = 'Enter a valid Uzbekistan phone number (+998 XX XXX XX XX).';
  }

  // Email is optional
  const email = form.email.trim();

  if (
    email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    next.email = 'Please enter a valid email address.';
  }

  setErrors(next);

  return Object.keys(next).length === 0;
};


  const validateDelivery = () => {
    if (delivery === 'delivery' && !form.address.trim()) {
      setErrors({ address: 'Please enter your delivery address.' });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (step === 0 && validateContact()) setStep(1);
    else if (step === 1 && validateDelivery()) setStep(2);
    else if (step === 2) {
      // Frontend-only prototype: backend order creation is not connected yet.
      navigate('/order-success', {
        state: { name: form.firstName, delivery, payment },
      });
    }
  };

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
                  <Field label="First name" value={form.firstName} error={errors.firstName} onChange={(v) => update('firstName', v)} placeholder="Your first name" />
                  <Field label="Last name" value={form.lastName} error={errors.lastName} onChange={(v) => update('lastName', v)} placeholder="Your last name" />
                  <Field label="Phone number" value={form.phone} error={errors.phone} onChange={(v) => update('phone', v)} placeholder="+998 90 123 45 67" type="tel" />
                  <Field label="Email address" value={form.email} error={errors.email} onChange={(v) => update('email', v)} placeholder="you@example.com" type="email" optional />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="checkout-section">
                <div className="checkout-section-title">
                  <span className="checkout-section-icon">⌖</span>
                  <div>
                    <h3>How would you like to receive it?</h3>
                    <p>Choose delivery or pick it up fresh from us.</p>
                  </div>
                </div>
                <div className="checkout-choice-grid">
                  <button type="button" className={`checkout-choice ${delivery === 'delivery' ? 'selected' : ''}`} onClick={() => setDelivery('delivery')}>
                    <span className="checkout-choice-icon">♧</span>
                    <span className="checkout-choice-title">Home delivery</span>
                    <span className="checkout-choice-description">Delivered to your door</span>
                    <span className="checkout-choice-price">25,000 UZS</span>
                  </button>
                  <button type="button" className={`checkout-choice ${delivery === 'pickup' ? 'selected' : ''}`} onClick={() => setDelivery('pickup')}>
                    <span className="checkout-choice-icon">⌂</span>
                    <span className="checkout-choice-title">Pickup</span>
                    <span className="checkout-choice-description">Collect at our bakery</span>
                    <span className="checkout-choice-price">Free</span>
                  </button>
                </div>
                {delivery === 'delivery' && (
                  <div className="checkout-fields two-columns delivery-fields">
                    <Field label="Street address" value={form.address} error={errors.address} onChange={(v) => update('address', v)} placeholder="Street, building, district" wide />
                    <Field label="Apartment / entrance" value={form.apartment} error={errors.apartment} onChange={(v) => update('apartment', v)} placeholder="Apartment, floor, entrance (optional)" wide optional />
                  </div>
                )}
                <label className="checkout-label" htmlFor="checkout-notes">Order notes <span>Optional</span></label>
                <textarea id="checkout-notes" value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Any delivery instructions or a little note..." rows={3} />
              </div>
            )}

            {step === 2 && (
              <div className="checkout-section">
                <div className="checkout-section-title">
                  <span className="checkout-section-icon">♡</span>
                  <div>
                    <h3>Payment method</h3>
                    <p>Choose how you would like to pay.</p>
                  </div>
                </div>
                <div className="checkout-payment-options">
                  <button type="button" className={`checkout-payment ${payment === 'cash' ? 'selected' : ''}`} onClick={() => setPayment('cash')}>
                    <span className="checkout-radio">{payment === 'cash' ? '●' : ''}</span>
                    <span><strong>Cash</strong><small>Pay when {delivery === 'pickup' ? 'you collect your order' : 'your order arrives'}</small></span>
                    <span className="checkout-payment-symbol">₸</span>
                  </button>
                  <button type="button" className={`checkout-payment ${payment === 'card' ? 'selected' : ''}`} onClick={() => setPayment('card')}>
                    <span className="checkout-radio">{payment === 'card' ? '●' : ''}</span>
                    <span><strong>Card</strong><small>Pay by card at {delivery === 'pickup' ? 'the bakery' : 'delivery'}</small></span>
                    <span className="checkout-payment-symbol">▰</span>
                  </button>
                </div>
                <div className="checkout-review">
                  <span className="checkout-review-check">✓</span>
                  <div><strong>Almost there!</strong><p>Please review your details before placing the order. This checkout is currently a frontend prototype.</p></div>
                </div>
              </div>
            )}

            <div className="checkout-form-actions">
              {step > 0 && <button type="button" className="checkout-button secondary" onClick={() => { setErrors({}); setStep(step - 1); }}>Back</button>}
              <button type="submit" className="checkout-button primary">
                {step === 2 ? 'Place order' : 'Continue'} <span>→</span>
              </button>
            </div>
          </form>
        </section>

        <aside className="checkout-summary">
          <div className="checkout-summary-top">
            <h3>Order summary</h3>
            <span className="checkout-summary-count">1 item</span>
          </div>
          <div className="checkout-summary-product">
            <div className="checkout-product-art" aria-hidden="true">🍒</div>
            <div className="checkout-product-info">
              <strong>Cherry Cake</strong>
              <span>Classic · 1 cake</span>
              <small>Example item</small>
            </div>
            <strong className="checkout-product-price">180,000</strong>
          </div>
          <div className="checkout-summary-line"><span>Subtotal</span><strong>180,000 UZS</strong></div>
          <div className="checkout-summary-line"><span>{delivery === 'pickup' ? 'Pickup' : 'Delivery'}</span><strong>{delivery === 'pickup' ? 'Free' : '25,000 UZS'}</strong></div>
          <div className="checkout-summary-total"><span>Total</span><strong>{delivery === 'pickup' ? '180,000' : '205,000'} <small>UZS</small></strong></div>
          <div className="checkout-summary-note"><span>♡</span><p>Freshly made with love. Thank you for choosing Cherry Cake!</p></div>
          <Link to="/menu" className="checkout-edit-cart">Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label, value, error, onChange, placeholder, type = 'text', wide = false, optional = false,
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  wide?: boolean;
  optional?: boolean;
}) {
  return (
    <div className={`checkout-field ${wide ? 'field-wide' : ''}`}>
      <label>{label} {optional && <span>Optional</span>}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-invalid={Boolean(error)} />
      {error && <small className="checkout-field-error">{error}</small>}
    </div>
  );
}
