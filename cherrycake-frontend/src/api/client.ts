import axios from "axios";
import { store, showToast } from "../store";
import { getClientId } from "../utils/clientId";

// All backend endpoints live under /api (for example /api/regions, /api/products).
// In development Vite proxies /api to the backend (see vite.config.ts).
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 10000,
});

// Orders (placing an order and "My orders") are tied to this browser by an anonymous client id.
api.interceptors.request.use((config) => {
  if (config.url?.startsWith("/orders")) {
    config.headers.set("X-Client-Id", getClientId());
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      "Cannot reach the server. Please try again.";

    store.dispatch(showToast(message));

    return Promise.reject(error);
  },
);
