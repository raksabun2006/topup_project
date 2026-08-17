import axios from 'axios';
import { env } from '../config/env';

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
// ការរក្សាទុក TOKEN
//
// localStorage ងាយស្រួល តែវាអាចអានបានដោយ JavaScript ណាមួយ
// លើទំព័រ ដូច្នេះការវាយប្រហារ XSS អាចលួច token បាន។
//
// ជម្រើសសុវត្ថិភាពជាងគឺ httpOnly cookie តែវាទាមទារឱ្យ backend
// កំណត់ cookie ជំនួសឱ្យការត្រឡប់ token ក្នុង JSON។
// សម្រាប់ការរៀន localStorage ល្អគ្រប់គ្រាន់។
// ============================================================
const ACCESS_KEY = 'gt_access_token';
const REFRESH_KEY = 'gt_refresh_token';

export const tokenStorage = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),

  set: (accessToken, refreshToken) => {
    localStorage.setItem(ACCESS_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  },

  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

// ============================================================
// INTERCEPTOR ចេញ - ភ្ជាប់ token
// ============================================================
apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================================
// INTERCEPTOR ចូល - ធ្វើឱ្យ token ថ្មីពេល 401
//
// access token មានអាយុតែ ៥ នាទី ដូច្នេះវាកើតឡើងញឹកញាប់។
// ដោយគ្មានវា អ្នកប្រើត្រូវ login ឡើងវិញរៀងរាល់ ៥ នាទី។
// ============================================================

// បើសំណើ ៥ បរាជ័យក្នុងពេលតែមួយ យើងមិនចង់ហៅ /refresh ៥ ដងទេ។
// អថេរនេះធានាថាមានតែការហៅមួយប៉ុណ្ណោះ ហើយសំណើដទៃរង់ចាំវា។
let refreshPromise = null;

let onAuthFailure = () => {};

/** AuthContext ចុះឈ្មោះ callback របស់វានៅទីនេះដើម្បី logout។ */
export function setAuthFailureHandler(handler) {
  onAuthFailure = handler;
}

apiClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const original = error.config;

    // មិនមែន 401 ឬបានព្យាយាមម្តងរួចហើយ - បញ្ជូនបន្តទៅមុខ។
    if (error.response?.status !== 401 || original._retried) {
      return Promise.reject(error);
    }

    // សំណើទៅ /auth/* មិនត្រូវព្យាយាមធ្វើឱ្យថ្មីទេ។ បើ /auth/login
    // ត្រឡប់ 401 នោះមានន័យថាពាក្យសម្ងាត់ខុស មិនមែន token ផុតទេ។
    if (original.url?.includes('/auth/')) {
      return Promise.reject(error);
    }

    original._retried = true;

    const refreshToken = tokenStorage.getRefresh();
    if (!refreshToken) {
      onAuthFailure();
      return Promise.reject(error);
    }

    try {
      // សំណើដំបូងបង្កើត promise; សំណើដទៃប្រើវាឡើងវិញ។
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken(refreshToken);
      }
      const newAccessToken = await refreshPromise;

      original.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(original);

    } catch (refreshError) {
      // Refresh token ក៏ផុតកំណត់ដែរ - ត្រូវ login ថ្មី។
      tokenStorage.clear();
      onAuthFailure();
      return Promise.reject(refreshError);

    } finally {
      refreshPromise = null;
    }
  }
);

/**
 * ប្រើ axios ធម្មតា មិនមែន apiClient ទេ។
 *
 * ការប្រើ apiClient នៅទីនេះនឹងបង្កើតរង្វិលជុំមិនចេះចប់: refresh
 * បរាជ័យ -> 401 -> interceptor -> refresh -> បរាជ័យ -> ...
 *
 * ចំណាំ: backend យក refreshToken ជា QUERY PARAM មិនមែន body ទេ។
 */
async function refreshAccessToken(refreshToken) {
  const response = await axios.post(
    `${env.apiBaseUrl}/api/v1/auth/refresh`,
    null,
    { params: { refreshToken } }
  );

  const data = response.data.data;
  tokenStorage.set(data.access_token, data.refresh_token);
  return data.access_token;
}

/**
 * បម្លែង error ពី Axios ទៅជាសារដែលអាចបង្ហាញដល់អ្នកប្រើ។
 *
 * Backend ត្រឡប់ { success, message, data }។ យើងចង់បាន message
 * នោះ មិនមែន "Request failed with status code 409" ទេ។
 */
export function getErrorMessage(error) {
  const backendMessage = error?.response?.data?.message;
  if (backendMessage) return backendMessage;

  if (error?.code === 'ECONNABORTED') {
    return 'សំណើលើសពេលកំណត់។ សូមព្យាយាមម្តងទៀត។';
  }
  if (!error?.response) {
    return 'មិនអាចភ្ជាប់ទៅ server បានទេ។ សូមពិនិត្យអ៊ីនធឺណិត។';
  }
  return 'មានបញ្ហាកើតឡើង។ សូមព្យាយាមម្តងទៀត។';
}