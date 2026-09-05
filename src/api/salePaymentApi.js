import { apiClient } from './client';

/**
 * Normalizes payment response across:
 * - Wrapped ApiResponsePaymentResponse: { success, message, data: { status, paymentStatus, paid, qrString, ... } }
 * - Direct SalePaymentStatusResponse / DTO: { paid: true, paymentStatus: 'PAID', saleId, invoiceNumber, amount, currency, ... }
 * - Direct PaymentResponse: { paymentId, orderId, qrString, md5, amount, currency, status: 'PAID', billNumber, ... }
 * - String or primitive status responses
 */
export function normalizePaymentResponse(raw, fallbackSaleId = null) {
  if (!raw) {
    return null;
  }

  // If raw is a direct string
  if (typeof raw === 'string') {
    const rawUpper = raw.trim().toUpperCase();
    const isSuccess = ['PAID', 'SUCCESS', 'COMPLETED'].includes(rawUpper);
    return {
      saleId: fallbackSaleId,
      status: isSuccess ? 'PAID' : rawUpper,
      paymentStatus: isSuccess ? 'PAID' : rawUpper,
      paid: isSuccess,
      raw,
    };
  }

  // Unwrap envelope if present
  let data = raw;
  if (raw.data != null) {
    data = raw.data;
  } else if (raw.result != null) {
    data = raw.result;
  }

  // If data is an array (e.g. content list)
  if (Array.isArray(data)) {
    data = data[0] || {};
  }

  // If data is a string inside the envelope
  if (typeof data === 'string') {
    const dataUpper = data.trim().toUpperCase();
    const isSuccess = ['PAID', 'SUCCESS', 'COMPLETED'].includes(dataUpper);
    return {
      saleId: raw.saleId || raw.orderId || fallbackSaleId,
      status: isSuccess ? 'PAID' : dataUpper,
      paymentStatus: isSuccess ? 'PAID' : dataUpper,
      paid: isSuccess,
      raw,
    };
  }

  // Collect all potential status strings from both inner data and outer envelope
  const candidateStrings = [
    data?.paymentStatus,
    data?.status,
    data?.payment_status,
    data?.orderStatus,
    data?.saleStatus,
    data?.transactionStatus,
    data?.txnStatus,
    data?.state,
    raw?.paymentStatus,
    raw?.status,
    raw?.payment_status,
    raw?.orderStatus,
    raw?.saleStatus,
    raw?.transactionStatus,
    raw?.txnStatus,
    raw?.state,
  ]
    .filter((s) => typeof s === 'string' && s.trim())
    .map((s) => s.trim().toUpperCase());

  // Boolean paid check: explicit boolean flags or terminal success status strings
  const explicitPaid =
    data?.paid === true ||
    data?.paid === 'true' ||
    raw?.paid === true ||
    raw?.paid === 'true' ||
    data?.isPaid === true ||
    raw?.isPaid === true ||
    data?.is_paid === true ||
    raw?.is_paid === true;

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
      data?.saleId ||
      data?.orderId ||
      data?.entityId ||
      raw?.saleId ||
      raw?.orderId ||
      raw?.entityId ||
      fallbackSaleId ||
      null,
    paymentId: data?.paymentId || data?.id || raw?.paymentId || raw?.id || null,
    status: finalStatus,
    paymentStatus: finalStatus,
    paid: isPaid,
    amount:
      data?.amount != null
        ? Number(data.amount)
        : raw?.amount != null
        ? Number(raw.amount)
        : null,
    currency: data?.currency || raw?.currency || 'USD',
    qrString: data?.qrString || data?.qr || raw?.qrString || raw?.qr || null,
    qr: data?.qr || data?.qrString || raw?.qr || raw?.qrString || null,
    md5: data?.md5 || raw?.md5 || null,
    invoiceNumber:
      data?.invoiceNumber ||
      data?.billNumber ||
      raw?.invoiceNumber ||
      raw?.billNumber ||
      null,
    billNumber:
      data?.billNumber ||
      data?.invoiceNumber ||
      raw?.billNumber ||
      raw?.invoiceNumber ||
      null,
    expiresAt: data?.expiresAt || raw?.expiresAt || null,
    paidAt: data?.paidAt || raw?.paidAt || null,
    createdAt: data?.createdAt || raw?.createdAt || null,
    merchantName: data?.merchantName || raw?.merchantName || null,
    deeplinkUrl: data?.deeplinkUrl || raw?.deeplinkUrl || null,
    message: data?.message || raw?.message || null,
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
   * 1. Primary: GET /api/v1/sales/{saleId}/payment/status (actively triggers Bakong gateway check)
   * 2. Secondary: GET /api/mart/sales/{saleId}/payment-status (POS payment status route)
   * 3. Tertiary: GET /sales/{saleId} (checks if Sale entity was updated to PAID/COMPLETED by gateway/webhook)
   */
  checkStatus: async (saleId) => {
    let paymentStatusRes = null;

    // 1. Primary active gateway verification endpoint:
    // GET /api/v1/sales/{saleId}/payment/status
    try {
      const res = await apiClient.get(`/api/v1/sales/${saleId}/payment/status`);
      paymentStatusRes = normalizePaymentResponse(res.data, saleId);
      if (paymentStatusRes?.paid || paymentStatusRes?.status === 'PAID') {
        return paymentStatusRes;
      }
    } catch (primaryErr) {
      console.warn(
        `[Payment] Active payment/status notice for sale ${saleId}:`,
        primaryErr?.response?.status,
        primaryErr?.message
      );
    }

    // 2. Secondary POS route:
    // GET /api/mart/sales/{saleId}/payment-status
    try {
      const fallbackRes = await apiClient.get(`/api/mart/sales/${saleId}/payment-status`);
      const fallbackNorm = normalizePaymentResponse(fallbackRes.data, saleId);
      if (fallbackNorm?.paid || fallbackNorm?.status === 'PAID') {
        return fallbackNorm;
      }
      if (!paymentStatusRes) {
        paymentStatusRes = fallbackNorm;
      }
    } catch {
      // ignore
    }

    // 3. Tertiary check: Verified Sale entity state:
    // GET /sales/{saleId} (or /api/v1/sales/{saleId})
    try {
      const saleRes = await apiClient.get(`/sales/${saleId}`);
      const rawSale = saleRes.data;
      const saleData =
        rawSale?.data && typeof rawSale.data === 'object' ? rawSale.data : rawSale;
      const salePaymentStatus = String(saleData?.paymentStatus || '').toUpperCase();
      const saleStatus = String(saleData?.status || '').toUpperCase();
      if (
        salePaymentStatus === 'PAID' ||
        salePaymentStatus === 'SUCCESS' ||
        salePaymentStatus === 'COMPLETED' ||
        saleStatus === 'COMPLETED' ||
        saleData?.paid === true
      ) {
        return {
          ...(paymentStatusRes || {}),
          saleId,
          status: 'PAID',
          paymentStatus: 'PAID',
          paid: true,
          amount:
            saleData?.total != null
              ? Number(saleData.total)
              : paymentStatusRes?.amount,
          invoiceNumber:
            saleData?.invoiceNumber || paymentStatusRes?.invoiceNumber,
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

