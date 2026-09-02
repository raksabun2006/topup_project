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
    // Prevent duplicate /api/v1 prefix if URL already includes it
    if (config.url) {
      if (config.url.startsWith('/api/v1/')) {
        config.url = config.url.replace(/^\/api\/v1/, '');
      } else if (config.url === '/api/v1') {
        config.url = '/';
      }
    }

    const token =
      (await authClient.ensureFreshToken()) ||
      authClient.getAccessToken() ||
      localStorage.getItem('access_token') ||
      localStorage.getItem('pos_access_token') ||
      localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
  console.error(error);
  const status = error?.response?.status;
  const data = error?.response?.data;

  // Custom domain errors from backend body if provided
  if (data?.code === 'INSUFFICIENT_STOCK') {
    return data.details?.available != null
      ? `ស្តុកមិនគ្រប់គ្រាន់ - នៅសល់ត្រឹម ${data.details.available}`
      : (data.message || 'ស្តុកមិនគ្រប់គ្រាន់');
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

  // Network error (no response)
  if (!error?.response) {
    if (error?.code === 'ECONNABORTED') {
      return 'សំណើលើសពេលកំណត់។ សូមព្យាយាមម្តងទៀត។ (Request timed out. Please try again.)';
    }
    return 'មិនអាចភ្ជាប់ទៅ Server បានទេ។ សូមពិនិត្យ Internet របស់អ្នក។ (Cannot connect to server. Please check your internet connection.)';
  }

  // 401: Unauthorized
  if (status === 401) {
    return 'សូមចូលគណនីឡើងវិញ (Authentication required)';
  }

  // 403: Forbidden
  if (status === 403) {
    return 'អ្នកមិនមានសិទ្ធិប្រើប្រាស់មុខងារនេះទេ (Permission denied)';
  }

  // 404: Not Found
  if (status === 404) {
    return 'រកមិនឃើញទិន្នន័យ (Resource or order not found)';
  }

  // 409: Conflict
  if (status === 409) {
    return data?.message && !looksLikeRawException(data.message)
      ? data.message
      : 'ទិន្នន័យជាន់គ្នា ឬការទូទាត់ត្រូវបានដំណើរការរួចហើយ (Conflict / Already processed)';
  }

  // 422: Unprocessable Entity
  if (status === 422) {
    return data?.message && !looksLikeRawException(data.message)
      ? data.message
      : 'ទិន្នន័យមិនត្រឹមត្រូវទេ (Unprocessable entity)';
  }

  // 429: Too Many Requests
  if (status === 429) {
    return 'សំណើច្រើនពេកក្នុងពេលតែមួយ។ សូមរង់ចាំបន្តិច។ (Too many requests. Please wait a moment.)';
  }

  // 500, 502, 503: Server Error / Provider Error / Unavailable
  if (status === 500 || status === 502 || status === 503) {
    return 'Server កំពុងមានបញ្ហា';
  }

  // Use clean backend message if not a raw stack trace
  if (data?.message && !looksLikeRawException(data.message)) {
    return data.message;
  }

  return 'មានបញ្ហាកើតឡើង។ សូមព្យាយាមម្តងទៀត។ (An unexpected error occurred)';
}