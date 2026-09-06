import { apiClient } from './client';

/**
 * Promotion & Discount API Service
 * Consumes authoritative backend promotion endpoints.
 */
export const discountApi = {
  /**
   * GET /api/v1/discounts/active
   * Public endpoint to retrieve currently active promotions.
   */
  getActiveDiscounts: async (config = {}) => {
    const res = await apiClient.get('/api/v1/discounts/active', config);
    return res.data?.data ?? res.data ?? [];
  },

  /**
   * GET /api/v1/admin/discounts
   * Admin endpoint to list all promotions with optional filtering.
   */
  getDiscounts: async (params = {}, config = {}) => {
    const res = await apiClient.get('/api/v1/admin/discounts', { params, ...config });
    return res.data?.data ?? res.data ?? [];
  },

  /**
   * GET /api/v1/admin/discounts/{id}
   * Admin endpoint to get details of a specific promotion.
   */
  getDiscount: async (id, config = {}) => {
    const res = await apiClient.get(`/api/v1/admin/discounts/${id}`, config);
    return res.data?.data ?? res.data;
  },

  /**
   * POST /api/v1/admin/discounts
   * Admin endpoint to create a new promotion.
   */
  createDiscount: async (data, config = {}) => {
    const res = await apiClient.post('/api/v1/admin/discounts', data, config);
    return res.data?.data ?? res.data;
  },

  /**
   * PUT /api/v1/admin/discounts/{id}
   * Admin endpoint to update an existing promotion.
   */
  updateDiscount: async (id, data, config = {}) => {
    const res = await apiClient.put(`/api/v1/admin/discounts/${id}`, data, config);
    return res.data?.data ?? res.data;
  },

  /**
   * DELETE /api/v1/admin/discounts/{id}
   * Admin endpoint to delete a promotion.
   */
  deleteDiscount: async (id, config = {}) => {
    const res = await apiClient.delete(`/api/v1/admin/discounts/${id}`, config);
    return res.data?.data ?? res.data;
  },

  /**
   * PATCH /api/v1/admin/discounts/{id}/status
   * Admin endpoint to toggle or update promotion status (e.g. ACTIVE, INACTIVE).
   */
  updateDiscountStatus: async (id, status, config = {}) => {
    const res = await apiClient.patch(`/api/v1/admin/discounts/${id}/status`, { status }, config);
    return res.data?.data ?? res.data;
  },
};
