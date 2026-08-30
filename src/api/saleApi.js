import { apiClient } from './client';

export const saleApi = {
  /**
   * POST /sales
   * CreateSaleRequestDto { customer, discount, tax, items }
   */
  create: async (data) => {
    const res = await apiClient.post('/sales', data);
    return res.data;
  },

  /** GET /sales?page=&size=&sort= - ត្រឡប់ Page<SaleResponseDto> */
  list: async ({ page = 0, size = 1000, sort } = {}) => {
    const res = await apiClient.get('/sales', { params: { page, size, sort } });
    const data = res.data;
    return {
      sales: data.content ?? [],
      total: data.totalElements ?? 0,
      totalPages: data.totalPages ?? 0,
      page: data.number ?? 0,
    };
  },

  getById: async (id) => {
    const res = await apiClient.get(`/sales/${id}`);
    return res.data;
  },

  /** GET /sales/{id}/payment/status - Polling payment status */
  getPaymentStatus: async (id) => {
    const res = await apiClient.get(`/sales/${id}/payment/status`);
    return res.data;
  },

  /** POST /sales/{id}/cancel */
  cancel: async (id) => {
    const res = await apiClient.post(`/sales/${id}/cancel`);
    return res.data;
  },

  /** POST /sales/{id}/refund - ADMIN role ប៉ុណ្ណោះ */
  refund: async (id, reason) => {
    const res = await apiClient.post(`/sales/${id}/refund`, reason ? { reason } : undefined);
    return res.data;
  },

  /**
   * POST /sales/{id}/mark-paid - កត់ត្រាថា Sale នេះបានបង់ប្រាក់រួច
   */
  markPaid: async (id) => {
    const res = await apiClient.post(`/sales/${id}/mark-paid`);
    return res.data;
  },
};