/**
 * ចំណុចតែមួយគត់ដែលអាន import.meta.env។
 * គាំទ្រទាំង VITE_API_BASE_URL និង VITE_API_URL
 */

const rawApiUrl = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'https://gametopup-backend-production-3423.up.railway.app'
).replace(/\/+$/, '');

export const env = {
  // Base URL for API requests (guarantees /api/v1 prefix)
  apiBaseUrl: rawApiUrl.endsWith('/api/v1') ? rawApiUrl : `${rawApiUrl}/api/v1`,

  // Base URL without /api/v1 prefix
  backendUrl: rawApiUrl.replace(/\/api\/v1$/, ''),

  appName: import.meta.env.VITE_APP_NAME ?? 'Mart System',

  // Official production URL for SEO & Canonical links
  siteUrl: (import.meta.env.VITE_SITE_URL || 'https://www.martsystemkh.software').replace(/\/+$/, ''),

  // Bakong QR polling ក្នុង POS checkout: 10–15s មួយដង (លំនាំដើម 12 វិនាទី)
  paymentPollIntervalMs: Number(
    import.meta.env.VITE_PAYMENT_POLL_INTERVAL_MS ?? 12000
  ),
};