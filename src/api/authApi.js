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
   */
  forgotPassword: async ({ email }) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const res = await apiClient.post('/auth/forgot-password', {
      email: cleanEmail,
      username: cleanEmail,
      usernameOrEmail: cleanEmail,
    });
    return res.data?.data ?? res.data;
  },

  /**
   * POST /api/v1/auth/reset-password
   * Resets password using valid token and new password
   */
  resetPassword: async ({ token, newPassword, password }) => {
    const finalPassword = newPassword || password;
    const cleanToken = (token || '').trim();
    const res = await apiClient.post('/auth/reset-password', {
      token: cleanToken,
      resetToken: cleanToken,
      code: cleanToken,
      newPassword: finalPassword,
      password: finalPassword,
      confirmPassword: finalPassword,
    });
    return res.data?.data ?? res.data;
  },
};