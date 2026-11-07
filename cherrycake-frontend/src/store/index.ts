import { configureStore, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

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
  KAZ: { currencyCode: 'KZT', currencySymbol: 'KZT', vatRate: 0.16 },
  GEO: { currencyCode: 'GEL', currencySymbol: 'GEL', vatRate: 0.18 },
  UKR: { currencyCode: 'UAH', currencySymbol: 'UAH', vatRate: 0.20 },
  CHN: { currencyCode: 'CNY', currencySymbol: 'CNY', vatRate: 0.13 },
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
  name: 'region',
  initialState: initialRegionState,
  reducers: {
    setRegion: (state, action: PayloadAction<string>) => {
      if (!isRegionCode(action.payload)) return;
      const code = action.payload;
      Object.assign(state, { code, selected: code, ...countries[code] });
    },
    setRegionCode: (state, action: PayloadAction<string>) => {
      if (!isRegionCode(action.payload)) return;
      const code = action.payload;
      Object.assign(state, { code, selected: code, ...countries[code] });
    },
  },
});
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [] as string[],
  },
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
  name: 'ui',
  initialState: {
    toast: '',
  },
  reducers: {
    showToast: (state, action: PayloadAction<string>) => {
      state.toast = action.payload;
    },

    hideToast: (state) => {
      state.toast = '';
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

