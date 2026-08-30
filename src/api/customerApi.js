import { apiClient } from './client';

export const customerApi = {
  /** GET /customers - គ្មាន query param គាំទ្រទេ ត្រូវ filter នៅ client */
  list: async () => {
    const res = await apiClient.get('/customers');
    return res.data;
  },

  /** GET /customers/walk-in - អតិថិជនលំនាំដើមសម្រាប់ការលក់ដែលមិនចង់កត់ត្រាអតិថិជន */
  getWalkIn: async () => {
    const res = await apiClient.get('/customers/walk-in');
    return res.data;
  },

  getById: async (id) => {
    const res = await apiClient.get(`/customers/${id}`);
    return res.data;
  },

  /** POST /customers - { name (required), phone, email, address, loyaltyPoint } */
  create: async (data) => {
    const res = await apiClient.post('/customers', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await apiClient.put(`/customers/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await apiClient.delete(`/customers/${id}`);
    return res.data;
  },

  /** PATCH /customers/{id}/loyalty-points?points= */
  addLoyaltyPoints: async (id, points) => {
    const res = await apiClient.patch(`/customers/${id}/loyalty-points`, null, {
      params: { points },
    });
    return res.data;
  },
};
