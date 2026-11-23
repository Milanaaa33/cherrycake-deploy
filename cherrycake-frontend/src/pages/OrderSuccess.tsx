import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '../i18n/useTranslation';
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
  const { t } = useTranslation();
  const order = ((location.state || {}) as SuccessState).order;

  if (!order) {
    return (
      <section className="checkout-success">
        <p className="checkout-eyebrow">CHERRY CAKE</p>
        <h2>{t('orderSuccess.noOrderTitle', 'No order to show')}</h2>
        <p>{t('orderSuccess.noOrderText', 'Place an order first, and its confirmation will appear here.')}</p>
        <Link to="/menu">{t('orderSuccess.backToMenu', 'Back to menu')}</Link>
      </section>
    );
  }

  return (
    <section className="checkout-success">
      <div className="checkout-success-icon">✓</div>
      <p className="checkout-eyebrow">{t('orderSuccess.eyebrow', 'CHERRY CAKE · THANK YOU')}</p>
      <h2>{t('orderSuccess.title', 'Your order is placed!')}</h2>
      <p>{t('orderSuccess.thankYou', 'Thank you, {name}!', { name: order.customer.name })}</p>
      <p><strong>{t('orderSuccess.orderNumber', 'Order number:')}</strong> {order.orderNumber}</p>
      <p><strong>{t('orderSuccess.orderDate', 'Order date:')}</strong> {order.orderDate} · <strong>{t('orderSuccess.total', 'Total:')}</strong> {formatMoney(order.total, order.currencyCode)}</p>
      <Link to="/account">{t('orderSuccess.viewOrders', 'View my orders')}</Link>{' '}
      <Link to="/menu">{t('orderSuccess.backToMenu', 'Back to menu')}</Link>
    </section>
  );
}
