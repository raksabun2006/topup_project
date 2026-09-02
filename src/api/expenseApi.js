import { apiClient } from './client';

/**
 * Expense API Service
 * Connects to Mart System expense management endpoints:
 * - POST   /expenses
 * - GET    /expenses?from=YYYY-MM-DD&to=YYYY-MM-DD&category=&page=&size=
 * - GET    /expenses/{id}
 * - PUT    /expenses/{id}
 * - DELETE /expenses/{id}
 */
export const expenseApi = {
  createExpense: async (data) => {
    const res = await apiClient.post('/expenses', data);
    return res.data?.data ?? res.data;
  },

  getExpenses: async ({ from, to, category, page = 0, size = 20 } = {}) => {
    const params = {};
    if (from) params.from = from;
    if (to) params.to = to;
    if (category && category !== 'ALL') params.category = category;
    if (page != null) params.page = page;
    if (size != null) params.size = size;

    const res = await apiClient.get('/expenses', { params });
    return res.data?.data ?? res.data;
  },

  getExpense: async (id) => {
    const res = await apiClient.get(`/expenses/${id}`);
    return res.data?.data ?? res.data;
  },

  updateExpense: async (id, data) => {
    const res = await apiClient.put(`/expenses/${id}`, data);
    return res.data?.data ?? res.data;
  },

  deleteExpense: async (id) => {
    const res = await apiClient.delete(`/expenses/${id}`);
    return res.data?.data ?? res.data;
  },
};
