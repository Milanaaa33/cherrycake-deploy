import { Suspense, lazy, useEffect, useRef } from 'react';
import { Navigate, Routes, Route, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { hideToast } from './store';
import type { RootState } from './store';
import useTranslation from './i18n/useTranslation';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Toast from './components/ui/Toast';
import RequireSignIn from './components/auth/RequireSignIn';
import RequireRole from './components/auth/RequireRole';
import UIKit from './pages/UIKit';

import Home from './pages/Home';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Reports from './pages/Reports';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Account from './pages/Account';
import Booking from './pages/Booking';
import Loader from './components/ui/Loader';
import SakuraBackground from './components/common/SakuraBackground';
import AudioPlayer from './components/common/AudioPlayer';
import CartDrawer from './components/common/CartDrawer';
import AboutHoursModal from './components/common/AboutHoursModal';
import { FreyjaEasterEgg } from './components/common/FreyjaEasterEgg';

// Loaded on demand: the About page carries three.js and the globe, the admin panel is for staff only.
const About = lazy(() => import('./pages/About'));
const Admin = lazy(() => import('./pages/Admin'));

import './App.css';

export default function App() {
  const toast = useSelector((state: RootState) => state.ui.toast);
  const toastType = useSelector((state: RootState) => state.ui.toastType);
  const theme = useSelector((state: RootState) => state.ui.theme);
  const language = useSelector((state: RootState) => state.language.current);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  // Screen readers and the browser's translation prompt follow the chosen interface language.
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    document.documentElement.setAttribute('data-reveal-ready', 'true');

    const observed = new WeakSet<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' },
    );

    const scanTargets = () => {
      const selector = [
        '.cc-home-featured',
        '.cc-spotlight-banner',
        '.cc-home-pillars',
        '.cc-home-promo-banner',
        '.about-page-container > section:not(:first-child)',
        '.storefront-footer',
      ].join(', ');

      document.querySelectorAll(selector).forEach((el) => {
        if (observed.has(el)) return;
        observed.add(el);
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.95) {
          el.classList.add('cc-reveal', 'is-visible');
        } else {
          el.classList.add('cc-reveal');
          observer.observe(el);
        }
      });
    };

    scanTargets();

    // Re-scan when lazy-loaded routes (e.g., About) mount into <main>
    const mutationObserver = new MutationObserver(() => scanTargets());
    if (mainRef.current) {
      mutationObserver.observe(mainRef.current, { childList: true, subtree: true });
    }

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [location.pathname]);

  return (
    <div className="cc-app">
      <SakuraBackground />
      <Header />

      <main ref={mainRef} className="cc-content">
        <div key={location.pathname} className="cc-page-transition">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/about" element={<Suspense fallback={<Loader label={t('common.loading', 'Loading…')} />}><About /></Suspense>} />
            <Route
              path="/admin"
              element={
                <RequireRole minimum="VIEWER">
                  <Suspense fallback={<Loader label={t('common.loading', 'Loading…')} />}>
                    <Admin />
                  </Suspense>
                </RequireRole>
              }
            />
            <Route path="/admin/catalog" element={<Navigate to="/admin" replace />} />
            <Route path="/cart" element={<RequireSignIn><Cart /></RequireSignIn>} />
            <Route
              path="/reports"
              element={
                <RequireRole minimum="STAFF">
                  <Reports />
                </RequireRole>
              }
            />
            <Route path="/checkout" element={<RequireSignIn><Checkout /></RequireSignIn>} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/account" element={<Account />} />
            <Route path="/login" element={<Navigate to="/account" replace />} />
            <Route path="/ui-kit" element={<UIKit />} />
          </Routes>
        </div>
      </main>

      <Footer />

      <Toast
        message={toast}
        type={toastType}
        onClose={() => dispatch(hideToast())}
      />

      <AudioPlayer />
      <CartDrawer />
      <AboutHoursModal />
      <FreyjaEasterEgg />
    </div>
  );
}
