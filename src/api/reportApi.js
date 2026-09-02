import { apiClient } from './client';

/**
 * Report API Service
 * Connects to production-ready Mart System financial report endpoints:
 * - GET /reports/daily?date=YYYY-MM-DD
 * - GET /reports/monthly?year=YYYY&month=MM
 * - GET /reports/monthly/trend?year=YYYY
 * - GET /reports/daily/trend?year=YYYY&month=MM
 * - GET /reports/expenses?from=YYYY-MM-DD&to=YYYY-MM-DD
 * - GET /reports/payment-methods?from=YYYY-MM-DD&to=YYYY-MM-DD
 * - GET /reports/top-products?from=YYYY-MM-DD&to=YYYY-MM-DD&limit=N
 * - GET /reports/sales?from=YYYY-MM-DD&to=YYYY-MM-DD
 * - GET /reports/dashboard?date=YYYY-MM-DD
 */
export const reportApi = {
  getDailyReport: async (date) => {
    const res = await apiClient.get('/reports/daily', { params: { date } });
    return res.data?.data ?? res.data;
  },

  getMonthlyReport: async (year, month) => {
    const res = await apiClient.get('/reports/monthly', { params: { year, month } });
    return res.data?.data ?? res.data;
  },

  getMonthlyTrend: async (year) => {
    const res = await apiClient.get('/reports/monthly/trend', { params: { year } });
    return res.data?.data ?? res.data;
  },

  getDailyTrend: async (year, month) => {
    const res = await apiClient.get('/reports/daily/trend', { params: { year, month } });
    return res.data?.data ?? res.data;
  },

  getExpenseSummary: async (from, to) => {
    const res = await apiClient.get('/reports/expenses', { params: { from, to } });
    return res.data?.data ?? res.data;
  },

  getPaymentMethods: async (from, to) => {
    const res = await apiClient.get('/reports/payment-methods', { params: { from, to } });
    return res.data?.data ?? res.data;
  },

  getTopProducts: async (from, to, limit = 10) => {
    const res = await apiClient.get('/reports/top-products', { params: { from, to, limit } });
    return res.data?.data ?? res.data;
  },

  getSalesSummary: async (from, to) => {
    const res = await apiClient.get('/reports/sales', { params: { from, to } });
    return res.data?.data ?? res.data;
  },

  getDashboardReport: async (date) => {
    const res = await apiClient.get('/reports/dashboard', { params: { date } });
    return res.data?.data ?? res.data;
  },
};
