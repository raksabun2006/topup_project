import { apiClient } from './client';

export const adminProductApi = {
  /** GET /api/v1/admin/products?page=&size=&sort= - Page<ProductResponseDto>, រួមទាំង status ទាំងអស់ */
  list: async ({ page = 0, size = 20, sort } = {}) => {
    const res = await apiClient.get('/api/v1/admin/products', { params: { page, size, sort } });
    return res.data;
  },

  /** POST /api/v1/admin/products - CreateProductRequestDto */
  create: async (data) => {
    const res = await apiClient.post('/api/v1/admin/products', data);
    return res.data;
  },

  /** PUT /api/v1/admin/products/{id} - UpdateProductRequestDto */
  update: async (id, data) => {
    const res = await apiClient.put(`/api/v1/admin/products/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await apiClient.delete(`/api/v1/admin/products/${id}`);
    return res.data;
  },
};
