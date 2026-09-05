import { apiClient } from './client';

export const saleApi = {
  /**
   * POST /sales
   * CreateSaleRequestDto { customer, discount, tax, items }
   */
  create: async (data, config = {}) => {
    const res = await apiClient.post('/sales', data, config);
    return res.data;
  },

  /** GET /sales?page=&size=&sort= - ត្រឡប់ Page<SaleResponseDto> */
  list: async ({ page = 0, size = 1000, sort } = {}, config = {}) => {
    const res = await apiClient.get('/sales', { params: { page, size, sort }, ...config });
    const data = res.data;
    return {
      sales: data.content ?? [],
      total: data.totalElements ?? 0,
      totalPages: data.totalPages ?? 0,
      page: data.number ?? 0,
    };
  },

  getById: async (id, config = {}) => {
    const res = await apiClient.get(`/sales/${id}`, config);
    return res.data;
  },

  /** GET /sales/{id}/payment/status - Polling payment status */
  getPaymentStatus: async (id, config = {}) => {
    const res = await apiClient.get(`/sales/${id}/payment/status`, config);
    return res.data;
  },

  /** POST /sales/{id}/cancel */
  cancel: async (id, config = {}) => {
    const res = await apiClient.post(`/sales/${id}/cancel`, undefined, config);
    return res.data;
  },

  /** POST /sales/{id}/refund - ADMIN role ប៉ុណ្ណោះ */
  refund: async (id, reason, config = {}) => {
    const res = await apiClient.post(`/sales/${id}/refund`, reason ? { reason } : undefined, config);
    return res.data;
  },

  /**
   * POST /sales/{id}/mark-paid - កត់ត្រាថា Sale នេះបានបង់ប្រាក់រួច
   */
  markPaid: async (id, config = {}) => {
    const res = await apiClient.post(`/sales/${id}/mark-paid`, undefined, config);
    return res.data;
  },
};