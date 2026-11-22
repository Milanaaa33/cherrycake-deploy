import axios from "axios";
import { store, showToast } from "../store";
import { getClientId } from "../utils/clientId";
import { getAuthToken } from "../utils/auth";

// All backend endpoints live under /api (for example /api/regions, /api/products).
// In development Vite proxies /api to the backend (see vite.config.ts).
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 10000,
});

// Orders (placing an order and "My orders") are tied to this browser by an anonymous client id.
// When the customer is signed in (email code), the session token is sent as well.
api.interceptors.request.use((config) => {
  if (config.url?.startsWith("/orders")) {
    config.headers.set("X-Client-Id", getClientId());
  }
  const token = getAuthToken();
  if (token && (config.url?.startsWith("/orders") || config.url?.startsWith("/admin") || config.url === "/auth/logout")) {
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

    const message = data?.message || "Cannot reach the server. Please try again.";

    store.dispatch(showToast(message));

    return Promise.reject(error);
  },
);
