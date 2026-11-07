import { configureStore, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

type RegionState = {
  selected: string;
  code: string;
  currencyCode: string | null;
  currencySymbol: string | null;
  vatRate: number | null;
};

const validCountries = ['UZB', 'KAZ', 'GEO', 'UKR', 'CHN'];

const savedRegion = localStorage.getItem('cc_region');

const initialCode =
  savedRegion && validCountries.includes(savedRegion)
    ? savedRegion
    : 'UZB';

const initialRegionState: RegionState = {
  selected: initialCode,
  code: initialCode,
  currencyCode: initialCode === 'UZB' ? 'UZS' : null,
  currencySymbol: initialCode === 'UZB' ? "so'm" : null,
  vatRate: initialCode === 'UZB' ? 0.15 : null,
};

const regionSlice = createSlice({
  name: 'region',
  initialState: initialRegionState,
  reducers: {
    setRegion: (state, action: PayloadAction<string>) => {
      state.selected = action.payload;
    },

    setRegionCode: (state, action: PayloadAction<string>) => {
      const newCode = action.payload;

      if (!validCountries.includes(newCode)) {
        return;
      }

      state.code = newCode;
      state.selected = newCode;

      if (newCode === 'UZB') {
        state.currencyCode = 'UZS';
        state.currencySymbol = "so'm";
        state.vatRate = 0.15;
      } else {
        state.currencyCode = null;
        state.currencySymbol = null;
        state.vatRate = null;
      }
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
