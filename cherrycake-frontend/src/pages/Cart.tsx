import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { api } from '../api/client';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import {
  isCartItem,
  removeFromCart,
  updateCartQuantity,
} from '../store';
import type { CartItem, AppDispatch, RootState } from '../store';

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

function CartSummary({ calculation }: { calculation: CartCalculation }) {
  return (
    <Card title="Order Summary">
      <dl style={{ display: 'grid', gap: 12, margin: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <dt>Subtotal</dt>
          <dd data-testid="cart-subtotal" style={{ margin: 0 }}>
            {formatMoney(calculation.subtotal, calculation.currencyCode)}
          </dd>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <dt>VAT ({calculation.vatRate * 100}%)</dt>
          <dd data-testid="cart-vat" style={{ margin: 0 }}>
            {formatMoney(calculation.vatAmount, calculation.currencyCode)}
          </dd>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <dt>Amount including VAT</dt>
          <dd data-testid="cart-amount-incl-vat" style={{ margin: 0 }}>
            {formatMoney(calculation.amountInclVat, calculation.currencyCode)}
          </dd>
        </div>
        {calculation.discountAmount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
            <dt>Discount ({calculation.discountRate * 100}%)</dt>
            <dd
              data-testid="cart-discount"
              style={{ margin: 0, color: 'var(--color-primary)' }}
            >
              -{formatMoney(calculation.discountAmount, calculation.currencyCode)}
            </dd>
          </div>
        )}
        {calculation.deliveryFee > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
            <dt>Delivery</dt>
            <dd data-testid="cart-delivery-fee" style={{ margin: 0 }}>
              {formatMoney(calculation.deliveryFee, calculation.currencyCode)}
            </dd>
          </div>
        )}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 16,
            paddingTop: 16,
            borderTop: '1px solid var(--color-border)',
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          <dt>TOTAL</dt>
          <dd data-testid="cart-total" style={{ margin: 0 }}>
            {formatMoney(calculation.total, calculation.currencyCode)}
          </dd>
        </div>
      </dl>
    </Card>
  );
}

function CartItemRow({
  item,
  calculatedItem,
  currencyCode,
  onDecrease,
  onIncrease,
  onRemove,
}: {
  item: CartItem;
  calculatedItem: CalculatedCartItem;
  currencyCode: string;
  onDecrease: () => void;
  onIncrease: () => void;
  onRemove: () => void;
}) {
  return (
    <li
      data-testid={`cart-item-${item.id}`}
      style={{
        display: 'grid',
        gridTemplateColumns: '80px minmax(0, 1fr)',
        gap: 16,
        alignItems: 'center',
        paddingBottom: 16,
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <img
        src={item.photoUrl ?? '/favicon.svg'}
        alt={item.name}
        style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
      />
      <div style={{ display: 'grid', gap: 6, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <strong>{item.name}</strong>
          <strong>{formatMoney(calculatedItem.lineTotal, currencyCode)}</strong>
        </div>
        <span>
          {formatMoney(calculatedItem.unitPrice, currencyCode)} each
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Button
            type="button"
            variant="secondary"
            aria-label={`Decrease quantity of ${item.name}`}
            onClick={onDecrease}
          >
            -
          </Button>
          <span data-testid={`cart-qty-${item.id}`} aria-live="polite">
            {item.quantity}
          </span>
          <Button
            type="button"
            variant="secondary"
            aria-label={`Increase quantity of ${item.name}`}
            onClick={onIncrease}
          >
            +
          </Button>
          <Button
            type="button"
            variant="secondary"
            aria-label={`Remove ${item.name} from cart`}
            data-testid={`cart-remove-${item.id}`}
            onClick={onRemove}
          >
            Remove
          </Button>
        </div>
      </div>
    </li>
  );
}

export default function Cart() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const storedItems = useSelector((state: RootState) => state.cart.items);
  const items = storedItems.filter(isCartItem);
  const currentRegion = useSelector((state: RootState) => state.region.code);
  const [calculation, setCalculation] = useState<CartCalculation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (items.length === 0) {
      setCalculation(null);
      setError('');
      return;
    }

    let active = true;
    setLoading(true);
    setError('');

    api
      .post<CartCalculation>('/cart/calculate', {
        region: currentRegion,
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
        if (active) setError('Unable to calculate your cart. Please try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [currentRegion, items]);

  if (items.length === 0) {
    return (
      <section style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
        <p className="cc-eyebrow">Your order</p>
        <h2>Your Cart Is Empty</h2>
        <p>There are no items in your cart yet. Explore our menu to find something sweet.</p>
        <Link to="/menu" className="cc-hero-action">
          Browse the Menu
        </Link>
      </section>
    );
  }

  return (
    <section style={{ display: 'grid', gap: 24 }}>
      <div>
        <p className="cc-eyebrow">Your order</p>
        <h2>Your Cart</h2>
      </div>

      {loading && <p>Calculating your cart...</p>}
      {error && <p role="alert">{error}</p>}

      {calculation && !error && (
        <div
          style={{
            display: 'grid',
            gap: 24,
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            alignItems: 'start',
          }}
        >
          <Card title="Cart Items">
            <ul style={{ display: 'grid', gap: 16, padding: 0, margin: 0, listStyle: 'none' }}>
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

          <CartSummary calculation={calculation} />
        </div>
      )}

      <Button
        type="button"
        data-testid="cart-checkout"
        disabled={loading || Boolean(error) || !calculation}
        onClick={() => navigate('/checkout')}
      >
        Proceed to Checkout
      </Button>
    </section>
  );
}
