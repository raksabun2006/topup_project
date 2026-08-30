import { apiClient } from './client';

/**
 * Endpoints for categories:
 * GET    /categories
 * POST   /categories        - CategoryRequestDto { name }
 * GET    /categories/{id}
 * PUT    /categories/{id}   - CategoryRequestDto { name }
 * DELETE /categories/{id}
 */
export const categoryApi = {
  list: async () => {
    const res = await apiClient.get('/categories');
    return res.data?.data ?? res.data;
  },

  getById: async (id) => {
    const res = await apiClient.get(`/categories/${id}`);
    return res.data?.data ?? res.data;
  },

  create: async (data) => {
    const res = await apiClient.post('/categories', data);
    return res.data?.data ?? res.data;
  },

  update: async (id, data) => {
    const res = await apiClient.put(`/categories/${id}`, data);
    return res.data?.data ?? res.data;
  },

  delete: async (id) => {
    const res = await apiClient.delete(`/categories/${id}`);
    return res.data?.data ?? res.data;
  },
};
