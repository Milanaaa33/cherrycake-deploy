import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

export default function CartBadge() {
  const count = useSelector((state: RootState) => state.cart.items.length);

  return (
    <Link to="/cart" className="cc-cart-badge" aria-label={`Cart with ${count} items`}>
      <span>Cart</span>
      <span className="cc-cart-count">{count}</span>
    </Link>
  );
}
