import { Link, NavLink } from 'react-router-dom';
import CountrySwitcher from './CountrySwitcher';
import CartBadge from './CartBadge';
import './Layout.css';

export default function Header() {
  return (
    <header className="cc-header">
      <div className="cc-header-inner">
        <Link to="/" className="cc-layout-brand">
          🍒 Cherry Cake
        </Link>

        <nav className="cc-nav" aria-label="Main navigation">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/menu">Menu</NavLink>
          <NavLink to="/orders">Orders</NavLink>
          <NavLink to="/ui-kit">UI Kit</NavLink>
        </nav>

        <div className="cc-header-actions">
          <CountrySwitcher />
          <CartBadge />
        </div>
      </div>
    </header>
  );
}
