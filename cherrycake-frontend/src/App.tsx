import { NavLink, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { hideToast } from "./store";
import type { RootState } from "./store";

import Toast from "./components/ui/Toast";
import UIKit from "./pages/UIKit";
import ReduxDemo from "./pages/ReduxDemo";

import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Reports from "./pages/Reports";

import "./App.css";

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
          </nav>
        </div>
      </header>

      <main className="cc-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/ui-kit" element={<UIKit />} />
          <Route path="/redux-demo" element={<ReduxDemo />} />
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
