import { apiClient } from './client';

export const productApi = {
  /** GET /products?category=&page=&size=&sort= - ត្រឡប់ Page<ProductResponseDto> */
  list: async ({ category, page = 0, size = 20, sort } = {}) => {
    const res = await apiClient.get('/products', {
      params: { category, page, size, sort },
    });
    return res.data;
  },

  /** GET /products/{id} */
  getById: async (id) => {
    const res = await apiClient.get(`/products/${id}`);
    return res.data;
  },
};
