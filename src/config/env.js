/**
 * Centralized Environment Configuration
 * Reads Vite environment variables safely and enforces HTTPS for production API communication.
 */

function resolveApiUrl() {
  const envUrl = (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    ''
  ).trim().replace(/\/+$/, '');

  if (envUrl) {
    // In production or when hosted over HTTPS, enforce HTTPS protocol to avoid mixed-content blocks
    if (import.meta.env.PROD && envUrl.startsWith('http://') && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      return envUrl.replace(/^http:\/\//i, 'https://');
    }
    return envUrl;
  }

  // Production fallback uses secure HTTPS Railway backend
  if (import.meta.env.PROD) {
    return 'https://gametopup-backend-production-3423.up.railway.app';
  }

  return 'http://localhost:8080';
}

const rawApiUrl = resolveApiUrl();

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