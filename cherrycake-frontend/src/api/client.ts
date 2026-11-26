import axios from "axios";
import { store, showToast } from "../store";
import { getClientId } from "../utils/clientId";
import { getAuthToken } from "../utils/auth";

declare module "axios" {
  // Per-request option: do not show the global error toast (the caller handles the error itself).
  export interface AxiosRequestConfig {
    silent?: boolean;
  }
}

// All backend endpoints live under /api (for example /api/regions, /api/products).
// In development Vite proxies /api to the backend (see vite.config.ts).
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 10000,
});

// Endpoints that read the session token: orders, the signed-in user, sign-out, the admin panel and reports.
const AUTH_PREFIXES = ["/orders", "/auth/me", "/auth/logout", "/admin", "/reports"];

// Orders (placing an order and "My orders") are tied to this browser by an anonymous client id.
// When the customer is signed in (email code), the session token is sent as well.
api.interceptors.request.use((config) => {
  const url = config.url ?? "";
  if (url.startsWith("/orders")) {
    config.headers.set("X-Client-Id", getClientId());
  }
  const token = getAuthToken();
  if (token && AUTH_PREFIXES.some((prefix) => url.startsWith(prefix))) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isCancel(error)) return Promise.reject(error);

    let data = error.response?.data;
    // An error of a file download (responseType "blob", e.g. the PDF report) arrives as a Blob:
    // read the JSON message out of it, otherwise the user would only see "Cannot reach the server".
    if (typeof Blob !== "undefined" && data instanceof Blob) {
      try {
        data = JSON.parse(await data.text());
      } catch {
        data = undefined;
      }
    }

    if (!error.config?.silent) {
      const message = data?.message || "Cannot reach the server. Please try again.";
      store.dispatch(showToast(message));
    }

    return Promise.reject(error);
  },
);
