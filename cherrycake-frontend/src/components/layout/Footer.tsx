import { useTranslation } from '../../i18n/useTranslation';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="cc-footer">
      <div className="cc-footer-inner">
        <div>
          <h2>&#127826; Cherry Cake</h2>
          <p>{t('footer.tagline', 'Handmade desserts for your sweetest moments.')}</p>
        </div>

        <p className="cc-footer-copy">
          {t('footer.copyright', '© 2026 Cherry Cake. All rights reserved.')}
        </p>
      </div>
    </footer>
  );
}
