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

    // Guest checkout: Do NOT attach Authorization header
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
    console.warn('Token check notice:', err);
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

function looksLikeRawException(message) {
  if (typeof message !== 'string') return false;
  return /(^|[.\s])[a-z]+(\.[a-z]+)+\.[A-Z]\w*Exception\b/.test(message);
}

export function getErrorMessage(error) {
  if (!error) return 'មានបញ្ហាកើតឡើង។ សូមព្យាយាមម្តងទៀត។ (An unexpected error occurred)';
  if (typeof error === 'string') return error;

  console.error(error);
  const status = error?.response?.status;
  const data = error?.response?.data;

  // Extract clean backend message if present
  let backendMsg = null;
  if (data) {
    if (typeof data === 'string') {
      backendMsg = data;
    } else if (typeof data === 'object') {
      if (data.message && !looksLikeRawException(data.message)) {
        backendMsg = data.message;
      } else if (data.error && typeof data.error === 'string') {
        backendMsg = data.error;
      } else if (data.error_description && typeof data.error_description === 'string') {
        backendMsg = data.error_description;
      }
    }
  }

  // Custom domain errors from backend body if provided
  if (data?.code === 'INSUFFICIENT_STOCK') {
    return data.details?.available != null
      ? `ស្តុកមិនគ្រប់គ្រាន់ - នៅសល់ត្រឹម ${data.details.available}`
      : (backendMsg || 'ស្តុកមិនគ្រប់គ្រាន់');
  }

  if (data?.code === 'VALIDATION_FAILED' && data?.details && typeof data.details === 'object') {
    return Object.entries(data.details)
      .map(([field, msg]) => `${field}: ${msg}`)
      .join(' · ');
  }

  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors
      .map((e) => (e.field ? `${e.field}: ${e.message}` : e.message))
      .join(' · ');
  }

  // Network error (no response received from server)
  if (!error?.response) {
    if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
      return 'Network error: សំណើលើសពេលកំណត់។ សូមព្យាយាមម្តងទៀត។ (Request timed out)';
    }
    const netDetails = error?.message ? ` (${error.message})` : '';
    return `Network error: មិនអាចភ្ជាប់ទៅកាន់ Server បានទេ។ សូមពិនិត្យ Internet របស់អ្នក។${netDetails}`;
  }

  // 401 Unauthorized
  if (status === 401) {
    const detail = backendMsg ? `: ${backendMsg}` : '';
    return `401 Unauthorized: សូមចូលគណនីឡើងវិញ (Authentication required${detail})`;
  }

  // 403 Forbidden
  if (status === 403) {
    const detail = backendMsg ? `: ${backendMsg}` : '';
    return `403 Forbidden: អ្នកមិនមានសិទ្ធិប្រើប្រាស់មុខងារនេះទេ (Permission denied${detail})`;
  }

  // 404 Not Found
  if (status === 404) {
    const detail = backendMsg ? `: ${backendMsg}` : '';
    return `404 Not Found: រកមិនឃើញទិន្នន័យ (Resource not found${detail})`;
  }

  // 409 Conflict
  if (status === 409) {
    return backendMsg || '409 Conflict: ទិន្នន័យជាន់គ្នា ឬការទូទាត់ត្រូវបានដំណើរការរួចហើយ (Conflict / Already processed)';
  }

  // 422 Unprocessable Entity
  if (status === 422) {
    return backendMsg || '422 Unprocessable Entity: ទិន្នន័យមិនត្រឹមត្រូវទេ';
  }

  // 429 Too Many Requests
  if (status === 429) {
    return '429 Too Many Requests: សំណើច្រើនពេកក្នុងពេលតែមួយ។ សូមរង់ចាំបន្តិច។';
  }

  // 500, 502, 503, 504: Server Error
  if (status >= 500) {
    const detail = backendMsg ? `: ${backendMsg}` : '';
    return `500 Server Error: Server កំពុងមានបញ្ហា (Internal Server Error${detail})`;
  }

  // If backend provided a specific message, display it
  if (backendMsg) {
    return backendMsg;
  }

  if (error?.message) {
    return error.message;
  }

  return 'មានបញ្ហាកើតឡើង។ សូមព្យាយាមម្តងទៀត។ (An unexpected error occurred)';
}