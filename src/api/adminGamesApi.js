import { apiClient } from './client';

export const adminGamesApi = {
  getAll: async () => {
    const res = await apiClient.get('/api/v1/admin/games');
    return res.data.data || res.data;
  },
  create: async (data) => {
    const res = await apiClient.post('/api/v1/admin/games', data);
    return res.data.data || res.data;
  },
  update: async (id, data) => {
    const res = await apiClient.put(`/api/v1/admin/games/${id}`, data);
    return res.data.data || res.data;
  },
  delete: async (id) => {
    const res = await apiClient.delete(`/api/v1/admin/games/${id}`);
    return res.data.data || res.data;
  },
};