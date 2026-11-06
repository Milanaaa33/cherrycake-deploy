<<<<<<< HEAD
﻿import { configureStore, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
=======
import { configureStore, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
>>>>>>> e7cd84a (CC-15: Add page skeletons and update App router)

type RegionCode = 'UZB' | 'KAZ' | 'GEO' | 'UKR' | 'CHN';

type RegionState = {
  code: RegionCode;
  selected: RegionCode;
  currencyCode: string;
  currencySymbol: string;
  vatRate: number;
};

const countries: Record<
  RegionCode,
  { currencyCode: string; currencySymbol: string; vatRate: number }
> = {
  UZB: { currencyCode: 'UZS', currencySymbol: "so'm", vatRate: 0.15 },
  KAZ: { currencyCode: 'KZT', currencySymbol: '₸', vatRate: 0.20 },
  GEO: { currencyCode: 'GEL', currencySymbol: '₾', vatRate: 0.12 },
  UKR: { currencyCode: 'UAH', currencySymbol: '₴', vatRate: 0.08 },
  CHN: { currencyCode: 'CNY', currencySymbol: '¥', vatRate: 0.18 },
};

const isRegionCode = (value: string): value is RegionCode =>
  Object.prototype.hasOwnProperty.call(countries, value);

const savedRegion = localStorage.getItem('cc_region');
const envRegion = import.meta.env.VITE_DEFAULT_REGION || 'UZB';

const initialCode: RegionCode =
  savedRegion && isRegionCode(savedRegion)
    ? savedRegion
    : isRegionCode(envRegion)
      ? envRegion
      : 'UZB';

const initialRegionState: RegionState = {
  code: initialCode,
  selected: initialCode,
  ...countries[initialCode],
};

const regionSlice = createSlice({
<<<<<<< HEAD
  name: 'region',
  initialState: initialRegionState,
=======
  name: "region",
  initialState: {
    selected: import.meta.env.VITE_DEFAULT_REGION || "Tashkent",
  },
>>>>>>> e7cd84a (CC-15: Add page skeletons and update App router)
  reducers: {
    setRegion: (state, action: PayloadAction<string>) => {
      if (!isRegionCode(action.payload)) return;
      const code = action.payload;
      Object.assign(state, { code, selected: code, ...countries[code] });
      localStorage.setItem('cc_region', code);
    },
    setRegionCode: (state, action: PayloadAction<string>) => {
      if (!isRegionCode(action.payload)) return;
      const code = action.payload;
      Object.assign(state, { code, selected: code, ...countries[code] });
      localStorage.setItem('cc_region', code);
    },
  },
});
const savedCart = localStorage.getItem('cc_cart');
let initialCart: string[] = [];
if (savedCart) {
  try {
    initialCart = JSON.parse(savedCart);
  } catch {
    initialCart = [];
  }
}

const cartSlice = createSlice({
<<<<<<< HEAD
  name: 'cart',
  initialState: {
    items: initialCart,
  },
=======
  name: "cart",
  initialState: { items: [] as string[] },
>>>>>>> e7cd84a (CC-15: Add page skeletons and update App router)
  reducers: {
    addToCart: (state, action: PayloadAction<string>) => {
      state.items.push(action.payload);
      localStorage.setItem('cc_cart', JSON.stringify(state.items));
    },

    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem('cc_cart');
    },
  },
});

const uiSlice = createSlice({
<<<<<<< HEAD
  name: 'ui',
  initialState: {
    toast: '',
  },
=======
  name: "ui",
  initialState: { toast: "" },
>>>>>>> e7cd84a (CC-15: Add page skeletons and update App router)
  reducers: {
    showToast: (state, action: PayloadAction<string>) => {
      state.toast = action.payload;
    },

    hideToast: (state) => {
      state.toast = "";
    },
  },
});

export const { setRegion, setRegionCode } = regionSlice.actions;

export const { addToCart, clearCart } = cartSlice.actions;

export const { showToast, hideToast } = uiSlice.actions;

export const store = configureStore({
  reducer: {
    region: regionSlice.reducer,
    cart: cartSlice.reducer,
    ui: uiSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

