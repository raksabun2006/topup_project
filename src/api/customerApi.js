import { apiClient } from './client';

export const customerApi = {
  /** GET /api/v1/customers - គ្មាន query param គាំទ្រទេ ត្រូវ filter នៅ client */
  list: async () => {
    const res = await apiClient.get('/api/v1/customers');
    return res.data;
  },

  /** GET /api/v1/customers/walk-in - អតិថិជនលំនាំដើមសម្រាប់ការលក់ដែលមិនចង់កត់ត្រាអតិថិជន */
  getWalkIn: async () => {
    const res = await apiClient.get('/api/v1/customers/walk-in');
    return res.data;
  },

  getById: async (id) => {
    const res = await apiClient.get(`/api/v1/customers/${id}`);
    return res.data;
  },

  /** POST /api/v1/customers - { name (required), phone, email, address, loyaltyPoint } */
  create: async (data) => {
    const res = await apiClient.post('/api/v1/customers', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await apiClient.put(`/api/v1/customers/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await apiClient.delete(`/api/v1/customers/${id}`);
    return res.data;
  },

  /** PATCH /api/v1/customers/{id}/loyalty-points?points= */
  addLoyaltyPoints: async (id, points) => {
    const res = await apiClient.patch(`/api/v1/customers/${id}/loyalty-points`, null, {
      params: { points },
    });
    return res.data;
  },
};
