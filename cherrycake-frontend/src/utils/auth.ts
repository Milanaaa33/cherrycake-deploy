// Sign-in by email code: the backend returns a session token, the browser keeps it here.
const TOKEN_KEY = 'cc_auth_token';
const EMAIL_KEY = 'cc_auth_email';

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

export function saveAuth(token: string, email: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(EMAIL_KEY, email);
  } catch {
    // Storage is blocked: the customer stays signed out after a reload.
  }
}

export function clearAuth() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
  } catch {
    // Nothing to clear.
  }
}
