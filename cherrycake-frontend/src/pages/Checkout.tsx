import { Fragment, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';

import { api } from '../api/client';
import { getAuthEmail } from '../utils/auth';
import { clearCart, isCartItem } from '../store';
import type { AppDispatch, RootState } from '../store';
import { getProductImage } from '../constants/productImages';
import { translateDeliveryZoneName, translateProductName } from '../i18n/catalog';
import { useTranslation } from '../i18n/useTranslation';
import CustomSelect from '../components/ui/CustomSelect';
import DatePicker from '../components/ui/DatePicker';
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
type TimingMode = 'now' | 'scheduled';

export type PlacedOrder = {
  orderNumber: string;
  orderDate: string;
  region: string;
  customer: { name: string; phone: string; email: string };
  total: number;
  currencyCode: string;
};

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
  const { t } = useTranslation();
  const storedItems = useSelector((state: RootState) => state.cart.items);
  const items = useMemo(() => storedItems.filter(isCartItem), [storedItems]);
  const region = useSelector((state: RootState) => state.region.code);

  const steps = [
    t('checkout.stepContact', 'Contact'),
    t('checkout.stepOrderDate', 'Order date'),
    t('checkout.stepConfirm', 'Confirm'),
  ];

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
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery');
  const [timingMode, setTimingMode] = useState<TimingMode>('now');
  const [currentHour] = useState(() => new Date().getHours());

  const [selectedPickupPointId, setSelectedPickupPointId] = useState<number | ''>('');
  const [selectedDeliveryZoneId, setSelectedDeliveryZoneId] = useState<number | ''>('');
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<number | ''>('');

  const [optionsResult, setOptionsResult] = useState<{
    region: string;
    pickupPoints: PickupPoint[];
    deliveryZones: DeliveryZone[];
    hasError: boolean;
  } | null>(null);
  const [slotsResult, setSlotsResult] = useState<{
    date: string;
    slots: TimeSlot[];
    hasError: boolean;
  } | null>(null);
  const [calcResult, setCalcResult] = useState<{
    key: string;
    calculation: Calculation | null;
    hasError: boolean;
  } | null>(null);

  // Pickup points and delivery zones belong to a region: reload them when it changes.
  useEffect(() => {
    const controller = new AbortController();

    Promise.all([
      api.get<PickupPoint[]>('/pickup-points', { params: { region }, signal: controller.signal }),
      api.get<DeliveryZone[]>('/delivery-zones', { params: { region }, signal: controller.signal }),
    ])
      .then(([pickupResponse, deliveryResponse]) => {
        if (!controller.signal.aborted) {
          setOptionsResult({
            region,
            pickupPoints: pickupResponse.data,
            deliveryZones: deliveryResponse.data,
            hasError: false,
          });
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted && !axios.isCancel(err)) {
          setOptionsResult({ region, pickupPoints: [], deliveryZones: [], hasError: true });
        }
      });

    return () => {
      controller.abort();
    };
  }, [region]);

  const validOrderDate = Boolean(form.orderDate) && form.orderDate >= todayString();

  // Time slots (with the places left) are loaded again whenever the order date changes.
  useEffect(() => {
    if (!validOrderDate) return;

    const controller = new AbortController();

    api
      .get<TimeSlot[]>('/time-slots', { params: { date: form.orderDate }, signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) {
          setSlotsResult({ date: form.orderDate, slots: data, hasError: false });
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted && !axios.isCancel(err)) {
          setSlotsResult({ date: form.orderDate, slots: [], hasError: true });
        }
      });

    return () => {
      controller.abort();
    };
  }, [form.orderDate, validOrderDate]);

  const activeOptions = optionsResult?.region === region ? optionsResult : null;
  const optionsLoading = activeOptions === null;
  const optionsError = activeOptions?.hasError
    ? t('checkout.optionsError', 'Unable to load delivery and pickup options.')
    : '';
  const pickupPoints = useMemo(() => activeOptions?.pickupPoints ?? [], [activeOptions]);
  const deliveryZones = useMemo(() => activeOptions?.deliveryZones ?? [], [activeOptions]);

  const activeSlots = validOrderDate && slotsResult?.date === form.orderDate ? slotsResult : null;
  const slotsLoading = validOrderDate && activeSlots === null;
  const slotsError = activeSlots?.hasError
    ? t('checkout.slotsError', 'Unable to load available time slots.')
    : '';
  const timeSlots = useMemo(() => activeSlots?.slots ?? [], [activeSlots]);

  const effectiveDeliveryZoneId = deliveryZones.some((z) => z.id === selectedDeliveryZoneId)
    ? selectedDeliveryZoneId
    : '';
  const effectivePickupPointId = pickupPoints.some((p) => p.id === selectedPickupPointId)
    ? selectedPickupPointId
    : '';
  const effectiveTimeSlotId = timeSlots.some((s) => s.id === selectedTimeSlotId && s.isAvailable)
    ? selectedTimeSlotId
    : '';

  const calcPayload = useMemo(
    () => ({
      region,
      ...(deliveryType === 'delivery' && effectiveDeliveryZoneId !== ''
        ? { deliveryZoneId: effectiveDeliveryZoneId }
        : {}),
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        modifierIds: item.modifierIds,
      })),
    }),
    [region, deliveryType, effectiveDeliveryZoneId, items],
  );
  const calcKey = items.length > 0 ? JSON.stringify(calcPayload) : '';

  // Totals always come from the backend, the frontend never calculates them itself.
  useEffect(() => {
    if (!calcKey) return;

    const controller = new AbortController();

    api
      .post<Calculation>('/cart/calculate', calcPayload, { signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) {
          setCalcResult({ key: calcKey, calculation: data, hasError: false });
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted && !axios.isCancel(err)) {
          setCalcResult({ key: calcKey, calculation: null, hasError: true });
        }
      });

    return () => {
      controller.abort();
    };
  }, [calcPayload, calcKey]);

  const activeCalc = calcKey && calcResult?.key === calcKey ? calcResult : null;
  const calculation = activeCalc?.calculation ?? null;
  const calcError = activeCalc?.hasError
    ? t('checkout.calcError', 'Unable to calculate your order. Please try again.')
    : '';

  const selectedZone = deliveryZones.find((zone) => zone.id === effectiveDeliveryZoneId);
  const selectedPoint = pickupPoints.find((point) => point.id === effectivePickupPointId);
  const selectedSlot = timeSlots.find((slot) => slot.id === effectiveTimeSlotId);
  const nowSlot = useMemo(() => {
    const available = timeSlots.filter((slot) => slot.isAvailable);
    if (available.length === 0) return undefined;
    const upcoming = available.find((slot) => {
      const startHour = Number(slot.startTime.split(':')[0]);
      return Number.isFinite(startHour) && startHour >= currentHour;
    });
    return upcoming ?? available[0];
  }, [timeSlots, currentHour]);
  const resolvedSlot = timingMode === 'now' ? nowSlot : selectedSlot;
  const resolvedTimeSlotId = timingMode === 'now' ? (nowSlot?.id ?? '') : effectiveTimeSlotId;

  const update = (key: keyof CheckoutForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: '' }));
    if (key === 'orderDate') {
      setSelectedTimeSlotId('');
    }
  };

  const validateContact = () => {
    const next: Record<string, string> = {};

    const name = form.name.trim();
    if (!name) next.name = t('checkout.errorNameRequired', 'Please enter your name.');
    else if (name.length < 2) next.name = t('checkout.errorNameShort', 'Name must contain at least 2 characters.');

    // Same rule as the backend: 7 to 15 digits with an optional leading +.
    const phone = form.phone.replace(/[\s()-]/g, '');
    if (!form.phone.trim()) next.phone = t('checkout.errorPhoneRequired', 'Please enter your phone number.');
    else if (!/^\+?[1-9][0-9]{6,14}$/.test(phone)) {
      next.phone = t('checkout.errorPhoneFormat', 'Phone must contain 7 to 15 digits, with an optional leading +.');
    }

    const email = form.email.trim();
    if (!email) next.email = t('checkout.errorEmailRequired', 'Please enter your email address.');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = t('checkout.errorEmailInvalid', 'Please enter a valid email address.');
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateDate = () => {
    const next: Record<string, string> = {};

    if (deliveryType === 'delivery' && effectiveDeliveryZoneId === '') {
      next.deliveryZoneId = t('checkout.errorZoneRequired', 'Please choose a delivery area.');
    }

    if (deliveryType === 'pickup' && effectivePickupPointId === '') {
      next.pickupPointId = t('checkout.errorPointRequired', 'Please choose a pickup point.');
    }

    if (timingMode === 'scheduled') {
      if (!form.orderDate) {
        next.orderDate = t('checkout.errorDateRequired', 'Please choose the order date.');
      } else if (form.orderDate < todayString()) {
        next.orderDate = t('checkout.errorDatePast', 'The order date must not be in the past.');
      }

      if (!selectedSlot || !selectedSlot.isAvailable) {
        next.timeSlotId = t('checkout.errorSlotRequired', 'Please choose a time.');
      }
    } else if (!resolvedSlot || !resolvedSlot.isAvailable) {
      next.timeSlotId = slotsLoading
        ? t('checkout.loadingSlots', 'Loading availability...')
        : t('checkout.noNowSlots', 'No immediate slots left today — please choose a specific time.');
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
        orderDate: timingMode === 'now' ? todayString() : form.orderDate,
        // The backend requires fulfillmentType whenever a point, zone or time slot is sent.
        fulfillmentType: deliveryType === 'delivery' ? 'DELIVERY' : 'PICKUP',
        ...(deliveryType === 'delivery'
          ? { deliveryZoneId: effectiveDeliveryZoneId }
          : { pickupPointId: effectivePickupPointId }),
        timeSlotId: resolvedTimeSlotId,
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
              t('checkout.submitErrorUnavailable', 'Your order could not be placed because something is no longer available. Please review your order and try again.'),
          );
        } else {
          setSubmitError(
            error.response?.data?.message ??
              t('checkout.submitError', 'Unable to place the order. Please try again.'),
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
            <p className="checkout-eyebrow">{t('checkout.eyebrow', 'CHERRY CAKE · YOUR ORDER')}</p>
            <h2>{t('checkout.emptyTitle', 'Your cart is empty')}</h2>
            <p className="checkout-subtitle">{t('checkout.emptyText', 'Add something sweet to your cart before checking out.')}</p>
          </div>
          <Link to="/menu" className="checkout-back-link">← {t('checkout.browseMenu', 'Browse the menu')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-heading">
        <div>
          <p className="checkout-eyebrow">{t('checkout.eyebrow', 'CHERRY CAKE · YOUR ORDER')}</p>
          <h2>{t('checkout.title', 'Checkout')}</h2>
          <p className="checkout-subtitle">{t('checkout.subtitle', 'A few details, then your sweet moment is on its way.')}</p>
        </div>
        <Link to="/cart" className="checkout-back-link">← {t('checkout.backToCart', 'Back to cart')}</Link>
      </div>

      <div className="checkout-layout">
        <section className="checkout-main">
          <div className="checkout-stepper" aria-label={t('checkout.progressAria', 'Checkout progress')}>
            {steps.map((label, index) => (
              <Fragment key={label}>
                <div className={`checkout-step ${index === step ? 'is-active' : ''} ${index < step ? 'is-done' : ''}`}>
                  <span className="checkout-step-number">{index < step ? '✓' : index + 1}</span>
                  <span className="checkout-step-label">{label}</span>
                </div>
                {index < steps.length - 1 && (
                  <span
                    className={`checkout-step-rail ${index < step ? 'is-done' : ''}`}
                    aria-hidden="true"
                  />
                )}
              </Fragment>
            ))}
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {step === 0 && (
              <div className="checkout-section">
                <div className="checkout-section-title">
                  <span className="checkout-section-icon">♡</span>
                  <div>
                    <h3>{t('checkout.contactTitle', 'Contact information')}</h3>
                    <p>{t('checkout.contactText', 'Who should we contact about your order?')}</p>
                  </div>
                </div>
                <div className="checkout-fields two-columns">
                  <Field id="checkout-full-name" label={t('checkout.fullName', 'Full name')} value={form.name} error={errors.name} onChange={(v) => update('name', v)} placeholder={t('checkout.fullNamePlaceholder', 'Your full name')} wide />
                  <Field id="checkout-phone-number" label={t('checkout.phone', 'Phone number')} value={form.phone} error={errors.phone} onChange={(v) => update('phone', v)} placeholder={t('checkout.phonePlaceholder', '+998 90 123 45 67')} type="tel" />
                  <Field
                    id="checkout-email-address"
                    label={t('checkout.email', 'Email address')}
                    value={form.email}
                    error={errors.email}
                    onChange={(v) => update('email', v)}
                    placeholder={t('checkout.emailPlaceholder', 'you@example.com')}
                    type="email"
                    readOnly={Boolean(signedInEmail)}
                    hint={signedInEmail ? <>{t('checkout.signedInHint', 'Signed in with this email')} · <Link to="/account">{t('checkout.changeEmail', 'Change')}</Link></> : undefined}
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="checkout-section">
                <div className="checkout-section-title">
                  <span className="checkout-section-icon">⌖</span>
                  <div>
                    <h3>{t('checkout.detailsTitle', 'Order details')}</h3>
                    <p>{t('checkout.detailsText', 'Choose how and when you want to receive your order.')}</p>
                  </div>
                </div>

                <div className="checkout-fields">
                  <div className="checkout-field">
                    <span className="checkout-label" id="receiving-method-label">{t('checkout.receivingMethod', 'Receiving method')}</span>
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
                        <span className="checkout-choice-title">{t('checkout.deliveryOption', 'Delivery')}</span>
                        <span className="checkout-choice-description">{t('checkout.deliveryOptionText', 'We bring it to you')}</span>
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
                        <span className="checkout-choice-title">{t('checkout.pickupOption', 'Pickup')}</span>
                        <span className="checkout-choice-description">{t('checkout.pickupOptionText', 'Collect it at our café')}</span>
                      </button>
                    </div>
                  </div>

                  {optionsLoading && <p className="checkout-hint">{t('checkout.loadingOptions', 'Loading delivery options...')}</p>}
                  {!optionsLoading && optionsError && (
                    <p role="alert" className="checkout-field-error">{optionsError}</p>
                  )}

                  {!optionsLoading && !optionsError && deliveryType === 'delivery' && (
                    <div className="checkout-field">
                      <CustomSelect
                        id="deliveryZone"
                        label={t('checkout.deliveryArea', 'Delivery area')}
                        value={String(effectiveDeliveryZoneId)}
                        error={errors.deliveryZoneId}
                        placeholder={t('checkout.chooseDeliveryArea', 'Choose delivery area')}
                        options={[
                          {
                            value: '',
                            label: t('checkout.chooseDeliveryArea', 'Choose delivery area'),
                          },
                          ...deliveryZones.map((zone) => ({
                            value: String(zone.id),
                            label: translateDeliveryZoneName(t, zone.name),
                            meta: formatMoney(zone.deliveryFee, zone.currencyCode),
                          })),
                        ]}
                        onChange={(value) => {
                          setSelectedDeliveryZoneId(value ? Number(value) : '');
                          setErrors((current) => ({ ...current, deliveryZoneId: '' }));
                        }}
                      />
                    </div>
                  )}

                  {!optionsLoading && !optionsError && deliveryType === 'pickup' && (
                    <div className="checkout-field">
                      <CustomSelect
                        id="pickupPoint"
                        label={t('checkout.pickupPoint', 'Pickup point')}
                        value={String(effectivePickupPointId)}
                        error={errors.pickupPointId}
                        placeholder={t('checkout.choosePickupPoint', 'Choose pickup point')}
                        options={[
                          {
                            value: '',
                            label: t('checkout.choosePickupPoint', 'Choose pickup point'),
                          },
                          ...pickupPoints.map((point) => ({
                            value: String(point.id),
                            label: `${point.name} — ${point.address}`,
                          })),
                        ]}
                        onChange={(value) => {
                          setSelectedPickupPointId(value ? Number(value) : '');
                          setErrors((current) => ({ ...current, pickupPointId: '' }));
                        }}
                      />
                    </div>
                  )}

                  <div className="checkout-field">
                    <span className="checkout-label" id="timing-mode-label">
                      {t('checkout.whenLabel', 'When would you like it?')}
                    </span>
                    <div className="checkout-choice-grid" role="radiogroup" aria-labelledby="timing-mode-label">
                      <button
                        type="button"
                        role="radio"
                        aria-checked={timingMode === 'now'}
                        className={`checkout-choice ${timingMode === 'now' ? 'is-selected' : ''}`}
                        onClick={() => {
                          setTimingMode('now');
                          setForm((current) => ({ ...current, orderDate: todayString() }));
                          setErrors((current) => ({ ...current, orderDate: '', timeSlotId: '' }));
                        }}
                      >
                        <span className="checkout-choice-title">{t('checkout.timingNow', 'Now')}</span>
                        <span className="checkout-choice-description">
                          {t('checkout.timingNowDesc', 'As soon as possible (~35–45 min)')}
                        </span>
                      </button>
                      <button
                        type="button"
                        role="radio"
                        aria-checked={timingMode === 'scheduled'}
                        className={`checkout-choice ${timingMode === 'scheduled' ? 'is-selected' : ''}`}
                        onClick={() => {
                          setTimingMode('scheduled');
                          setErrors((current) => ({ ...current, timeSlotId: '' }));
                        }}
                      >
                        <span className="checkout-choice-title">
                          {t('checkout.timingScheduled', 'At specific time')}
                        </span>
                        <span className="checkout-choice-description">
                          {t('checkout.timingScheduledDesc', 'Choose a date and time')}
                        </span>
                      </button>
                    </div>
                  </div>

                  {timingMode === 'now' ? (
                    (slotsError || errors.timeSlotId) && (
                      <small role="alert" className="checkout-field-error">
                        {errors.timeSlotId || slotsError}
                      </small>
                    )
                  ) : (
                    <div className="checkout-fields two-columns">
                      <div className="checkout-field">
                        <DatePicker
                          id="checkout-order-date"
                          label={t('checkout.orderDate', 'Order date')}
                          value={form.orderDate}
                          min={todayString()}
                          error={errors.orderDate}
                          onChange={(v) => update('orderDate', v)}
                        />
                      </div>
                      <div className="checkout-field">
                        <CustomSelect
                          id="checkout-preferred-time"
                          label={t('checkout.preferredTime', 'Preferred time')}
                          value={String(effectiveTimeSlotId)}
                          disabled={slotsLoading || Boolean(slotsError) || timeSlots.length === 0}
                          error={errors.timeSlotId || slotsError}
                          placeholder={
                            slotsLoading
                              ? t('checkout.loadingSlots', 'Loading...')
                              : t('checkout.chooseTime', 'Choose time')
                          }
                          options={[
                            {
                              value: '',
                              label: t('checkout.chooseTime', 'Choose time'),
                            },
                            ...timeSlots.map((slot) => ({
                              value: String(slot.id),
                              label: `${slot.startTime}–${slot.endTime}`,
                              disabled: !slot.isAvailable,
                              meta: !slot.isAvailable
                                ? t('checkout.slotUnavailable', 'Unavailable')
                                : undefined,
                            })),
                          ]}
                          onChange={(value) => {
                            setSelectedTimeSlotId(value ? Number(value) : '');
                            setErrors((current) => ({ ...current, timeSlotId: '' }));
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="checkout-section">
                <div className="checkout-section-title">
                  <span className="checkout-section-icon">♡</span>
                  <div>
                    <h3>{t('checkout.confirmTitle', 'Confirm your order')}</h3>
                    <p>{t('checkout.confirmText', 'Check your details and place the order.')}</p>
                  </div>
                </div>
                <div className="checkout-review">
                  <span className="checkout-review-check">✓</span>
                  <div>
                    <strong>{form.name.trim()}</strong>
                    <p>{form.phone.trim()} · {form.email.trim()}</p>
                    <p>{t('checkout.reviewDateCountry', 'Order date: {date} · Country: {country}', { date: form.orderDate, country: region })}</p>
                    <p>
                      {deliveryType === 'delivery'
                        ? t('checkout.reviewDelivery', 'Delivery · {zone}', {
                            zone: translateDeliveryZoneName(t, selectedZone?.name ?? ''),
                          })
                        : t('checkout.reviewPickup', 'Pickup · {point}', {
                            point: `${selectedPoint?.name ?? ''}${selectedPoint ? `, ${selectedPoint.address}` : ''}`,
                          })}
                    </p>
                    {timingMode === 'now' ? (
                      <p>{t('checkout.reviewNow', 'Timing: As soon as possible (Today)')}</p>
                    ) : (
                      selectedSlot && (
                        <p>
                          {t('checkout.reviewTime', 'Time: {start}–{end}', {
                            start: selectedSlot.startTime,
                            end: selectedSlot.endTime,
                          })}
                        </p>
                      )
                    )}
                  </div>
                </div>
                {submitError && <p role="alert" className="checkout-field-error">{submitError}</p>}
              </div>
            )}

            <div className="checkout-form-actions">
              {step > 0 && (
                <button type="button" className="checkout-button secondary" onClick={() => { setErrors({}); setSubmitError(''); setStep(step - 1); }}>
                  {t('checkout.back', 'Back')}
                </button>
              )}
              <button type="submit" className="checkout-button primary" disabled={submitting || (step === 2 && !calculation)}>
                {step === 2 ? (submitting ? t('checkout.placingOrder', 'Placing order...') : t('checkout.placeOrder', 'Place order')) : t('checkout.continue', 'Continue')} <span>→</span>
              </button>
            </div>
          </form>
        </section>

        <aside className="checkout-summary">
          <div className="checkout-summary-top">
            <h3>{t('checkout.summaryTitle', 'Order summary')}</h3>
            <span className="checkout-summary-count">{items.length === 1 ? t('checkout.itemCountOne', '{count} item', { count: items.length }) : t('checkout.itemCount', '{count} items', { count: items.length })}</span>
          </div>

          {calcError && <p role="alert" className="checkout-field-error">{calcError}</p>}
          {!calculation && !calcError && <p>{t('checkout.calculating', 'Calculating...')}</p>}

          {calculation && (
            <>
              <div className="checkout-summary-items">
                {items.map((item) => {
                  const line = calculation.items.find((entry) => entry.productId === item.productId);
                  const displayName = translateProductName(t, item.name);
                  return (
                    <div className="checkout-summary-product" key={item.id}>
                      <img
                        src={item.imageUrl ?? item.photoUrl ?? getProductImage(item.name)}
                        alt={displayName}
                        className="checkout-product-thumb"
                      />
                      <div className="checkout-product-info">
                        <strong>{displayName}</strong>
                        <span className="checkout-product-qty">× {item.quantity}</span>
                      </div>
                      {line && (
                        <strong className="checkout-product-price">
                          {formatMoney(line.lineTotal, calculation.currencyCode)}
                        </strong>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="checkout-summary-line"><span>{t('checkout.subtotal', 'Subtotal')}</span><strong>{formatMoney(calculation.subtotal, calculation.currencyCode)}</strong></div>
              <div className="checkout-summary-line"><span>{t('checkout.vat', 'VAT ({rate}%)', { rate: Math.round(calculation.vatRate * 100) })}</span><strong>{formatMoney(calculation.vatAmount, calculation.currencyCode)}</strong></div>
              <div className="checkout-summary-line"><span>{t('checkout.amountInclVat', 'Amount including VAT')}</span><strong>{formatMoney(calculation.amountInclVat, calculation.currencyCode)}</strong></div>
              {calculation.discountAmount > 0 && (
                <div className="checkout-summary-line"><span>{t('checkout.discount', 'Discount ({rate}%)', { rate: Math.round(calculation.discountRate * 100) })}</span><strong>-{formatMoney(calculation.discountAmount, calculation.currencyCode)}</strong></div>
              )}
              {calculation.deliveryFee > 0 && (
                <div className="checkout-summary-line"><span>{t('checkout.deliveryFee', 'Delivery')}</span><strong>{formatMoney(calculation.deliveryFee, calculation.currencyCode)}</strong></div>
              )}
              <div className="checkout-summary-total"><span>{t('checkout.total', 'Total')}</span><strong>{formatMoney(calculation.total, calculation.currencyCode)}</strong></div>
            </>
          )}

          <div className="checkout-summary-footer">
            <div className="checkout-summary-note"><span>♡</span><p>{t('checkout.summaryNote', 'Freshly made with love. Thank you for choosing Cherry Cake!')}</p></div>
            <Link to="/menu" className="checkout-edit-cart">{t('checkout.continueShopping', 'Continue shopping')}</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({
  id, label, value, error, onChange, placeholder, type = 'text', wide = false, min, readOnly = false, hint,
}: {
  id: string;
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
