<<<<<<< HEAD
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import { setRegion, addToCart, clearCart, showToast } from "../store";
=======
<<<<<<< HEAD
﻿import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import {
  setRegion,
  addToCart,
  clearCart,
  showToast,
} from '../store';
=======
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import { setRegion, addToCart, clearCart, showToast } from "../store";
>>>>>>> e7cd84a (CC-15: Add page skeletons and update App router)
>>>>>>> c45befe (CC-15: Add page skeletons and update App router)

export default function ReduxDemo() {
  const dispatch = useDispatch();

  const region = useSelector((state: RootState) => state.region.selected);

  const cart = useSelector((state: RootState) => state.cart.items);

  return (
    <section style={{ padding: 24 }}>
      <h2>Cherry Cake вЂ” Redux Demo</h2>

      <h3>Region</h3>
      <p>Selected region: {region}</p>

      <select
        value={region}
        onChange={(event) => dispatch(setRegion(event.target.value))}
      >
        <option value="UZB">Uzbekistan</option>
        <option value="KAZ">Kazakhstan</option>
        <option value="GEO">Georgia</option>
        <option value="UKR">Ukraine</option>
        <option value="CHN">China</option>
      </select>

      <hr />

      <h3>Cart</h3>
      <p>Items in cart: {cart.length}</p>

      <button onClick={() => dispatch(addToCart("Chocolate Cake"))}>
        Add Chocolate Cake
      </button>

      <button onClick={() => dispatch(addToCart("Cherry Cake"))}>
        Add Cherry Cake
      </button>

      <button onClick={() => dispatch(clearCart())}>Clear Cart</button>

      <ul>
        {cart.map((item, index) => (
          <li key={`${item}-${index}`}>{item}</li>
        ))}
      </ul>

      <hr />

      <h3>UI State</h3>
      <button onClick={() => dispatch(showToast("Redux UI state is working!"))}>
        Show Redux Toast
      </button>
    </section>
  );
}

