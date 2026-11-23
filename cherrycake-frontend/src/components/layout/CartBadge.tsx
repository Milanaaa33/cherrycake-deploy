import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { isCartItem } from '../../store';
import type { RootState } from '../../store';
import { useTranslation } from '../../i18n/useTranslation';

export default function CartBadge() {
  const { t } = useTranslation();
  const count = useSelector((state: RootState) =>
    state.cart.items.reduce(
      (total, item) => total + (isCartItem(item) ? item.quantity : 0),
      0,
    ),
  );

  return (
    <Link
      to="/cart"
      className="cc-cart-badge"
      aria-label={t('header.cartAria', 'Cart with {count} items', { count })}
      data-testid="cart-badge"
    >
      <span>{t('header.cart', 'Cart')}</span>
      <span className="cc-cart-count">{count}</span>
    </Link>
  );
}
