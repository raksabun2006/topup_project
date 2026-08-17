import { apiClient } from './client';

export const adminProductsApi = {
  /** GET /api/v1/admin/products/by-game/{gameId} - រួមទាំងកញ្ចប់ដែលបិទស្រាប់ */
  listByGame: async (gameId) => {
    const res = await apiClient.get(`/api/v1/admin/products/by-game/${gameId}`);
    return res.data.data || res.data;
  },
  create: async (data) => {
    const res = await apiClient.post('/api/v1/admin/products', data);
    return res.data.data || res.data;
  },
  getById: async (id) => {
    const res = await apiClient.get(`/api/v1/admin/products/${id}`);
    return res.data.data || res.data;
  },
  update: async (id, data) => {
    const res = await apiClient.put(`/api/v1/admin/products/${id}`, data);
    return res.data.data || res.data;
  },
  /** DELETE /api/v1/admin/products/{id} - soft delete (deactivate) */
  delete: async (id) => {
    const res = await apiClient.delete(`/api/v1/admin/products/${id}`);
    return res.data.data || res.data;
  },
  /** POST /api/v1/admin/products/{id}/reactivate */
  reactivate: async (id) => {
    const res = await apiClient.post(`/api/v1/admin/products/${id}/reactivate`);
    return res.data.data || res.data;
  },
};