import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

const initialItems: CartItem[] = [
  {
    id: 1,
    name: 'Cherry Cheesecake',
    price: 8,
    quantity: 1,
    image:
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=320&q=80',
  },
  {
    id: 2,
    name: 'Vanilla Cupcake',
    price: 3,
    quantity: 2,
    image:
      'https://images.unsplash.com/photo-1587668178277-295251f900ce?auto=format&fit=crop&w=320&q=80',
  },
];

// Mock checkout values used until cart data is connected to the backend.
const VAT_RATE = 0.12;
const DISCOUNT_RATE = 0.1;
const DISCOUNT_THRESHOLD = 20;
const DELIVERY_FEE = 4;
const ORDER_TYPE = 'DELIVERY';

function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`;
}

function roundAmount(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function CartSummary({ subtotal }: { subtotal: number }) {
  const vat = roundAmount(subtotal * VAT_RATE);
  const amountIncludingVat = roundAmount(subtotal + vat);
  const discount =
    amountIncludingVat >= DISCOUNT_THRESHOLD
      ? roundAmount(amountIncludingVat * DISCOUNT_RATE)
      : 0;
  const delivery = ORDER_TYPE === 'DELIVERY' ? DELIVERY_FEE : 0;
  const total = roundAmount(amountIncludingVat - discount + delivery);

  return (
    <Card title="Order Summary">
      <dl style={{ display: 'grid', gap: 12, margin: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <dt>Subtotal</dt>
          <dd data-testid="cart-subtotal" style={{ margin: 0 }}>
            {formatCurrency(subtotal)}
          </dd>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <dt>VAT ({VAT_RATE * 100}%)</dt>
          <dd data-testid="cart-vat" style={{ margin: 0 }}>
            {formatCurrency(vat)}
          </dd>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <dt>Amount including VAT</dt>
          <dd data-testid="cart-amount-incl-vat" style={{ margin: 0 }}>
            {formatCurrency(amountIncludingVat)}
          </dd>
        </div>
        {discount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
            <dt>Discount ({DISCOUNT_RATE * 100}%)</dt>
            <dd
              data-testid="cart-discount"
              style={{ margin: 0, color: 'var(--color-primary)' }}
            >
              -{formatCurrency(discount)}
            </dd>
          </div>
        )}
        {ORDER_TYPE === 'DELIVERY' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
            <dt>Delivery</dt>
            <dd data-testid="cart-delivery-fee" style={{ margin: 0 }}>
              {formatCurrency(delivery)}
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
            {formatCurrency(total)}
          </dd>
        </div>
      </dl>
    </Card>
  );
}

export default function Cart() {
  const [items, setItems] = useState<CartItem[]>(initialItems);
  const navigate = useNavigate();

  const subtotal = useMemo(
    () => roundAmount(items.reduce((total, item) => total + item.price * item.quantity, 0)),
    [items],
  );

  function updateQuantity(id: number, change: number) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item,
      ),
    );
  }

  function removeItem(id: number) {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  }

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
            {items.map((item) => (
              <li
                key={item.id}
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
                  src={item.image}
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
                    <strong>{formatCurrency(item.price * item.quantity)}</strong>
                  </div>
                  <span>{formatCurrency(item.price)} each</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Button
                        type="button"
                        variant="secondary"
                        style={{ padding: '4px 10px', minHeight: 'auto' }}
                        aria-label={`Decrease quantity of ${item.name}`}
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        -
                      </Button>
                      <span aria-live="polite" style={{ padding: '0 8px', fontWeight: 600 }}>
                        {item.quantity}
                      </span>
                      <Button
                        type="button"
                        variant="secondary"
                        style={{ padding: '4px 10px', minHeight: 'auto' }}
                        aria-label={`Increase quantity of ${item.name}`}
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        +
                      </Button>
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      style={{ padding: '4px 12px', minHeight: 'auto', color: '#b91c1c' }}
                      aria-label={`Remove ${item.name} from cart`}
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </Button>
                  </div>

                </div>
              </li>
            ))}
          </ul>
        </Card>

        <CartSummary subtotal={subtotal} />
      </div>

      <Button
        type="button"
        data-testid="cart-checkout"
        onClick={() => navigate('/checkout')}
      >
        Proceed to Checkout
      </Button>
    </section>
  );
}
