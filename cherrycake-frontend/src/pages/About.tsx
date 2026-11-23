import { Link } from 'react-router-dom';

import { useTranslation } from '../i18n/useTranslation';
import Globe from '../components/about/Globe';

import './About.css';

/**
 * About us: story, the interactive globe of the 17 countries we operate in, standards, hours and the team.
 * Texts come from the about.* dictionary (16 languages); the layout follows this project's light design tokens.
 */
export default function About() {
  const { t } = useTranslation();

  const metrics = [
    { value: '17', label: t('about.metricNations', 'Connected Nations & Hubs') },
    { value: '100%', label: t('about.metricIngredients', 'Pure Natural Ingredients') },
    { value: '04:30', label: t('about.metricDawn', 'Fresh Dawn Baking Daily') },
    { value: '1,200+', label: t('about.metricCelebrations', 'Celebrations & Weddings') },
  ];

  const promises = [
    [t('about.promiseButter', 'Normandy AOP Butter:'), t('about.promiseButterDesc', '84% fat content for delicate, paper-thin flakiness.')],
    [t('about.promiseVanilla', 'Madagascar Bourbon Vanilla:'), t('about.promiseVanillaDesc', 'Fragrant, rich, whole vanilla bean caviar.')],
    [t('about.promiseCocoa', 'Single-Origin Cocoa:'), t('about.promiseCocoaDesc', 'Sustainable 72% Belgian dark chocolate couvertures.')],
    [t('about.promiseColdChain', 'Cold-Chain Integrity:'), t('about.promiseColdChainDesc', 'Specialized electric delivery vans keeping cakes at a pristine +4°C.')],
  ];

  const pillars = [
    { icon: '🥐', title: t('about.pillar1Title', 'Master Viennoiserie'), text: t('about.pillar1Desc', 'Slow cold-fermented doughs folded across 72 micro-layers, yielding crisp golden crusts with meltingly soft honeycomb interiors.') },
    { icon: '🍓', title: t('about.pillar2Title', 'Organic Orchard Fruit'), text: t('about.pillar2Desc', 'Hand-picked wild raspberries, mountain cherries, and orchard blueberries harvested at peak ripeness for pure, natural fruit coulis.') },
    { icon: '🎂', title: t('about.pillar3Title', 'Custom Studio Creations'), text: t('about.pillar3Desc', 'Interactive bespoke design studio allowing our guests to tailor shapes, tier heights, fillings, artisanal glazes, and celebration toppers.') },
    { icon: '☕', title: t('about.pillar4Title', 'Specialty Barista Roast'), text: t('about.pillar4Desc', 'Single-origin Ethiopian and Colombian Arabica beans micro-roasted weekly to pair in exquisite balance with every pastry notes.') },
  ];

  const hours = [
    { icon: '☕', title: t('about.diningRoomTitle', 'Café & Dining Room'), lines: [t('about.diningMonFri', 'Monday – Friday: 08:00 – 22:00'), t('about.diningSatSun', 'Saturday – Sunday: 09:00 – 23:00')], note: t('about.diningNote', 'Sakura garden & indoor dining') },
    { icon: '🛍️', title: t('about.hubPickupTitle', 'Boutique Hub Pickup'), lines: [t('about.hubPickupDaily', 'Daily: 08:30 – 21:30')], note: t('about.hubPickupNote', 'Pre-orders ready in 15 minutes') },
    { icon: '🚚', title: t('about.deliveryTitle', 'Climate-Controlled Delivery'), lines: [t('about.deliveryDaily', 'Daily: 10:00 – 20:30')], note: t('about.deliveryNote', 'Insulated thermal packaging') },
  ];

  const chefs = [
    { icon: '👨‍🍳', name: 'Chef Pierre Delacroix', role: t('about.chef1Role', 'Executive Pastry Director'), text: t('about.chef1Desc', 'Over 20 years of classical Parisian pâtisserie mastery, overseeing dough lamination, viennoiserie, and signature celebration gateaux.') },
    { icon: '👩‍🍳', name: 'Chef Yumi Takahashi', role: t('about.chef2Role', 'Botanical & Matcha Specialist'), text: t('about.chef2Desc', 'Pioneering the fusion of Japanese cherry blossom petals, Uji ceremonial matcha, and white peach purees with French textures.') },
    { icon: '👨‍🍳', name: 'Chef Rustam Karimov', role: t('about.chef3Role', 'Regional Honey & Nut Artisan'), text: t('about.chef3Desc', 'Specialist in traditional Silk Road honey cakes (Medovik), mountain walnuts, pistachios, and regional spice infusions.') },
  ];

  return (
    <div className="about-page" data-testid="about-page">
      {/* 1. Hero */}
      <section className="about-hero">
        <p className="about-eyebrow">{t('about.heroBadge', 'Haute Pâtisserie & Specialty Café')}</p>
        <h1>{t('about.heroTitle', 'Sweet Moments, Crafted with Heritage & Passion')}</h1>
        <p className="about-lead">
          {t('about.heroDesc', 'Where timeless French viennoiserie marries delicate Japanese cherry blossom botanicals. Handcrafted daily before sunrise using 100% natural dairy cream, organic vanilla, farm-picked berries, and single-origin Belgian chocolate.')}
        </p>
        <ul className="about-metrics">
          {metrics.map((metric) => (
            <li key={metric.label} className="about-metric">
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 2. Story and promise */}
      <section className="about-story">
        <div>
          <p className="about-eyebrow">{t('about.storyEyebrow', 'Our Origin & Philosophy')}</p>
          <h2>{t('about.storyTitle', 'Two Cultures, One Harmonious Sweet Perfection')}</h2>
          <p>{t('about.storyP1', 'Cherry Cake was born from a singular culinary vision: to weave the uncompromising architectural rigor of classical French pâtisserie with the subtle, ephemeral grace of Japanese cherry blossom florals.')}</p>
          <p>{t('about.storyP2', 'We refuse artificial colorings, synthetic stabilizers, and industrialized shortcuts. Every single layer of puff pastry is hand-laminated over three days using single-origin Normandy butter. Every fruit filling is simmered in copper pots from farm-picked mountain cherries and wild strawberries.')}</p>
          <div className="about-actions">
            <Link to="/menu" className="about-btn about-btn-primary">{t('about.ctaMenu', 'Browse Full Menu')}</Link>
            <Link to="/booking" className="about-btn">{t('about.ctaBooking', 'Reserve a Table')}</Link>
          </div>
        </div>
        <aside className="about-promise">
          <h3>{t('about.promiseTitle', "The Pâtissier's Golden Promise")}</h3>
          <ul>
            {promises.map(([title, text]) => (
              <li key={title}>
                <span className="about-check" aria-hidden="true">✓</span>
                <span><strong>{title}</strong> {text}</span>
              </li>
            ))}
          </ul>
        </aside>
      </section>

      {/* 3. Interactive globe */}
      <section className="about-globe">
        <Globe />
      </section>

      {/* 4. Pillars */}
      <section className="about-section">
        <p className="about-eyebrow">{t('about.pillarsEyebrow', 'Artisanal Standards')}</p>
        <h2>{t('about.pillarsTitle', 'Our Four Pillars of Culinary Excellence')}</h2>
        <div className="about-grid about-grid-4">
          {pillars.map((pillar) => (
            <article key={pillar.title} className="about-card">
              <div className="about-card-icon" aria-hidden="true">{pillar.icon}</div>
              <h3>{pillar.title}</h3>
              <p>{pillar.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 5. Hours */}
      <section className="about-section">
        <div className="about-section-head">
          <div>
            <p className="about-eyebrow">{t('about.schedEyebrow', 'Hospitality & Pickup Schedules')}</p>
            <h2>{t('about.schedTitle', 'Café, Dining & Distribution Hours')}</h2>
          </div>
          <Link to="/booking" className="about-btn about-btn-primary">{t('about.bookDiningTable', 'Book a Dining Table')}</Link>
        </div>
        <div className="about-grid about-grid-3">
          {hours.map((block) => (
            <article key={block.title} className="about-card">
              <div className="about-card-icon" aria-hidden="true">{block.icon}</div>
              <h3>{block.title}</h3>
              {block.lines.map((line) => (
                <p key={line} className="about-hours-line">{line}</p>
              ))}
              <p className="about-muted">{block.note}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 6. Team */}
      <section className="about-section">
        <p className="about-eyebrow">{t('about.chefsEyebrow', 'Culinary Leadership')}</p>
        <h2>{t('about.chefsTitle', 'Meet Our Master Pâtissiers')}</h2>
        <div className="about-grid about-grid-3">
          {chefs.map((chef) => (
            <article key={chef.name} className="about-card about-chef">
              <div className="about-chef-avatar" aria-hidden="true">{chef.icon}</div>
              <h3>{chef.name}</h3>
              <p className="about-chef-role">{chef.role}</p>
              <p>{chef.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 7. Call to action */}
      <section className="about-cta">
        <h2>{t('about.ctaTitle', 'Ready to Experience the Artistry?')}</h2>
        <p>{t('about.ctaDesc', 'Explore our artisan catalog, reserve an afternoon tea table at our flagship café, or design a bespoke celebration cake.')}</p>
        <div className="about-actions">
          <Link to="/menu" className="about-btn about-btn-primary">{t('about.ctaMenu', 'Browse Full Menu')}</Link>
          <Link to="/booking" className="about-btn">{t('about.ctaBooking', 'Reserve a Table')}</Link>
        </div>
      </section>
    </div>
  );
}
