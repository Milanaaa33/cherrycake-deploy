import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { closeAboutModal } from '../../store/uiSlice';
import useTranslation from '../../i18n/useTranslation';

export function AboutHoursModal() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isOpen = useSelector((state) => state.ui?.isAboutModalOpen);

  if (!isOpen) return null;

  const handleBooking = () => {
    dispatch(closeAboutModal());
    navigate('/booking');
  };

  const handleBrowseMenu = () => {
    dispatch(closeAboutModal());
    navigate('/menu');
  };

  return (
    <div
      className="cc-modal open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="aboutModalTitle"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 3500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) dispatch(closeAboutModal());
      }}
    >
      <div
        className="modal-dialog"
        style={{
          backgroundColor: 'var(--cherry-panel)',
          border: '2px solid var(--cherry-border)',
          borderRadius: '24px',
          maxWidth: '680px',
          width: '100%',
          padding: '32px',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.75)',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Header with Close Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(230, 57, 96, 0.4), rgba(45, 14, 36, 0.8))',
                border: '2px solid var(--cherry-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(230, 57, 96, 0.35)',
                flexShrink: 0
              }}
            >
              <img
                src="/TransparentSakuraFlower.png"
                alt="Cherry Cake"
                style={{ width: '28px', height: '28px', objectFit: 'contain' }}
              />
            </div>
            <div>
              <span
                style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                  color: 'var(--sakura-pink)',
                  fontWeight: 700,
                  display: 'block'
                }}
              >
                {t('about.eyebrow', 'Haute Pâtisserie & Specialty Café')}
              </span>
              <h2
                id="aboutModalTitle"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.65rem',
                  fontWeight: 700,
                  color: 'var(--cheesecake-cream)',
                  margin: 0
                }}
              >
                {t('about.title', 'About & Hospitality Hours')}
              </h2>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-round-btn"
            onClick={() => dispatch(closeAboutModal())}
            aria-label="Close About modal"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '2px solid var(--cherry-border)',
              background: 'var(--color-surface-soft)',
              color: 'var(--text-main)',
              fontSize: '1.3rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            &times;
          </button>
        </div>

        {/* Story Section */}
        <div
          style={{
            background: 'var(--color-surface-soft)',
            border: '2px solid var(--cherry-border)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '20px'
          }}
        >
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1.15rem',
              color: 'var(--sakura-pink)',
              marginBottom: '8px'
            }}
          >
            {t('about.heritageTitle', 'Our Heritage & Craftsmanship')}
          </h3>
          <p
            style={{
              color: 'var(--text-dim)',
              fontSize: '0.92rem',
              lineHeight: 1.6,
              margin: 0
            }}
          >
            {t('about.heritageText', 'Founded with a passion for exquisite confectionery, Cherry Cake unites classical French viennoiserie with delicate Japanese cherry blossom botanicals. Every gateau, macaron, and celebration tier is handcrafted daily by our master pâtissiers using single-origin Normandy butter, organic vanilla beans, and premier Belgian chocolate.')}
          </p>
        </div>

        {/* Hours Grid */}
        <div style={{ marginBottom: '20px' }}>
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--crust-gold)',
              marginBottom: '12px'
            }}
          >
            {t('about.hoursTitle', 'Operating Schedules')}
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px'
            }}
          >
            {/* Dining Room */}
            <div
              style={{
                background: 'var(--cherry-card)',
                border: '2px solid var(--cherry-border)',
                borderRadius: '14px',
                padding: '16px'
              }}
            >
              <div style={{ fontSize: '1.4rem', marginBottom: '6px' }}>☕</div>
              <strong style={{ display: 'block', color: 'var(--cheesecake-cream)', fontSize: '0.95rem' }}>
                {t('about.diningRoomTitle', 'Café & Dining Room')}
              </strong>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '4px' }}>
                <div>{t('about.diningMonFri', 'Monday – Friday: 08:00 – 22:00')}</div>
                <div>{t('about.diningSatSun', 'Saturday – Sunday: 09:00 – 23:00')}</div>
              </div>
            </div>

            {/* Hub Pickup */}
            <div
              style={{
                background: 'var(--cherry-card)',
                border: '2px solid var(--cherry-border)',
                borderRadius: '14px',
                padding: '16px'
              }}
            >
              <div style={{ fontSize: '1.4rem', marginBottom: '6px' }}>🛍️</div>
              <strong style={{ display: 'block', color: 'var(--cheesecake-cream)', fontSize: '0.95rem' }}>
                {t('about.hubPickupTitle', 'Boutique Hub Pickup')}
              </strong>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '4px' }}>
                <div>{t('about.hubPickupDaily', 'Daily: 08:30 – 21:30')}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--mint-fresh)', marginTop: '2px' }}>
                  {t('about.hubPickupNote', 'Pre-orders ready in 15 minutes')}
                </div>
              </div>
            </div>

            {/* Courier Delivery */}
            <div
              style={{
                background: 'var(--cherry-card)',
                border: '2px solid var(--cherry-border)',
                borderRadius: '14px',
                padding: '16px'
              }}
            >
              <div style={{ fontSize: '1.4rem', marginBottom: '6px' }}>🛵</div>
              <strong style={{ display: 'block', color: 'var(--cheesecake-cream)', fontSize: '0.95rem' }}>
                {t('about.deliveryTitle', 'Climate-Controlled Delivery')}
              </strong>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '4px' }}>
                <div>{t('about.deliveryDaily', 'Daily: 10:00 – 20:30')}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--sakura-pink)', marginTop: '2px' }}>
                  {t('about.deliveryNote', 'Insulated thermal packaging')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Location & Contact Info */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            background: 'var(--color-surface-soft)',
            border: '2px solid var(--cherry-border)',
            borderRadius: '14px',
            padding: '14px 18px',
            marginBottom: '24px',
            fontSize: '0.88rem'
          }}
        >
          <div>
            <span style={{ color: 'var(--text-dim)' }}>{t('about.flagshipLocation', 'Flagship Location:')}</span>{' '}
            <strong style={{ color: 'var(--text-main)' }}>14 Sakura Boulevard, Central District</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-dim)' }}>{t('about.concierge', 'Concierge:')}</span>{' '}
            <strong style={{ color: 'var(--crust-gold)' }}>+998 (71) 200-26-26</strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
            gap: '12px'
          }}
        >
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleBrowseMenu}
            style={{ border: '2px solid var(--cherry-border)', borderRadius: '9999px', padding: '10px 20px' }}
          >
            {t('hero.viewMenu', 'View Menu')}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleBooking}
            style={{ borderRadius: '9999px', padding: '10px 24px', fontWeight: 700 }}
          >
            {t('about.ctaBooking', 'Reserve a Table')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AboutHoursModal;

