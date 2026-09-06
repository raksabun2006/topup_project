import axios from 'axios';
import { apiClient } from './client';
import { normalizePaymentResponse } from './salePaymentApi';

export const orderPaymentApi = {
  /**
   * Create payment QR for an e-commerce order:
   * POST /api/v1/orders/{orderId}/payment
   */
  create: async (orderId, provider = 'BAKONG', config = {}) => {
    console.log(`[orderPaymentApi.create] Creating payment for orderId:`, orderId);
    const res = await apiClient.post(
      `/api/v1/orders/${orderId}/payment`,
      { provider },
      config
    );
    const normalized = normalizePaymentResponse(res.data, orderId);
    console.log(`[orderPaymentApi.create] Payment created:`, {
      orderId: normalized?.saleId || orderId,
      paymentId: normalized?.paymentId,
      status: normalized?.status,
    });
    return normalized;
  },

  /**
   * Retrieve existing QR and payment info for order without re-triggering gateway:
   * GET /api/v1/orders/{orderId}/payment
   */
  get: async (orderId, config = {}) => {
    console.log(`[orderPaymentApi.get] Fetching payment for orderId:`, orderId);
    const res = await apiClient.get(`/api/v1/orders/${orderId}/payment`, config);
    return normalizePaymentResponse(res.data, orderId);
  },

  /**
   * Check & verify payment status with Bakong for order:
   * GET /api/v1/orders/{orderId}/payment/status
   */
  checkStatus: async (orderId, config = {}) => {
    console.log(`[orderPaymentApi.checkStatus] GET /api/v1/orders/${orderId}/payment/status (using orderId: ${orderId})`);
    const res = await apiClient.get(`/api/v1/orders/${orderId}/payment/status`, config);
    const normalized = normalizePaymentResponse(res.data, orderId);
    console.log(`[orderPaymentApi.checkStatus] Result:`, {
      orderId,
      paymentId: normalized?.paymentId,
      status: normalized?.status,
      paid: normalized?.paid,
    });
    return normalized;
  },

  /**
   * Cancel order payment on backend:
   * POST /api/v1/orders/payment/{paymentId}/cancel
   */
  cancel: async (paymentId, config = {}) => {
    console.log(`[orderPaymentApi.cancel] POST /api/v1/orders/payment/${paymentId}/cancel`);
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
