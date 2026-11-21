import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { api } from '../api/client';
import { getAuthEmail } from '../utils/auth';
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
type PickupPoint = {
  id: number;
  name: string;
  address: string;
  openingHours: string;
};

type DeliveryZone = {
  id: number;
  name: string;
  deliveryFee: number;
  currencyCode: string;
};

type TimeSlot = {
  id: number;
  startTime: string;
  endTime: string;
  remaining: number;
  isAvailable: boolean;
};

type DeliveryType = 'delivery' | 'pickup';

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

  // The customer signed in with this email (code from the email), so it is filled in and locked.
  const [signedInEmail] = useState(getAuthEmail);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CheckoutForm>({
    name: '',
    phone: '',
    email: signedInEmail ?? '',
    orderDate: todayString(),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [calculation, setCalculation] = useState<Calculation | null>(null);
  const [calcError, setCalcError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery');

  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  const [selectedPickupPointId, setSelectedPickupPointId] = useState<number | ''>('');
  const [selectedDeliveryZoneId, setSelectedDeliveryZoneId] = useState<number | ''>('');
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<number | ''>('');

  const [optionsLoading, setOptionsLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState('');
  const [slotsError, setSlotsError] = useState('');

  // Pickup points and delivery zones belong to a region: reload them (and forget the old choice) when it changes.
  useEffect(() => {
    let active = true;

    setOptionsLoading(true);
    setOptionsError('');
    setSelectedPickupPointId('');
    setSelectedDeliveryZoneId('');

    Promise.all([
      api.get<PickupPoint[]>('/pickup-points', { params: { region } }),
      api.get<DeliveryZone[]>('/delivery-zones', { params: { region } }),
    ])
      .then(([pickupResponse, deliveryResponse]) => {
        if (!active) return;
        setPickupPoints(pickupResponse.data);
        setDeliveryZones(deliveryResponse.data);
      })
      .catch(() => {
        if (active) setOptionsError('Unable to load delivery and pickup options.');
      })
      .finally(() => {
        if (active) setOptionsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [region]);

  // Time slots (with the places left) are loaded again whenever the order date changes.
  useEffect(() => {
    if (!form.orderDate || form.orderDate < todayString()) {
      setTimeSlots([]);
      setSelectedTimeSlotId('');
      return;
    }

    let active = true;

    setSlotsLoading(true);
    setSlotsError('');
    setSelectedTimeSlotId('');
    setTimeSlots([]);

    api
      .get<TimeSlot[]>('/time-slots', { params: { date: form.orderDate } })
      .then(({ data }) => {
        if (active) setTimeSlots(data);
      })
      .catch(() => {
        if (active) setSlotsError('Unable to load available time slots.');
      })
      .finally(() => {
        if (active) setSlotsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [form.orderDate]);

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
        ...(deliveryType === 'delivery' && selectedDeliveryZoneId !== ''
          ? { deliveryZoneId: selectedDeliveryZoneId }
          : {}),
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
  }, [region, storedItems, deliveryType, selectedDeliveryZoneId]);

  const selectedZone = deliveryZones.find((zone) => zone.id === selectedDeliveryZoneId);
  const selectedPoint = pickupPoints.find((point) => point.id === selectedPickupPointId);
  const selectedSlot = timeSlots.find((slot) => slot.id === selectedTimeSlotId);

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

    if (!form.orderDate) {
      next.orderDate = 'Please choose the order date.';
    } else if (form.orderDate < todayString()) {
      next.orderDate = 'The order date must not be in the past.';
    }

    if (deliveryType === 'delivery' && selectedDeliveryZoneId === '') {
      next.deliveryZoneId = 'Please choose a delivery area.';
    }

    if (deliveryType === 'pickup' && selectedPickupPointId === '') {
      next.pickupPointId = 'Please choose a pickup point.';
    }

    if (!selectedSlot || !selectedSlot.isAvailable) {
      next.timeSlotId = 'Please choose an available time slot.';
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
        // The backend requires fulfillmentType whenever a point, zone or time slot is sent.
        fulfillmentType: deliveryType === 'delivery' ? 'DELIVERY' : 'PICKUP',
        ...(deliveryType === 'delivery'
          ? { deliveryZoneId: selectedDeliveryZoneId }
          : { pickupPointId: selectedPickupPointId }),
        timeSlotId: selectedTimeSlotId,
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
      .catch((error: {
        response?: {
          status?: number;
          data?: { message?: string };
        };
      }) => {
        if (error.response?.status === 409) {
          // Out of stock, time slot is full or zone/point is closed: the backend message says which one.
          setSubmitError(
            error.response?.data?.message ??
              'Your order could not be placed because something is no longer available. Please review your order and try again.',
          );
        } else {
          setSubmitError(
            error.response?.data?.message ??
              'Unable to place the order. Please try again.',
          );
        }
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
                  <Field
                    label="Email address"
                    value={form.email}
                    error={errors.email}
                    onChange={(v) => update('email', v)}
                    placeholder="you@example.com"
                    type="email"
                    readOnly={Boolean(signedInEmail)}
                    hint={signedInEmail ? <>Signed in with this email · <Link to="/account">Change</Link></> : undefined}
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="checkout-section">
                <div className="checkout-section-title">
                  <span className="checkout-section-icon">⌖</span>
                  <div>
                    <h3>Order details</h3>
                    <p>Choose how and when you want to receive your order.</p>
                  </div>
                </div>

                <div className="checkout-fields">
                  <div className="checkout-field">
                    <span className="checkout-label" id="receiving-method-label">Receiving method</span>
                    <div className="checkout-choice-grid" role="radiogroup" aria-labelledby="receiving-method-label">
                      <button
                        type="button"
                        role="radio"
                        aria-checked={deliveryType === 'delivery'}
                        className={`checkout-choice ${deliveryType === 'delivery' ? 'is-selected' : ''}`}
                        onClick={() => {
                          setDeliveryType('delivery');
                          setSelectedPickupPointId('');
                          setErrors((current) => ({ ...current, pickupPointId: '' }));
                        }}
                      >
                        <span className="checkout-choice-title">Delivery</span>
                        <span className="checkout-choice-description">We bring it to you</span>
                      </button>
                      <button
                        type="button"
                        role="radio"
                        aria-checked={deliveryType === 'pickup'}
                        className={`checkout-choice ${deliveryType === 'pickup' ? 'is-selected' : ''}`}
                        onClick={() => {
                          setDeliveryType('pickup');
                          setSelectedDeliveryZoneId('');
                          setErrors((current) => ({ ...current, deliveryZoneId: '' }));
                        }}
                      >
                        <span className="checkout-choice-title">Pickup</span>
                        <span className="checkout-choice-description">Collect it at our café</span>
                      </button>
                    </div>
                  </div>

                  {optionsLoading && <p className="checkout-hint">Loading delivery options...</p>}
                  {!optionsLoading && optionsError && (
                    <p role="alert" className="checkout-field-error">{optionsError}</p>
                  )}

                  {!optionsLoading && !optionsError && deliveryType === 'delivery' && (
                    <div className="checkout-field">
                      <label htmlFor="deliveryZone">Delivery area</label>
                      <select
                        id="deliveryZone"
                        value={selectedDeliveryZoneId}
                        aria-invalid={Boolean(errors.deliveryZoneId)}
                        onChange={(e) => {
                          setSelectedDeliveryZoneId(e.target.value ? Number(e.target.value) : '');
                          setErrors((current) => ({ ...current, deliveryZoneId: '' }));
                        }}
                      >
                        <option value="">Choose delivery area</option>
                        {deliveryZones.map((zone) => (
                          <option key={zone.id} value={zone.id}>
                            {zone.name} — {formatMoney(zone.deliveryFee, zone.currencyCode)}
                          </option>
                        ))}
                      </select>
                      {errors.deliveryZoneId && (
                        <small className="checkout-field-error">{errors.deliveryZoneId}</small>
                      )}
                    </div>
                  )}

                  {!optionsLoading && !optionsError && deliveryType === 'pickup' && (
                    <div className="checkout-field">
                      <label htmlFor="pickupPoint">Pickup point</label>
                      <select
                        id="pickupPoint"
                        value={selectedPickupPointId}
                        aria-invalid={Boolean(errors.pickupPointId)}
                        onChange={(e) => {
                          setSelectedPickupPointId(e.target.value ? Number(e.target.value) : '');
                          setErrors((current) => ({ ...current, pickupPointId: '' }));
                        }}
                      >
                        <option value="">Choose pickup point</option>
                        {pickupPoints.map((point) => (
                          <option key={point.id} value={point.id}>
                            {point.name} — {point.address}
                          </option>
                        ))}
                      </select>
                      {errors.pickupPointId && (
                        <small className="checkout-field-error">{errors.pickupPointId}</small>
                      )}
                    </div>
                  )}

                  <Field
                    label="Order date"
                    value={form.orderDate}
                    error={errors.orderDate}
                    onChange={(v) => update('orderDate', v)}
                    type="date"
                    min={todayString()}
                  />

                  <div className="checkout-field">
                    <span className="checkout-label" id="time-slot-label">Available time slots</span>

                    {slotsLoading ? (
                      <p className="checkout-hint">Loading time slots...</p>
                    ) : slotsError ? (
                      <small role="alert" className="checkout-field-error">{slotsError}</small>
                    ) : timeSlots.length === 0 ? (
                      <p className="checkout-hint">No time slots available for this date.</p>
                    ) : (
                      <div className="checkout-slot-grid" role="radiogroup" aria-labelledby="time-slot-label">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot.id}
                            type="button"
                            role="radio"
                            aria-checked={selectedTimeSlotId === slot.id}
                            disabled={!slot.isAvailable}
                            className={`checkout-slot ${selectedTimeSlotId === slot.id ? 'is-selected' : ''}`}
                            onClick={() => {
                              setSelectedTimeSlotId(slot.id);
                              setErrors((current) => ({ ...current, timeSlotId: '' }));
                            }}
                          >
                            <strong>{slot.startTime}–{slot.endTime}</strong>
                            <small>{slot.isAvailable ? `${slot.remaining} left` : 'Unavailable'}</small>
                          </button>
                        ))}
                      </div>
                    )}

                    {errors.timeSlotId && (
                      <small className="checkout-field-error">{errors.timeSlotId}</small>
                    )}
                  </div>
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
                    <p>
                      {deliveryType === 'delivery'
                        ? `Delivery · ${selectedZone?.name ?? ''}`
                        : `Pickup · ${selectedPoint?.name ?? ''}${selectedPoint ? `, ${selectedPoint.address}` : ''}`}
                    </p>
                    {selectedSlot && <p>Time: {selectedSlot.startTime}–{selectedSlot.endTime}</p>}
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
  label, value, error, onChange, placeholder, type = 'text', wide = false, min, readOnly = false, hint,
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  wide?: boolean;
  min?: string;
  readOnly?: boolean;
  hint?: ReactNode;
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
        readOnly={readOnly}
        aria-invalid={Boolean(error)}
      />
      {hint && <small className="checkout-field-hint">{hint}</small>}
      {error && <small className="checkout-field-error">{error}</small>}
    </div>
  );
}
