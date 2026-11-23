// Admin panel API (/api/admin/**). Every call sends the session token (see client.ts);
// the backend answers 401 without a session and 403 when the role is too low.
import { api } from './client';
import type { Role } from '../utils/auth';

export type AdminCategory = { id: number; name: string; sortOrder: number; productCount: number };

export type RegionalPriceView = {
  regionCode: string;
  currencyCode: string;
  /** Conventional units, as stored. */
  price: number;
  /** What the customer sees in that region's currency. */
  localPrice: number;
  inStock: boolean;
};

export type AdminProduct = {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  description: string | null;
  photoUrl: string | null;
  prices: RegionalPriceView[];
};

export type AdminRegion = {
  id: number;
  code: string;
  name: string;
  currencyCode: string;
  currencySymbol: string;
  vatRate: number;
  exchangeRate: number;
};

export type UserRole = {
  email: string;
  role: Role;
  grantedBy: string | null;
  grantedAt: string | null;
  bootstrap: boolean;
};

export type ProductInput = {
  categoryId: number;
  name: string;
  description: string;
  photoUrl: string;
  /** CU price for every region when creating; ignored on update. */
  price?: number;
};

export const adminApi = {
  categories: () => api.get<AdminCategory[]>('/admin/categories', { silent: true }).then((r) => r.data),
  createCategory: (body: { name: string; sortOrder: number }) =>
    api.post<AdminCategory>('/admin/categories', body).then((r) => r.data),
  updateCategory: (id: number, body: { name: string; sortOrder: number }) =>
    api.put<AdminCategory>(`/admin/categories/${id}`, body).then((r) => r.data),
  deleteCategory: (id: number) => api.delete(`/admin/categories/${id}`).then(() => undefined),

  products: () => api.get<AdminProduct[]>('/admin/products', { silent: true }).then((r) => r.data),
  createProduct: (body: ProductInput) => api.post<AdminProduct>('/admin/products', body).then((r) => r.data),
  updateProduct: (id: number, body: ProductInput) =>
    api.put<AdminProduct>(`/admin/products/${id}`, body).then((r) => r.data),
  deleteProduct: (id: number) =>
    api.delete<{ deleted: boolean }>(`/admin/products/${id}`).then((r) => r.data),

  updatePrice: (productId: number, regionCode: string, body: { price: number; inStock: boolean }) =>
    api.put<AdminProduct>(`/admin/products/${productId}/prices/${regionCode}`, body).then((r) => r.data),
  updateAvailability: (productId: number, regionCode: string, inStock: boolean) =>
    api
      .patch<AdminProduct>(`/admin/products/${productId}/availability/${regionCode}`, { inStock })
      .then((r) => r.data),

  regions: () => api.get<AdminRegion[]>('/admin/regions', { silent: true }).then((r) => r.data),
  updateRegion: (code: string, body: { vatRate: number; exchangeRate: number }) =>
    api.put<AdminRegion>(`/admin/regions/${code}`, body).then((r) => r.data),

  users: () => api.get<UserRole[]>('/admin/users', { silent: true }).then((r) => r.data),
  setUserRole: (email: string, role: Role) => api.put<UserRole>('/admin/users', { email, role }).then((r) => r.data),
  deleteUserRole: (email: string) =>
    api.delete(`/admin/users/${encodeURIComponent(email)}`).then(() => undefined),
};
