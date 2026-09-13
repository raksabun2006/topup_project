import { apiClient } from './client';

/**
 * Delivery Provider API Service
 * Handles public and administrative courier provider management.
 */
export const deliveryProviderApi = {
  /**
   * Get active delivery providers (Public/Customer)
   * GET /api/v1/deliveries/providers
   */
  getActiveProviders: async () => {
    try {
      const res = await apiClient.get('/api/v1/deliveries/providers');
      const data = res.data?.data ?? res.data;
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn('Failed to load active delivery providers:', err);
      return [];
    }
  },

  /**
   * List all delivery providers (Admin)
   * GET /api/v1/admin/delivery-providers
   */
  getAllProviders: async () => {
    const res = await apiClient.get('/api/v1/admin/delivery-providers');
    const data = res.data?.data ?? res.data;
    return Array.isArray(data) ? data : [];
  },

  /**
   * Get delivery provider details by ID (Admin)
   * GET /api/v1/admin/delivery-providers/{id}
   */
  getProviderById: async (id) => {
    const res = await apiClient.get(`/api/v1/admin/delivery-providers/${id}`);
    return res.data?.data ?? res.data;
  },

  /**
   * Create a new delivery provider (Admin)
   * POST /api/v1/admin/delivery-providers
   */
  createProvider: async (providerData) => {
    const res = await apiClient.post('/api/v1/admin/delivery-providers', providerData);
    return res.data?.data ?? res.data;
  },

  /**
   * Update delivery provider configuration (Admin)
   * PUT /api/v1/admin/delivery-providers/{id}
   */
  updateProvider: async (id, providerData) => {
    const res = await apiClient.put(`/api/v1/admin/delivery-providers/${id}`, providerData);
    return res.data?.data ?? res.data;
  },

  /**
   * Toggle provider active/disabled status (Admin)
   * PATCH /api/v1/admin/delivery-providers/{id}/toggle-status
   */
  toggleProviderStatus: async (id, enabled) => {
    const res = await apiClient.patch(`/api/v1/admin/delivery-providers/${id}/toggle-status`, {
      enabled: Boolean(enabled),
    });
    return res.data?.data ?? res.data;
  },
};
