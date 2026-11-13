
import { configureStore, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

type RegionCode = string;

type CountryInfo = {
  name: string;
  currencyCode: string;
  currencySymbol: string;
  vatRate: number;
};

type RegionState = {
  code: RegionCode;
  selected: RegionCode;
  name: string;
  currencyCode: string;
  currencySymbol: string;
  vatRate: number;
};

type RegionDetails = {
  code: string;
  name: string;
  currencyCode: string;
  currencySymbol: string;
  vatRate: number;
};

// Fallback data when the regions API is unavailable.
const countries: Record<string, CountryInfo> = {
  UZB: {
    name: 'Uzbekistan',
    currencyCode: 'UZS',
    currencySymbol: "so'm",
    vatRate: 0.15,
  },
  KAZ: {
    name: 'Kazakhstan',
    currencyCode: 'KZT',
    currencySymbol: '\u20B8',
    vatRate: 0.20,
  },
  GEO: {
    name: 'Georgia',
    currencyCode: 'GEL',
    currencySymbol: '\u20BE',
    vatRate: 0.12,
  },
  UKR: {
    name: 'Ukraine',
    currencyCode: 'UAH',
    currencySymbol: '\u20B4',
    vatRate: 0.08,
  },
  CHN: {
    name: 'China',
    currencyCode: 'CNY',
    currencySymbol: '\u00A5',
    vatRate: 0.18,
  },
};

const isValidRegionCode = (value: string): boolean =>
  /^[A-Z]{3}$/.test(value);

const isFallbackRegion = (value: string): boolean =>
  Object.prototype.hasOwnProperty.call(countries, value);

const savedRegion = localStorage.getItem('cc_region');
const envRegion = import.meta.env.VITE_DEFAULT_REGION || 'UZB';

const initialCode: RegionCode =
  savedRegion && isValidRegionCode(savedRegion)
    ? savedRegion
    : isFallbackRegion(envRegion)
      ? envRegion
      : 'UZB';

const initialRegionState: RegionState = {
  code: initialCode,
  selected: initialCode,
  ...(countries[initialCode] ?? countries.UZB),
};

const regionSlice = createSlice({
  name: 'region',
  initialState: initialRegionState,
  reducers: {
    setRegion: (state, action: PayloadAction<string>) => {
      const code = action.payload;
      const country = countries[code];

      if (!country) {
        return;
      }

      Object.assign(state, {
        code,
        selected: code,
        ...country,
      });

      localStorage.setItem('cc_region', code);
    },

    setRegionCode: (state, action: PayloadAction<string>) => {
      const code = action.payload;
      const country = countries[code];

      if (!country) {
        return;
      }

      Object.assign(state, {
        code,
        selected: code,
        ...country,
      });

      localStorage.setItem('cc_region', code);
    },

    // Supports all regions returned by the backend API.
    setRegionDetails: (
      state,
      action: PayloadAction<RegionDetails>
    ) => {
      const region = action.payload;

      if (
        !isValidRegionCode(region.code) ||
        !region.name.trim() ||
        !region.currencyCode.trim() ||
        !region.currencySymbol.trim() ||
        !Number.isFinite(region.vatRate) ||
        region.vatRate < 0
      ) {
        return;
      }

      state.code = region.code;
      state.selected = region.code;
      state.name = region.name;
      state.currencyCode = region.currencyCode;
      state.currencySymbol = region.currencySymbol;
      state.vatRate = region.vatRate;

      localStorage.setItem('cc_region', region.code);
    },
  },
});
export type CartItem = {
  id: string;
  productId: number;
  name: string;
  quantity: number;
  modifierIds: number[];
  photoUrl: string | null;
};

export type StoredCartItem = CartItem | string;

export function isCartItem(item: StoredCartItem): item is CartItem {
  return typeof item !== 'string';
}

function readCart(): StoredCartItem[] {
  const savedCart = localStorage.getItem('cc_cart');
  if (!savedCart) return [];

  try {
    const parsed: unknown = JSON.parse(savedCart);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is StoredCartItem => {
      if (typeof item === 'string') return true;
      if (!item || typeof item !== 'object') return false;
      const candidate = item as Partial<CartItem>;
      return (
        typeof candidate.id === 'string' &&
        typeof candidate.productId === 'number' &&
        typeof candidate.name === 'string' &&
        typeof candidate.quantity === 'number' &&
        candidate.quantity >= 1 &&
        Array.isArray(candidate.modifierIds) &&
        candidate.modifierIds.every((id) => typeof id === 'number') &&
        (typeof candidate.photoUrl === 'string' || candidate.photoUrl === null)
      );
    });
  } catch {
    return [];
  }
}

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: readCart(),
  },
  reducers: {
    addToCart: (
      state,
      action: PayloadAction<Omit<CartItem, 'id'> & { id?: string } | string>,
    ) => {
      if (typeof action.payload === 'string') {
        state.items.push(action.payload);
        localStorage.setItem('cc_cart', JSON.stringify(state.items));
        return;
      }

      const item = action.payload;
      const modifierKey = [...item.modifierIds].sort((a, b) => a - b).join(',');
      const existing = state.items.find(
        (current) =>
          isCartItem(current) &&
          current.productId === item.productId &&
          [...current.modifierIds].sort((a, b) => a - b).join(',') === modifierKey,
      );

      if (existing && isCartItem(existing)) {
        existing.quantity += Math.max(1, item.quantity);
      } else {
        state.items.push({
          ...item,
          id: item.id ?? `${item.productId}-${modifierKey || 'base'}`,
          quantity: Math.max(1, item.quantity),
        });
      }
      localStorage.setItem('cc_cart', JSON.stringify(state.items));
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item) => !isCartItem(item) || item.id !== action.payload,
      );
      localStorage.setItem('cc_cart', JSON.stringify(state.items));
    },

    updateCartQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>,
    ) => {
      const item = state.items.find(
        (current) => isCartItem(current) && current.id === action.payload.id,
      );
      if (item && isCartItem(item)) {
        item.quantity = Math.max(1, action.payload.quantity);
        localStorage.setItem('cc_cart', JSON.stringify(state.items));
      }
    },

    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem('cc_cart');
    },
  },
});

// Keep existing UI functionality.
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
      state.toast = "";
    },
  },
});

export const {
  setRegion,
  setRegionCode,
  setRegionDetails,
} = regionSlice.actions;

export const {
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
} = cartSlice.actions;

export const {
  showToast,
  hideToast,
} = uiSlice.actions;

export const store = configureStore({
  reducer: {
    region: regionSlice.reducer,
    cart: cartSlice.reducer,
    ui: uiSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
