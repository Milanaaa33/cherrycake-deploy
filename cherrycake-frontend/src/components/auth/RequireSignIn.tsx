import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { getAuthToken } from '../../utils/auth';

/**
 * The cart and checkout are only for signed-in customers: someone who is not signed in by email code
 * is sent to My Account, and after signing in is brought back to the page they came from.
 */
export default function RequireSignIn({ children }: { children: ReactNode }) {
  const location = useLocation();

  if (!getAuthToken()) {
    return <Navigate to="/account" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
