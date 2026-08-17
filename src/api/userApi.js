import { apiClient } from './client';

export const usersApi = {
  me: async () => {
    const res = await apiClient.get('/api/v1/users/me');
    return res.data.data;
  },

  updateMe: async ({ email, displayName, phoneNumber, avatarUrl }) => {
    const res = await apiClient.put('/api/v1/users/me', {
      email,
      displayName,
      phoneNumber,
      avatarUrl,
    });
    return res.data.data;
  },
};