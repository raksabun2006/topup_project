import { apiClient } from './client';

export const saleApi = {
  /**
   * POST /api/v1/sales
   * CreateSaleRequestDto { customer, cashier, discount, tax, paymentStatus, items }
   * item: { product, quantity, unitPrice, discount }
   *
   * customer/product ត្រូវជា UUID (string) យោងទៅ Customer/Product ពិត -
   * schema មិនប្រកាស format:uuid ជាក់លាក់ទេ ព្រោះ field ជា String នៅ
   * Java DTO តែ service layer រំពឹងថាជា UUID reference។
   */
  create: async (data) => {
    const res = await apiClient.post('/api/v1/sales', data);
    return res.data;
  },

  /** GET /api/v1/sales - គ្មាន pagination/filter param គាំទ្រទេ ត្រឡប់ទាំងអស់ */
  list: async () => {
    const res = await apiClient.get('/api/v1/sales');
    return res.data;
  },

  getById: async (id) => {
    const res = await apiClient.get(`/api/v1/sales/${id}`);
    return res.data;
  },

  /** PUT /api/v1/sales/{id}/cancel */
  cancel: async (id) => {
    const res = await apiClient.put(`/api/v1/sales/${id}/cancel`);
    return res.data;
  },
};
  