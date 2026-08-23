import { apiClient } from './client';

/**
 * /api/v1/products* ត្រឡប់ DTO ដោយផ្ទាល់ (មិនរុំក្នុង {success,message,data}
 * ដូច endpoint ចាស់ៗ /api/v1/orders* ទេ) - ដូច្នេះយើងអាន res.data ផ្ទាល់។
 */
export const productApi = {
  /** GET /api/v1/products?category=&page=&size=&sort= - ត្រឡប់ Page<ProductResponseDto> */
  list: async ({ category, page = 0, size = 20, sort } = {}) => {
    const res = await apiClient.get('/api/v1/products', {
      params: { category, page, size, sort },
    });
    return res.data;
  },

  /** GET /api/v1/products/{id} */
  getById: async (id) => {
    const res = await apiClient.get(`/api/v1/products/${id}`);
    return res.data;
  },
};
