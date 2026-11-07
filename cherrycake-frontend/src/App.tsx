
import { Link, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { hideToast } from './store';
import type { RootState } from './store';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Toast from './components/ui/Toast';
import UIKit from './pages/UIKit';
import ReduxDemo from './pages/ReduxDemo';

import './App.css';

function Page({ title }: { title: string }) {
  return (
    <section className="cc-placeholder">
      <p className="cc-eyebrow">Cherry Cake</p>
      <h2>{title}</h2>
      <p>This page is ready for development.</p>
    </section>
  );
}

function Home() {
  return (
    <section className="cc-hero">
      <span className="cc-eyebrow">Handmade with love</span>
      <h2>Life is sweeter with Cherry Cake.</h2>
      <p>
        Discover delicious cakes, fresh desserts, and sweet moments made
        especially for you.
      </p>
      <Link to="/menu" className="cc-hero-action">
        Explore Our Menu
      </Link>
    </section>
  );
}

export default function App() {
  const toast = useSelector((state: RootState) => state.ui.toast);
  const dispatch = useDispatch();

  return (
    <div className="cc-app">
      <Header />

      <main className="cc-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Page title="Menu" />} />
          <Route path="/cart" element={<Page title="Cart" />} />
          <Route path="/orders" element={<Page title="Orders" />} />
          <Route path="/ui-kit" element={<UIKit />} />
          <Route path="/redux-demo" element={<ReduxDemo />} />
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
