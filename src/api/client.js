import axios from 'axios';
import { env } from '../config/env';
import { authClient } from '../config/authClient';

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

// Outbound Interceptor: Normalizes URL and attaches JWT token for protected requests
apiClient.interceptors.request.use(async (config) => {
  try {
    // Prevent duplicate /api/v1 or /api prefix if URL already includes it
    if (config.url) {
      if (config.url.startsWith('/api/v1/')) {
        config.url = config.url.replace(/^\/api\/v1/, '');
      } else if (config.url === '/api/v1') {
        config.url = '/';
      } else if (config.url.startsWith('/api/')) {
        config.url = config.url.replace(/^\/api/, '');
      }
    }

    // Guest checkout / public auth requests: Do NOT attach Authorization header
    if (config.isGuest || config.headers?.isGuest || config.skipAuth) {
      if (config.headers) {
        delete config.headers.Authorization;
        delete config.headers.authorization;
        delete config.headers.isGuest;
      }
      return config;
    }

    const token =
      (await authClient.ensureFreshToken()) ||
      authClient.getAccessToken() ||
      localStorage.getItem('access_token') ||
      localStorage.getItem('pos_access_token') ||
      localStorage.getItem('token');

    if (token && typeof token === 'string' && token !== 'null' && token !== 'undefined' && token.trim().length > 10) {
      config.headers.Authorization = `Bearer ${token.trim()}`;
    } else if (config.headers) {
      delete config.headers.Authorization;
      delete config.headers.authorization;
    }
  } catch (err) {
    // Silent catch to prevent request abortion
  }
  return config;
});

// Inbound Interceptor: Handles 401 responses gracefully
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear token only if one was previously stored (silent session cleanup)
      authClient.triggerSessionExpired();
    }
    return Promise.reject(error);
  }
);

function isSensitiveOrTechnical(message) {
  if (typeof message !== 'string') return false;
  const sensitivePatterns = [
    /(^|[.\s])[a-z0-9_]+(\.[a-z0-9_]+)+\.[A-Z]\w*Exception\b/i,
    /org\.springframework/i,
    /java\.(lang|util|sql|io)/i,
    /at\s+[a-z0-9_$.]+\([a-z0-9_]+\.java:\d+\)/i,
    /nested exception is/i,
    /hibernate/i,
    /jdbc/i,
    /sql\s*(syntax|state|error)/i,
    /NullPointerException/i,
    /Cannot deserialize/i,
    /org\.apache/i,
    /com\.zaxxer/i,
    /password/i,
    /secret/i,
    /credential/i,
    /connection refused/i,
    /d:\\/i,
    /\/var\/log/i,
  ];
  return sensitivePatterns.some((pattern) => pattern.test(message));
}

export function getErrorMessage(error) {
  if (!error) return 'Something went wrong. Please try again.';
  if (typeof error === 'string') {
    return isSensitiveOrTechnical(error) ? 'Something went wrong. Please try again.' : error;
  }

  const status = error?.response?.status;
  const data = error?.response?.data;

  // Extract backend message if present
  let backendMsg = null;
  if (data) {
    if (typeof data === 'string' && !isSensitiveOrTechnical(data)) {
      backendMsg = data;
    } else if (typeof data === 'object') {
      if (data.message && typeof data.message === 'string' && !isSensitiveOrTechnical(data.message)) {
        backendMsg = data.message;
      } else if (data.error && typeof data.error === 'string' && !isSensitiveOrTechnical(data.error)) {
        backendMsg = data.error;
      } else if (data.error_description && typeof data.error_description === 'string' && !isSensitiveOrTechnical(data.error_description)) {
        backendMsg = data.error_description;
      }
    }
  }

  // Custom domain field validation errors if provided
  if (data?.code === 'VALIDATION_FAILED' && data?.details && typeof data.details === 'object') {
    const fields = Object.entries(data.details)
      .filter(([_, msg]) => typeof msg === 'string' && !isSensitiveOrTechnical(msg))
      .map(([field, msg]) => `${field}: ${msg}`);
    if (fields.length > 0) return fields.join(' · ');
  }

  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    const cleanErrors = data.errors
      .filter((e) => e && (e.message || typeof e === 'string'))
      .map((e) => {
        const msg = typeof e === 'string' ? e : e.message;
        if (isSensitiveOrTechnical(msg)) return null;
        return e.field ? `${e.field}: ${msg}` : msg;
      })
      .filter(Boolean);
    if (cleanErrors.length > 0) return cleanErrors.join(' · ');
  }

  // Network error (no response received from server)
  if (!error?.response) {
    if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    return 'Unable to connect to the server. Please check your internet connection.';
  }

  // Standard HTTP status code mappings
  switch (status) {
    case 400:
      return backendMsg || 'Please check your information.';
    case 401:
      if (backendMsg && !backendMsg.includes('Full authentication') && !backendMsg.includes('Unauthorized')) {
        return backendMsg;
      }
      return 'Invalid email or password.';
    case 403:
      return backendMsg || "You don't have permission to perform this action.";
    case 404:
      return backendMsg || 'The requested resource was not found.';
    case 409:
      return backendMsg || 'This email is already registered.';
    case 422:
      return backendMsg || 'The submitted data was invalid.';
    case 429:
      return 'Too many requests. Please try again later.';
    case 500:
      return 'Something went wrong. Please try again.';
    case 502:
    case 503:
    case 504:
      return 'Service temporarily unavailable. Please try again later.';
    default:
      if (backendMsg) return backendMsg;
      if (status >= 500) return 'Something went wrong. Please try again.';
      return 'Something went wrong. Please try again.';
  }
}