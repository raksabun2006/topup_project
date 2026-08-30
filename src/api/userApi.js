import { apiClient } from './client';

export const usersApi = {
  me: async () => {
    const res = await apiClient.get('/users/me');
    return res.data?.data ?? res.data;
  },

  updateMe: async ({ email, displayName, phoneNumber, avatarUrl }) => {
    const res = await apiClient.put('/users/me', {
      email,
      displayName,
      phoneNumber,
      avatarUrl,
    });
    return res.data?.data ?? res.data;
  },
};