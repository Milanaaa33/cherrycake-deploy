import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import useTranslation from "../i18n/useTranslation";

import heroCake from "../assets/hero-cake.png";
import treatCoffee from "../assets/treat-coffee.png";
import treatChocolate from "../assets/treat-chocolate.png";
import treatVanilla from "../assets/treat-vanilla.png";
import treatCupcake from "../assets/treat-cupcake.png";

import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="cc-home-container">
      {/* ====================================================================
          1. HERO SECTION (Artisan Editorial Look)
          ==================================================================== */}
      <section className="cc-home-hero" aria-label="Welcome and hero banner">
        <div className="cc-hero-left">
          <div className="cc-hero-tag">
            <span>✨</span> {t('hero.badge', 'Artisan Confectionery & Café')}
          </div>

          <div className="cc-hero-headline">
            <h1 className="cc-hero-title">
              {t('hero.title1', 'Sweet Moments')}
              <span className="cc-hero-title-cursive">{t('hero.title2', 'Start Here')}</span>
            </h1>
            <p className="cc-hero-eyebrow-accent">
              {t('hero.badge', 'Welcome to Cherry Cake')}
            </p>
          </div>

          <p className="cc-hero-subtitle">
            {t('hero.subtitle', 'Handcrafted with passion and baked fresh every sunrise. We pair authentic European pastry techniques with fresh wild berries, pure dairy cream, and single-origin Belgian chocolate to celebrate your every sweet milestone.')}
          </p>

          <div className="cc-hero-actions">
            <Button
              type="button"
              onClick={() => navigate("/menu")}
              className="cc-hero-primary-btn"
            >
              <span>{t('hero.viewMenu', 'View Menu')}</span>
              <span className="cc-hero-arrow-bubble" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            </Button>

            <button
              type="button"
              onClick={() => navigate("/menu")}
              className="cc-hero-secondary-btn"
            >
              <span>{t('hero.explore', 'Explore Flavors')}</span>
              <span style={{ fontSize: "12px", color: "var(--color-primary)" }}>&gt;</span>
            </button>
          </div>

          <div className="cc-hero-perks">
            <div className="cc-hero-perk-item">
              <span className="cc-hero-perk-icon-wrap">🍓</span>
              <span>{t('hero.perk1', '100% Natural Berries & Cream')}</span>
            </div>
            <div className="cc-hero-perk-item">
              <span className="cc-hero-perk-icon-wrap">🧁</span>
              <span>{t('hero.perk2', 'Baked Fresh Every Day')}</span>
            </div>
            <div className="cc-hero-perk-item">
              <span className="cc-hero-perk-icon-wrap">🚚</span>
              <span>{t('hero.perk3', 'Regional Delivery & Pickup')}</span>
            </div>
          </div>
        </div>

        {/* Hero Visual: Centerpiece Cake with Floating Glassmorphism Badges */}
        <div className="cc-hero-right">
          <div className="cc-hero-visual-stage">
            <div className="cc-hero-pedestal-glow" aria-hidden="true" />

            <img
              src={heroCake}
              alt="Artisan Strawberry Charlotte Cake"
              className="cc-hero-cake-image"
              loading="eager"
            />

            {/* Floating Left Card: Chocolate Indulgence */}
            <div
              className="cc-floating-card-left"
              onClick={() => navigate("/menu")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && navigate("/menu")}
              title="Click to view Chocolate Indulgence in Menu"
            >
              <img
                src={treatChocolate}
                alt="Chocolate cake thumbnail"
                className="cc-floating-thumb"
              />
              <div className="cc-floating-info">
                <span className="cc-floating-title">{t('hero.chocolate', 'Chocolate Indulgence')}</span>
                <span className="cc-floating-caption">
                  {t('hero.viewCake', 'View Cake')} &rarr;
                </span>
              </div>
            </div>

            {/* Floating Right Card: Strawberry Bliss */}
            <div
              className="cc-floating-card-right"
              onClick={() => navigate("/menu")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && navigate("/menu")}
              title="Click to view Strawberry Bliss in Menu"
            >
              <img
                src={treatCupcake}
                alt="Strawberry treat thumbnail"
                className="cc-floating-thumb"
              />
              <div className="cc-floating-info">
                <span className="cc-floating-title">{t('hero.strawberry', 'Strawberry Bliss')}</span>
                <span className="cc-floating-caption">
                  {t('hero.viewTreat', 'View Treat')} &rarr;
                </span>
              </div>
            </div>

            {/* Floating Top Rating Badge */}
            <div className="cc-floating-rating">
              <span className="cc-rating-star">★</span>
              <span className="cc-rating-text">{t('hero.rating', '4.9 • 1,200+ Happy Guests')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. FEATURED CONFECTIONS (Matching "Holde a cake" from Mockup)
          ==================================================================== */}
      <section className="cc-home-featured" aria-label="Featured confections">
        <div className="cc-section-header">
          <p className="cc-section-eyebrow">{t('section.delightsTag', 'OUR ARTISAN SPECIALTIES')}</p>
          <h2 className="cc-section-title">{t('section.delightsTitle', 'Signature Delights')}</h2>
          <p className="cc-section-subtitle">
            {t('section.delightsSub', 'A curated glimpse of our handcrafted confectionery, whipped to perfection and prepared fresh every single morning.')}
          </p>
        </div>

        <div className="cc-featured-grid">
          {/* Card 1: Coffee & Latte */}
          <div
            className="cc-treat-card"
            onClick={() => navigate("/menu")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && navigate("/menu")}
          >
            <div className="cc-treat-image-wrap">
              <span className="cc-treat-pill-tag">{t('treat.tagBarista', 'Specialty Barista')}</span>
              <img
                src={treatCoffee}
                alt="Velvet Latte & Specialty Brews"
                className="cc-treat-img"
                loading="lazy"
              />
            </div>
            <div className="cc-treat-body">
              <h3 className="cc-treat-title">{t('treat.titleLatte', 'Velvet Latte & Coffee')}</h3>
              <p className="cc-treat-desc">
                {t('treat.descLatte', 'Single-origin Arabica espresso paired with velvety microfoam milk and delicate floral lavender notes.')}
              </p>
              <div className="cc-treat-footer">
                <span className="cc-treat-link-text">{t('treat.linkDrinks', 'Explore Drinks')}</span>
                <span className="cc-treat-circle-btn">&rarr;</span>
              </div>
            </div>
          </div>

          {/* Card 2: Chocolate Truffle */}
          <div
            className="cc-treat-card"
            onClick={() => navigate("/menu")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && navigate("/menu")}
          >
            <div className="cc-treat-image-wrap">
              <span className="cc-treat-pill-tag">{t('treat.tagSignature', "Chef's Signature")}</span>
              <img
                src={treatChocolate}
                alt="Artisan Chocolate Truffle Cake"
                className="cc-treat-img"
                loading="lazy"
              />
            </div>
            <div className="cc-treat-body">
              <h3 className="cc-treat-title">{t('treat.titleChocolate', 'Chocolate Truffle Cake')}</h3>
              <p className="cc-treat-desc">
                {t('treat.descChocolate', 'Rich layers of dark Belgian chocolate sponge infused with farm-picked berries and silky cocoa ganache.')}
              </p>
              <div className="cc-treat-footer">
                <span className="cc-treat-link-text">{t('treat.linkCakes', 'Explore Cakes')}</span>
                <span className="cc-treat-circle-btn">&rarr;</span>
              </div>
            </div>
          </div>

          {/* Card 3: Honey & Vanilla */}
          <div
            className="cc-treat-card"
            onClick={() => navigate("/menu")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && navigate("/menu")}
          >
            <div className="cc-treat-image-wrap">
              <span className="cc-treat-pill-tag">{t('treat.tagBestseller', 'Classic Bestseller')}</span>
              <img
                src={treatVanilla}
                alt="Golden Honey & Vanilla Cake Slices"
                className="cc-treat-img"
                loading="lazy"
              />
            </div>
            <div className="cc-treat-body">
              <h3 className="cc-treat-title">{t('treat.titleHoney', 'Golden Honey & Cream')}</h3>
              <p className="cc-treat-desc">
                {t('treat.descHoney', 'Golden caramelised honey cake layers layered with cloud-light sour cream mousse and crumb topping.')}
              </p>
              <div className="cc-treat-footer">
                <span className="cc-treat-link-text">{t('treat.linkPastries', 'Explore Pastries')}</span>
                <span className="cc-treat-circle-btn">&rarr;</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. ARTISAN SPOTLIGHT PAIRING (Matching Bottom of Reference 1)
          ==================================================================== */}
      <section className="cc-spotlight-banner" aria-label="Seasonal spotlight">
        <div className="cc-spotlight-img-wrap">
          <img
            src={treatCupcake}
            alt="Handcrafted berry cupcake with swirl cream"
            className="cc-spotlight-img"
            loading="lazy"
          />
        </div>

        <div className="cc-spotlight-content">
          <div className="cc-hero-tag" style={{ alignSelf: "flex-start" }}>
            <span>🧁</span> {t('spotlight.badge', "Pastry Chef's Pairing")}
          </div>

          <h2 className="cc-spotlight-title">
            {t('spotlight.title', 'Artisan Pastry & Coffee Pairing')}
          </h2>

          <p className="cc-spotlight-text">
            {t('spotlight.desc', 'Every memorable dessert deserves its perfect counterpart. Enjoy our freshly whipped berry cupcakes alongside our house-specialty roast coffee — balanced to perfection for your morning coffee break or evening celebration.')}
          </p>

          <div>
            <Button
              type="button"
              onClick={() => navigate("/menu")}
              className="cc-hero-primary-btn"
            >
              <span>{t('spotlight.btn', 'Explore Bakery Menu')}</span>
              <span className="cc-hero-arrow-bubble" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            </Button>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. THREE VALUE PILLARS (Matching Lumière Bakery Reference)
          ==================================================================== */}
      <section className="cc-home-pillars" aria-label="Bakery standards and guarantees">
        <div className="cc-pillar-item">
          <div className="cc-pillar-icon-box">🌾</div>
          <h3 className="cc-pillar-title">{t('pillar.title1', 'Quality Ingredients, Unforgettable Taste')}</h3>
          <p className="cc-pillar-desc">
            {t('pillar.desc1', 'We source only natural dairy cream, organic flour, and farm-fresh berries without artificial coloring or preservatives.')}
          </p>
        </div>

        <div className="cc-pillar-item">
          <div className="cc-pillar-icon-box">🧁</div>
          <h3 className="cc-pillar-title">{t('pillar.title2', 'Freshly Baked Every Single Day')}</h3>
          <p className="cc-pillar-desc">
            {t('pillar.desc2', 'Baked in small artisanal batches every morning to ensure unmatched texture, moisture, and delicate aroma in every bite.')}
          </p>
        </div>

        <div className="cc-pillar-item">
          <div className="cc-pillar-icon-box">🌟</div>
          <h3 className="cc-pillar-title">{t('pillar.title3', '1,200+ Happy Celebrations')}</h3>
          <p className="cc-pillar-desc">
            {t('pillar.desc3', 'From intimate afternoon tea to grand anniversaries and weddings, our desserts bring smiles across all our regions.')}
          </p>
        </div>
      </section>

      {/* ====================================================================
          5. CALL TO ACTION BANNER (Matching Reference 2 Bottom)
          ==================================================================== */}
      <section className="cc-home-promo-banner" aria-label="Menu callout banner">
        <div className="cc-promo-left">
          <h2 className="cc-promo-title">{t('promo.title', 'Ready to Bite into Happiness?')}</h2>
          <p className="cc-promo-text">
            {t('promo.desc', 'Explore our complete catalog with localized pricing, custom modifier options, and seamless checkout with delivery.')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/menu")}
          className="cc-promo-btn"
        >
          <span>{t('promo.btn', 'Open Full Menu →')}</span>
        </button>
      </section>
    </div>
  );
}
