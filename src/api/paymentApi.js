import { apiClient } from './client';
import { env } from '../config/env';

export const paymentApi = {
  /**
   * POST /api/v1/orders/{orderId}/payment
   * ត្រឡប់ qrString ដែលអ្នកបម្លែងទៅជារូប QR។
   *
   * expirationMinutes ត្រូវបានផ្ញើទៅ backend ដើម្បីឲ្យ KHQR generator
   * កំណត់ Tag 08 (TTL) អាស្រ័យតម្លៃនេះ - មិនប្រើតម្លៃថេរ hardcode ទេ។
   */
  create: async (orderId, provider = 'BAKONG', expirationMinutes = env.qrExpirationMinutes) => {
    const res = await apiClient.post(
      `/api/v1/orders/${orderId}/payment`,
      { provider, expirationMinutes }
    );
    return res.data.data;
  },

  /** GET - អានពីមូលដ្ឋានទិន្នន័យតែប៉ុណ្ណោះ មិនហៅ Bakong ទេ។ */
  get: async (orderId) => {
    const res = await apiClient.get(`/api/v1/orders/${orderId}/payment`);
    return res.data.data;
  },

  /**
   * GET .../payment/status - នេះជា endpoint ដែលហៅ Bakong ពិត។
   *
   * កុំហៅញឹកញាប់ជាង VITE_PAYMENT_POLL_INTERVAL_MS។ Bakong
   * អនុញ្ញាតតែ 100 សំណើក្នុងមួយថ្ងៃលើ token អ្នកអភិវឌ្ឍន៍។
   */
  checkStatus: async (orderId) => {
    const res = await apiClient.get(`/api/v1/orders/${orderId}/payment/status`);
    return res.data.data;
  },
};