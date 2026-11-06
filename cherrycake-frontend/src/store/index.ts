import { configureStore, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

const regionSlice = createSlice({
  name: "region",
  initialState: {
    selected: import.meta.env.VITE_DEFAULT_REGION || "Tashkent",
  },
  reducers: {
    setRegion: (state, action: PayloadAction<string>) => {
      state.selected = action.payload;
    },
  },
});

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [] as string[] },
  reducers: {
    addToCart: (state, action: PayloadAction<string>) => {
      state.items.push(action.payload);
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

const uiSlice = createSlice({
  name: "ui",
  initialState: { toast: "" },
  reducers: {
    showToast: (state, action: PayloadAction<string>) => {
      state.toast = action.payload;
    },
    hideToast: (state) => {
      state.toast = "";
    },
  },
});

export const { setRegion } = regionSlice.actions;
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
