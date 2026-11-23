// Supported interface languages and the country -> language mapping.
// Ported from the extended project; the dictionary itself lives in ./locales.
export type SupportedLanguage =
  | 'en' | 'ru' | 'uz' | 'kk' | 'ka' | 'uk' | 'zh' | 'tr'
  | 'hy' | 'az' | 'ro' | 'et' | 'lv' | 'lt' | 'fi' | 'sv';

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  nativeName: string;
  flagCode: string;
}

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeName: 'English', flagCode: 'en' },
  { code: 'ru', label: 'Russian', nativeName: 'Русский', flagCode: 'ru' },
  { code: 'uz', label: 'Uzbek', nativeName: "O'zbek", flagCode: 'uzb' },
  { code: 'kk', label: 'Kazakh', nativeName: 'Қазақша', flagCode: 'kaz' },
  { code: 'ka', label: 'Georgian', nativeName: 'ქართული', flagCode: 'geo' },
  { code: 'uk', label: 'Ukrainian', nativeName: 'Українська', flagCode: 'ukr' },
  { code: 'zh', label: 'Chinese', nativeName: '中文', flagCode: 'chn' },
  { code: 'tr', label: 'Turkish', nativeName: 'Türkçe', flagCode: 'tur' },
  { code: 'hy', label: 'Armenian', nativeName: 'Հայերեն', flagCode: 'arm' },
  { code: 'az', label: 'Azerbaijani', nativeName: 'Azərbaycan', flagCode: 'aze' },
  { code: 'ro', label: 'Romanian', nativeName: 'Română', flagCode: 'rou' },
  { code: 'et', label: 'Estonian', nativeName: 'Eesti', flagCode: 'est' },
  { code: 'lv', label: 'Latvian', nativeName: 'Latviešu', flagCode: 'lva' },
  { code: 'lt', label: 'Lithuanian', nativeName: 'Lietuvių', flagCode: 'ltu' },
  { code: 'fi', label: 'Finnish', nativeName: 'Suomi', flagCode: 'fin' },
  { code: 'sv', label: 'Swedish', nativeName: 'Svenska', flagCode: 'swe' },
];

export const LANGUAGE_CODES: SupportedLanguage[] = LANGUAGES.map((l) => l.code);

export function isSupportedLanguage(value: unknown): value is SupportedLanguage {
  return typeof value === 'string' && (LANGUAGE_CODES as string[]).includes(value);
}

/** Language suggested when the customer picks a country (ISO 3166-1 alpha-3 region codes). */
export const REGION_TO_LANGUAGE: Record<string, SupportedLanguage> = {
  UZB: 'uz', KAZ: 'kk', GEO: 'ka', UKR: 'uk', CHN: 'zh',
  ARM: 'hy', AZE: 'az', TUR: 'tr', MDA: 'ro', ROU: 'ro',
  EST: 'et', LVA: 'lv', LTU: 'lt', FIN: 'fi', SWE: 'sv',
  BLR: 'ru', RUS: 'ru',
};

/** Flag file (public/assets/flags/<code>.svg) for a language or a region code. */
export function getFlagSrc(code: string): string {
  const c = (code || '').toLowerCase().trim();
  const language = LANGUAGES.find((l) => l.code === c);
  return `/assets/flags/${language ? language.flagCode : c}.svg`;
}
