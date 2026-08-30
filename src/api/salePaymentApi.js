import { apiClient } from './client';

/**
 * Endpoints for Bakong KHQR Sales Payments:
 * POST /sales/{saleId}/payment
 * GET  /sales/{saleId}/payment
 * GET  /sales/{saleId}/payment/status
 * POST /sales/payment/{paymentId}/cancel
 */
function unwrapPaymentResponse(body) {
  if (body && typeof body === 'object' && body.data && typeof body.data === 'object') {
    return body.data;
  }
  return body;
}

export const salePaymentApi = {
  /**
   * Create payment QR. Expiration (+15 min) is controlled entirely by backend.
   */
  create: async (saleId, provider = 'BAKONG') => {
    const res = await apiClient.post(`/sales/${saleId}/payment`, {
      provider,
    });
    return unwrapPaymentResponse(res.data);
  },

  get: async (saleId) => {
    const res = await apiClient.get(`/sales/${saleId}/payment`);
    return unwrapPaymentResponse(res.data);
  },

  checkStatus: async (saleId) => {
    const res = await apiClient.get(`/sales/${saleId}/payment/status`);
    return unwrapPaymentResponse(res.data);
  },

  cancel: async (paymentIdOrSaleId) => {
    try {
      const res = await apiClient.post(`/sales/payment/${paymentIdOrSaleId}/cancel`);
      return unwrapPaymentResponse(res.data);
    } catch {
      const res = await apiClient.post(`/sales/${paymentIdOrSaleId}/payment/cancel`);
      return unwrapPaymentResponse(res.data);
    }
  },
};
