import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { hideToast } from './store';
import type { RootState } from './store';

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

// Loaded on demand: the About page carries three.js and the globe, the admin panel is for staff only.
const About = lazy(() => import('./pages/About'));
const Admin = lazy(() => import('./pages/Admin'));

import './App.css';

export default function App() {
  const toast = useSelector((state: RootState) => state.ui.toast);
  const language = useSelector((state: RootState) => state.language.current);
  const dispatch = useDispatch();

  // Screen readers and the browser's translation prompt follow the chosen interface language.
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <div className="cc-app">
      <Header />

      <main className="cc-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/about" element={<Suspense fallback={<Loader />}><About /></Suspense>} />
          <Route
            path="/admin"
            element={
              <RequireRole minimum="VIEWER">
                <Suspense fallback={<Loader />}>
                  <Admin />
                </Suspense>
              </RequireRole>
            }
          />
          <Route path="/cart" element={<RequireSignIn><Cart /></RequireSignIn>} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/checkout" element={<RequireSignIn><Checkout /></RequireSignIn>} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/account" element={<Account />} />
          <Route path="/ui-kit" element={<UIKit />} />
        </Routes>
      </main>

      <Footer />

      <Toast
        message={toast}
        type="error"
        onClose={() => dispatch(hideToast())}
      />
    </div>
  );
}
