import { apiClient } from './client';

/**
 * Normalizes payment response across:
 * - Wrapped ApiResponsePaymentResponse: { success, message, data: { status, paymentStatus, paid, qrString, ... } }
 * - Direct SalePaymentStatusResponse / DTO: { paid: true, paymentStatus: 'PAID', saleId, invoiceNumber, amount, currency, ... }
 * - Direct PaymentResponse: { paymentId, orderId, qrString, md5, amount, currency, status: 'PAID', billNumber, ... }
 */
export function normalizePaymentResponse(raw, fallbackSaleId = null) {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  // Unwrap envelope if present
  const data = raw.data && typeof raw.data === 'object' ? raw.data : raw;

  // Collect all potential status strings from both inner data and outer envelope
  const candidateStrings = [
    data.paymentStatus,
    data.status,
    data.payment_status,
    data.orderStatus,
    data.saleStatus,
    raw.paymentStatus,
    raw.status,
    raw.payment_status,
    raw.orderStatus,
    raw.saleStatus,
  ]
    .filter((s) => typeof s === 'string' && s.trim())
    .map((s) => s.trim().toUpperCase());

  // Boolean paid check: explicit boolean flags or terminal success status strings
  const explicitPaid =
    data.paid === true ||
    data.paid === 'true' ||
    raw.paid === true ||
    raw.paid === 'true' ||
    data.isPaid === true ||
    raw.isPaid === true;

  const hasTerminalSuccess = candidateStrings.some((s) =>
    ['PAID', 'SUCCESS', 'COMPLETED'].includes(s)
  );

  const isPaid = explicitPaid || hasTerminalSuccess;

  let finalStatus = 'PENDING';
  if (isPaid) {
    finalStatus = 'PAID';
  } else {
    const terminalFailure = candidateStrings.find((s) =>
      ['FAILED', 'EXPIRED', 'CANCELLED', 'REFUNDED'].includes(s)
    );
    if (terminalFailure) {
      finalStatus = terminalFailure;
    } else if (candidateStrings.length > 0) {
      finalStatus = candidateStrings[0];
    }
  }

  return {
    saleId:
      data.saleId ||
      data.orderId ||
      data.entityId ||
      raw.saleId ||
      raw.orderId ||
      raw.entityId ||
      fallbackSaleId ||
      null,
    paymentId: data.paymentId || data.id || raw.paymentId || raw.id || null,
    status: finalStatus,
    paymentStatus: finalStatus,
    paid: isPaid,
    amount:
      data.amount != null
        ? Number(data.amount)
        : raw.amount != null
        ? Number(raw.amount)
        : null,
    currency: data.currency || raw.currency || 'USD',
    qrString: data.qrString || data.qr || raw.qrString || raw.qr || null,
    qr: data.qr || data.qrString || raw.qr || raw.qrString || null,
    md5: data.md5 || raw.md5 || null,
    invoiceNumber:
      data.invoiceNumber ||
      data.billNumber ||
      raw.invoiceNumber ||
      raw.billNumber ||
      null,
    billNumber:
      data.billNumber ||
      data.invoiceNumber ||
      raw.billNumber ||
      raw.invoiceNumber ||
      null,
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
      console.log(`[Payment] Checking payment status for sale: ${saleId}`);
      const res = await apiClient.get(`/api/v1/sales/${saleId}/payment/status`);
      const normalized = normalizePaymentResponse(res.data, saleId);
      console.log(`[Payment] Payment API response:`, {
        saleId,
        endpoint: `/api/v1/sales/${saleId}/payment/status`,
        httpStatus: res.status,
        normalizedStatus: normalized?.status,
        paid: normalized?.paid,
      });
      return normalized;
    } catch (primaryErr) {
      const httpStatus = primaryErr?.response?.status;
      console.warn(
        `[Payment] Active payment/status verification notice for sale ${saleId}:`,
        httpStatus,
        primaryErr?.message
      );

      // Fallback only if active verification endpoint fails
      try {
        const fallbackRes = await apiClient.get(`/api/mart/sales/${saleId}/payment-status`);
        const fallbackNormalized = normalizePaymentResponse(fallbackRes.data, saleId);
        console.log(`[Payment] Fallback payment-status response:`, {
          saleId,
          endpoint: `/api/mart/sales/${saleId}/payment-status`,
          httpStatus: fallbackRes.status,
          normalizedStatus: fallbackNormalized?.status,
          paid: fallbackNormalized?.paid,
        });
        return fallbackNormalized;
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

