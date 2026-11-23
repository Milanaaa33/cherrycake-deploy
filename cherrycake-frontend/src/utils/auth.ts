// Sign-in by email code: the backend returns a session token, the browser keeps it here.
// The role (CUSTOMER, VIEWER, STAFF, ADMIN) decides whether the admin panel is shown; the backend
// checks it again on every admin request, so this copy is only for the UI.
const TOKEN_KEY = 'cc_auth_token';
const EMAIL_KEY = 'cc_auth_email';
const ROLE_KEY = 'cc_auth_role';

export const ROLES = ['CUSTOMER', 'VIEWER', 'STAFF', 'ADMIN'] as const;
export type Role = (typeof ROLES)[number];

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value);
}

const ROLE_LEVEL: Record<Role, number> = { CUSTOMER: 0, VIEWER: 1, STAFF: 2, ADMIN: 3 };

/** True when `role` is `minimum` or higher (ADMIN covers STAFF, STAFF covers VIEWER). */
export function roleAtLeast(role: Role | null | undefined, minimum: Role): boolean {
  return ROLE_LEVEL[role ?? 'CUSTOMER'] >= ROLE_LEVEL[minimum];
}

export type AuthSnapshot = {
  token: string | null;
  email: string | null;
  role: Role | null;
};

const listeners = new Set<() => void>();
let snapshot: AuthSnapshot = readSnapshot();

function readSnapshot(): AuthSnapshot {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const role = localStorage.getItem(ROLE_KEY);
    return {
      token,
      email: localStorage.getItem(EMAIL_KEY),
      role: token && isRole(role) ? role : null,
    };
  } catch {
    return { token: null, email: null, role: null };
  }
}

function notify() {
  snapshot = readSnapshot();
  listeners.forEach((listener) => listener());
}

/** For useSyncExternalStore: components re-render when the session changes. */
export function subscribeAuth(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getAuthSnapshot(): AuthSnapshot {
  return snapshot;
}

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getAuthEmail(): string | null {
  try {
    return localStorage.getItem(EMAIL_KEY);
  } catch {
    return null;
  }
}

export function getAuthRole(): Role | null {
  try {
    const role = localStorage.getItem(ROLE_KEY);
    return isRole(role) ? role : null;
  } catch {
    return null;
  }
}

export function saveAuth(token: string, email: string, role: Role = 'CUSTOMER') {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(EMAIL_KEY, email);
    localStorage.setItem(ROLE_KEY, role);
  } catch {
    // Storage is blocked: the customer stays signed out after a reload.
  }
  notify();
}

export function saveAuthRole(role: Role) {
  try {
    localStorage.setItem(ROLE_KEY, role);
  } catch {
    // Nothing to do.
  }
  notify();
}

export function clearAuth() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
    localStorage.removeItem(ROLE_KEY);
  } catch {
    // Nothing to clear.
  }
  notify();
}
