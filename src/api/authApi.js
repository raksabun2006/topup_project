import { apiClient } from './client';

export const authApi = {
  /**
   * POST /api/v1/auth/login
   * Supports email or username identifier along with password
   */
  login: async ({ username, email, password }) => {
    const identifier = username || email;
    const res = await apiClient.post('/auth/login', {
      username: identifier,
      email: identifier,
      password,
    });
    return res.data?.data ?? res.data;
  },

  /**
   * POST /api/v1/auth/register
   * Spring Boot registration endpoint
   */
  register: async ({ username, email, password, name, displayName, phoneNumber }) => {
    const fullName = name || displayName || username;
    const res = await apiClient.post('/auth/register', {
      username: username || email,
      email,
      password,
      name: fullName,
      displayName: fullName,
      phoneNumber: phoneNumber || undefined,
    });
    return res.data?.data ?? res.data;
  },

  /**
   * POST /api/v1/auth/google
   * Google OAuth 2.0 credential verification endpoint
   */
  googleLogin: async ({ token, idToken, credential }) => {
    const googleToken = token || idToken || credential;
    const res = await apiClient.post('/auth/google', {
      token: googleToken,
      idToken: googleToken,
      credential: googleToken,
    });
    return res.data?.data ?? res.data;
  },

  /**
   * POST /api/v1/auth/forgot-password
   * Requests a password reset link to be sent via backend email
   * Backend intentionally returns generic success response to prevent email enumeration
   */
  forgotPassword: async (input) => {
    const rawEmail = typeof input === 'string' ? input : input?.email;
    const cleanEmail = (rawEmail || '').trim().toLowerCase();
    const res = await apiClient.post('/auth/forgot-password', {
      email: cleanEmail,
    });
    return res.data?.data ?? res.data;
  },

  /**
   * POST /api/v1/auth/reset-password
   * Resets password using valid single-use token and new password
   */
  resetPassword: async (param1, param2) => {
    let token = '';
    let newPassword = '';
    if (typeof param1 === 'object' && param1 !== null) {
      token = param1.token || param1.resetToken || param1.code || '';
      newPassword = param1.newPassword || param1.password || '';
    } else {
      token = param1 || '';
      newPassword = param2 || '';
    }
    const cleanToken = (token || '').trim();
    const finalPassword = newPassword || '';
    const res = await apiClient.post('/auth/reset-password', {
      token: cleanToken,
      newPassword: finalPassword,
    });
    return res.data?.data ?? res.data;
  },
};