import { apiClient } from './client';

export const adminApi = {
  checkBakong: async () => {
    const res = await apiClient.get('/admin/bakong/check');
    return res.data?.data ?? res.data;
  },

  getAllOrders: async ({ page = 0, size = 20, sort } = {}) => {
    const res = await apiClient.get('/admin/orders', {
      params: { page, size, sort },
    });
    return res.data?.data ?? res.data;
  },

  getOrderStatistics: async () => {
    const res = await apiClient.get('/admin/orders/statistics');
    return res.data?.data ?? res.data;
  },

  updateOrderStatus: async (id, status) => {
    const res = await apiClient.patch(`/admin/orders/${id}/status`, null, {
      params: { status },
    });
    return res.data?.data ?? res.data;
  },
};
