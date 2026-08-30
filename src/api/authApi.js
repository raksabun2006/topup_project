import { apiClient } from './client';

export const authApi = {
  login: async ({ username, password }) => {
    const res = await apiClient.post('/auth/login', {
      username,
      password,
    });
    return res.data?.data ?? res.data;
  },

  register: async ({ username, email, password, displayName, phoneNumber }) => {
    const res = await apiClient.post('/auth/register', {
      username,
      email,
      password,
      displayName,
      phoneNumber,
    });
    return res.data?.data ?? res.data;
  },
};