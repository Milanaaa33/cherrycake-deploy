
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState } from '../../store';
import { setLanguageFromRegion, setRegionDetails } from '../../store';
import { FALLBACK_REGIONS } from '../../constants/regions';
import { getFlagSrc } from '../../i18n/languages';
import { useTranslation } from '../../i18n/useTranslation';

type Region = {
  code: string;
  name: string;
  currencyCode: string;
  currencySymbol: string;
  vatRate: number;
};

type RegionSource = 'loading' | 'api' | 'mock';

const mockRegions: Region[] = FALLBACK_REGIONS;

function parseRegions(body: unknown): Region[] {
  let data: unknown[];

  if (Array.isArray(body)) {
    data = body;
  } else if (
    typeof body === 'object' &&
    body !== null &&
    'data' in body &&
    Array.isArray(body.data)
  ) {
    data = body.data;
  } else {
    return [];
  }

  return data.flatMap((item): Region[] => {
    if (typeof item !== 'object' || item === null) {
      return [];
    }

    const region = item as Record<string, unknown>;

    if (
      typeof region.code !== 'string' ||
      !/^[A-Z]{3}$/.test(region.code) ||
      typeof region.name !== 'string' ||
      typeof region.currencyCode !== 'string' ||
      typeof region.currencySymbol !== 'string' ||
      typeof region.vatRate !== 'number' ||
      !Number.isFinite(region.vatRate) ||
      region.vatRate < 0 ||
      region.active === false
    ) {
      return [];
    }

    return [
      {
        code: region.code,
        name: region.name,
        currencyCode: region.currencyCode,
        currencySymbol: region.currencySymbol,
        vatRate: region.vatRate,
      },
    ];
  });
}

export default function CountrySwitcher() {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const selectedCode = useSelector(
    (state: RootState) => state.region.code
  );

  const [regions, setRegions] = useState<Region[]>(
    mockRegions
  );

  const [source, setSource] =
    useState<RegionSource>('loading');

  useEffect(() => {
    const controller = new AbortController();

    async function loadRegions() {
      try {
        const baseUrl = (
          import.meta.env.VITE_API_BASE_URL || '/api'
        ).replace(/\/+$/, '');

        const response = await fetch(
          `${baseUrl}/regions`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(
            `Regions API returned ${response.status}`
          );
        }

        const body: unknown = await response.json();
        const apiRegions = parseRegions(body);

        if (apiRegions.length === 0) {
          throw new Error('Invalid regions response');
        }

        if (!controller.signal.aborted) {
          setRegions(apiRegions);
          setSource('api');
        }
      } catch {
        if (!controller.signal.aborted) {
          setRegions(mockRegions);
          setSource('mock');
        }
      }
    }

    void loadRegions();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (source === 'loading') {
      return;
    }

    const selectedRegion = regions.find(
      (region) => region.code === selectedCode
    );

    if (selectedRegion) {
      dispatch(setRegionDetails(selectedRegion));
      return;
    }

    // Only replace an unavailable saved region
    // when the real API has returned its full list.
    if (source === 'api' && regions.length > 0) {
      dispatch(setRegionDetails(regions[0]));
    }
  }, [dispatch, regions, selectedCode, source]);

  function handleChange(code: string) {
    const selectedRegion = regions.find(
      (region) => region.code === code
    );

    if (!selectedRegion) {
      return;
    }

    dispatch(setRegionDetails(selectedRegion));
    // Suggest the country's language unless the customer already picked one.
    dispatch(setLanguageFromRegion(selectedRegion.code));

    localStorage.setItem(
      'cc_region',
      selectedRegion.code
    );
  }

  return (
    <label className="cc-country-switcher">
      <img
        src={getFlagSrc(selectedCode)}
        alt=""
        aria-hidden="true"
        className="cc-flag-img"
        onError={(event) => {
          event.currentTarget.style.display = 'none';
        }}
      />
      <span className="cc-visually-hidden">{t('header.country', 'Country')}</span>

      <select
        value={selectedCode}
        onChange={(event) =>
          handleChange(event.target.value)
        }
        aria-label={t('header.chooseCountry', 'Choose country')}
        data-testid="country-switcher"
      >
        {!regions.some(
          (region) => region.code === selectedCode
        ) && (
          <option value={selectedCode}>
            {selectedCode} - {t('header.savedRegion', 'Saved')}
          </option>
        )}

        {regions.map((region) => (
          <option
            key={region.code}
            value={region.code}
          >
            {region.code} - {region.name}
          </option>
        ))}
      </select>
    </label>
  );
}
