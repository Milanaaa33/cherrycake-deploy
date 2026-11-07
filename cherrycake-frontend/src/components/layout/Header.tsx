import { Link, NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import CountrySwitcher from './CountrySwitcher';
import CartBadge from './CartBadge';
import './Layout.css';

export default function Header() {
  const currencyCode = useSelector((state: RootState) => state.region.currencyCode);
  return (
    <header className="cc-header">
      <div className="cc-header-inner">
        <Link to="/" className="cc-layout-brand">
          рџЌ’ Cherry Cake
        </Link>

        <nav className="cc-nav" aria-label="Main navigation">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/menu">Menu</NavLink>
          <NavLink to="/orders">Orders</NavLink>
          <NavLink to="/reports">Reports</NavLink>
          <NavLink to="/ui-kit">UI Kit</NavLink>
        </nav>

        <div className="cc-header-actions">
          <CountrySwitcher />
          <span className="cc-active-currency">{currencyCode}</span>
          <CartBadge />
        </div>
      </div>
    </header>
  );
}

