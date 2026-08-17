import { apiClient, tokenStorage } from './client';

/**
 * គ្រប់ការឆ្លើយតបមានរូបរាង { success, message, data }
 * ដូច្នេះយើងស្រង់ .data.data ជានិច្ច។
 */
export const authApi = {
  /** POST /api/v1/auth/register - public */
  register: async ({ username, email, password }) => {
    const res = await apiClient.post('/api/v1/auth/register', {
      username,
      email,
      password,
    });
    return res.data;
  },

  /** POST /api/v1/auth/login - ត្រឡប់ token ហើយរក្សាទុកវា */
  login: async ({ username, password }) => {
    const res = await apiClient.post('/api/v1/auth/login', {
      username,
      password,
    });

    const tokens = res.data.data;
    tokenStorage.set(tokens.access_token, tokens.refresh_token);
    return tokens;
  },

  /** GET /api/v1/users/me - ត្រូវការ token */
  me: async () => {
    const res = await apiClient.get('/api/v1/users/me');
    return res.data.data;
  },

  /**
   * Logout ជាការសម្អាតខាង client តែប៉ុណ្ណោះ។
   *
   * Backend គ្មាន endpoint logout ទេ ព្រោះ JWT គ្មានស្ថានភាព -
   * server មិនរក្សា session ដែលអាចបញ្ចប់បានទេ។ Token នៅតែ
   * មានសុពលភាពរហូតដល់វាផុតកំណត់ (៥ នាទី)។
   */
  logout: () => {
    tokenStorage.clear();
  },
};