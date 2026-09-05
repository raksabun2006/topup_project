import axios from 'axios';
import { apiClient } from './client';

/**
 * Safely invokes a getter function or reads a property
 */
function readPropOrGetter(obj, getterName, ...propNames) {
  if (!obj || typeof obj !== 'object') return undefined;
  if (typeof obj[getterName] === 'function') {
    try {
      const val = obj[getterName]();
      if (val !== undefined && val !== null) return val;
    } catch {
      // ignore
    }
  }
  for (const prop of propNames) {
    if (obj[prop] !== undefined && obj[prop] !== null) {
      return obj[prop];
    }
  }
  return undefined;
}

/**
 * Normalizes payment response across:
 * - Wrapped ApiResponsePaymentResponse: { success, message, data: { status, paymentStatus, paid, qr, ... } }
 * - Direct SalePaymentStatusResponse / DTO: { paid: true, paymentStatus: 'PAID', saleId, invoiceNumber, amount, currency, ... }
 * - Direct PaymentResponse: { paymentId, orderId, qrString, md5, amount, currency, status: 'PAID', billNumber, ... }
 * - Objects with getters: getSaleId(), getQr(), getPaymentStatus(), isPaid(), getAmount()
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
      paymentId: null,
      status: isSuccess ? 'PAID' : rawUpper,
      paymentStatus: isSuccess ? 'PAID' : rawUpper,
      paid: isSuccess,
      amount: null,
      currency: 'USD',
      qr: null,
      qrString: null,
      raw,
      getSaleId: () => fallbackSaleId,
      getQr: () => null,
      getPaymentStatus: () => (isSuccess ? 'PAID' : rawUpper),
      isPaid: () => isSuccess,
      getAmount: () => null,
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
    const saleIdVal = readPropOrGetter(raw, 'getSaleId', 'saleId', 'orderId') || fallbackSaleId;
    return {
      saleId: saleIdVal,
      paymentId: readPropOrGetter(raw, 'getPaymentId', 'paymentId'),
      status: isSuccess ? 'PAID' : dataUpper,
      paymentStatus: isSuccess ? 'PAID' : dataUpper,
      paid: isSuccess,
      amount: null,
      currency: 'USD',
      qr: null,
      qrString: null,
      raw,
      getSaleId: () => saleIdVal,
      getQr: () => null,
      getPaymentStatus: () => (isSuccess ? 'PAID' : dataUpper),
      isPaid: () => isSuccess,
      getAmount: () => null,
    };
  }

  // Collect all potential status strings from both inner data and outer envelope
  const candidateStrings = [
    readPropOrGetter(data, 'getPaymentStatus', 'paymentStatus'),
    readPropOrGetter(data, 'getStatus', 'status'),
    readPropOrGetter(data, 'getPayment_status', 'payment_status'),
    readPropOrGetter(data, 'getOrderStatus', 'orderStatus'),
    readPropOrGetter(data, 'getSaleStatus', 'saleStatus'),
    readPropOrGetter(data, 'getTransactionStatus', 'transactionStatus'),
    readPropOrGetter(data, 'getTxnStatus', 'txnStatus'),
    readPropOrGetter(data, 'getState', 'state'),
    readPropOrGetter(raw, 'getPaymentStatus', 'paymentStatus'),
    readPropOrGetter(raw, 'getStatus', 'status'),
    readPropOrGetter(raw, 'getPayment_status', 'payment_status'),
    readPropOrGetter(raw, 'getOrderStatus', 'orderStatus'),
    readPropOrGetter(raw, 'getSaleStatus', 'saleStatus'),
    readPropOrGetter(raw, 'getTransactionStatus', 'transactionStatus'),
    readPropOrGetter(raw, 'getTxnStatus', 'txnStatus'),
    readPropOrGetter(raw, 'getState', 'state'),
  ]
    .filter((s) => typeof s === 'string' && s.trim())
    .map((s) => s.trim().toUpperCase());

  // Boolean paid check: explicit boolean flags or terminal success status strings
  const isPaidData = readPropOrGetter(data, 'isPaid', 'paid', 'is_paid');
  const isPaidRaw = readPropOrGetter(raw, 'isPaid', 'paid', 'is_paid');

  const explicitPaid =
    isPaidData === true ||
    isPaidData === 'true' ||
    isPaidRaw === true ||
    isPaidRaw === 'true';

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

  // Strictly separate paymentId and saleId
  const rawPaymentId =
    readPropOrGetter(data, 'getPaymentId', 'paymentId') ||
    readPropOrGetter(raw, 'getPaymentId', 'paymentId') ||
    (data?.id && data.id !== fallbackSaleId ? data.id : null) ||
    (raw?.id && raw.id !== fallbackSaleId ? raw.id : null) ||
    null;

  const rawSaleId =
    readPropOrGetter(data, 'getSaleId', 'saleId', 'orderId', 'entityId') ||
    readPropOrGetter(raw, 'getSaleId', 'saleId', 'orderId', 'entityId') ||
    fallbackSaleId ||
    null;

  const rawAmountVal =
    readPropOrGetter(data, 'getAmount', 'amount') ??
    readPropOrGetter(raw, 'getAmount', 'amount');
  const rawAmount = rawAmountVal != null ? Number(rawAmountVal) : null;

  const qrValue =
    readPropOrGetter(data, 'getQr', 'qr', 'qrString', 'qr_string') ||
    readPropOrGetter(data, 'getQrString', 'qrString', 'qr', 'qr_string') ||
    readPropOrGetter(raw, 'getQr', 'qr', 'qrString', 'qr_string') ||
    readPropOrGetter(raw, 'getQrString', 'qrString', 'qr', 'qr_string') ||
    null;

  return {
    saleId: rawSaleId,
    paymentId: rawPaymentId,
    status: finalStatus,
    paymentStatus: finalStatus,
    paid: isPaid,
    amount: rawAmount,
    currency: data?.currency || raw?.currency || 'USD',
    qr: qrValue,
    qrString: qrValue,
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
    // Method getters for full compatibility
    getSaleId: () => rawSaleId,
    getQr: () => qrValue,
    getPaymentStatus: () => finalStatus,
    isPaid: () => isPaid,
    getAmount: () => rawAmount,
  };
}

export const salePaymentApi = {
  /**
   * Create payment QR. Expiration (+15 min) is controlled entirely by backend.
   * POST /api/v1/sales/{saleId}/payment
   */
  create: async (saleId, provider = 'BAKONG', config = {}) => {
    console.log(`[salePaymentApi.create] Creating payment for saleId:`, saleId);
    const res = await apiClient.post(
      `/api/v1/sales/${saleId}/payment`,
      { provider },
      config
    );
    const normalized = normalizePaymentResponse(res.data, saleId);
    console.log(`[salePaymentApi.create] Payment created:`, {
      saleId: normalized?.saleId,
      paymentId: normalized?.paymentId,
      status: normalized?.status,
    });
    return normalized;
  },

  /**
   * Retrieve existing QR and payment info without re-triggering Bakong gateway.
   * GET /api/v1/sales/{saleId}/payment
   */
  get: async (saleId, config = {}) => {
    console.log(`[salePaymentApi.get] Fetching payment for saleId:`, saleId);
    const res = await apiClient.get(`/api/v1/sales/${saleId}/payment`, config);
    return normalizePaymentResponse(res.data, saleId);
  },

  /**
   * Check & verify payment status with Bakong.
   * Active verification endpoint:
   * GET /api/v1/sales/{saleId}/payment/status (expects SALE ID)
   */
  checkStatus: async (saleId, config = {}) => {
    console.log(`[salePaymentApi.checkStatus] GET /api/v1/sales/${saleId}/payment/status (using saleId: ${saleId})`);
    const res = await apiClient.get(`/api/v1/sales/${saleId}/payment/status`, config);
    const normalized = normalizePaymentResponse(res.data, saleId);
    console.log(`[salePaymentApi.checkStatus] Result:`, {
      saleId,
      paymentId: normalized?.paymentId,
      status: normalized?.status,
      paid: normalized?.paid,
    });
    return normalized;
  },

  /**
   * Cancel payment on backend.
   * POST /api/v1/sales/payment/{paymentId}/cancel (expects PAYMENT ID)
   */
  cancel: async (paymentId, config = {}) => {
    console.log(`[salePaymentApi.cancel] POST /api/v1/sales/payment/${paymentId}/cancel (using paymentId: ${paymentId})`);
    try {
      const res = await apiClient.post(`/api/v1/sales/payment/${paymentId}/cancel`, undefined, config);
      return normalizePaymentResponse(res.data);
    } catch {
      const res = await apiClient.post(`/sales/payment/${paymentId}/cancel`, undefined, config);
      return normalizePaymentResponse(res.data);
    }
  },

  /**
   * Helper to check if an error was caused by AbortController/request cancellation
   */
  isCancel: (err) => axios.isCancel(err) || err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED',
};