/**
 * ចំណុចតែមួយគត់ដែលអាន import.meta.env។
 * គាំទ្រទាំង VITE_API_BASE_URL និង VITE_API_URL
 */

const rawApiUrl = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'https://mart-api-rubm.onrender.com/api/v1'
).replace(/\/+$/, '');

export const env = {
  apiBaseUrl: rawApiUrl.endsWith('/api/v1') ? rawApiUrl : `${rawApiUrl}/api/v1`,

  appName: import.meta.env.VITE_APP_NAME ?? 'Mart System',

  // Official production URL for SEO & Canonical links
  siteUrl: (import.meta.env.VITE_SITE_URL || 'https://topup-project.vercel.app').replace(/\/+$/, ''),

  // Bakong QR polling ក្នុង POS checkout: 3s មួយដង
  paymentPollIntervalMs: Number(
    import.meta.env.VITE_PAYMENT_POLL_INTERVAL_MS ?? 3000
  ),
};