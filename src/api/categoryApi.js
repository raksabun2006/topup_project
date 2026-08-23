import { apiClient } from './client';

/**
 * GET /api/v1/categories, POST /api/v1/categories - CategoryRequestDto { name },
 * DELETE /api/v1/categories/{id}
 */
export const categoryApi = {
  list: async () => {
    const res = await apiClient.get('/api/v1/categories');
    return res.data;
  },

  create: async (data) => {
    const res = await apiClient.post('/api/v1/categories', data);
    return res.data;
  },

  delete: async (id) => {
    const res = await apiClient.delete(`/api/v1/categories/${id}`);
    return res.data;
  },
};
