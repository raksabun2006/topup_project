import { apiClient } from './client';

export const adminApi = {
  /**
   * GET /api/v1/admin/bakong/check - endpoint ចាស់ (មិនមែន POS module ថ្មីទេ)
   * ត្រូវការ ADMIN token។ ត្រឡប់ Map<String,Object> ដោយសេរី (រូបរាងមិនកំណត់
   * ជាក់លាក់ក្នុង schema) - UI ត្រូវបង្ហាញ field ណាមួយដែលមកវិញដោយទូទៅ។
   */
  checkBakong: async () => {
    const res = await apiClient.get('/api/v1/admin/bakong/check');
    return res.data.data;
  },
};
