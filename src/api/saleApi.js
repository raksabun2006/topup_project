import { apiClient } from './client';

export const saleApi = {
  /**
   * POST /api/v1/sales
   * CreateSaleRequestDto { customer, discount, tax, items }
   */
  create: async (data) => {
    const res = await apiClient.post('/api/v1/sales', data);
    return res.data;
  },

  /** GET /api/v1/sales?page=&size=&sort= - ត្រឡប់ Page<SaleResponseDto> */
  list: async ({ page = 0, size = 1000, sort } = {}) => {
    const res = await apiClient.get('/api/v1/sales', { params: { page, size, sort } });
    const data = res.data;
    return {
      sales: data.content ?? [],
      total: data.totalElements ?? 0,
      totalPages: data.totalPages ?? 0,
      page: data.number ?? 0,
    };
  },

  getById: async (id) => {
    const res = await apiClient.get(`/api/v1/sales/${id}`);
    return res.data;
  },

  /** GET /api/v1/sales/{id}/payment/status - Polling payment status */
  getPaymentStatus: async (id) => {
    const res = await apiClient.get(`/api/v1/sales/${id}/payment/status`);
    return res.data;
  },

  /** POST /api/v1/sales/{id}/cancel */
  cancel: async (id) => {
    const res = await apiClient.post(`/api/v1/sales/${id}/cancel`);
    return res.data;
  },

  /** POST /api/v1/sales/{id}/refund - ADMIN role ប៉ុណ្ណោះ */
  refund: async (id, reason) => {
    const res = await apiClient.post(`/api/v1/sales/${id}/refund`, reason ? { reason } : undefined);
    return res.data;
  },

  /**
   * POST /api/v1/sales/{id}/payment - គ្មាន body - កត់ត្រាថា Sale នេះបានបង់
   * ប្រាក់រួច ហើយជំរុញ Telegram notification នៅ backend។ ចំណាំ: endpoint
   * ដូចគ្នានឹង salePaymentApi.create() ដែលស្នើសុំ Bakong QR (POST ជាមួយ
   * { provider, expirationMinutes } body) - backend បែងចែកតាមវត្តមាន body។
   * សាច់ប្រាក់ - ហៅភ្លាមក្រោយ create(); Bakong - ហៅតែពេល payment status
   * polling បញ្ជាក់ PAID (មើល BakongPaymentModal.jsx)។
   */
  // markPaid: async (id) => {
  //   const res = await apiClient.post(`/api/v1/sales/${id}/payment`);
  //   return res.data;
  // },
  markPaid: async (id) => {
  const res = await apiClient.post(`/api/v1/sales/${id}/mark-paid`);
  return res.data;
},
};