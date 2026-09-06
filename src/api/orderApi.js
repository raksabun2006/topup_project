import { apiClient } from './client';

export const orderApi = {
  /**
   * Sync frontend cart items into backend customer cart before checkout
   */
  syncCart: async (items) => {
    try {
      await apiClient.delete('/api/v1/cart');
    } catch {
      // ignore if cart is already empty
    }

    for (const item of items) {
      const productId = item.product?.id || item.productId;
      const quantity = item.quantity || item.qty || 1;
      if (productId) {
        await apiClient.post('/api/v1/cart/items', {
          productId,
          quantity,
        });
      }
    }
  },

  /**
   * Create or update delivery address for customer:
   * POST /api/v1/customer/addresses
   */
  createAddress: async ({ receiverName, phoneNumber, address, province = 'Phnom Penh', district = '', note = '' }) => {
    const res = await apiClient.post('/api/v1/customer/addresses', {
      receiverName: receiverName || 'Customer',
      phoneNumber: phoneNumber || '012345678',
      address: address || 'Phnom Penh, Cambodia',
      province: province || 'Phnom Penh',
      district: district || '',
      note: note || '',
      defaultAddress: true,
    });
    return res.data?.data ?? res.data;
  },

  /**
   * Get customer addresses:
   * GET /api/v1/customer/addresses
   */
  getAddresses: async () => {
    const res = await apiClient.get('/api/v1/customer/addresses');
    return res.data?.data ?? res.data ?? [];
  },

  /**
   * Checkout customer cart to create e-commerce order:
   * POST /api/v1/orders/checkout
   * Returns: CheckoutResponse { orderId, orderNumber, amount, currency, status, order, payment }
   */
  checkout: async ({ deliveryAddressId = null, note = '' } = {}, config = {}) => {
    const res = await apiClient.post(
      '/api/v1/orders/checkout',
      {
        deliveryAddressId: deliveryAddressId || null,
        note: note || '',
      },
      config
    );
    return res.data?.data ?? res.data;
  },

  /**
   * Direct order creation:
   * POST /api/v1/orders
   */
  create: async (data, config = {}) => {
    const res = await apiClient.post('/api/v1/orders', data, config);
    return res.data?.data ?? res.data;
  },

  /**
   * Get order by ID:
   * GET /api/v1/orders/{id}
   */
  getById: async (id, config = {}) => {
    const res = await apiClient.get(`/api/v1/orders/${id}`, config);
    return res.data?.data ?? res.data;
  },

  /**
   * Get current customer's order history:
   * GET /api/v1/orders/my-orders or GET /api/v1/customer/orders
   */
  getMyOrders: async ({ page = 0, size = 20 } = {}, config = {}) => {
    try {
      const res = await apiClient.get('/api/v1/orders/my-orders', {
        params: { page, size },
        ...config,
      });
      return res.data?.data ?? res.data;
    } catch {
      const res = await apiClient.get('/api/v1/customer/orders', {
        params: { page, size },
        ...config,
      });
      return res.data?.data ?? res.data;
    }
  },

  /**
   * Cancel customer order:
   * POST /api/v1/customer/orders/{id}/cancel
   */
  cancel: async (id, config = {}) => {
    const res = await apiClient.post(`/api/v1/customer/orders/${id}/cancel`, undefined, config);
    return res.data?.data ?? res.data;
  },
};
