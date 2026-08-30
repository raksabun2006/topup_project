import axios from 'axios';
import { env } from '../config/env';
import { authClient } from '../config/authClient';

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

// Outbound Interceptor: Normalizes URL and attaches JWT token
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
    console.warn('Failed to get token before request:', err);
    const storedToken =
      authClient.getAccessToken() ||
      localStorage.getItem('access_token') ||
      localStorage.getItem('pos_access_token');
    if (storedToken) {
      config.headers.Authorization = `Bearer ${storedToken}`;
    }
  }
  return config;
});

// Inbound Interceptor: Handles 401 responses
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear token & auth state
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

  // 401: Unauthorized / Login required
  if (status === 401) {
    return 'ឈ្មោះអ្នកប្រើ ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ ឬតម្រូវឱ្យចូលគណនីឡើងវិញ (Authentication required)';
  }

  // 403: Forbidden / Permission denied
  if (status === 403) {
    return 'អ្នកមិនមានសិទ្ធិអនុវត្តសកម្មភាពនេះទេ (Permission denied)';
  }

  // 404: Not Found (Payment / Order not found)
  if (status === 404) {
    return 'មិនស្វែងរកឃើញទិន្នន័យការទូទាត់ ឬការលក់នេះទេ (Payment or order not found)';
  }

  // 409: Conflict (Duplicate / Payment already processed)
  if (status === 409) {
    return data?.message && !looksLikeRawException(data.message)
      ? data.message
      : 'ការទូទាត់ត្រូវបានដំណើរការរួចហើយ ឬទិន្នន័យជាន់គ្នា (Payment already processed or conflict)';
  }

  // 422: Unprocessable Entity (Invalid payment data)
  if (status === 422) {
    return data?.message && !looksLikeRawException(data.message)
      ? data.message
      : 'ទិន្នន័យការទូទាត់មិនត្រឹមត្រូវទេ (Invalid payment data)';
  }

  // 503: Service Unavailable (Bakong / payment provider down)
  if (status === 503) {
    return 'សេវាទូទាត់ Bakong KHQR មិនដំណើរការបណ្តោះអាសន្ន (Payment provider unavailable)';
  }

  // Use clean backend message if not a raw stack trace
  if (data?.message && !looksLikeRawException(data.message)) {
    return data.message;
  }

  // 500: Internal Server Error
  if (status === 500) {
    return 'មានបញ្ហាកើតឡើងនៅម៉ាស៊ីនមេ។ សូមព្យាយាមម្តងទៀត។ (Server error. Please try again later)';
  }

  if (error?.code === 'ECONNABORTED') {
    return 'សំណើលើសពេលកំណត់។ សូមព្យាយាមម្តងទៀត។';
  }
  if (!error?.response) {
    return 'មិនអាចភ្ជាប់ទៅ server បានទេ។ សូមពិនិត្យអ៊ីនធឺណិត។';
  }
  return 'មានបញ្ហាកើតឡើង។ សូមព្យាយាមម្តងទៀត។';
}