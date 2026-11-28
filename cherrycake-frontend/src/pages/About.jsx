import React from 'react';
import { useNavigate } from 'react-router-dom';
import useTranslation from '../i18n/useTranslation';
import Photorealistic3DMap from '../components/common/Photorealistic3DMap';

export function About() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="about-page-container" style={{ padding: 'var(--space-8) var(--space-4)', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* 1. Hero Section */}
      <section
        style={{
          textAlign: 'center',
          marginBottom: '56px',
          padding: '48px 24px',
          background: 'radial-gradient(ellipse at top, rgba(230, 57, 96, 0.18) 0%, transparent 70%)',
          borderRadius: '28px',
          border: '1.5px solid var(--cherry-border)'
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(230, 57, 96, 0.15)',
            border: '1.5px solid var(--cherry-border)',
            padding: '6px 16px',
            borderRadius: '9999px',
            color: 'var(--sakura-pink)',
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            marginBottom: '16px'
          }}
        >
          <img src="/TransparentSakuraFlower.png" alt="Sakura" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
          <span>{t('about.heroBadge', 'Haute Pâtisserie & Specialty Café')}</span>
        </div>

        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
            color: 'var(--cheesecake-cream)',
            margin: '0 0 16px 0',
            lineHeight: 1.15
          }}
        >
          {t('about.heroTitle', 'Sweet Moments, Crafted with Heritage & Passion')}
        </h1>

        <p
          style={{
            color: 'var(--text-dim)',
            fontSize: 'clamp(1rem, 2vw, 1.15rem)',
            maxWidth: '780px',
            margin: '0 auto 28px',
            lineHeight: 1.65
          }}
        >
          {t('about.heroDesc', 'Where timeless French viennoiserie marries delicate Japanese cherry blossom botanicals. Handcrafted daily before sunrise using 100% natural dairy cream, organic vanilla, farm-picked berries, and single-origin Belgian chocolate.')}
        </p>

        {/* Quick Metrics Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            maxWidth: '920px',
            margin: '0 auto'
          }}
        >
          <div style={{ background: 'var(--cherry-card)', padding: '16px', borderRadius: '16px', border: '1px solid var(--cherry-border)' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--crust-gold)', fontFamily: "'Playfair Display', serif" }}>
              17
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '2px' }}>
              {t('about.metricNations', 'Connected Nations & Hubs')}
            </div>
          </div>

          <div style={{ background: 'var(--cherry-card)', padding: '16px', borderRadius: '16px', border: '1px solid var(--cherry-border)' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--sakura-pink)', fontFamily: "'Playfair Display', serif" }}>
              100%
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '2px' }}>
              {t('about.metricIngredients', 'Pure Natural Ingredients')}
            </div>
          </div>

          <div style={{ background: 'var(--cherry-card)', padding: '16px', borderRadius: '16px', border: '1px solid var(--cherry-border)' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--mint-fresh)', fontFamily: "'Playfair Display', serif" }}>
              04:30 AM
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '2px' }}>
              {t('about.metricDawn', 'Fresh Dawn Baking Daily')}
            </div>
          </div>

          <div style={{ background: 'var(--cherry-card)', padding: '16px', borderRadius: '16px', border: '1px solid var(--cherry-border)' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--raspberry-bright)', fontFamily: "'Playfair Display', serif" }}>
              1,200+
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '2px' }}>
              {t('about.metricCelebrations', 'Celebrations & Weddings')}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Brand Story & Craftsmanship Section */}
      <section style={{ marginBottom: '56px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '32px',
            alignItems: 'center'
          }}
        >
          {/* Left Column: Story Prose */}
          <div>
            <span
              style={{
                fontSize: '0.78rem',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: 'var(--sakura-pink)',
                fontWeight: 700
              }}
            >
              {t('about.storyEyebrow', 'Our Origin & Philosophy')}
            </span>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '2.1rem',
                color: 'var(--cheesecake-cream)',
                margin: '8px 0 16px 0'
              }}
            >
              {t('about.storyTitle', 'Two Cultures, One Harmonious Sweet Perfection')}
            </h2>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.96rem', lineHeight: 1.7, marginBottom: '14px' }}>
              {t('about.storyP1', 'Cherry Cake was born from a singular culinary vision: to weave the uncompromising architectural rigor of classical French pâtisserie with the subtle, ephemeral grace of Japanese cherry blossom florals.')}
            </p>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.96rem', lineHeight: 1.7, marginBottom: '20px' }}>
              {t('about.storyP2', 'We refuse artificial colorings, synthetic stabilizers, and industrialized shortcuts. Every single layer of puff pastry is hand-laminated over three days using single-origin Normandy butter. Every fruit filling is simmered in copper pots from farm-picked mountain cherries and wild strawberries.')}
            </p>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate('/menu')}
                style={{ padding: '11px 24px', borderRadius: '9999px', fontWeight: 700 }}
              >
                {t('hero.viewMenu', 'Explore Artisan Menu')} &rarr;
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/booking')}
                style={{ padding: '11px 24px', borderRadius: '9999px', fontWeight: 600, border: '2px solid var(--cherry-border)' }}
              >
                {t('about.ctaBooking', 'Reserve a Table')}
              </button>
            </div>
          </div>

          {/* Right Column: Visual Feature Box */}
          <div
            style={{
              background: 'linear-gradient(135deg, var(--cherry-card), var(--cherry-panel))',
              border: '2px solid var(--cherry-border)',
              borderRadius: '24px',
              padding: '32px',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.4)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(230, 57, 96, 0.35), rgba(45, 14, 36, 0.8))',
                border: '2px solid var(--cherry-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                boxShadow: '0 4px 16px rgba(230, 57, 96, 0.35)'
              }}
            >
              <img
                src="/TransparentSakuraFlower.png"
                alt="Cherry Cake Sakura Flower"
                style={{
                  width: '40px',
                  height: '40px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.45))'
                }}
              />
            </div>

            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', color: 'var(--crust-gold)', margin: '0 0 10px 0' }}>
              {t('about.promiseTitle', "The Pâtissier's Golden Promise")}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ color: 'var(--mint-fresh)', fontWeight: 800 }}>✓</span>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>
                  <strong>{t('about.promiseButter', 'Normandy AOP Butter:')}</strong> {t('about.promiseButterDesc', '84% fat content for delicate, paper-thin flakiness.')}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ color: 'var(--mint-fresh)', fontWeight: 800 }}>✓</span>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>
                  <strong>{t('about.promiseVanilla', 'Madagascar Bourbon Vanilla:')}</strong> {t('about.promiseVanillaDesc', 'Fragrant, rich, whole vanilla bean caviar.')}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ color: 'var(--mint-fresh)', fontWeight: 800 }}>✓</span>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>
                  <strong>{t('about.promiseCocoa', 'Single-Origin Cocoa:')}</strong> {t('about.promiseCocoaDesc', 'Sustainable 72% Belgian dark chocolate couvertures.')}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ color: 'var(--mint-fresh)', fontWeight: 800 }}>✓</span>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>
                  <strong>{t('about.promiseColdChain', 'Cold-Chain Integrity:')}</strong> {t('about.promiseColdChainDesc', 'Specialized electric delivery vans keeping cakes at a pristine +4°C.')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The 3D Realistic Google Earth Globe Map Feature */}
      <section style={{ marginBottom: '64px' }}>
        <Photorealistic3DMap />
      </section>

      {/* 4. Four Core Culinary Pillars */}
      <section style={{ marginBottom: '56px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span
            style={{
              fontSize: '0.78rem',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: 'var(--sakura-pink)',
              fontWeight: 700
            }}
          >
            {t('about.pillarsEyebrow', 'Artisanal Standards')}
          </span>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '2.1rem',
              color: 'var(--cheesecake-cream)',
              margin: '6px 0 0 0'
            }}
          >
            {t('about.pillarsTitle', 'Our Four Pillars of Culinary Excellence')}
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
          }}
        >
          {/* Pillar 1 */}
          <div
            className="card"
            style={{
              background: 'var(--cherry-card)',
              border: '1.5px solid var(--cherry-border)',
              borderRadius: '20px',
              padding: '24px'
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🥐</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: 'var(--sakura-pink)', fontSize: '1.2rem', margin: '0 0 8px 0' }}>
              {t('about.pillar1Title', 'Master Viennoiserie')}
            </h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
              {t('about.pillar1Desc', 'Slow cold-fermented doughs folded across 72 micro-layers, yielding crisp golden crusts with meltingly soft honeycomb interiors.')}
            </p>
          </div>

          {/* Pillar 2 */}
          <div
            className="card"
            style={{
              background: 'var(--cherry-card)',
              border: '1.5px solid var(--cherry-border)',
              borderRadius: '20px',
              padding: '24px'
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🍓</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: 'var(--crust-gold)', fontSize: '1.2rem', margin: '0 0 8px 0' }}>
              {t('about.pillar2Title', 'Organic Orchard Fruit')}
            </h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
              {t('about.pillar2Desc', 'Hand-picked wild raspberries, mountain cherries, and orchard blueberries harvested at peak ripeness for pure, natural fruit coulis.')}
            </p>
          </div>

          {/* Pillar 3 */}
          <div
            className="card"
            style={{
              background: 'var(--cherry-card)',
              border: '1.5px solid var(--cherry-border)',
              borderRadius: '20px',
              padding: '24px'
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🎂</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: 'var(--mint-fresh)', fontSize: '1.2rem', margin: '0 0 8px 0' }}>
              {t('about.pillar3ModTitle', 'Tailored Modifiers & Pairings')}
            </h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
              {t('about.pillar3ModDesc', 'Personalize every dessert and beverage with curated fillings, glazes, and regional accompaniments.')}
            </p>
          </div>

          {/* Pillar 4 */}
          <div
            className="card"
            style={{
              background: 'var(--cherry-card)',
              border: '1.5px solid var(--cherry-border)',
              borderRadius: '20px',
              padding: '24px'
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>☕</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: 'var(--raspberry-bright)', fontSize: '1.2rem', margin: '0 0 8px 0' }}>
              {t('about.pillar4Title', 'Specialty Barista Roast')}
            </h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
              {t('about.pillar4Desc', 'Single-origin Ethiopian and Colombian Arabica beans micro-roasted weekly to pair in exquisite balance with every pastry notes.')}
            </p>
          </div>
        </div>
      </section>

      {/* 5. Operating Hours & Boutique Hubs */}
      <section
        style={{
          background: 'var(--cherry-card)',
          border: '2px solid var(--cherry-border)',
          borderRadius: '24px',
          padding: '36px 28px',
          marginBottom: '56px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--sakura-pink)', fontWeight: 700 }}>
              {t('about.schedEyebrow', 'Hospitality & Pickup Schedules')}
            </span>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.85rem', color: 'var(--cheesecake-cream)', margin: '6px 0 0 0' }}>
              {t('about.schedTitle', 'Café, Dining & Distribution Hours')}
            </h2>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/booking')}
            style={{ padding: '10px 22px', borderRadius: '9999px', fontWeight: 700 }}
          >
            {t('about.bookDiningTable', '📅 Book a Dining Table')}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {/* Café Dining */}
          <div style={{ background: 'var(--color-surface-soft)', border: '1px solid var(--cherry-border)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ fontSize: '1.6rem', marginBottom: '6px' }}>☕</div>
            <strong style={{ color: 'var(--cheesecake-cream)', fontSize: '1.05rem', display: 'block' }}>
              {t('about.diningRoomTitle', 'Café & Dining Room')}
            </strong>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.88rem', marginTop: '6px', lineHeight: 1.6 }}>
              <div>{t('about.diningMonFri', 'Monday – Friday: 08:00 – 22:00')}</div>
              <div>{t('about.diningSatSun', 'Saturday – Sunday: 09:00 – 23:00')}</div>
              <div style={{ color: 'var(--sakura-pink)', fontSize: '0.8rem', marginTop: '4px' }}>
                {t('about.diningNote', 'Sakura garden & indoor dining')}
              </div>
            </div>
          </div>

          {/* Boutique Hub Pickup */}
          <div style={{ background: 'var(--color-surface-soft)', border: '1px solid var(--cherry-border)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ fontSize: '1.6rem', marginBottom: '6px' }}>🛍️</div>
            <strong style={{ color: 'var(--cheesecake-cream)', fontSize: '1.05rem', display: 'block' }}>
              {t('about.hubPickupTitle', 'Boutique Hub Pickup')}
            </strong>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.88rem', marginTop: '6px', lineHeight: 1.6 }}>
              <div>{t('about.hubPickupDaily', 'Daily: 08:30 – 21:30')}</div>
              <div style={{ color: 'var(--mint-fresh)', fontSize: '0.8rem', marginTop: '4px' }}>
                {t('about.hubPickupNote', 'Pre-orders ready in 15 minutes')}
              </div>
            </div>
          </div>

          {/* Courier Delivery */}
          <div style={{ background: 'var(--color-surface-soft)', border: '1px solid var(--cherry-border)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ fontSize: '1.6rem', marginBottom: '6px' }}>🛵</div>
            <strong style={{ color: 'var(--cheesecake-cream)', fontSize: '1.05rem', display: 'block' }}>
              {t('about.deliveryTitle', 'Climate-Controlled Delivery')}
            </strong>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.88rem', marginTop: '6px', lineHeight: 1.6 }}>
              <div>{t('about.deliveryDaily', 'Daily: 10:00 – 20:30')}</div>
              <div style={{ color: 'var(--crust-gold)', fontSize: '0.8rem', marginTop: '4px' }}>
                {t('about.deliveryNote', 'Insulated thermal packaging')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Executive Master Pâtissiers */}
      <section style={{ marginBottom: '56px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--sakura-pink)', fontWeight: 700 }}>
            {t('about.chefsEyebrow', 'Culinary Leadership')}
          </span>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.1rem', color: 'var(--cheesecake-cream)', margin: '6px 0 0 0' }}>
            {t('about.chefsTitle', 'Meet Our Master Pâtissiers')}
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          <div style={{ background: 'var(--cherry-card)', border: '1.5px solid var(--cherry-border)', borderRadius: '20px', padding: '24px', textAlign: 'center' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(230, 57, 96, 0.2)', border: '2px solid var(--raspberry-coulis)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
              👨‍🍳
            </div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: 'var(--cheesecake-cream)', margin: '0 0 4px 0', fontSize: '1.2rem' }}>
              Chef Pierre Delacroix
            </h3>
            <div style={{ color: 'var(--sakura-pink)', fontSize: '0.82rem', fontWeight: 700, marginBottom: '8px' }}>
              {t('about.chef1Role', 'Executive Pastry Director')}
            </div>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
              {t('about.chef1Desc', 'Over 20 years of classical Parisian pâtisserie mastery, overseeing dough lamination, viennoiserie, and signature celebration gateaux.')}
            </p>
          </div>

          <div style={{ background: 'var(--cherry-card)', border: '1.5px solid var(--cherry-border)', borderRadius: '20px', padding: '24px', textAlign: 'center' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(229, 176, 97, 0.2)', border: '2px solid var(--crust-gold)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
              👩‍🍳
            </div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: 'var(--cheesecake-cream)', margin: '0 0 4px 0', fontSize: '1.2rem' }}>
              Chef Yumi Takahashi
            </h3>
            <div style={{ color: 'var(--crust-gold)', fontSize: '0.82rem', fontWeight: 700, marginBottom: '8px' }}>
              {t('about.chef2Role', 'Botanical & Matcha Specialist')}
            </div>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
              {t('about.chef2Desc', 'Pioneering the fusion of Japanese cherry blossom petals, Uji ceremonial matcha, and white peach purees with French textures.')}
            </p>
          </div>

          <div style={{ background: 'var(--cherry-card)', border: '1.5px solid var(--cherry-border)', borderRadius: '20px', padding: '24px', textAlign: 'center' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(56, 193, 114, 0.2)', border: '2px solid var(--mint-fresh)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
              👨‍🍳
            </div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: 'var(--cheesecake-cream)', margin: '0 0 4px 0', fontSize: '1.2rem' }}>
              Chef Rustam Karimov
            </h3>
            <div style={{ color: 'var(--mint-fresh)', fontSize: '0.82rem', fontWeight: 700, marginBottom: '8px' }}>
              {t('about.chef3Role', 'Regional Honey & Nut Artisan')}
            </div>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
              {t('about.chef3Desc', 'Specialist in traditional Silk Road honey cakes (Medovik), mountain walnuts, pistachios, and regional spice infusions.')}
            </p>
          </div>
        </div>
      </section>

      {/* 7. Call To Action Footer Banner */}
      <section
        style={{
          background: 'linear-gradient(135deg, #8b1e42 0%, #4a0e24 100%)',
          border: '2px solid rgba(255, 183, 197, 0.28)',
          borderRadius: '28px',
          padding: '48px 24px',
          textAlign: 'center',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
        }}
      >
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
            color: '#ffffff',
            margin: '0 0 12px 0'
          }}
        >
          {t('about.ctaTitle', 'Ready to Experience the Artistry?')}
        </h2>
        <p
          style={{
            color: 'rgba(255, 245, 248, 0.92)',
            fontSize: '1rem',
            maxWidth: '620px',
            margin: '0 auto 28px'
          }}
        >
          {t('about.ctaDesc', 'Explore our artisan catalog, reserve an afternoon tea table at our flagship café, or design a bespoke celebration cake.')}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/menu')}
            style={{ padding: '12px 28px', borderRadius: '9999px', fontWeight: 700 }}
          >
            {t('about.ctaMenu', '🍰 Browse Full Menu')}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/booking')}
            style={{ padding: '12px 28px', borderRadius: '9999px', fontWeight: 700, border: '2px solid rgba(255, 183, 197, 0.45)' }}
          >
            {t('about.ctaBooking', '🪑 Reserve a Table')}
          </button>
        </div>
      </section>

    </div>
  );
}

export default About;
