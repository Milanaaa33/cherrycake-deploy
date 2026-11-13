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
  name: 'region',
  initialState: initialRegionState,
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

export const { setRegion, setRegionCode } = regionSlice.actions;

export const {
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
} = cartSlice.actions;

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
