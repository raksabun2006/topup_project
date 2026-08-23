import axios from 'axios';
import { env } from '../config/env';
import { authClient } from '../config/authClient';

/**
 * Axios instance តែមួយសម្រាប់កម្មវិធីទាំងមូល។
 *
 * មិនត្រូវហៅ axios.get() ដោយផ្ទាល់នៅកន្លែងណាទេ - បើធ្វើដូច្នេះ
 * សំណើនោះនឹងខកខាន token និងការដោះស្រាយ 401។
 */
export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ============================================================
// INTERCEPTOR ចេញ - ភ្ជាប់ token
//
// authClient គ្រប់គ្រង token storage/refresh ដោយខ្លួនឯង។
// ensureFreshToken() ធ្វើ token ថ្មីស្វ័យប្រវត្តិបើជិតផុតកំណត់ បើមិន
// ដូច្នេះទេ វា resolve ភ្លាមៗដោយប្រើ token ដដែល។
// ============================================================
apiClient.interceptors.request.use(async (config) => {
  const token = await authClient.ensureFreshToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================================
// INTERCEPTOR ចូល - ព្យាយាមធ្វើ token ថ្មីម្តងទៀតពេល 401
// ============================================================
apiClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const original = error.config;

    // មិនមែន 401 ឬបានព្យាយាមម្តងរួចហើយ - បញ្ជូនបន្តទៅមុខ។
    if (error.response?.status !== 401 || original._retried) {
      return Promise.reject(error);
    }

    // មិនធ្លាប់មាន session ទេ (ឧ. ការហៅពីទំព័រសាធារណៈដូច ចុះឈ្មោះ) -
    // នេះមិនមែនករណី session ផុតកំណត់ទេ ដូច្នេះទុកឲ្យ caller បង្ហាញ
    // error message ខ្លួនឯង។
    if (!authClient.isAuthenticated()) {
      return Promise.reject(error);
    }
    original._retried = true;

    const token = await authClient.ensureFreshToken();
    if (token) {
      original.headers.Authorization = `Bearer ${token}`;
      return apiClient(original);
    }
    // ensureFreshToken() ខ្លួនឯងហើយហៅ onSessionExpired ស្រាប់ (AuthContext
    // នឹង set isAuthenticated=false ហើយ ProtectedRoute បញ្ជូនទៅ /login)។
    return Promise.reject(error);
  }
);

// Stack-trace-looking message (ឧ. "jakarta.ws.rs.NotAuthorizedException: HTTP 401
// Unauthorized" ដែល backend leak ចេញផ្ទាល់ពី exception ដោយមិនចាប់) - កុំបង្ហាញ
// ដល់អ្នកប្រើ ព្រោះលាតត្រដាង implementation detail ខាងក្នុង។
function looksLikeRawException(message) {
  return /(^|[.\s])[a-z]+(\.[a-z]+)+\.[A-Z]\w*Exception\b/.test(message);
}

/**
 * បម្លែង error ពី Axios ទៅជាសារដែលអាចបង្ហាញដល់អ្នកប្រើ។
 *
 * Backend មានទម្រង់ error ចម្រុះ៖
 *  - ថ្មីបំផុត (sale module): { code, message, details, timestamp } - code ក្នុង
 *    ចំណោម INSUFFICIENT_STOCK/NOT_FOUND/INVALID_SALE/VALIDATION_FAILED/INTERNAL_ERROR
 *    (VALIDATION_FAILED: details ជា map field path -> message)
 *  - ចាស់ (users/me, orders): { success, message, data }
 *  - ចាស់ (auth/register validation): { status, code, message, errors: [{field, message}] }
 *  - Spring Boot default (unhandled exception): { error, message, status, timestamp }
 * ព្យាយាមទាញយក message ជាក់លាក់បំផុតដែលមាន។ console.error លើ error ដើម
 * ជានិច្ច ដើម្បីមូលហេតុពិត (stack, response ពេញលេញ) នៅតែឃើញក្នុង devtools
 * ទោះបីសារបង្ហាញដល់អ្នកប្រើខ្លីជាងក៏ដោយ។
 */
export function getErrorMessage(error) {
  console.error(error);
  const data = error?.response?.data;

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

  if (data?.message && !looksLikeRawException(data.message)) {
    return data.message;
  }

  if (error?.code === 'ECONNABORTED') {
    return 'សំណើលើសពេលកំណត់។ សូមព្យាយាមម្តងទៀត។';
  }
  if (!error?.response) {
    return 'មិនអាចភ្ជាប់ទៅ server បានទេ។ សូមពិនិត្យអ៊ីនធឺណិត។';
  }
  return 'មានបញ្ហាកើតឡើង។ សូមព្យាយាមម្តងទៀត។';
}
