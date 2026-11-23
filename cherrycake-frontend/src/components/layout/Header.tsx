import { Link, NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';

import type { RootState } from '../../store';
import { useTranslation } from '../../i18n/useTranslation';
import { useAuthRole } from '../../hooks/useAuthRole';

import CountrySwitcher from './CountrySwitcher';
import LanguageSwitcher from './LanguageSwitcher';
import CartBadge from './CartBadge';
import ThemeToggle from './ThemeToggle';

import './Layout.css';

export default function Header() {
  const { t } = useTranslation();
  const currencyCode = useSelector((state: RootState) => state.region.currencyCode);
  const { canSeeAdmin } = useAuthRole();

  return (
    <header className="cc-header">
      <div className="cc-header-inner">
        <Link to="/" className="cc-layout-brand">
          &#127826; Cherry Cake
        </Link>

        <nav className="cc-nav" aria-label={t('nav.ariaMain', 'Main navigation')}>
          <NavLink to="/" end>
            {t('nav.home', 'Home')}
          </NavLink>

          <NavLink to="/menu">{t('nav.menu', 'Menu')}</NavLink>

          <NavLink to="/booking">{t('nav.booking', 'Booking')}</NavLink>

          <NavLink to="/about">{t('nav.about', 'About us')}</NavLink>

          <NavLink to="/account">{t('nav.account', 'Orders / Account')}</NavLink>

          <NavLink to="/reports">{t('nav.reports', 'Reports')}</NavLink>

          {canSeeAdmin && (
            <NavLink to="/admin" className="cc-nav-admin" data-testid="nav-admin">
              {t('nav.admin', 'Admin')}
            </NavLink>
          )}
        </nav>

        <div className="cc-header-actions">
          <CountrySwitcher />

          <span className="cc-active-currency">{currencyCode}</span>

          <LanguageSwitcher />

          <ThemeToggle />

          <CartBadge />
        </div>
      </div>
    </header>
  );
}
