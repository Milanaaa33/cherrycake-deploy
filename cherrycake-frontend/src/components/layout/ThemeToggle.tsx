import { useDispatch, useSelector } from 'react-redux';

import type { RootState } from '../../store';
import { toggleTheme } from '../../store';
import { useTranslation } from '../../i18n/useTranslation';

/** Day / night switch. The choice is kept in localStorage ('cc_theme'). */
export default function ThemeToggle() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.ui.theme);
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className="cc-theme-toggle"
      onClick={() => dispatch(toggleTheme())}
      aria-pressed={isDark}
      aria-label={isDark ? t('header.themeLight', 'Switch to light theme') : t('header.themeDark', 'Switch to dark theme')}
      title={isDark ? t('header.themeLight', 'Switch to light theme') : t('header.themeDark', 'Switch to dark theme')}
      data-testid="theme-toggle"
    >
      <span aria-hidden="true">{isDark ? '☀️' : '🌙'}</span>
    </button>
  );
}
