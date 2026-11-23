import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuthRole } from '../../hooks/useAuthRole';
import { roleAtLeast, type Role } from '../../utils/auth';

/**
 * Pages for staff only. Not signed in: go to My Account to sign in by email code (and come back).
 * Signed in without the role: shown a short "no access" page. The backend checks the role again on
 * every admin request, so this is for navigation only.
 */
export default function RequireRole({ minimum, children }: { minimum: Role; children: ReactNode }) {
  const location = useLocation();
  const { isSignedIn, role } = useAuthRole();

  if (!isSignedIn) {
    return <Navigate to="/account" replace state={{ from: location.pathname }} />;
  }

  if (!roleAtLeast(role, minimum)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
