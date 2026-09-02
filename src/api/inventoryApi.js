import { apiClient } from './client';

export const inventoryApi = {
  /** GET /inventory */
  list: async () => {
    const res = await apiClient.get('/inventory');
    const data = res.data?.data ?? res.data;
    return Array.isArray(data) ? data : (data?.content ?? []);
  },

  /** GET /inventory/low-stock */
  lowStock: async () => {
    const res = await apiClient.get('/inventory/low-stock');
    const data = res.data?.data ?? res.data;
    return Array.isArray(data) ? data : (data?.content ?? []);
  },

  /** POST /inventory/stock-in - { inventoryId, quantity } */
  stockIn: async ({ inventoryId, quantity }) => {
    const res = await apiClient.post('/inventory/stock-in', { inventoryId, quantity });
    return res.data?.data ?? res.data;
  },

  /** POST /inventory/adjust - { inventoryId, newQuantity } */
  adjust: async ({ inventoryId, newQuantity }) => {
    const res = await apiClient.post('/inventory/adjust', { inventoryId, newQuantity });
    return res.data?.data ?? res.data;
  },
};
