import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { api } from '../../api/client';
import { setRegion, setRegions } from '../../store/regionSlice';
import { setLanguageFromRegion } from '../../store/languageSlice';
import { calculateCart } from '../../store/cartSlice';
import useTranslation from '../../i18n/useTranslation';

const FLAG_MAP = {
  uz: 'uzb', uzb: 'uzb',
  kz: 'kaz', kaz: 'kaz',
  ge: 'geo', geo: 'geo',
  ua: 'ukr', ukr: 'ukr',
  cn: 'chn', chn: 'chn',
  se: 'swe', swe: 'swe',
  fi: 'fin', fin: 'fin',
  lt: 'ltu', ltu: 'ltu',
  lv: 'lva', lva: 'lva',
  ee: 'est', est: 'est',
  by: 'blr', blr: 'blr',
  md: 'mda', mda: 'mda',
  ro: 'rou', rou: 'rou',
  tr: 'tur', tur: 'tur',
  az: 'aze', aze: 'aze',
  am: 'arm', arm: 'arm',
  ru: 'ru', rus: 'rus'
};

function getFlagSrc(code) {
  const c = (code || '').toLowerCase().trim();
  const file = FLAG_MAP[c] || c;
  return `/assets/flags/${file}.svg`;
}

function formatVatDisplay(val, vatLabel = 'VAT') {
  if (val === undefined || val === null) return `12% ${vatLabel}`;
  let num = parseFloat(val);
  if (num < 1 && num > 0) num = num * 100;
  return `${num % 1 === 0 ? num.toFixed(0) : num.toFixed(1)}% ${vatLabel}`;
}

const ISO3_TO_ISO2 = {
  UZB: 'UZ',
  KAZ: 'KZ',
  GEO: 'GE',
  UKR: 'UA',
  CHN: 'CN',
  ARM: 'AM',
  AZE: 'AZ',
  TUR: 'TR',
  MDA: 'MD',
  ROU: 'RO',
  EST: 'EE',
  LVA: 'LV',
  LTU: 'LT',
  FIN: 'FI',
  SWE: 'SE',
  BLR: 'BY',
  RUS: 'RU',
};

function translateCountryName(language, code, fallbackName) {
  const iso2 = ISO3_TO_ISO2[(code || '').toUpperCase()];
  if (!iso2 || typeof Intl === 'undefined' || typeof Intl.DisplayNames !== 'function') {
    return fallbackName;
  }
  try {
    const names = new Intl.DisplayNames([language || 'en'], { type: 'region' });
    return names.of(iso2) || fallbackName;
  } catch {
    return fallbackName;
  }
}

export function CountrySwitcher({ className = '' }) {
  const dispatch = useDispatch();
  const { t, language } = useTranslation();
  const currentRegion = useSelector((state) => state.region.code);
  const regions = useSelector((state) => state.region.regions);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    let active = true;
    api
      .get('/regions', { silent: true })
      .then(({ data }) => {
        if (active && Array.isArray(data) && data.length > 0) {
          dispatch(setRegions(data));
        }
      })
      .catch(() => {
        // Keep the 17 built-in fallback regions if the backend is momentarily unreachable.
      });
    return () => {
      active = false;
    };
  }, [dispatch]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleSelect = (code) => {
    dispatch(setRegion(code));
    dispatch(setLanguageFromRegion(code));
    dispatch(calculateCart());
    setIsOpen(false);
  };

  const selectedRegionObj = regions.find((r) => r.code === currentRegion) || {
    code: currentRegion,
    name: 'Uzbekistan'
  };

  return (
    <div
      ref={dropdownRef}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
      className={className}
    >
      {/* Hidden native select for accessibility & form automation */}
      <select
        id="country-select"
        value={currentRegion}
        onChange={(e) => handleSelect(e.target.value)}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      >
        {regions.map((r) => (
          <option key={r.code} value={r.code}>
            {r.code} · {r.name}
          </option>
        ))}
      </select>

      {/* Custom Sleek Region Trigger */}
      <button
        type="button"
        data-testid="country-switcher"
        className={`region-select-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        title="Select operating country and currency"
      >
        <img
          src={getFlagSrc(selectedRegionObj.code)}
          alt={selectedRegionObj.code}
          className="region-flag-img"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <span>{selectedRegionObj.code}</span>
        <span className="region-select-arrow">&#9662;</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="region-dropdown-menu" role="listbox">
          {regions.map((r) => {
            const isSelected = r.code === currentRegion;
            return (
              <div
                key={r.code}
                role="option"
                aria-selected={isSelected}
                className={`region-option ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelect(r.code)}
              >
                <img
                  src={getFlagSrc(r.code)}
                  alt={r.code}
                  className="region-flag-img"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span className="region-option-code">{r.code}</span>
                <span className="region-option-name">{translateCountryName(language, r.code, r.name)}</span>
                <span className="region-option-meta">{formatVatDisplay(r.vatRate, t('cart.vatShort', 'VAT'))}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CountrySwitcher;
