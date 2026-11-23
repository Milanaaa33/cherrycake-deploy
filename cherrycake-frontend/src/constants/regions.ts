// Fallback list of regions, used only while /api/regions has not answered (or is unreachable).
// The backend (Flyway V3 + V9) is the source of truth; keep this list in sync with it.
export type RegionInfo = {
  code: string;
  name: string;
  currencyCode: string;
  currencySymbol: string;
  vatRate: number;
};

export const FALLBACK_REGIONS: RegionInfo[] = [
  { code: 'UZB', name: 'Uzbekistan', currencyCode: 'UZS', currencySymbol: "so'm", vatRate: 0.15 },
  { code: 'KAZ', name: 'Kazakhstan', currencyCode: 'KZT', currencySymbol: '₸', vatRate: 0.2 },
  { code: 'GEO', name: 'Georgia', currencyCode: 'GEL', currencySymbol: '₾', vatRate: 0.12 },
  { code: 'UKR', name: 'Ukraine', currencyCode: 'UAH', currencySymbol: '₴', vatRate: 0.08 },
  { code: 'CHN', name: 'China', currencyCode: 'CNY', currencySymbol: '¥', vatRate: 0.18 },
  { code: 'ARM', name: 'Armenia', currencyCode: 'AMD', currencySymbol: '֏', vatRate: 0.2 },
  { code: 'AZE', name: 'Azerbaijan', currencyCode: 'AZN', currencySymbol: '₼', vatRate: 0.18 },
  { code: 'TUR', name: 'Turkey', currencyCode: 'TRY', currencySymbol: '₺', vatRate: 0.18 },
  { code: 'MDA', name: 'Moldova', currencyCode: 'MDL', currencySymbol: 'L', vatRate: 0.2 },
  { code: 'ROU', name: 'Romania', currencyCode: 'RON', currencySymbol: 'lei', vatRate: 0.19 },
  { code: 'EST', name: 'Estonia', currencyCode: 'EUR', currencySymbol: '€', vatRate: 0.22 },
  { code: 'LVA', name: 'Latvia', currencyCode: 'EUR', currencySymbol: '€', vatRate: 0.21 },
  { code: 'LTU', name: 'Lithuania', currencyCode: 'EUR', currencySymbol: '€', vatRate: 0.21 },
  { code: 'FIN', name: 'Finland', currencyCode: 'EUR', currencySymbol: '€', vatRate: 0.24 },
  { code: 'SWE', name: 'Sweden', currencyCode: 'SEK', currencySymbol: 'kr', vatRate: 0.25 },
  { code: 'BLR', name: 'Belarus', currencyCode: 'BYN', currencySymbol: 'Br', vatRate: 0.2 },
  { code: 'RUS', name: 'Russia', currencyCode: 'RUB', currencySymbol: '₽', vatRate: 0.2 },
];

export const FALLBACK_REGION_MAP: Record<string, RegionInfo> = Object.fromEntries(
  FALLBACK_REGIONS.map((region) => [region.code, region]),
);
