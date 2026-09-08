/**
 * Centralized Environment Configuration
 * Reads Vite environment variables safely.
 * Prioritizes VITE_API_URL and supports VITE_API_BASE_URL.
 */

const rawApiUrl = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8080'
).replace(/\/+$/, '');

export const env = {
  // Base URL for API requests (guarantees /api/v1 prefix)
  apiBaseUrl: rawApiUrl.endsWith('/api/v1') ? rawApiUrl : `${rawApiUrl}/api/v1`,

  // Base URL without /api/v1 prefix
  backendUrl: rawApiUrl.replace(/\/api\/v1$/, ''),

  // Application Display Name
  appName: import.meta.env.VITE_APP_NAME ?? 'Mart System',

  // Official production URL for SEO & Canonical links
  siteUrl: (import.meta.env.VITE_SITE_URL || 'https://martsystemkh.software').replace(/\/+$/, ''),

  // Bakong QR polling in POS checkout: 3000ms default
  paymentPollIntervalMs: Number(
    import.meta.env.VITE_PAYMENT_POLL_INTERVAL_MS ?? 3000
  ),

  // Google OAuth 2.0 Client ID for customer sign-in (Public)
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
};