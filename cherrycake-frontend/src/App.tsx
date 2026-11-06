
import { NavLink, Link, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { hideToast } from './store';
import type { RootState } from './store';

import Toast from './components/ui/Toast';
import UIKit from './pages/UIKit';
import ReduxDemo from './pages/ReduxDemo';

import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';

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
      <span className="cc-eyebrow">
        Handmade with love
      </span>

      <h2>Life is sweeter with Cherry Cake.</h2>

      <p>
        Discover delicious cakes, fresh desserts,
        and sweet moments made especially for you.
      </p>

      <Link to="/menu" className="cc-hero-action">
        Explore Our Menu
      </Link>
    </section>
  );
}

function Cart() {
  return (
    <section className="cc-placeholder">
      <p className="cc-eyebrow">Cherry Cake</p>

      <h2>Cart</h2>

      <p>Your shopping cart is ready.</p>

      <Link to="/checkout" className="cc-hero-action">
        Proceed to Checkout
      </Link>
    </section>
  );
}

export default function App() {
  const toast = useSelector(
    (state: RootState) => state.ui.toast
  );

  const dispatch = useDispatch();

  return (
    <div className="cc-app">
      <header className="cc-header">
        <div className="cc-header-inner">
          <h1 className="cc-brand">🍒 Cherry Cake</h1>

          <nav className="cc-nav" aria-label="Main navigation">
            <NavLink to="/" end>
              Home
            </NavLink>

            <NavLink to="/menu">
              Menu
            </NavLink>

            <NavLink to="/cart">
              Cart
            </NavLink>

            <NavLink to="/orders">
              Orders
            </NavLink>

            <NavLink to="/ui-kit">
              UI Kit
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="cc-content">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route
            path="/menu"
            element={<Page title="Menu" />}
          />

          <Route
            path="/cart"
            element={<Cart />}
          />

          <Route
            path="/checkout"
            element={<Checkout />}
          />

          <Route
            path="/order-success"
            element={<OrderSuccess />}
          />

          <Route
            path="/orders"
            element={<Page title="Orders" />}
          />

          <Route
            path="/ui-kit"
            element={<UIKit />}
          />

          <Route
            path="/redux-demo"
            element={<ReduxDemo />}
          />
        </Routes>
      </main>

      <Toast
        message={toast}
        type="error"
        onClose={() => dispatch(hideToast())}
      />
    </div>
  );
}
