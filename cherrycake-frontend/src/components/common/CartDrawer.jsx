import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { closeCartDrawer } from '../../store/uiSlice';
import { isCartItem, updateQuantity, removeItem, clearCart } from '../../store/cartSlice';
import useTranslation from '../../i18n/useTranslation';
import { translateProductName } from '../../i18n/catalog';
import CustomSelect from '../ui/CustomSelect';

export function CartDrawer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isOpen = useSelector((state) => state.ui?.isCartDrawerOpen);
  const rawCartItems = useSelector((state) => state.cart?.items || []);
  const cartItems = rawCartItems.filter(isCartItem);
  const regionCode = useSelector((state) => state.region?.code || 'UZB');
  const regions = useSelector((state) => state.region?.regions || []);
  const currentRegion = regions.find((r) => r.code === regionCode) || {
    currencySymbol: "so'm",
    vatRate: 0.15
  };
  const currencySymbol = currentRegion.currencySymbol || "so'm";
  const rawVatRate = currentRegion.vatRate ?? 0.15;
  const normalizedVat = rawVatRate > 1 ? rawVatRate / 100 : rawVatRate;

  const [fulfillment, setFulfillment] = useState('PICKUP'); // 'PICKUP' | 'DELIVERY'
  const [pickupHub, setPickupHub] = useState('hub-central');
  const [deliveryZone, setDeliveryZone] = useState('zone-standard');

  const formatPrice = (amount) => {
    const num = parseFloat(amount) || 0;
    return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencySymbol}`;
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.unitPrice || 0) * (item.quantity || 1), 0);
  const vatAmount = subtotal * normalizedVat;
  const baseDeliveryFee = regionCode === 'UZB' ? 25000 : 5;
  const deliveryFee =
    fulfillment === 'DELIVERY'
      ? deliveryZone === 'zone-express'
        ? baseDeliveryFee * 1.5
        : baseDeliveryFee
      : 0;
  const grandTotal = subtotal + vatAmount + deliveryFee;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 3800,
        pointerEvents: isOpen ? 'auto' : 'none',
        visibility: isOpen ? 'visible' : 'hidden',
        transition: 'visibility 0.35s ease'
      }}
    >
      {/* Backdrop Overlay */}
      <div
        className="cart-overlay active"
        onClick={() => dispatch(closeCartDrawer())}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 3790,
          opacity: isOpen ? 1 : 0,
          transition: 'opacity 0.35s ease'
        }}
      />

      {/* Slide-out Drawer */}
      <aside
        className={`cart-drawer ${isOpen ? 'open' : ''}`}
        id="cartDrawer"
        aria-label="Shopping Bag"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '440px',
          maxWidth: '100vw',
          height: '100vh',
          backgroundColor: 'var(--cherry-panel)',
          borderLeft: '2px solid var(--cherry-border)',
          boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.6)',
          zIndex: 3800,
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Drawer Header */}
        <div
          className="cart-drawer-header"
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--cherry-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--cherry-card)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--sakura-pink)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <h3
              style={{
                margin: 0,
                fontFamily: "'Playfair Display', serif",
                fontSize: '1.25rem',
                color: 'var(--cheesecake-cream)',
                fontWeight: 700
              }}
            >
              {t('cart.title', 'Your Sweet Bag')}
            </h3>
            <span
              style={{
                backgroundColor: 'var(--raspberry-coulis)',
                color: '#fff',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '999px'
              }}
            >
              {cartItems.reduce((acc, i) => acc + (i.quantity || 1), 0)} {t('reports.ordersCount', 'items')}
            </span>
          </div>

          <button
            type="button"
            className="drawer-close-btn"
            onClick={() => dispatch(closeCartDrawer())}
            aria-label="Close bag"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.6rem',
              color: 'var(--text-dim)',
              cursor: 'pointer',
              lineHeight: 1
            }}
          >
            &times;
          </button>
        </div>

        {/* Drawer Body */}
        <div
          className="cart-drawer-body"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}
        >
          {/* Fulfillment Selector */}
          <div
            style={{
              background: 'var(--cherry-card)',
              border: '1.5px solid var(--cherry-border)',
              borderRadius: '14px',
              padding: '14px'
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--sakura-pink)',
                fontWeight: 700,
                marginBottom: '10px'
              }}
            >
              {t('cart.fulfillment', 'Order Fulfillment')}
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <button
                type="button"
                onClick={() => setFulfillment('PICKUP')}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: fulfillment === 'PICKUP' ? '2px solid var(--raspberry-coulis)' : '2px solid var(--cherry-border)',
                  background: fulfillment === 'PICKUP' ? 'rgba(230, 57, 96, 0.2)' : 'transparent',
                  color: fulfillment === 'PICKUP' ? 'var(--sakura-pink)' : 'var(--text-dim)',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                {t('cart.pickup', 'Flagship Pickup')}
              </button>
              <button
                type="button"
                onClick={() => setFulfillment('DELIVERY')}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: fulfillment === 'DELIVERY' ? '2px solid var(--raspberry-coulis)' : '2px solid var(--cherry-border)',
                  background: fulfillment === 'DELIVERY' ? 'rgba(230, 57, 96, 0.2)' : 'transparent',
                  color: fulfillment === 'DELIVERY' ? 'var(--sakura-pink)' : 'var(--text-dim)',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                {t('cart.delivery', 'Courier Delivery')}
              </button>
            </div>

            {fulfillment === 'PICKUP' ? (
              <CustomSelect
                compact
                ariaLabel={t('cart.pickup', 'Flagship Pickup')}
                value={pickupHub}
                onChange={setPickupHub}
                options={[
                  {
                    value: 'hub-central',
                    label: t('cart.hubCentral', 'Tashkent Central Flagship (Amir Timur Ave, 12)'),
                  },
                  {
                    value: 'hub-samarkand',
                    label: t('cart.hubSamarkand', 'Samarkand Boutique Hub (Registan Plaza, 4)'),
                  },
                  {
                    value: 'hub-bukhara',
                    label: t('cart.hubBukhara', 'Bukhara Old City Pâtisserie (Lyabi Khauz, 1)'),
                  },
                ]}
              />
            ) : (
              <CustomSelect
                compact
                ariaLabel={t('cart.delivery', 'Courier Delivery')}
                value={deliveryZone}
                onChange={setDeliveryZone}
                options={[
                  {
                    value: 'zone-standard',
                    label: t('cart.zoneStandard', 'City Center Zone'),
                    meta: `+${formatPrice(baseDeliveryFee)}`,
                  },
                  {
                    value: 'zone-express',
                    label: t('cart.zoneExpress', 'Metropolitan Express'),
                    meta: `+${formatPrice(baseDeliveryFee * 1.5)}`,
                  },
                ]}
              />
            )}
          </div>

          {/* Cart Items List */}
          {cartItems.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 16px',
                color: 'var(--text-dim)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <span style={{ fontSize: '48px' }}>🍰</span>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', color: 'var(--cheesecake-cream)' }}>
                {t('cart.emptyTitle', 'Your bag is empty')}
              </div>
              <p style={{ fontSize: '0.85rem', margin: 0, maxWidth: '240px' }}>
                {t('cart.emptyText', 'Add artisanal cakes and handcrafted delicacies to enjoy prompt confectionery fulfillment.')}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cartItems.map((item, idx) => {
                const itemKey = item.id || item.productId || idx;
                const itemTarget = item.id || item.productId;
                const unitPrice = item.unitPrice || 0;
                const itemTotal = unitPrice * (item.quantity || 1);
                const thumbSrc = item.imageUrl || item.photoUrl;

                return (
                  <div
                    key={itemKey}
                    style={{
                      background: 'var(--cherry-card)',
                      border: '1.5px solid var(--cherry-border)',
                      borderRadius: '14px',
                      padding: '12px',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center'
                    }}
                  >
                    {/* Item Image */}
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(230, 57, 96, 0.12)',
                        border: '1px solid var(--cherry-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        overflow: 'hidden'
                      }}
                    >
                      {thumbSrc ? (
                        <img
                          src={thumbSrc}
                          alt={translateProductName(t, item.name)}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <span style={{ fontSize: '28px' }}>🍰</span>
                      )}
                    </div>

                    {/* Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '0.92rem',
                          color: 'var(--text-main)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {translateProductName(t, item.name)}
                      </div>

                      <div
                        style={{
                          fontWeight: 700,
                          color: 'var(--sakura-pink)',
                          fontSize: '0.88rem',
                          marginTop: '4px'
                        }}
                      >
                        {formatPrice(itemTotal)}
                      </div>
                    </div>

                    {/* Quantity Stepper & Remove */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => dispatch(removeItem(itemTarget))}
                        title="Remove item"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-dim)',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          padding: '2px'
                        }}
                      >
                        ✕
                      </button>

                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          backgroundColor: 'var(--color-surface-soft)',
                          border: '1px solid var(--cherry-border)',
                          borderRadius: '6px',
                          overflow: 'hidden'
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            if (item.quantity > 1) {
                              dispatch(updateQuantity({ id: item.id, productId: item.productId, quantity: item.quantity - 1 }));
                            } else {
                              dispatch(removeItem(itemTarget));
                            }
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-main)',
                            padding: '2px 8px',
                            cursor: 'pointer',
                            fontWeight: 700
                          }}
                        >
                          &minus;
                        </button>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, minWidth: '18px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => dispatch(updateQuantity({ id: item.id, productId: item.productId, quantity: item.quantity + 1 }))}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-main)',
                            padding: '2px 8px',
                            cursor: 'pointer',
                            fontWeight: 700
                          }}
                        >
                          &#43;
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {cartItems.length > 0 && (
          <div
            className="cart-drawer-footer"
            style={{
              padding: '20px 24px',
              borderTop: '2px solid var(--cherry-border)',
              background: 'var(--cherry-card)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
              <span>{t('cart.subtotal', 'Subtotal')}:</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
              <span>{t('cart.vat', 'VAT ({rate}%)', { rate: Math.round(normalizedVat * 100) })}:</span>
              <span>{formatPrice(vatAmount)}</span>
            </div>
            {fulfillment === 'DELIVERY' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                <span>{t('cart.deliveryFee', 'Courier Delivery')}:</span>
                <span>{formatPrice(deliveryFee)}</span>
              </div>
            )}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.2rem',
                fontWeight: 800,
                color: 'var(--cheesecake-cream)',
                borderTop: '1px solid var(--cherry-border)',
                paddingTop: '8px'
              }}
            >
              <span>{t('cart.total', 'Total')}:</span>
              <span style={{ color: 'var(--sakura-pink)' }}>{formatPrice(grandTotal)}</span>
            </div>

            <button
              type="button"
              className="btn-checkout"
              onClick={() => {
                dispatch(closeCartDrawer());
                navigate('/checkout');
              }}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: '9999px',
                fontWeight: 700,
                fontSize: '0.98rem',
                background: 'linear-gradient(135deg, var(--raspberry-coulis), var(--raspberry-bright))',
                color: '#fff',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 4px 18px rgba(230, 57, 96, 0.45)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>{t('cart.checkoutBtn', 'Proceed to Checkout')}</span>
              <span>&rarr;</span>
            </button>

            <button
              type="button"
              onClick={() => {
                dispatch(closeCartDrawer());
                navigate('/cart');
              }}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '9999px',
                fontWeight: 600,
                fontSize: '0.88rem',
                background: 'transparent',
                color: 'var(--text-main)',
                border: '1.5px solid var(--cherry-border)',
                cursor: 'pointer'
              }}
            >
              {t('cart.viewFullCart', 'View Full Cart')}
            </button>

            <button
              type="button"
              onClick={() => dispatch(clearCart())}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-dim)',
                fontSize: '0.78rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {t('cart.clear', 'Empty Bag')}
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

export default CartDrawer;

