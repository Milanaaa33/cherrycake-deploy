import { Link, useLocation } from 'react-router-dom';
import './Checkout.css';

type SuccessState = {
  name?: string;
  delivery?: 'delivery' | 'pickup';
  payment?: 'cash' | 'card';
};

export default function OrderSuccess() {
  const location = useLocation();
  const state = (location.state || {}) as SuccessState;

  return (
    <section className="checkout-success">
      <div className="checkout-success-icon">✓</div>
      <p className="checkout-eyebrow">CHERRY CAKE · THANK YOU</p>
      <h2>Your order is ready!</h2>
      <p>Thank you{state.name ? `, ${state.name}` : ''}! This is a frontend demo confirmation. No real order has been sent to the backend yet.</p>
      {state.delivery && <p><strong>Fulfillment:</strong> {state.delivery === 'pickup' ? 'Pickup' : 'Home delivery'} · <strong>Payment:</strong> {state.payment === 'card' ? 'Card' : 'Cash'}</p>}
      <Link to="/menu">Back to menu</Link>
    </section>
  );
}
