import axios from 'axios';
import { store, showToast } from '../store';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      'Server bilan bog‘lanishda xatolik yuz berdi';

    store.dispatch(showToast(message));
    return Promise.reject(error);
  }
);
