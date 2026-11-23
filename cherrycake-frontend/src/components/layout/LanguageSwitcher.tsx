import { useSelector } from 'react-redux';

import type { RootState } from '../../store';
import { LANGUAGES, getFlagSrc, isSupportedLanguage } from '../../i18n/languages';
import { useTranslation } from '../../i18n/useTranslation';

/**
 * Interface language. A native <select> like the country switcher: keyboard and screen-reader friendly,
 * and the same look on every device.
 */
export default function LanguageSwitcher() {
  const { t, changeLanguage } = useTranslation();
  const current = useSelector((state: RootState) => state.language.current);

  return (
    <label className="cc-country-switcher cc-language-switcher">
      <img
        src={getFlagSrc(current)}
        alt=""
        aria-hidden="true"
        className="cc-flag-img"
        onError={(event) => {
          event.currentTarget.style.display = 'none';
        }}
      />
      <span className="cc-visually-hidden">{t('header.language', 'Language')}</span>
      <select
        value={current}
        onChange={(event) => {
          if (isSupportedLanguage(event.target.value)) {
            changeLanguage(event.target.value);
          }
        }}
        aria-label={t('header.chooseLanguage', 'Choose language')}
        data-testid="language-switcher"
      >
        {LANGUAGES.map((language) => (
          <option key={language.code} value={language.code}>
            {language.code.toUpperCase()} · {language.nativeName}
          </option>
        ))}
      </select>
    </label>
  );
}
