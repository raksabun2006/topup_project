import { apiClient } from './client';

export const adminApi = {
  /**
   * GET /api/v1/admin/statistics - ត្រូវការ ADMIN token
   *
   * ត្រឡប់ { totalOrders, totalRevenue, successCount, failedCount,
   * pendingCount, countByStatus, totalUsers, activeGames, activeProducts }
   * បញ្ជាក់ពី Swagger ពិត។
   */
  getStatistics: async () => {
    const res = await apiClient.get('/api/v1/admin/statistics');
    return res.data.data;
  },

  /**
   * GET /api/v1/admin/bakong/check - ត្រូវការ ADMIN token
   *
   * ពិនិត្យការកំណត់រចនាសម្ព័ន្ធ Bakong ទាំងអស់។ Backend ត្រឡប់ជា
   * Map<String, Object> ដោយសេរី (មិនមាន schema ជាក់លាក់ទេ) ដូច្នេះ
   * client មិនគួរសន្មតឈ្មោះ field ជាក់លាក់ណាមួយឡើយ។
   */
  checkBakong: async () => {
    const res = await apiClient.get('/api/v1/admin/bakong/check');
    return res.data.data;
  },
};
