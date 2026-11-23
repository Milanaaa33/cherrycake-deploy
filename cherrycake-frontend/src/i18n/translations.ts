// Dictionary access. Keys are flat and dotted ('nav.menu'); every language falls back to English,
// and English falls back to the inline default passed to t(), so a missing key never shows blank text.
import type { SupportedLanguage } from './languages';
import { DEFAULT_LANGUAGE } from './languages';
import { en } from './locales/en';
import { ru } from './locales/ru';
import { uz } from './locales/uz';
import { kk } from './locales/kk';
import { ka } from './locales/ka';
import { uk } from './locales/uk';
import { zh } from './locales/zh';
import { tr } from './locales/tr';
import { hy } from './locales/hy';
import { az } from './locales/az';
import { ro } from './locales/ro';
import { et } from './locales/et';
import { lv } from './locales/lv';
import { lt } from './locales/lt';
import { fi } from './locales/fi';
import { sv } from './locales/sv';
import { aboutTranslations } from './locales/about';

export type Dictionary = Record<string, string>;

const BASE: Record<SupportedLanguage, Dictionary> = {
  en, ru, uz, kk, ka, uk, zh, tr, hy, az, ro, et, lv, lt, fi, sv,
};

// The About page dictionary (about.*) was ported as a separate file; merge it into every language.
export const UI_TRANSLATIONS: Record<SupportedLanguage, Dictionary> = Object.fromEntries(
  (Object.keys(BASE) as SupportedLanguage[]).map((lang) => [lang, { ...BASE[lang], ...aboutTranslations[lang] }]),
) as Record<SupportedLanguage, Dictionary>;

export type TranslationParams = Record<string, string | number>;

/** Replaces {name} placeholders: t('cart.items', 'Items: {count}', { count: 3 }). */
export function interpolate(text: string, params?: TranslationParams): string {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : match,
  );
}

export function getUIText(lang: string, key: string, fallback = '', params?: TranslationParams): string {
  const table = UI_TRANSLATIONS[lang as SupportedLanguage];
  const text =
    (table && table[key]) ||
    UI_TRANSLATIONS[DEFAULT_LANGUAGE][key] ||
    fallback ||
    key;
  return interpolate(text, params);
}
