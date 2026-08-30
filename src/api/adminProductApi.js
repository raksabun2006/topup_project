import { apiClient } from './client';

export const adminProductApi = {
  /** GET /admin/products?page=&size=&sort= */
  list: async ({ page = 0, size = 15, sort } = {}) => {
    const res = await apiClient.get('/admin/products', {
      params: { page, size, sort },
    });
    // Unwraps custom wrapper object { success, message, data: { content, ... } }
    return res.data?.data || res.data;
  },

  /** POST /admin/products */
  create: async (data) => {
    const res = await apiClient.post('/admin/products', data);
    return res.data?.data || res.data;
  },

  /** PUT /admin/products/{id} */
  update: async (id, data) => {
    const res = await apiClient.put(`/admin/products/${id}`, data);
    return res.data?.data || res.data;
  },

  /** DELETE /admin/products/{id} */
  delete: async (id) => {
    const res = await apiClient.delete(`/admin/products/${id}`);
    return res.data?.data || res.data;
  },
};