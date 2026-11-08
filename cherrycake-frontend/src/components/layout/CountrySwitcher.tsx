import { useDispatch, useSelector } from 'react-redux';
import { setRegionCode } from '../../store';
import type { RootState } from '../../store';

const countries = [
  { code: 'UZB', name: 'Uzbekistan' },
  { code: 'KAZ', name: 'Kazakhstan' },
  { code: 'GEO', name: 'Georgia' },
  { code: 'UKR', name: 'Ukraine' },
  { code: 'CHN', name: 'China' },
];

const defaultCountry = 'UZB';

export default function CountrySwitcher() {
  const dispatch = useDispatch();

  const code = useSelector((state: RootState) => state.region.code);

  const selectedCountry = countries.some((country) => country.code === code)
    ? code
    : defaultCountry;

  function handleChange(newCode: string) {
    localStorage.setItem('cc_region', newCode);
    dispatch(setRegionCode(newCode));
  }

  return (
    <label className="cc-country-switcher">
      <span>Страна</span>

      <select
        aria-label="Select country"
        value={selectedCountry}
        onChange={(event) => handleChange(event.target.value)}
      >
        {countries.map((country) => (
          <option key={country.code} value={country.code}>
            {country.code} — {country.name}
          </option>
        ))}
      </select>
    </label>
  );
}
