import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';

import { api } from '../api/client';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import {
  isCartItem,
  removeFromCart,
  updateCartQuantity,
} from '../store';
import type { CartItem, AppDispatch, RootState } from '../store';
import { getProductImage } from '../constants/productImages';
import { translateProductName } from '../i18n/catalog';
import { useTranslation } from '../i18n/useTranslation';
import './Cart.css';

type CalculatedCartItem = {
  productId: number;
  unitPrice: number;
  modifiersPrice: number;
  quantity: number;
  lineTotal: number;
};

type CartCalculation = {
  items: CalculatedCartItem[];
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

function formatMoney(value: number, currencyCode: string) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currencyCode,
  }).format(value);
}

function CartSummary({
  calculation,
  disabled,
  onCheckout,
}: {
  calculation: CartCalculation;
  disabled: boolean;
  onCheckout: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Card title={t('cart.summaryTitle', 'Order Summary')} className="cc-cart-summary-card">
      <dl className="cc-cart-summary-list">
        <div className="cc-cart-summary-row">
          <dt>{t('cart.subtotal', 'Subtotal')}</dt>
          <dd data-testid="cart-subtotal">
            {formatMoney(calculation.subtotal, calculation.currencyCode)}
          </dd>
        </div>
        <div className="cc-cart-summary-row">
          <dt>{t('cart.vat', 'VAT ({rate}%)', { rate: calculation.vatRate * 100 })}</dt>
          <dd data-testid="cart-vat">
            {formatMoney(calculation.vatAmount, calculation.currencyCode)}
          </dd>
        </div>
        <div className="cc-cart-summary-row">
          <dt>{t('cart.amountInclVat', 'Amount including VAT')}</dt>
          <dd data-testid="cart-amount-incl-vat">
            {formatMoney(calculation.amountInclVat, calculation.currencyCode)}
          </dd>
        </div>
        {calculation.discountAmount > 0 && (
          <div className="cc-cart-summary-row is-discount">
            <dt>{t('cart.discount', 'Discount ({rate}%)', { rate: calculation.discountRate * 100 })}</dt>
            <dd data-testid="cart-discount">
              -{formatMoney(calculation.discountAmount, calculation.currencyCode)}
            </dd>
          </div>
        )}
        {calculation.deliveryFee > 0 && (
          <div className="cc-cart-summary-row">
            <dt>{t('cart.delivery', 'Delivery')}</dt>
            <dd data-testid="cart-delivery-fee">
              {formatMoney(calculation.deliveryFee, calculation.currencyCode)}
            </dd>
          </div>
        )}
        <div className="cc-cart-summary-total">
          <dt>{t('cart.total', 'TOTAL')}</dt>
          <dd data-testid="cart-total">
            {formatMoney(calculation.total, calculation.currencyCode)}
          </dd>
        </div>
      </dl>

      <div className="cc-cart-summary-actions">
        <Button
          type="button"
          data-testid="cart-checkout"
          disabled={disabled}
          onClick={onCheckout}
          style={{ width: '100%' }}
        >
          {t('cart.proceedToCheckout', 'Proceed to Checkout')}
        </Button>
        <Link to="/menu" className="cc-cart-continue-link">
          {t('cart.browseMenu', 'Browse the Menu')}
        </Link>
      </div>
    </Card>
  );
}

function CartItemRow({
  item,
  calculatedItem,
  currencyCode,
  disabled,
  onDecrease,
  onIncrease,
  onRemove,
}: {
  item: CartItem;
  calculatedItem: CalculatedCartItem;
  currencyCode: string;
  disabled?: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const displayName = translateProductName(t, item.name);
  return (
    <li data-testid={`cart-item-${item.id}`} className="cc-cart-row">
      <img
        src={item.imageUrl ?? item.photoUrl ?? getProductImage(item.name)}
        alt={displayName}
        className="cc-cart-thumb"
      />
      <div className="cc-cart-row-body">
        <div className="cc-cart-row-top">
          <strong className="cc-cart-item-name">{displayName}</strong>
          <strong className="cc-cart-item-total">
            {formatMoney(calculatedItem.lineTotal, currencyCode)}
          </strong>
        </div>
        <span className="cc-cart-item-unit">
          {t('cart.eachPrice', '{price} each', { price: formatMoney(calculatedItem.unitPrice, currencyCode) })}
        </span>
        <div className="cc-cart-row-actions">
          <div className="cc-cart-stepper">
            <button
              type="button"
              className="cc-cart-step-btn"
              disabled={disabled || item.quantity <= 1}
              aria-label={t('cart.decreaseQuantity', 'Decrease quantity of {name}', { name: displayName })}
              onClick={onDecrease}
            >
              &minus;
            </button>
            <span data-testid={`cart-qty-${item.id}`} aria-live="polite" className="cc-cart-step-value">
              {item.quantity}
            </span>
            <button
              type="button"
              className="cc-cart-step-btn"
              disabled={disabled}
              aria-label={t('cart.increaseQuantity', 'Increase quantity of {name}', { name: displayName })}
              onClick={onIncrease}
            >
              +
            </button>
          </div>
          <button
            type="button"
            className="cc-cart-remove-btn"
            disabled={disabled}
            aria-label={t('cart.removeFromCart', 'Remove {name} from cart', { name: displayName })}
            data-testid={`cart-remove-${item.id}`}
            onClick={onRemove}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            <span>{t('cart.remove', 'Remove')}</span>
          </button>
        </div>
      </div>
    </li>
  );
}

export default function Cart() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const storedItems = useSelector((state: RootState) => state.cart.items);
  const items = useMemo(() => storedItems.filter(isCartItem), [storedItems]);
  const currentRegion = useSelector((state: RootState) => state.region.code);
  const calcPayload = useMemo(
    () => ({
      region: currentRegion,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        modifierIds: item.modifierIds,
      })),
    }),
    [currentRegion, items],
  );
  const requestKey = items.length > 0 ? JSON.stringify(calcPayload) : '';
  const [calcResult, setCalcResult] = useState<{
    key: string;
    calculation: CartCalculation | null;
    hasError: boolean;
  } | null>(null);

  useEffect(() => {
    if (!requestKey) return;

    const controller = new AbortController();

    api
      .post<CartCalculation>('/cart/calculate', calcPayload, { signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) {
          setCalcResult({ key: requestKey, calculation: data, hasError: false });
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted && !axios.isCancel(err)) {
          setCalcResult({ key: requestKey, calculation: null, hasError: true });
        }
      });

    return () => {
      controller.abort();
    };
  }, [calcPayload, requestKey]);

  const activeCalcResult = requestKey && calcResult?.key === requestKey ? calcResult : null;
  const calculation = activeCalcResult?.calculation ?? null;
  const loading = Boolean(requestKey) && activeCalcResult === null;
  const error = activeCalcResult?.hasError
    ? t('cart.calculateError', 'Unable to calculate your cart. Please try again.')
    : '';

  if (items.length === 0) {
    return (
      <section style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
        <p className="cc-eyebrow">{t('cart.eyebrow', 'Your order')}</p>
        <h2>{t('cart.emptyTitle', 'Your Cart Is Empty')}</h2>
        <p>{t('cart.emptyText', 'There are no items in your cart yet. Explore our menu to find something sweet.')}</p>
        <Link to="/menu" className="cc-hero-action">
          {t('cart.browseMenu', 'Browse the Menu')}
        </Link>
      </section>
    );
  }

  return (
    <section className="cc-cart-page">
      <div className="cc-cart-header">
        <p className="cc-eyebrow">{t('cart.eyebrow', 'Your order')}</p>
        <h2>{t('cart.title', 'Your Cart')}</h2>
      </div>

      {loading && !calculation && <p>{t('cart.calculating', 'Calculating your cart...')}</p>}
      {error && <p role="alert">{error}</p>}

      {calculation && !error && (
        <div className={`cc-cart-grid${loading ? ' is-loading' : ''}`}>
          <Card title={t('cart.itemsTitle', 'Cart Items')}>
            <ul className="cc-cart-list">
              {items.map((item) => {
                const calculatedItem = calculation.items.find(
                  (line) => line.productId === item.productId,
                );

                if (!calculatedItem) return null;

                return (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    calculatedItem={calculatedItem}
                    currencyCode={calculation.currencyCode}
                    disabled={loading}
                    onDecrease={() =>
                      dispatch(updateCartQuantity({ id: item.id, quantity: item.quantity - 1 }))
                    }
                    onIncrease={() =>
                      dispatch(updateCartQuantity({ id: item.id, quantity: item.quantity + 1 }))
                    }
                    onRemove={() => dispatch(removeFromCart(item.id))}
                  />
                );
              })}
            </ul>
          </Card>

          <CartSummary
            calculation={calculation}
            disabled={loading || Boolean(error) || !calculation}
            onCheckout={() => navigate('/checkout')}
          />
        </div>
      )}
    </section>
  );
}
