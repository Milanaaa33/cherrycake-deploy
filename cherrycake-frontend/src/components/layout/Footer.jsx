import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthRole } from '../../hooks/useAuthRole';
import useTranslation from '../../i18n/useTranslation';

export function Footer() {
  const { t } = useTranslation();
  const { canSeeAdmin, canEditPrices } = useAuthRole();
  return (
    <footer className="storefront-footer" id="about-section">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Column 1: Brand & Philosophy */}
          <div className="footer-col brand-col">
            <div className="footer-brand">
              <img
                src="/TransparentSakuraFlower.png?v=3"
                alt="Cherry Cake Blossom"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/assets/TransparentSakuraFlower.png";
                }}
                className="footer-logo-img"
              />
              <div className="footer-brand-title">
                <h3 className="display-font">Cherry Cake</h3>
                <span className="script-font">{t('footer.brandSubtitle', 'Haute Pâtisserie & Café')}</span>
              </div>
            </div>
            <p className="footer-desc">
              {t('footer.desc', 'Celebrating the harmony between classic French viennoiserie and delicate Japanese cherry blossom botanicals. Handcrafted daily with single-origin butter and premium Belgian cocoa.')}
            </p>
            <div className="footer-badges">
              <span className="f-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2a4 4 0 0 1 4 4c0 2-2 3-4 3-2 0-4-1-4-3a4 4 0 0 1 4-4z" />
                  <path d="M22 12a4 4 0 0 1-4 4c-2 0-3-2-3-4 0-2 1-4 3-4a4 4 0 0 1 4 4z" />
                  <path d="M12 22a4 4 0 0 1-4-4c0-2 2-3 4-3 2 0 4 1 4 3a4 4 0 0 1-4 4z" />
                  <path d="M2 12a4 4 0 0 1 4-4c2 0 3 2 3 4 0 2-1 4-3 4a4 4 0 0 1-4-4z" />
                </svg>
                {t('footer.freshDaily', 'Fresh Daily')}
              </span>
              <span className="f-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 20h20" />
                  <path d="M3 20l18-8v-3L3 13v7z" />
                  <path d="M3 13l9-4 9 3" />
                  <circle cx="12" cy="6" r="2" />
                </svg>
                {t('footer.artisanalRecipes', 'Artisanal Recipes')}
              </span>
              <span className="f-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                  <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                  <line x1="6" y1="1" x2="6" y2="4" />
                  <line x1="10" y1="1" x2="10" y2="4" />
                  <line x1="14" y1="1" x2="14" y2="4" />
                </svg>
                {t('footer.specialtyRoasts', 'Specialty Roasts')}
              </span>
            </div>
          </div>

          {/* Column 2: Artisan Menu */}
          <div className="footer-col">
            <h4 className="footer-heading">{t('footer.artisanMenu', 'Artisan Menu')}</h4>
            <ul className="footer-nav-list">
              <li><Link to="/menu">{t('footer.menuCherry', 'Cherry Blossom Heart Gateau')}</Link></li>
              <li><Link to="/menu">{t('footer.menuBerry', 'Triple Berry Gumdrop Heart')}</Link></li>
              <li><Link to="/menu">{t('footer.menuVanilla', 'Golden Vanilla Fudge Heart')}</Link></li>
              <li><Link to="/menu">{t('footer.menuSmiley', 'Smiley Berry Artisan Square')}</Link></li>
              <li><Link to="/menu">{t('footer.menuSweetheart', 'Sweetheart Chocolate Petite')}</Link></li>
              <li><Link to="/menu">{t('footer.menuClover', 'Lucky Clover Chocolate Gateau')}</Link></li>
            </ul>
          </div>

          {/* Column 3: Hospitality & Hours */}
          <div className="footer-col">
            <h4 className="footer-heading">{t('footer.hours', 'Café & Hospitality')}</h4>
            <ul className="footer-hours-list">
              <li><span>{t('footer.monFri', 'Mon - Fri:')}</span> <strong>08:00 - 22:00</strong></li>
              <li><span>{t('footer.satSun', 'Sat - Sun:')}</span> <strong>09:00 - 23:00</strong></li>
              <li><span>{t('footer.hubPickup', 'Hub Pickup:')}</span> <strong>{t('footer.pickupTimes', 'Daily 08:30 - 21:30')}</strong></li>
            </ul>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Link to="/booking" className="footer-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 22h8" />
                  <path d="M12 15v7" />
                  <path d="M5 3h14c0 6-3 10-7 10S5 9 5 3z" />
                  <line x1="5" y1="8" x2="19" y2="8" />
                </svg>
                <span>{t('footer.bookTable', 'Book a Café Table')}</span>
              </Link>
            </div>
          </div>

          {/* Column 4: Client & API Portals */}
          <div className="footer-col">
            <h4 className="footer-heading">{t('footer.portals', 'Client & API Portals')}</h4>
            <ul className="footer-nav-list">
              <li>
                <Link to="/account">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  {t('footer.customerAccount', 'Customer Sign In / Account')}
                </Link>
              </li>
              {canSeeAdmin && (
                <li>
                  <Link to="/admin">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 4l3 12h14l3-12-5 4-5-6-5 6z" />
                      <path d="M5 20h14" />
                    </svg>
                    {t('footer.adminPortal', 'Administrator Portal')}
                  </Link>
                </li>
              )}
              <li>
                <a href="/swagger.html" target="_blank" rel="noopener noreferrer">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                  {t('footer.apiSwagger', 'REST API Swagger UI')}
                </a>
              </li>
              <li>
                <a href="/v3/api-docs" target="_blank" rel="noopener noreferrer">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  {t('footer.apiOpenApi', 'OpenAPI Specification (JSON)')}
                </a>
              </li>
              {canEditPrices && (
                <li>
                  <Link to="/reports">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10 2v7.5a2 2 0 0 1-.2.9L4.7 20.6A1 1 0 0 0 5.6 22h12.8a1 1 0 0 0 .9-1.4l-5.1-10.2a2 2 0 0 1-.2-.9V2" />
                      <path d="M8.5 2h7" />
                      <path d="M7 16h10" />
                    </svg>
                    {t('footer.qaReports', 'Quality Assurance Reports')}
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Sub-Footer */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            {t('footer.copyright', '© 2026 Cherry Cake Bakery & Café. All rights reserved. • ITPU University Teamwork 2026 (Team 9).')}
          </div>
          <div className="footer-bottom-links">
            <Link to="/about">{t('footer.aboutUs', 'About Us & Hubs')}</Link>
            <Link to="/menu">{t('footer.menu', 'Menu')}</Link>
            <Link to="/booking">{t('footer.reservations', 'Reservations')}</Link>
            <Link to="/account">{t('footer.account', 'Account')}</Link>
            <a href="/swagger.html" target="_blank" rel="noopener noreferrer">{t('footer.apiRef', 'API Reference')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
