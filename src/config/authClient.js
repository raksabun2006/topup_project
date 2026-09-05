import { env } from './env';

const STORAGE_TOKEN_KEY = 'access_token';
const STORAGE_USER_KEY = 'pos_user_data';
const REFRESH_SKEW_MS = 15000;

let accessToken = null;
let tokenParsed = null;
let expiresAt = 0;
let onSessionExpired = null;

function decodeJwt(token) {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(decodeURIComponent(escape(atob(padded))));
  } catch (e) {
    console.warn('Could not decode JWT:', e);
    return null;
  }
}

function buildClaimsFromAuth(token, userData = {}) {
  const jwtClaims = decodeJwt(token);
  if (jwtClaims) {
    const roles = Array.isArray(jwtClaims.realm_access?.roles)
      ? [...jwtClaims.realm_access.roles]
      : (jwtClaims.role ? [jwtClaims.role] : [userData.role || 'USER']);
    if (userData.role && !roles.includes(userData.role)) {
      roles.push(userData.role);
    }
    return {
      ...jwtClaims,
      sub: jwtClaims.sub || userData.id,
      id: userData.id || jwtClaims.sub,
      username: jwtClaims.preferred_username || userData.username || jwtClaims.sub,
      preferred_username: jwtClaims.preferred_username || userData.username,
      email: jwtClaims.email || userData.email,
      name: userData.displayName || jwtClaims.name || userData.username,
      displayName: userData.displayName || jwtClaims.name || userData.username,
      phoneNumber: userData.phoneNumber || jwtClaims.phoneNumber,
      role: userData.role || (roles.includes('ADMIN') ? 'ADMIN' : 'USER'),
      roles,
      exp: jwtClaims.exp,
    };
  }

  const role = userData.role || 'USER';
  return {
    sub: userData.id || 'user',
    id: userData.id,
    username: userData.username,
    preferred_username: userData.username,
    email: userData.email,
    displayName: userData.displayName || userData.username,
    name: userData.displayName || userData.username,
    phoneNumber: userData.phoneNumber,
    role,
    roles: [role],
    exp: Math.floor((Date.now() + 24 * 3600 * 1000) / 1000),
  };
}

function setSession(token, userData = {}) {
  accessToken = token;
  tokenParsed = buildClaimsFromAuth(token, userData);
  expiresAt = tokenParsed.exp ? tokenParsed.exp * 1000 : Date.now() + 24 * 3600 * 1000;

  localStorage.setItem(STORAGE_TOKEN_KEY, token);
  localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(tokenParsed));
}

function clearSession() {
  accessToken = null;
  tokenParsed = null;
  expiresAt = 0;
  localStorage.removeItem(STORAGE_TOKEN_KEY);
  localStorage.removeItem('pos_access_token');
  localStorage.removeItem('token');
  localStorage.removeItem(STORAGE_USER_KEY);
  localStorage.removeItem('pos_refresh_token');
}

export const authClient = {
  setOnSessionExpired(callback) {
    onSessionExpired = callback;
  },

  triggerSessionExpired() {
    clearSession();
    onSessionExpired?.();
  },

  async login(username, password) {
    // Determine login endpoint URL
    const baseUrl = env.apiBaseUrl.replace(/\/+$/, '');
    const url = baseUrl.endsWith('/api/v1') ? `${baseUrl}/auth/login` : `${baseUrl}/api/v1/auth/login`;

    let res;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
    } catch (networkErr) {
      const err = new Error(
        `Network error: មិនអាចភ្ជាប់ទៅកាន់ Server បានទេ។ សូមពិនិត្យ Internet របស់អ្នក។ (${networkErr.message || 'Connection failed'})`
      );
      err.code = 'NETWORK_ERROR';
      throw err;
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      let msg = data.message || data.error_description || data.error;
      if (!msg) {
        if (res.status === 401) {
          msg = '401 Unauthorized: ឈ្មោះអ្នកប្រើ ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ (Invalid username or password)';
        } else if (res.status === 403) {
          msg = '403 Forbidden: អ្នកមិនមានសិទ្ធិចូលប្រើប្រាស់ទេ (Permission denied)';
        } else if (res.status === 404) {
          msg = '404 Not Found: រកមិនឃើញសេវាកម្ម Login (Endpoint not found)';
        } else if (res.status >= 500) {
          msg = '500 Server Error: Server កំពុងមានបញ្ហា (Internal Server Error)';
        } else {
          msg = 'ចូលគណនីមិនបានទេ។ សូមព្យាយាមម្តងទៀត។';
        }
      } else {
        if (res.status === 401 && !msg.includes('401')) {
          msg = `401 Unauthorized: ${msg}`;
        } else if (res.status === 403 && !msg.includes('403')) {
          msg = `403 Forbidden: ${msg}`;
        } else if (res.status === 404 && !msg.includes('404')) {
          msg = `404 Not Found: ${msg}`;
        } else if (res.status >= 500 && !msg.includes('500')) {
          msg = `500 Server Error: ${msg}`;
        }
      }
      const err = new Error(msg);
      err.code = data.code || (res.status === 401 ? 'invalid_grant' : 'AUTH_ERROR');
      err.status = res.status;
      err.response = { status: res.status, data };
      throw err;
    }

    const json = await res.json();
    const authData = json.data || json; // AuthResponse: { token, accessToken, tokenType, username, role, id, user }
    const token = authData.token || authData.accessToken || authData.access_token;

    if (!token) {
      throw new Error('មិនបានទទួល token ពី server ទេ។ (No token returned from server)');
    }

    const userData = { ...authData, ...(authData.user || {}) };
    setSession(token, userData);
    return tokenParsed;
  },

  /** Restore session from localStorage */
  async restoreSession() {
    const storedToken =
      localStorage.getItem(STORAGE_TOKEN_KEY) ||
      localStorage.getItem('pos_access_token') ||
      localStorage.getItem('token');
    const storedUser = localStorage.getItem(STORAGE_USER_KEY);

    if (!storedToken) {
      clearSession();
      return null;
    }

    let parsedUser = null;
    if (storedUser) {
      try {
        parsedUser = JSON.parse(storedUser);
      } catch {
        // ignore
      }
    }

    accessToken = storedToken;
    tokenParsed = buildClaimsFromAuth(storedToken, parsedUser || {});
    expiresAt = tokenParsed.exp ? tokenParsed.exp * 1000 : Date.now() + 24 * 3600 * 1000;

    // Check if token has expired
    if (Date.now() >= expiresAt - REFRESH_SKEW_MS) {
      clearSession();
      return null;
    }

    return tokenParsed;
  },

  async ensureFreshToken() {
    if (!accessToken) {
      const stored =
        localStorage.getItem(STORAGE_TOKEN_KEY) ||
        localStorage.getItem('pos_access_token') ||
        localStorage.getItem('token');
      if (stored) {
        accessToken = stored;
      } else {
        return null;
      }
    }

    if (expiresAt && Date.now() >= expiresAt - REFRESH_SKEW_MS) {
      clearSession();
      onSessionExpired?.();
      return null;
    }

    return accessToken;
  },

  async logout() {
    try {
      const baseUrl = env.apiBaseUrl.replace(/\/+$/, '');
      const url = baseUrl.endsWith('/api/v1') ? `${baseUrl}/auth/logout` : `${baseUrl}/api/v1/auth/logout`;
      const token = accessToken || localStorage.getItem(STORAGE_TOKEN_KEY);
      if (token) {
        await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }).catch(() => {});
      }
    } finally {
      clearSession();
    }
  },

  getAccessToken: () =>
    accessToken ||
    localStorage.getItem(STORAGE_TOKEN_KEY) ||
    localStorage.getItem('pos_access_token') ||
    localStorage.getItem('token'),
  getUser: () => tokenParsed,
  isAuthenticated: () =>
    !!(
      accessToken ||
      localStorage.getItem(STORAGE_TOKEN_KEY) ||
      localStorage.getItem('pos_access_token') ||
      localStorage.getItem('token')
    ),
};
