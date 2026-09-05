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
   * Primary: GET /sales/{saleId}/payment/status (actively verifies with Bakong API)
   * Secondary: GET /sales/{saleId}/payment-status
   * Tertiary: GET /sales/{saleId} (checks if sale entity was marked PAID)
   */
  checkStatus: async (saleId) => {
    let paymentStatusRes = null;

    // 1. Primary: GET /sales/{saleId}/payment/status
    // This actively calls Bakong API (checkStatus with Bakong gateway)
    try {
      const res = await apiClient.get(`/sales/${saleId}/payment/status`);
      paymentStatusRes = normalizePaymentResponse(res.data, saleId);
      if (paymentStatusRes?.paid || paymentStatusRes?.status === 'PAID') {
        return paymentStatusRes;
      }
    } catch (err) {
      console.warn('Notice calling payment/status:', err?.response?.status, err?.message);
    }

    // 2. Secondary: GET /sales/{saleId}/payment-status
    try {
      const directRes = await apiClient.get(`/sales/${saleId}/payment-status`);
      const direct = normalizePaymentResponse(directRes.data, saleId);
      if (direct?.paid || direct?.status === 'PAID') {
        return direct;
      }
      if (!paymentStatusRes) {
        paymentStatusRes = direct;
      }
    } catch (err) {
      console.warn('Notice calling payment-status:', err?.response?.status, err?.message);
    }

    // 3. Tertiary: GET /sales/{saleId}
    // Verifies whether the sale itself has transitioned to PAID / COMPLETED
    try {
      const saleRes = await apiClient.get(`/sales/${saleId}`);
      const saleData = saleRes.data;
      if (
        saleData &&
        (saleData.paymentStatus === 'PAID' || saleData.status === 'COMPLETED')
      ) {
        return {
          ...(paymentStatusRes || {}),
          saleId,
          status: 'PAID',
          paymentStatus: 'PAID',
          paid: true,
          amount: saleData.total,
          invoiceNumber: saleData.invoiceNumber,
        };
      }
    } catch {
      // ignore
    }

    return paymentStatusRes;
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

