import { apiClient } from './client';
import { env } from '../config/env';

/**
 * ⚠️ PROPOSED CONTRACT - endpoint ទាំងនេះមិនទាន់មាននៅ backend ទេ
 * (ត្រូវអនុវត្តដោយ backend dev)។ រចនាឡើងឲ្យដូច PaymentResponse ចាស់
 * (orders/{orderId}/payment) ដែលដំណើរការស្រាប់ តែផ្លាស់ orderId ->
 * saleId ដើម្បីភ្ជាប់ទៅ Sale ពិត (គាំទ្រ cart ច្រើនធាតុ/quantity
 * ដោយសេរី - មិនដូច Order bridge ចាស់ដែលកំណត់ត្រឹមទំនិញមួយប្រភេទ
 * ចំនួន ១ ទេ)។
 *
 * POST   /api/v1/sales/{saleId}/payment         { provider, expirationMinutes } -> PaymentResponse
 * GET    /api/v1/sales/{saleId}/payment         -> PaymentResponse
 * GET    /api/v1/sales/{saleId}/payment/status  -> PaymentResponse (ហៅ Bakong ពិត)
 * POST   /api/v1/sales/{saleId}/payment/cancel  -> PaymentResponse
 *
 * PaymentResponse ដដែលនឹង schema ចាស់ តែ orderId ប្តូរជា saleId:
 * { paymentId, saleId, qrString, md5, amount, currency, status,
 *   billNumber, expiresAt, createdAt, provider?, deeplinkUrl? }
 *
 * ចម្លើយសន្មត់ថាមិនរុំក្នុង {success,message,data} ទេ - ដូច endpoint
 * ផ្សេងទៀតក្នុង module sale (/api/v1/sales*) ដែលទាំងអស់ត្រឡប់ DTO
 * ដោយផ្ទាល់។ បើ backend ជ្រើសរើសរុំវិញ សូមកែ res.data -> res.data.data
 * ខាងក្រោម។
 */
export const salePaymentApi = {
  create: async (saleId, provider = 'BAKONG', expirationMinutes = env.qrExpirationMinutes) => {
    const res = await apiClient.post(`/api/v1/sales/${saleId}/payment`, {
      provider,
      expirationMinutes,
    });
    return res.data;
  },

  get: async (saleId) => {
    const res = await apiClient.get(`/api/v1/sales/${saleId}/payment`);
    return res.data;
  },

  checkStatus: async (saleId) => {
    const res = await apiClient.get(`/api/v1/sales/${saleId}/payment/status`);
    return res.data;
  },

  cancel: async (saleId) => {
    const res = await apiClient.post(`/api/v1/sales/${saleId}/payment/cancel`);
    return res.data;
  },
};
