import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState } from '../store';
import { setLanguage } from '../store';
import { LANGUAGES, type SupportedLanguage } from './languages';
import { getEasterEggTexts, getUIText, type TranslationParams } from './translations';

export type TranslateFn = (key: string, fallback?: string, params?: TranslationParams) => string;

/**
 * t('menu.title', 'Our menu') returns the text in the current language, English when the language has no
 * such key, and the inline fallback when English has none either.
 */
export function useTranslation() {
  const dispatch = useDispatch();
  const language = useSelector((state: RootState) => state.language.current);

  const t = useCallback<TranslateFn>(
    (key, fallback, params) => getUIText(language, key, fallback, params),
    [language],
  );

  const changeLanguage = useCallback(
    (code: SupportedLanguage | string) => {
      dispatch(setLanguage(code));
    },
    [dispatch],
  );

  const easterEgg = getEasterEggTexts(language);

  return { language, t, easterEgg, changeLanguage, languages: LANGUAGES };
}

export default useTranslation;
