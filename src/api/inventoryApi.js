import { apiClient } from './client';

export const inventoryApi = {
  /** GET /api/v1/inventory */
  list: async () => {
    const res = await apiClient.get('/api/v1/inventory');
    return res.data;
  },

  /** GET /api/v1/inventory/low-stock */
  lowStock: async () => {
    const res = await apiClient.get('/api/v1/inventory/low-stock');
    return res.data;
  },

  /** POST /api/v1/inventory/stock-in - { inventoryId, quantity } */
  stockIn: async ({ inventoryId, quantity }) => {
    const res = await apiClient.post('/api/v1/inventory/stock-in', { inventoryId, quantity });
    return res.data;
  },

  /** POST /api/v1/inventory/adjust - { inventoryId, newQuantity } */
  adjust: async ({ inventoryId, newQuantity }) => {
    const res = await apiClient.post('/api/v1/inventory/adjust', { inventoryId, newQuantity });
    return res.data;
  },
};
