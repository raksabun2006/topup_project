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
  } catch {
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
      sub: jwtClaims.sub || userData.id || userData.userId,
      id: userData.id || userData.userId || jwtClaims.sub,
      username: jwtClaims.preferred_username || userData.username || userData.email || jwtClaims.sub,
      preferred_username: jwtClaims.preferred_username || userData.username,
      email: jwtClaims.email || userData.email,
      name: userData.displayName || userData.name || jwtClaims.name || userData.username,
      displayName: userData.displayName || userData.name || jwtClaims.name || userData.username,
      phoneNumber: userData.phoneNumber || jwtClaims.phoneNumber,
      role: userData.role || (roles.includes('ADMIN') ? 'ADMIN' : 'USER'),
      roles,
      exp: jwtClaims.exp,
    };
  }

  const role = userData.role || 'USER';
  return {
    sub: userData.id || userData.userId || 'user',
    id: userData.id || userData.userId,
    username: userData.username || userData.email,
    preferred_username: userData.username,
    email: userData.email,
    displayName: userData.displayName || userData.name || userData.username,
    name: userData.displayName || userData.name || userData.username,
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

  setSession(token, userData = {}) {
    setSession(token, userData);
  },

  clearSession() {
    clearSession();
  },

  async login(usernameOrEmail, password) {
    const baseUrl = env.apiBaseUrl.replace(/\/+$/, '');
    const url = baseUrl.endsWith('/api/v1') ? `${baseUrl}/auth/login` : `${baseUrl}/api/v1/auth/login`;

    let res;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: usernameOrEmail,
          email: usernameOrEmail,
          password,
        }),
      });
    } catch (networkErr) {
      const err = new Error(
        `Network error: Unable to connect to server. Please check your internet connection.`
      );
      err.code = 'NETWORK_ERROR';
      throw err;
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      let msg = data.message || data.error_description || data.error;
      if (!msg) {
        if (res.status === 401) {
          msg = 'Invalid email or password.';
        } else if (res.status === 403) {
          msg = "You don't have permission to perform this action.";
        } else if (res.status === 404) {
          msg = 'The requested resource was not found.';
        } else if (res.status >= 500) {
          msg = 'Something went wrong. Please try again.';
        } else {
          msg = 'Unable to sign in. Please try again.';
        }
      }
      const err = new Error(msg);
      err.code = data.code || (res.status === 401 ? 'invalid_grant' : 'AUTH_ERROR');
      err.status = res.status;
      err.response = { status: res.status, data };
      throw err;
    }

    const json = await res.json();
    const authData = json.data || json;
    const token = authData.token || authData.accessToken || authData.access_token || authData.jwt;

    if (!token) {
      throw new Error('No authentication token returned by the server.');
    }

    const userData = { ...authData, ...(authData.user || {}) };
    setSession(token, userData);
    return tokenParsed;
  },

  async loginWithGoogle(credential) {
    const baseUrl = env.apiBaseUrl.replace(/\/+$/, '');
    const url = baseUrl.endsWith('/api/v1') ? `${baseUrl}/auth/google` : `${baseUrl}/api/v1/auth/google`;

    let res;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: credential,
          idToken: credential,
          credential: credential,
        }),
      });
    } catch (networkErr) {
      const err = new Error(
        `Network error: Unable to connect to server. Please check your internet connection.`
      );
      err.code = 'NETWORK_ERROR';
      throw err;
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      let msg = data.message || data.error_description || data.error;
      if (!msg) {
        if (res.status === 401) {
          msg = 'Invalid Google credentials.';
        } else if (res.status === 403) {
          msg = "You don't have permission to perform this action.";
        } else if (res.status >= 500) {
          msg = 'Something went wrong. Please try again.';
        } else {
          msg = 'Unable to sign in with Google. Please try again.';
        }
      }
      const err = new Error(msg);
      err.code = data.code || 'GOOGLE_AUTH_ERROR';
      err.status = res.status;
      err.response = { status: res.status, data };
      throw err;
    }

    const json = await res.json();
    const authData = json.data || json;
    const token = authData.token || authData.accessToken || authData.access_token || authData.jwt;

    if (!token) {
      throw new Error('No authentication token returned by the server.');
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
