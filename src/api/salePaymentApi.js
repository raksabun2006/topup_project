import { apiClient } from './client';

function extractStatusString(obj) {
  if (!obj || typeof obj !== 'object') return '';
  if (typeof obj.paymentStatus === 'string' && obj.paymentStatus.trim()) {
    return obj.paymentStatus.trim();
  }
  if (typeof obj.status === 'string' && obj.status.trim()) {
    return obj.status.trim();
  }
  return '';
}

/**
 * Normalizes payment response across:
 * - Wrapped response: { success, message, data: { status, paymentStatus, paid, qrString, ... } }
 * - Direct response: { paid: true, paymentStatus: 'PAID', ... }
 * - Fallback / Raw status responses
 */
export function normalizePaymentResponse(raw, fallbackSaleId = null) {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  // Unwrap envelope if present
  const data = raw.data && typeof raw.data === 'object' ? raw.data : raw;

  // Extract status safely from paymentStatus or status
  const rawStatus = extractStatusString(data) || extractStatusString(raw);
  const normalizedStatus = rawStatus ? rawStatus.toUpperCase() : '';

  // Boolean paid check: explicit paid flag or terminal success statuses
  const isPaid =
    data.paid === true ||
    raw.paid === true ||
    ['PAID', 'SUCCESS', 'COMPLETED'].includes(normalizedStatus);

  let finalStatus = 'PENDING';
  if (isPaid) {
    finalStatus = 'PAID';
  } else if (['FAILED', 'EXPIRED', 'CANCELLED', 'REFUNDED'].includes(normalizedStatus)) {
    finalStatus = normalizedStatus;
  } else if (normalizedStatus) {
    finalStatus = normalizedStatus;
  }

  return {
    saleId: data.saleId || data.orderId || raw.saleId || raw.orderId || fallbackSaleId || null,
    paymentId: data.paymentId || data.id || raw.paymentId || raw.id || null,
    status: finalStatus,
    paymentStatus: finalStatus,
    paid: isPaid,
    amount: data.amount != null ? Number(data.amount) : raw.amount != null ? Number(raw.amount) : null,
    currency: data.currency || raw.currency || 'USD',
    qrString: data.qrString || data.qr || raw.qrString || raw.qr || null,
    qr: data.qr || data.qrString || raw.qr || raw.qrString || null,
    md5: data.md5 || raw.md5 || null,
    invoiceNumber: data.invoiceNumber || data.billNumber || raw.invoiceNumber || raw.billNumber || null,
    billNumber: data.billNumber || data.invoiceNumber || raw.billNumber || raw.invoiceNumber || null,
    expiresAt: data.expiresAt || raw.expiresAt || null,
    paidAt: data.paidAt || raw.paidAt || null,
    createdAt: data.createdAt || raw.createdAt || null,
    merchantName: data.merchantName || raw.merchantName || null,
    deeplinkUrl: data.deeplinkUrl || raw.deeplinkUrl || null,
    message: data.message || raw.message || null,
    raw,
  };
}

export const salePaymentApi = {
  /**
   * Create payment QR. Expiration (+15 min) is controlled entirely by backend.
   * POST /api/v1/sales/{saleId}/payment
   */
  create: async (saleId, provider = 'BAKONG') => {
    const res = await apiClient.post(`/api/v1/sales/${saleId}/payment`, {
      provider,
    });
    return normalizePaymentResponse(res.data, saleId);
  },

  /**
   * Retrieve existing QR and payment info without re-triggering Bakong gateway.
   * GET /api/v1/sales/{saleId}/payment
   */
  get: async (saleId) => {
    const res = await apiClient.get(`/api/v1/sales/${saleId}/payment`);
    return normalizePaymentResponse(res.data, saleId);
  },

  /**
   * Check & verify payment status with Bakong.
   * Prioritizes active gateway verification endpoint:
   * GET /api/v1/sales/{saleId}/payment/status (actively verifies with Bakong API)
   * Falls back to GET /api/mart/sales/{saleId}/payment-status only if primary route fails.
   */
  checkStatus: async (saleId) => {
    try {
      const res = await apiClient.get(`/api/v1/sales/${saleId}/payment/status`);
      return normalizePaymentResponse(res.data, saleId);
    } catch (primaryErr) {
      console.warn(
        'Notice calling active payment/status verification:',
        primaryErr?.response?.status,
        primaryErr?.message
      );

      // Fallback only if active verification endpoint fails
      try {
        const fallbackRes = await apiClient.get(`/api/mart/sales/${saleId}/payment-status`);
        return normalizePaymentResponse(fallbackRes.data, saleId);
      } catch (fallbackErr) {
        throw primaryErr;
      }
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

