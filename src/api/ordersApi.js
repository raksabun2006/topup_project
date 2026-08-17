import { apiClient } from './client';

export const ordersApi = {
  /**
   * POST /api/v1/orders - បង្កើត order មុននឹងបង់ប្រាក់/topup
   * ត្រូវផ្ទៀងផ្ទាត់ field ទាំងនេះជាមួយ OrderRequest DTO ពិត -
   * សន្មត់តាមគំរូនៃ endpoint ផ្សេងទៀត (ProductRequest ប្រើ gameId
   * មិនមែន gameCode ទេ ដូច្នេះ field នេះអាចត្រូវកែផងដែរ)។
   */
  create: async ({ gameCode, productId, gameUserId }) => {
    const res = await apiClient.post('/api/v1/orders', {
      gameCode,
      productId,
      gameUserId,
    });
    return res.data.data;
  },

  /**
   * GET /api/v1/orders - ត្រូវការ token, ADMIN ឃើញទាំងអស់, USER ឃើញតែរបស់ខ្លួន
   * status ស្រេចចិត្ត (ឧ. 'SUCCESS') - axios លុប params undefined ចោលដោយស្វ័យប្រវត្តិ។
   */
  list: async ({ page = 0, size = 20, status } = {}) => {
    const res = await apiClient.get('/api/v1/orders', {
      params: { page, size, status },
    });
    return res.data.data;
  },

  /** GET /api/v1/orders/id/{uuid} - ម្ចាស់ order ឬ ADMIN */
  getById: async (orderId) => {
    const res = await apiClient.get(`/api/v1/orders/id/${orderId}`);
    return res.data.data;
  },

  /** GET /api/v1/orders/{orderNumber} - ម្ចាស់ order ឬ ADMIN */
  getByNumber: async (orderNumber) => {
    const res = await apiClient.get(`/api/v1/orders/${orderNumber}`);
    return res.data.data;
  },
};
