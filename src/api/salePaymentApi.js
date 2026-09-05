import { apiClient } from './client';

/**
 * Normalizes payment response across:
 * - SalePaymentStatusResponse: { saleId, paymentStatus, paid, invoiceNumber, amount, currency, md5, paidAt, message }
 * - ApiResponsePaymentResponse: { success, message, data: { paymentId, orderId, saleId, qrString, qr, md5, amount, currency, status, paymentStatus, paid, billNumber, expiresAt, paidAt, createdAt } }
 * - PaymentResponse: { ... }
 */
export function normalizePaymentResponse(raw, fallbackSaleId = null) {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  // Unwrap envelope if present
  const data = raw.data && typeof raw.data === 'object' ? raw.data : raw;

  // Determine status (PAID, PENDING, FAILED, EXPIRED, CANCELLED, REFUNDED)
  const rawStatus = data.status || data.paymentStatus || raw.paymentStatus || '';
  const statusUpper = String(rawStatus).toUpperCase();

  // Boolean paid check: true if explicit boolean or status indicates completion
  const isPaid =
    data.paid === true ||
    raw.paid === true ||
    statusUpper === 'PAID' ||
    statusUpper === 'SUCCESS' ||
    statusUpper === 'COMPLETED';

  let normalizedStatus = statusUpper;
  if (isPaid) {
    normalizedStatus = 'PAID';
  } else if (!normalizedStatus) {
    normalizedStatus = 'PENDING';
  }

  return {
    saleId: data.saleId || data.orderId || fallbackSaleId || null,
    paymentId: data.paymentId || data.id || null,
    status: normalizedStatus,
    paymentStatus: normalizedStatus,
    paid: isPaid,
    amount: data.amount != null ? Number(data.amount) : null,
    currency: data.currency || 'USD',
    qrString: data.qrString || data.qr || null,
    md5: data.md5 || null,
    invoiceNumber: data.invoiceNumber || data.billNumber || null,
    billNumber: data.billNumber || data.invoiceNumber || null,
    expiresAt: data.expiresAt || null,
    paidAt: data.paidAt || null,
    createdAt: data.createdAt || null,
    message: data.message || raw.message || null,
    raw,
  };
}

export const salePaymentApi = {
  /**
   * Create payment QR. Expiration (+15 min) is controlled entirely by backend.
   * POST /sales/{saleId}/payment
   */
  create: async (saleId, provider = 'BAKONG') => {
    const res = await apiClient.post(`/sales/${saleId}/payment`, {
      provider,
    });
    return normalizePaymentResponse(res.data, saleId);
  },

  /**
   * Retrieve existing QR and payment info without re-triggering Bakong gateway.
   * GET /sales/{saleId}/payment
   */
  get: async (saleId) => {
    const res = await apiClient.get(`/sales/${saleId}/payment`);
    return normalizePaymentResponse(res.data, saleId);
  },

  /**
   * Check & verify payment status with Bakong.
   * Prefers dedicated Mart POS endpoint: GET /sales/{saleId}/payment-status
   * Falls back to wrapped status endpoint: GET /sales/{saleId}/payment/status
   */
  checkStatus: async (saleId) => {
    try {
      const res = await apiClient.get(`/sales/${saleId}/payment-status`);
      return normalizePaymentResponse(res.data, saleId);
    } catch (err) {
      if (err?.response?.status === 404) {
        const res = await apiClient.get(`/sales/${saleId}/payment/status`);
        return normalizePaymentResponse(res.data, saleId);
      }
      throw err;
    }
  },

  /**
   * Cancel payment on backend.
   * POST /sales/payment/{paymentId}/cancel
   */
  cancel: async (paymentIdOrSaleId) => {
    try {
      const res = await apiClient.post(`/sales/payment/${paymentIdOrSaleId}/cancel`);
      return normalizePaymentResponse(res.data, paymentIdOrSaleId);
    } catch {
      const res = await apiClient.post(`/sales/${paymentIdOrSaleId}/payment/cancel`);
      return normalizePaymentResponse(res.data, paymentIdOrSaleId);
    }
  },
};

