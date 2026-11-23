import { useEffect, useSyncExternalStore } from 'react';

import { api } from '../api/client';
import {
  getAuthSnapshot,
  isRole,
  roleAtLeast,
  saveAuthRole,
  subscribeAuth,
  type Role,
} from '../utils/auth';

let refreshed = false;

/**
 * Current session and role for the UI. Once per page load the role is re-read from GET /api/auth/me,
 * so a role granted (or revoked) in the admin panel shows up after a reload without signing in again.
 */
export function useAuthRole() {
  const auth = useSyncExternalStore(subscribeAuth, getAuthSnapshot, getAuthSnapshot);

  useEffect(() => {
    if (refreshed || !auth.token) return;
    refreshed = true;
    api
      .get<{ email: string; role: Role }>('/auth/me', { silent: true })
      .then(({ data }) => {
        if (isRole(data.role) && data.role !== auth.role) saveAuthRole(data.role);
      })
      .catch(() => {
        // Expired session or offline: the pages that need the session handle the 401 themselves.
      });
  }, [auth.token, auth.role]);

  const role: Role = auth.token && auth.role ? auth.role : 'CUSTOMER';

  return {
    token: auth.token,
    email: auth.email,
    role,
    isSignedIn: Boolean(auth.token),
    canSeeAdmin: roleAtLeast(role, 'VIEWER'),
    canEditPrices: roleAtLeast(role, 'STAFF'),
    isAdmin: roleAtLeast(role, 'ADMIN'),
  };
}
