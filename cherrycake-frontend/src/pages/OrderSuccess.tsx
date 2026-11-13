import { Link, useLocation } from 'react-router-dom';
import type { PlacedOrder } from './Checkout';
import './Checkout.css';

type SuccessState = {
  order?: PlacedOrder;
};

function formatMoney(value: number, currencyCode: string) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currencyCode,
  }).format(value);
}

export default function OrderSuccess() {
  const location = useLocation();
  const order = ((location.state || {}) as SuccessState).order;

  if (!order) {
    return (
      <section className="checkout-success">
        <p className="checkout-eyebrow">CHERRY CAKE</p>
        <h2>No order to show</h2>
        <p>Place an order first, and its confirmation will appear here.</p>
        <Link to="/menu">Back to menu</Link>
      </section>
    );
  }

  return (
    <section className="checkout-success">
      <div className="checkout-success-icon">✓</div>
      <p className="checkout-eyebrow">CHERRY CAKE · THANK YOU</p>
      <h2>Your order is placed!</h2>
      <p>Thank you, {order.customer.name}!</p>
      <p><strong>Order number:</strong> {order.orderNumber}</p>
      <p><strong>Order date:</strong> {order.orderDate} · <strong>Total:</strong> {formatMoney(order.total, order.currencyCode)}</p>
      <Link to="/menu">Back to menu</Link>
    </section>
  );
}
