import { configureStore, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { FALLBACK_REGIONS, FALLBACK_REGION_MAP, type RegionInfo } from '../constants/regions';
import {
  DEFAULT_LANGUAGE,
  REGION_TO_LANGUAGE,
  isSupportedLanguage,
  type SupportedLanguage,
} from '../i18n/languages';

export type Region = RegionInfo;
type RegionCode = string;

type RegionState = {
  code: RegionCode;
  selected: RegionCode;
  name: string;
  currencyCode: string;
  currencySymbol: string;
  vatRate: number;
  regions: Region[];
};

type RegionDetails = {
  code: string;
  name: string;
  currencyCode: string;
  currencySymbol: string;
  vatRate: number;
};

// Fallback data when the regions API is unavailable (shared with CountrySwitcher).
const countries: Record<string, RegionInfo> = FALLBACK_REGION_MAP;

const isValidRegionCode = (value: string): boolean =>
  /^[A-Z]{3}$/.test(value);

const isFallbackRegion = (value: string): boolean =>
  Object.prototype.hasOwnProperty.call(countries, value);

function readSavedRegion(): string | null {
  try {
    return localStorage.getItem('cc_region');
  } catch {
    return null;
  }
}

const savedRegion = readSavedRegion();
const envRegion = import.meta.env.VITE_DEFAULT_REGION || 'UZB';

const initialCode: RegionCode =
  savedRegion && isValidRegionCode(savedRegion)
    ? savedRegion
    : isFallbackRegion(envRegion)
      ? envRegion
      : 'UZB';

const initialCountry = countries[initialCode] ?? countries.UZB;

const initialRegionState: RegionState = {
  code: initialCode,
  selected: initialCode,
  name: initialCountry.name,
  currencyCode: initialCountry.currencyCode,
  currencySymbol: initialCountry.currencySymbol,
  vatRate: initialCountry.vatRate,
  regions: FALLBACK_REGIONS,
};

export const regionSlice = createSlice({
  name: 'region',
  initialState: initialRegionState,
  reducers: {
    setRegion: (state, action: PayloadAction<string>) => {
      const code = action.payload;
      const country =
        state.regions.find((r) => r.code === code) ?? countries[code];

      if (!country) {
        return;
      }

      state.code = code;
      state.selected = code;
      state.name = country.name;
      state.currencyCode = country.currencyCode;
      state.currencySymbol = country.currencySymbol;
      state.vatRate = country.vatRate;

      try {
        localStorage.setItem('cc_region', code);
      } catch {
        // Storage blocked.
      }
    },

    setRegionCode: (state, action: PayloadAction<string>) => {
      regionSlice.caseReducers.setRegion(state, action);
    },

    // Supports all regions returned by the backend API.
    setRegionDetails: (
      state,
      action: PayloadAction<RegionDetails>,
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

      try {
        localStorage.setItem('cc_region', region.code);
      } catch {
        // Storage blocked.
      }
    },

    setRegions: (state, action: PayloadAction<Region[]>) => {
      if (!Array.isArray(action.payload) || action.payload.length === 0) {
        return;
      }
      state.regions = action.payload;
      const active = action.payload.find((r) => r.code === state.code);
      if (active) {
        state.name = active.name;
        state.currencyCode = active.currencyCode;
        state.currencySymbol = active.currencySymbol;
        state.vatRate = active.vatRate;
      }
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
  unitPrice?: number;
  imageUrl?: string;
};

export type StoredCartItem = CartItem | string;

export function isCartItem(item: StoredCartItem): item is CartItem {
  return typeof item !== 'string';
}

function readCart(): StoredCartItem[] {
  try {
    const savedCart = localStorage.getItem('cc_cart');
    if (!savedCart) return [];
    const parsed: unknown = JSON.parse(savedCart);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is StoredCartItem => {
        if (typeof item === 'string') return true;
        if (!item || typeof item !== 'object') return false;
        const candidate = item as Partial<CartItem>;
        return (
          typeof candidate.productId === 'number' &&
          typeof candidate.name === 'string' &&
          typeof candidate.quantity === 'number' &&
          candidate.quantity >= 1
        );
      })
      .map((item) => {
        if (typeof item === 'string') return item;
        const modifierIds = Array.isArray(item.modifierIds)
          ? item.modifierIds.filter((id): id is number => typeof id === 'number')
          : [];
        return {
          ...item,
          id: typeof item.id === 'string' ? item.id : `${item.productId}-${Date.now()}`,
          modifierIds,
          photoUrl: typeof item.photoUrl === 'string' ? item.photoUrl : item.imageUrl ?? null,
        };
      });
  } catch {
    return [];
  }
}

function saveCart(items: StoredCartItem[]) {
  try {
    localStorage.setItem('cc_cart', JSON.stringify(items));
  } catch {
    // Storage blocked.
  }
}

export const calculateCart = createAsyncThunk('cart/calculate', async () => null);

export const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: readCart(),
  },
  reducers: {
    addToCart: (
      state,
      action: PayloadAction<
        | (Omit<CartItem, 'id' | 'modifierIds' | 'photoUrl'> & {
            id?: string;
            modifierIds?: number[];
            photoUrl?: string | null;
          })
        | string
      >,
    ) => {
      if (typeof action.payload === 'string') {
        state.items.push(action.payload);
        saveCart(state.items);
        return;
      }

      const item = action.payload;
      const modifierIds = Array.isArray(item.modifierIds) ? item.modifierIds : [];
      const modifierKey = [...modifierIds].sort((a, b) => a - b).join(',');
      const existing = state.items.find(
        (current) =>
          isCartItem(current) &&
          current.productId === item.productId &&
          [...current.modifierIds].sort((a, b) => a - b).join(',') === modifierKey,
      );

      if (existing && isCartItem(existing)) {
        existing.quantity += Math.max(1, item.quantity || 1);
      } else {
        const photoUrl = item.photoUrl ?? item.imageUrl ?? null;
        state.items.push({
          ...item,
          id: item.id ?? `${item.productId}-${modifierKey || 'base'}`,
          quantity: Math.max(1, item.quantity || 1),
          modifierIds,
          photoUrl,
          imageUrl: item.imageUrl ?? (photoUrl ?? undefined),
          unitPrice: item.unitPrice ?? 0,
        });
      }
      saveCart(state.items);
    },

    removeFromCart: (state, action: PayloadAction<string | number>) => {
      const target = action.payload;
      state.items = state.items.filter((item) => {
        if (typeof item === 'string') return item !== target;
        return item.id !== target && item.productId !== target;
      });
      saveCart(state.items);
    },

    updateCartQuantity: (
      state,
      action: PayloadAction<{ id?: string; productId?: number | string; quantity: number }>,
    ) => {
      const { id, productId, quantity } = action.payload;
      const item = state.items.find(
        (current) =>
          isCartItem(current) &&
          ((id && current.id === id) || (productId !== undefined && current.productId === productId)),
      );
      if (item && isCartItem(item)) {
        item.quantity = Math.max(1, quantity);
        saveCart(state.items);
      }
    },

    clearCart: (state) => {
      state.items = [];
      try {
        localStorage.removeItem('cc_cart');
      } catch {
        // Storage blocked.
      }
    },
  },
});

// Interface language. Saved in localStorage ('cc_language'). A new visitor starts in English; switching
// the country suggests that country's language (REGION_TO_LANGUAGE) until a language is picked explicitly.
const LANGUAGE_KEY = 'cc_language';

function readSavedLanguage(): SupportedLanguage | null {
  try {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    return isSupportedLanguage(saved) ? saved : null;
  } catch {
    return null;
  }
}

function saveLanguage(code: SupportedLanguage) {
  try {
    localStorage.setItem(LANGUAGE_KEY, code);
  } catch {
    // Storage is blocked: the choice lasts for this page only.
  }
}

type LanguageState = {
  current: SupportedLanguage;
  /** True once the customer chose a language; the country switcher then stops changing it. */
  chosen: boolean;
};

const savedLanguage = readSavedLanguage();

const initialLanguageState: LanguageState = {
  current: savedLanguage ?? DEFAULT_LANGUAGE,
  chosen: savedLanguage !== null,
};

export const languageSlice = createSlice({
  name: 'language',
  initialState: initialLanguageState,
  reducers: {
    setLanguage: (state, action: PayloadAction<SupportedLanguage | string>) => {
      if (!isSupportedLanguage(action.payload)) return;
      state.current = action.payload;
      state.chosen = true;
      saveLanguage(action.payload);
    },

    // Called by the country switcher: only suggests a language while none was chosen explicitly.
    setLanguageFromRegion: (state, action: PayloadAction<string>) => {
      if (state.chosen) return;
      const mapped = REGION_TO_LANGUAGE[(action.payload || '').toUpperCase()];
      if (mapped) {
        state.current = mapped;
      }
    },
  },
});

// Day / night theme. Saved in localStorage ('cc_theme' and 'cherry_theme'); defaults to 'dark' for new visitors.
export type Theme = 'light' | 'dark';
export type ToastType = 'error' | 'success' | 'warning';
const THEME_KEY = 'cc_theme';
const LEGACY_THEME_KEY = 'cherry_theme';

function readInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_KEY) || localStorage.getItem(LEGACY_THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // Storage is blocked.
  }
  return 'dark';
}

function applyTheme(theme: Theme) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }
  try {
    localStorage.setItem(THEME_KEY, theme);
    localStorage.setItem(LEGACY_THEME_KEY, theme);
  } catch {
    // Nothing to do.
  }
}

const initialTheme = readInitialTheme();
if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-theme', initialTheme);
}

export const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    toast: '',
    toastType: 'error' as ToastType,
    theme: initialTheme,
    isCartDrawerOpen: false,
    isAboutModalOpen: false,
    isBookingModalOpen: false,
  },
  reducers: {
    showToast: (
      state,
      action: PayloadAction<string | { type?: ToastType; message?: string }>,
    ) => {
      if (typeof action.payload === 'string') {
        state.toast = action.payload;
        state.toastType = 'error';
      } else {
        state.toast = action.payload?.message || 'Cannot reach the server. Please try again.';
        state.toastType = action.payload?.type || 'error';
      }
    },

    hideToast: (state) => {
      state.toast = '';
    },

    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      applyTheme(state.theme);
    },

    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      applyTheme(state.theme);
    },

    openCartDrawer: (state) => {
      state.isCartDrawerOpen = true;
    },
    closeCartDrawer: (state) => {
      state.isCartDrawerOpen = false;
    },
    toggleCartDrawer: (state) => {
      state.isCartDrawerOpen = !state.isCartDrawerOpen;
    },
    openAboutModal: (state) => {
      state.isAboutModalOpen = true;
    },
    closeAboutModal: (state) => {
      state.isAboutModalOpen = false;
    },
    openBookingModal: (state) => {
      state.isBookingModalOpen = true;
    },
    closeBookingModal: (state) => {
      state.isBookingModalOpen = false;
    },
  },
});

export const {
  setRegion,
  setRegionCode,
  setRegionDetails,
  setRegions,
} = regionSlice.actions;

export const {
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
} = cartSlice.actions;

export const addItem = addToCart;
export const removeItem = removeFromCart;
export const updateQuantity = updateCartQuantity;

export const {
  showToast,
  hideToast,
  toggleTheme,
  setTheme,
  openCartDrawer,
  closeCartDrawer,
  toggleCartDrawer,
  openAboutModal,
  closeAboutModal,
  openBookingModal,
  closeBookingModal,
} = uiSlice.actions;

export const {
  setLanguage,
  setLanguageFromRegion,
} = languageSlice.actions;

export const store = configureStore({
  reducer: {
    region: regionSlice.reducer,
    language: languageSlice.reducer,
    cart: cartSlice.reducer,
    ui: uiSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
