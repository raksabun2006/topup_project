import { apiClient } from './client';

export const inventoryApi = {
  /** GET /inventory */
  list: async () => {
    const res = await apiClient.get('/inventory');
    return res.data;
  },

  /** GET /inventory/low-stock */
  lowStock: async () => {
    const res = await apiClient.get('/inventory/low-stock');
    return res.data;
  },

  /** POST /inventory/stock-in - { inventoryId, quantity } */
  stockIn: async ({ inventoryId, quantity }) => {
    const res = await apiClient.post('/inventory/stock-in', { inventoryId, quantity });
    return res.data;
  },

  /** POST /inventory/adjust - { inventoryId, newQuantity } */
  adjust: async ({ inventoryId, newQuantity }) => {
    const res = await apiClient.post('/inventory/adjust', { inventoryId, newQuantity });
    return res.data;
  },
};
