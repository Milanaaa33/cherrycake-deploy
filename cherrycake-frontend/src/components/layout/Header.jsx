import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../../store/uiSlice';
import { useAuthRole } from '../../hooks/useAuthRole';
import CountrySwitcher from './CountrySwitcher';
import LanguageSwitcher from './LanguageSwitcher';
import CartBadge from './CartBadge';
import { useTranslation } from '../../i18n/useTranslation';

export function Header() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { isSignedIn, canSeeAdmin, canEditPrices } = useAuthRole();
  const currentTheme = useSelector((state) => state.ui?.theme || 'dark');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className={`site-header${isScrolled ? ' scrolled' : ''}`}>
      <nav className="cc-navbar">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand" onClick={closeMobileMenu}>
          <div className="navbar-brand-icon">
            <img
              src="/TransparentSakuraFlower.png?v=3"
              alt="Cherry Logo"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.nextSibling) {
                  e.currentTarget.nextSibling.style.display = 'block';
                }
              }}
              style={{ width: '24px', height: '24px', flexShrink: 0, objectFit: 'contain' }}
            />
            <svg
              style={{ display: 'none', width: '24px', height: '24px', flexShrink: 0 }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#e63960"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="3" fill="#e63960" />
              <path d="M12 2a4 4 0 0 1 4 4c0 2-2 3-4 3-2 0-4-1-4-3a4 4 0 0 1 4-4z" fill="#ffb7c5" />
              <path d="M22 12a4 4 0 0 1-4 4c-2 0-3-2-3-4 0-2 1-4 3-4a4 4 0 0 1 4 4z" fill="#ffb7c5" />
              <path d="M12 22a4 4 0 0 1-4-4c0-2 2-3 4-3 2 0 4 1 4 3a4 4 0 0 1-4 4z" fill="#ffb7c5" />
              <path d="M2 12a4 4 0 0 1 4-4c2 0 3 2 3 4 0 2-1 4-3 4a4 4 0 0 1-4-4z" fill="#ffb7c5" />
            </svg>
          </div>
          <div className="navbar-brand-text">
            <span className="navbar-title">Cherry Cake</span>
            <span className="navbar-subtitle">{t('nav.brandSubtitle', 'Bakery & Café')}</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="navbar-links">
          <NavLink to="/menu" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <span>{t('nav.menu', 'Artisan Menu')}</span>
          </NavLink>
          <NavLink to="/booking" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <span>{t('nav.booking', 'Table Reservation')}</span>
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <span>{t('nav.about', 'About & Hours')}</span>
          </NavLink>
          {canEditPrices && (
            <NavLink to="/reports" className={({ isActive }) => `nav-link nav-link-extra${isActive ? ' active' : ''}`}>
              <span>{t('nav.reports', 'Reports')}</span>
            </NavLink>
          )}
          <a
            href="/swagger.html"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link nav-link-extra"
          >
            {t('nav.apiDocs', 'API Docs')}
          </a>
          <NavLink to="/account" className={({ isActive }) => `nav-link nav-link-extra${isActive ? ' active' : ''}`}>
            <span>{isSignedIn ? t('nav.account', 'Account') : t('nav.login', 'Sign In')}</span>
          </NavLink>
          {canSeeAdmin && (
            <NavLink to="/admin" className={({ isActive }) => `nav-link nav-link-extra${isActive ? ' active' : ''}`}>
              {t('nav.admin', 'Admin')}
            </NavLink>
          )}
        </div>

        {/* Right actions: Theme, Region, Cart, Mobile Toggle */}
        <div className="navbar-actions">
          {/* Theme Toggle */}
          <button
            className="theme-toggle-btn"
            onClick={() => dispatch(toggleTheme())}
            title={currentTheme === 'dark' ? t('header.themeLight', 'Switch to Light theme') : t('header.themeDark', 'Switch to Dark theme')}
            aria-label="Toggle theme"
          >
            <span key={currentTheme} id="themeToggleIcon" className="theme-toggle-icon-anim">
              {currentTheme === 'dark' ? (
                <svg className="inline-svg-icon" viewBox="0 0 24 24" width="14" height="14" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg className="inline-svg-icon" viewBox="0 0 24 24" width="14" height="14" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </span>
            <span id="themeToggleLabel">{currentTheme === 'dark' ? t('nav.lightMode', 'Light') : t('nav.darkMode', 'Dark')}</span>
          </button>

          {/* Region Switcher */}
          <CountrySwitcher />

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Cart */}
          <CartBadge />

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            className="navbar-hamburger-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
            title="Menu"
          >
            {isMobileMenuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Adaptive Mobile / Tablet Drawer */}
      {isMobileMenuOpen && (
        <div className="mobile-nav-drawer" role="dialog" aria-label="Mobile Navigation">
          <div style={{ padding: '6px 16px 10px', display: 'flex', gap: '10px', alignItems: 'center', borderBottom: '1px solid var(--cherry-border)', marginBottom: '8px' }}>
            <LanguageSwitcher />
            <CountrySwitcher />
          </div>
          <NavLink to="/menu" className="mobile-nav-link" onClick={closeMobileMenu}>
            <span>{t('nav.menu', 'Artisan Menu')}</span>
          </NavLink>
          <NavLink to="/booking" className="mobile-nav-link" onClick={closeMobileMenu}>
            <span>{t('nav.booking', 'Table Reservation')}</span>
          </NavLink>
          <NavLink to="/about" className="mobile-nav-link" onClick={closeMobileMenu}>
            <span>{t('nav.about', 'About & Hours')}</span>
          </NavLink>
          {canEditPrices && (
            <NavLink to="/reports" className="mobile-nav-link" onClick={closeMobileMenu}>
              <span>{t('nav.reports', 'Reports')}</span>
            </NavLink>
          )}
          <a
            href="/swagger.html"
            target="_blank"
            rel="noopener noreferrer"
            className="mobile-nav-link"
            onClick={closeMobileMenu}
          >
            {t('nav.apiDocs', 'API Docs')}
          </a>
          <NavLink to="/account" className="mobile-nav-link" onClick={closeMobileMenu}>
            <span>{isSignedIn ? t('nav.account', 'Account') : t('nav.login', 'Sign In')}</span>
          </NavLink>
          {canSeeAdmin && (
            <NavLink to="/admin" className="mobile-nav-link" onClick={closeMobileMenu}>
              {t('nav.admin', 'Admin')}
            </NavLink>
          )}
        </div>
      )}
    </header>
  );
}

export default Header;
