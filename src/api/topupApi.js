import { apiClient } from './client';

export const topupApi = {
  /**
   * POST /api/v1/topups
   *
   * Idempotency-Key ជាការសន្យារបស់ client ថាការព្យាយាមម្តងទៀត
   * មានន័យថា "តើសំណើដំបូងបានទៅដល់ទេ?" មិនមែន "ធ្វើម្តងទៀត" ទេ។
   * ការផ្ញើ key ដដែលពីរដងត្រឡប់ transaction ដដែល។
   */
  create: async (orderId, idempotencyKey) => {
    const res = await apiClient.post(
      '/api/v1/topups',
      { orderId },
      { headers: { 'Idempotency-Key': idempotencyKey } }
    );
    return res.data.data;
  },

  list: async ({ page = 0, size = 20 } = {}) => {
    const res = await apiClient.get('/api/v1/topups', {
      params: { page, size },
    });
    return res.data.data;
  },

  getById: async (transactionId) => {
    const res = await apiClient.get(`/api/v1/topups/${transactionId}`);
    return res.data.data;
  },
};