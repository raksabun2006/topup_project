/**
 * Centralized Environment Configuration
 * Reads Vite environment variables safely and enforces HTTPS for production API communication.
 */

const rawEnv = (typeof import.meta !== 'undefined' && import.meta.env) || (typeof process !== 'undefined' && process.env) || {};

const PRODUCTION_BACKEND_URL = 'https://gametopup-backend-production-3423.up.railway.app';
const PRODUCTION_WS_URL = 'wss://gametopup-backend-production-3423.up.railway.app/ws';

function resolveApiUrl() {
  const envUrl = (
    rawEnv.VITE_API_URL ||
    rawEnv.VITE_API_BASE_URL ||
    ''
  ).trim().replace(/\/+$/, '');

  if (envUrl) {
    // Relative path for same-origin reverse proxy (e.g. /api/v1 or /api)
    if (envUrl.startsWith('/')) {
      return envUrl;
    }
    // In production or when hosted over HTTPS, enforce HTTPS protocol to avoid mixed-content blocks
    if (rawEnv.PROD && envUrl.startsWith('http://') && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      return envUrl.replace(/^http:\/\//i, 'https://');
    }
    return envUrl;
  }

  // In production (Vercel / martsystemkh.software), use same-origin relative '/api/v1' to proxy securely
  if (
    rawEnv.PROD ||
    (typeof window !== 'undefined' && window.location && window.location.protocol === 'https:' && !window.location.hostname.includes('localhost'))
  ) {
    return '/api/v1';
  }

  return 'http://localhost:8080';
}

function resolveWsUrl(backendUrl) {
  const envWs = (rawEnv.VITE_WS_URL || '').trim();
  if (envWs) {
    if (rawEnv.PROD && envWs.startsWith('ws://') && !envWs.includes('localhost') && !envWs.includes('127.0.0.1')) {
      return envWs.replace(/^ws:\/\//i, 'wss://');
    }
    return envWs;
  }

  // Fallback based on backend URL or environment
  if (rawEnv.PROD || (typeof window !== 'undefined' && window.location && window.location.protocol === 'https:' && !window.location.hostname.includes('localhost'))) {
    return PRODUCTION_WS_URL;
  }

  if (backendUrl && backendUrl.startsWith('https://')) {
    return backendUrl.replace(/^https:\/\//i, 'wss://') + '/ws';
  }
  if (backendUrl && backendUrl.startsWith('http://')) {
    return backendUrl.replace(/^http:\/\//i, 'ws://') + '/ws';
  }

  return 'ws://localhost:8080/ws';
}

const rawApiUrl = resolveApiUrl();
const rawBackendUrl = rawApiUrl.startsWith('http') ? rawApiUrl.replace(/\/api\/v1$/, '') : '';
const rawWsUrl = resolveWsUrl(rawBackendUrl);

export const env = {
  // Base URL for API requests (guarantees /api/v1 prefix)
  apiBaseUrl: rawApiUrl.endsWith('/api/v1') ? rawApiUrl : `${rawApiUrl}/api/v1`,

  // Base URL without /api/v1 prefix (or production backend URL for absolute links)
  backendUrl: rawBackendUrl || PRODUCTION_BACKEND_URL,

  // WebSocket URL for STOMP real-time notification client
  wsUrl: rawWsUrl,

  // HTTP/HTTPS endpoint for SockJS fallback
  sockJsUrl: `${rawBackendUrl || PRODUCTION_BACKEND_URL}/ws`,

  // Application Display Name
  appName: rawEnv.VITE_APP_NAME ?? 'Mart System',

  // Official production URL for SEO & Canonical links
  siteUrl: (rawEnv.VITE_SITE_URL || 'https://martsystemkh.software').replace(/\/+$/, ''),

  // Bakong QR polling in POS checkout: 3000ms default
  paymentPollIntervalMs: Number(
    rawEnv.VITE_PAYMENT_POLL_INTERVAL_MS ?? 3000
  ),

  // Google OAuth 2.0 Client ID for customer sign-in (Public)
  googleClientId: rawEnv.VITE_GOOGLE_CLIENT_ID || '',
};