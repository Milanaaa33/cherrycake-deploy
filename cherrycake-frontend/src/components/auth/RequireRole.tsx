import type { ReactNode } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';

import { useAuthRole } from '../../hooks/useAuthRole';
import useTranslation from '../../i18n/useTranslation';
import { roleAtLeast, type Role } from '../../utils/auth';

/**
 * Pages for staff only. Not signed in: go to My Account to sign in by email code (and come back).
 * Signed in without the role: shown a short "no access" page. The backend checks the role again on
 * every admin request, so this is for navigation only.
 */
export default function RequireRole({ minimum, children }: { minimum: Role; children: ReactNode }) {
  const location = useLocation();
  const { t } = useTranslation();
  const { isSignedIn, role, email } = useAuthRole();

  if (!isSignedIn) {
    return <Navigate to="/account" replace state={{ from: location.pathname }} />;
  }

  if (!roleAtLeast(role, minimum)) {
    return (
      <section
        role="alert"
        style={{
          maxWidth: 520,
          margin: '36px auto',
          padding: 32,
          borderRadius: '20px',
          background: 'var(--cherry-card)',
          border: '1.5px solid var(--cherry-border)',
          color: 'var(--text-main)',
          textAlign: 'center',
          display: 'grid',
          gap: 14,
          boxShadow: '0 14px 36px rgba(0, 0, 0, 0.2)',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: '0.78rem',
            fontWeight: 800,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--sakura-pink)',
          }}
        >
          {t('access.eyebrow', 'Restricted Area')}
        </p>
        <h2
          style={{
            margin: 0,
            fontFamily: "'Playfair Display', serif",
            fontSize: '1.75rem',
            color: 'var(--cheesecake-cream)',
          }}
        >
          {t('access.title', 'Staff Access Only')}
        </h2>
        <p style={{ margin: 0, color: 'var(--text-dim)', lineHeight: 1.6 }}>
          {t(
            'access.message',
            'Your account ({email}) does not have permission to view this page. Contact an administrator if you need staff access.',
            { email: email ?? '' },
          )}
        </p>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 12,
            flexWrap: 'wrap',
            marginTop: 6,
          }}
        >
          <Link to="/" className="cc-hero-action">
            {t('access.backHome', 'Back to Home')}
          </Link>
          <Link
            to="/account"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px 20px',
              borderRadius: '999px',
              border: '1.5px solid var(--cherry-border)',
              color: 'var(--text-main)',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.92rem',
            }}
          >
            {t('nav.account', 'Account')}
          </Link>
        </div>
      </section>
    );
  }

  return <>{children}</>;
}
