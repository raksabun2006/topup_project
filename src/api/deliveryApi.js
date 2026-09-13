import { apiClient } from './client';

/**
 * Delivery API Service
 * Handles operational queries, state machine updates, courier assignments, tracking, and audit logs.
 */
export const deliveryApi = {
  /**
   * Get all deliveries with filters and pagination (Staff/Admin)
   * GET /api/v1/admin/deliveries
   */
  getAllDeliveries: async ({ status, providerCode, query, page = 0, size = 20 } = {}) => {
    const params = { page, size };
    if (status && status !== 'ALL') params.status = status;
    if (providerCode && providerCode !== 'ALL') params.providerCode = providerCode;
    if (query && query.trim()) params.query = query.trim();

    const res = await apiClient.get('/api/v1/admin/deliveries', { params });
    // Spring Boot Page object wrapped in ApiResponse or raw Page
    const payload = res.data?.data ?? res.data;
    return payload;
  },

  /**
   * Get delivery details by ID (Staff/Admin)
   * GET /api/v1/admin/deliveries/{id}
   */
  getDeliveryById: async (id) => {
    const res = await apiClient.get(`/api/v1/admin/deliveries/${id}`);
    return res.data?.data ?? res.data;
  },

  /**
   * Get delivery info for an order (Customer/Admin)
   * GET /api/v1/deliveries/order/{orderId}
   */
  getDeliveryByOrderId: async (orderId) => {
    const res = await apiClient.get(`/api/v1/deliveries/order/${orderId}`);
    return res.data?.data ?? res.data;
  },

  /**
   * Get delivery tracking history for an order (Customer/Admin)
   * GET /api/v1/deliveries/order/{orderId}/tracking
   */
  getCustomerTracking: async (orderId) => {
    const res = await apiClient.get(`/api/v1/deliveries/order/${orderId}/tracking`);
    return res.data?.data ?? res.data;
  },

  /**
   * Get tracking history events for delivery by ID
   * GET /api/v1/admin/deliveries/{id}/tracking
   */
  getTrackingEvents: async (deliveryId) => {
    const res = await apiClient.get(`/api/v1/admin/deliveries/${deliveryId}/tracking`);
    const data = res.data?.data ?? res.data;
    return Array.isArray(data) ? data : [];
  },

  /**
   * Assign delivery provider and package specifications
   * POST /api/v1/admin/deliveries/{id}/assign
   */
  assignProvider: async (deliveryId, {
    providerCode,
    carrier,
    weight,
    length,
    width,
    height,
    packageCount,
    declaredValue,
    deliveryNote,
    estimatedDeliveryDate,
  }) => {
    const res = await apiClient.post(`/api/v1/admin/deliveries/${deliveryId}/assign`, {
      providerCode,
      carrier,
      weight: weight !== undefined && weight !== '' ? Number(weight) : undefined,
      length: length !== undefined && length !== '' ? Number(length) : undefined,
      width: width !== undefined && width !== '' ? Number(width) : undefined,
      height: height !== undefined && height !== '' ? Number(height) : undefined,
      packageCount: packageCount ? Number(packageCount) : 1,
      declaredValue: declaredValue ? Number(declaredValue) : undefined,
      deliveryNote,
      estimatedDeliveryDate,
    });
    return res.data?.data ?? res.data;
  },

  /**
   * Create shipment with courier provider API
   * POST /api/v1/admin/deliveries/{id}/create-shipment
   */
  createShipment: async (deliveryId, payload = {}) => {
    const res = await apiClient.post(`/api/v1/admin/deliveries/${deliveryId}/create-shipment`, payload);
    return res.data?.data ?? res.data;
  },

  /**
   * Update tracking and driver details (Staff/Admin)
   * PATCH /api/v1/deliveries/{id}/tracking
   */
  updateTracking: async (deliveryId, { trackingNumber, carrier, courierOrderNumber, estimatedDeliveryDate }) => {
    const res = await apiClient.patch(`/api/v1/deliveries/${deliveryId}/tracking`, {
      trackingNumber,
      carrier,
      courierOrderNumber,
      estimatedDeliveryDate,
    });
    return res.data?.data ?? res.data;
  },

  /**
   * Update delivery status with state machine validation
   * PATCH /api/v1/admin/deliveries/{id}/status
   */
  updateStatus: async (deliveryId, { status, note, location, estimatedDeliveryDate }) => {
    const res = await apiClient.patch(`/api/v1/admin/deliveries/${deliveryId}/status`, {
      status,
      note,
      location,
      estimatedDeliveryDate,
    });
    return res.data?.data ?? res.data;
  },

  /**
   * Cancel shipment and record reason
   * POST /api/v1/admin/deliveries/{id}/cancel
   */
  cancelShipment: async (deliveryId, reason) => {
    const res = await apiClient.post(`/api/v1/admin/deliveries/${deliveryId}/cancel`, { reason });
    return res.data?.data ?? res.data;
  },

  /**
   * Manually trigger courier tracking synchronization
   * POST /api/v1/admin/deliveries/{id}/sync
   */
  syncTracking: async (deliveryId) => {
    const res = await apiClient.post(`/api/v1/admin/deliveries/${deliveryId}/sync`);
    return res.data?.data ?? res.data;
  },

  /**
   * Get delivery audit trail logs
   * GET /api/v1/admin/deliveries/{id}/audit
   */
  getAuditLogs: async (deliveryId) => {
    const res = await apiClient.get(`/api/v1/admin/deliveries/${deliveryId}/audit`);
    const data = res.data?.data ?? res.data;
    return Array.isArray(data) ? data : [];
  },
};
