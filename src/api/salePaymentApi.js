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
/**
 * ករណីខ្លះ backend រុំចម្លើយក្នុង { message, data } (ដូច endpoint ចាស់មួយចំនួន)
 * ករណីខ្លះទៀតត្រឡប់ PaymentResponse ដោយផ្ទាល់ (ដូចឯកសារខាងលើសន្មត់)។ មិន
 * ដឹងច្បាស់មួយណាត្រូវសម្រាប់ endpoint នេះទេ ដូច្នេះទទួលយកទាំងពីរបែប -
 * បើ body.status គ្មាន តែ body.data.status មាន ទាញ .data ជំនួសវិញ។
 */
function unwrapPaymentResponse(body) {
  if (body && typeof body === 'object' && body.status === undefined && body.data && typeof body.data === 'object') {
    return body.data;
  }
  return body;
}

export const salePaymentApi = {
  create: async (saleId, provider = 'BAKONG', expirationMinutes = env.qrExpirationMinutes) => {
    const res = await apiClient.post(`/api/v1/sales/${saleId}/payment`, {
      provider,
      expirationMinutes,
    });
    return unwrapPaymentResponse(res.data);
  },

  get: async (saleId) => {
    const res = await apiClient.get(`/api/v1/sales/${saleId}/payment`);
    return unwrapPaymentResponse(res.data);
  },

  checkStatus: async (saleId) => {
    const res = await apiClient.get(`/api/v1/sales/${saleId}/payment/status`);
    return unwrapPaymentResponse(res.data);
  },

  cancel: async (saleId) => {
    const res = await apiClient.post(`/api/v1/sales/${saleId}/payment/cancel`);
    return unwrapPaymentResponse(res.data);
  },
};
