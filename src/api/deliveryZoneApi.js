import { apiClient } from './client';

/**
 * Delivery Zone API Service
 * Handles delivery zones, rates, and thresholds.
 */
export const deliveryZoneApi = {
  /**
   * Get active delivery zones (Public/Customer)
   * GET /api/v1/delivery-zones
   */
  getActiveZones: async () => {
    try {
      const res = await apiClient.get('/api/v1/delivery-zones');
      const data = res.data?.data ?? res.data;
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn('Failed to load active delivery zones:', err);
      return [];
    }
  },

  /**
   * Get all delivery zones with pagination (Admin)
   * GET /api/v1/admin/delivery-zones
   */
  getAllZones: async ({ page = 0, size = 50 } = {}) => {
    const res = await apiClient.get('/api/v1/admin/delivery-zones', {
      params: { page, size },
    });
    return res.data?.data ?? res.data;
  },

  /**
   * Get delivery zone by ID (Admin)
   * GET /api/v1/admin/delivery-zones/{id}
   */
  getZoneById: async (id) => {
    const res = await apiClient.get(`/api/v1/admin/delivery-zones/${id}`);
    return res.data?.data ?? res.data;
  },

  /**
   * Create delivery zone (Admin)
   * POST /api/v1/admin/delivery-zones
   */
  createZone: async (zoneData) => {
    const res = await apiClient.post('/api/v1/admin/delivery-zones', zoneData);
    return res.data?.data ?? res.data;
  },

  /**
   * Update delivery zone (Admin)
   * PUT /api/v1/admin/delivery-zones/{id}
   */
  updateZone: async (id, zoneData) => {
    const res = await apiClient.put(`/api/v1/admin/delivery-zones/${id}`, zoneData);
    return res.data?.data ?? res.data;
  },

  /**
   * Delete delivery zone (Admin)
   * DELETE /api/v1/admin/delivery-zones/{id}
   */
  deleteZone: async (id) => {
    const res = await apiClient.delete(`/api/v1/admin/delivery-zones/${id}`);
    return res.data?.data ?? res.data;
  },
};
