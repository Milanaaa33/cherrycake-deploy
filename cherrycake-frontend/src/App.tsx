<<<<<<< HEAD
import { NavLink, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { hideToast } from "./store";
import type { RootState } from "./store";

import { NavLink, Link, Routes, Route } from 'react-router-dom';
﻿
import { Link, Routes, Route } from 'react-router-dom';
=======
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { hideToast } from './store';
import type { RootState } from './store';
>>>>>>> c45befe (CC-15: Add page skeletons and update App router)

import Toast from "./components/ui/Toast";
import UIKit from "./pages/UIKit";
import ReduxDemo from "./pages/ReduxDemo";
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Toast from './components/ui/Toast';
import UIKit from './pages/UIKit';
import ReduxDemo from './pages/ReduxDemo';

<<<<<<< HEAD
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Reports from "./pages/Reports";
=======
import Home from './pages/Home';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Reports from './pages/Reports';

>>>>>>> c45befe (CC-15: Add page skeletons and update App router)
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';

import './App.css';

function Page({ title }: Readonly<{ title: string }>) {
  return (
    <section className="cc-placeholder">
      <p className="cc-eyebrow">Cherry Cake</p>
      <h2>{title}</h2>
      <p>This page is ready for development.</p>
    </section>
  );
}

export default function App() {
  const toast = useSelector((state: RootState) => state.ui.toast);

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
            <NavLink to="/menu">Menu</NavLink>
            <NavLink to="/cart">Cart</NavLink>
            <NavLink to="/reports">Reports</NavLink>
            <NavLink to="/ui-kit">UI Kit</NavLink>

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
      <Header />

      <main className="cc-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/reports" element={<Reports />} />
<<<<<<< HEAD
          <Route path="/ui-kit" element={<UIKit />} />
          <Route path="/redux-demo" element={<ReduxDemo />} />

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

          <Route path="/reports" element={<Page title="Reports" />} />
          <Route
            path="/ui-kit"
            element={<UIKit />}
          />

          <Route
            path="/redux-demo"
            element={<ReduxDemo />}
          />
=======
          
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/orders" element={<Page title="Orders" />} />
          <Route path="/ui-kit" element={<UIKit />} />
          <Route path="/redux-demo" element={<ReduxDemo />} />
>>>>>>> c45befe (CC-15: Add page skeletons and update App router)
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
