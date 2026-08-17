import { apiClient } from './client';

export const gamesApi = {
  /** GET /api/v1/games - public, តែហ្គេម ACTIVE */
  getAll: async () => {
    const res = await apiClient.get('/api/v1/games');
    return res.data.data;
  },

  /** GET /api/v1/games/{code} - public។ ចំណាំ: code មិនមែន id ទេ។ */
  getByCode: async (code) => {
    const res = await apiClient.get(`/api/v1/games/${code}`);
    return res.data.data;
  },

  /** GET /api/v1/games/{gameCode}/products - public, តម្លៃថោកមុន */
  getProducts: async (gameCode) => {
    const res = await apiClient.get(`/api/v1/games/${gameCode}/products`);
    return res.data.data;
  },
};