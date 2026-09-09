import axios from 'axios';
import { apiClient } from './client';
import { normalizePaymentResponse } from './salePaymentApi';

export const orderPaymentApi = {
  /**
   * Create payment QR for an e-commerce order:
   * POST /api/v1/orders/{orderId}/payment
   */
  create: async (orderId, provider = 'BAKONG', config = {}) => {
    const res = await apiClient.post(
      `/api/v1/orders/${orderId}/payment`,
      { provider },
      config
    );
    return normalizePaymentResponse(res.data, orderId);
  },

  /**
   * Retrieve existing QR and payment info for order without re-triggering gateway:
   * GET /api/v1/orders/{orderId}/payment
   */
  get: async (orderId, config = {}) => {
    const res = await apiClient.get(`/api/v1/orders/${orderId}/payment`, config);
    return normalizePaymentResponse(res.data, orderId);
  },

  /**
   * Check & verify payment status with Bakong for order:
   * GET /api/v1/orders/{orderId}/payment/status
   */
  checkStatus: async (orderId, config = {}) => {
    const res = await apiClient.get(`/api/v1/orders/${orderId}/payment/status`, config);
    return normalizePaymentResponse(res.data, orderId);
  },

  /**
   * Cancel order payment on backend:
   * POST /api/v1/orders/payment/{paymentId}/cancel
   */
  cancel: async (paymentId, config = {}) => {
    try {
      const res = await apiClient.post(`/api/v1/orders/payment/${paymentId}/cancel`, undefined, config);
      return normalizePaymentResponse(res.data);
    } catch {
      const res = await apiClient.post(`/orders/payment/${paymentId}/cancel`, undefined, config);
      return normalizePaymentResponse(res.data);
    }
  },

  isCancel: (err) => axios.isCancel(err) || err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED',
};
