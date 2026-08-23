import { env } from './env';

/**
 * ជំនួស keycloak-js SDK - Login.jsx ជា form ក្នុង app ដោយផ្ទាល់ ជំនួស
 * ការ redirect ទៅ Keycloak hosted page។ ប្រើ Direct Access Grant
 * (grant_type=password) ហៅទៅ Keycloak token endpoint ដោយផ្ទាល់។
 *
 * ⚠️ តម្រូវការសំខាន់លើ Keycloak client (គូរធ្វើដោយ admin, មិនមែនកូដ):
 *   1. "Direct Access Grants Enabled" ត្រូវបើកលើ client (gametopup-api)
 *      ក្នុង Keycloak admin console - បិទដោយលំនាំដើម។
 *   2. Web Origins របស់ client ត្រូវរួម http://localhost:5173 (ឬ origin
 *      ពិតប្រាកដ) ដើម្បីឲ្យ browser អាចហៅ token endpoint ដោយផ្ទាល់បាន
 *      ដោយគ្មាន CORS block។
 *
 * refresh_token រក្សាទុកក្នុង localStorage ដើម្បីអាចស្តារ session វិញ
 * ពេល reload ទំព័រ។ access_token រក្សាទុកតែក្នុង memory (មិនត្រូវទុក
 * localStorage ព្រោះមានហានិភ័យ XSS ខ្ពស់ជាង - refresh token ខ្លីជាង
 * scope ក៏ត្រូវការតែម្តងសម្រាប់ refresh ថ្មីតែប៉ុណ្ណោះ)។
 */
const TOKEN_ENDPOINT = `${env.keycloak.url}/realms/${env.keycloak.realm}/protocol/openid-connect/token`;
const LOGOUT_ENDPOINT = `${env.keycloak.url}/realms/${env.keycloak.realm}/protocol/openid-connect/logout`;
const STORAGE_KEY = 'pos_refresh_token';
const REFRESH_SKEW_MS = 15000;

let accessToken = null;
let refreshToken = null;
let tokenParsed = null;
let expiresAt = 0;
let onSessionExpired = null;
let refreshPromise = null;

function decodeJwt(token) {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  return JSON.parse(decodeURIComponent(escape(atob(padded))));
}

function setSession(data) {
  accessToken = data.access_token;
  refreshToken = data.refresh_token ?? refreshToken;
  tokenParsed = decodeJwt(accessToken);
  expiresAt = Date.now() + data.expires_in * 1000;
  if (refreshToken) {
    localStorage.setItem(STORAGE_KEY, refreshToken);
  }
}

function clearSession() {
  accessToken = null;
  refreshToken = null;
  tokenParsed = null;
  expiresAt = 0;
  localStorage.removeItem(STORAGE_KEY);
}

async function tokenRequest(params) {
  const body = new URLSearchParams({ client_id: env.keycloak.clientId, ...params });
  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(data.error_description || data.error || 'ចូលគណនីមិនបានទេ');
    err.code = data.error;
    throw err;
  }
  return res.json();
}

export const authClient = {
  setOnSessionExpired(callback) {
    onSessionExpired = callback;
  },

  async login(username, password) {
    const data = await tokenRequest({ grant_type: 'password', username, password });
    setSession(data);
    return tokenParsed;
  },

  /** ហៅម្តងពេលកម្មវិធីចាប់ផ្តើម - ព្យាយាមស្តារ session ពី refresh token ចាស់ */
  async restoreSession() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    try {
      const data = await tokenRequest({ grant_type: 'refresh_token', refresh_token: stored });
      setSession(data);
      return tokenParsed;
    } catch {
      clearSession();
      return null;
    }
  },

  /**
   * ត្រឡប់ access token ត្រឹមត្រូវបច្ចុប្បន្ន - refresh ដោយស្វ័យប្រវត្តិ
   * បើជិតផុតកំណត់។ apiClient interceptor ហៅមុននឹងផ្ញើសំណើនីមួយៗ។
   */
  async ensureFreshToken() {
    if (!accessToken) return null;
    if (Date.now() < expiresAt - REFRESH_SKEW_MS) return accessToken;
    if (!refreshToken) {
      clearSession();
      onSessionExpired?.();
      return null;
    }

    // ការពារកុំឲ្យសំណើ concurrent ច្រើនហៅ refresh ព្រមគ្នា
    if (!refreshPromise) {
      refreshPromise = tokenRequest({ grant_type: 'refresh_token', refresh_token: refreshToken })
        .then((data) => {
          setSession(data);
          return accessToken;
        })
        .catch(() => {
          clearSession();
          onSessionExpired?.();
          return null;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }
    return refreshPromise;
  },

  async logout() {
    if (refreshToken) {
      try {
        await fetch(LOGOUT_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ client_id: env.keycloak.clientId, refresh_token: refreshToken }),
        });
      } catch {
        // ទោះ revoke នៅ server បរាជ័យក៏សម្អាត local state ដដែល
      }
    }
    clearSession();
  },

  getAccessToken: () => accessToken,
  isAuthenticated: () => !!accessToken,
};
