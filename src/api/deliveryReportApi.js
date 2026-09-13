import { apiClient } from './client';

/**
 * Delivery Report API Service
 * Handles metrics summary, courier provider performance, and status breakdowns.
 */
export const deliveryReportApi = {
  /**
   * Get overall delivery metrics summary (Admin/Manager)
   * GET /api/v1/reports/delivery
   */
  getDeliverySummary: async () => {
    const res = await apiClient.get('/api/v1/reports/delivery');
    return res.data?.data ?? res.data;
  },

  /**
   * Get courier provider performance metrics (Admin/Manager)
   * GET /api/v1/reports/delivery/providers
   */
  getProviderPerformance: async () => {
    const res = await apiClient.get('/api/v1/reports/delivery/providers');
    const data = res.data?.data ?? res.data;
    return Array.isArray(data) ? data : [];
  },

  /**
   * Get delivery counts by status (Admin/Manager)
   * GET /api/v1/reports/delivery/status
   */
  getDeliveryStatusBreakdown: async () => {
    const res = await apiClient.get('/api/v1/reports/delivery/status');
    const data = res.data?.data ?? res.data;
    return Array.isArray(data) ? data : [];
  },
};
