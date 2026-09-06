import { apiClient } from './client';

export const orderApi = {
  /**
   * Sync frontend cart items into backend customer cart before checkout
   */
  syncCart: async (items) => {
    try {
      await apiClient.delete('/api/v1/cart');
    } catch {
      // ignore if cart is already empty or unauthenticated
    }

    for (const item of items) {
      const productId = item.product?.id || item.productId;
      const quantity = item.quantity || item.qty || 1;
      if (productId) {
        try {
          await apiClient.post('/api/v1/cart/items', {
            productId,
            quantity,
          });
        } catch {
          // ignore individual item sync errors
        }
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
   * Parameters: { deliveryMethod = 'DELIVERY', deliveryAddressId = null, note = '' }
   * Returns: CheckoutResponse { orderId, orderNumber, amount, currency, status, order, payment }
   */
  checkout: async ({ deliveryMethod = 'DELIVERY', deliveryAddressId = null, note = '' } = {}, config = {}) => {
    const res = await apiClient.post(
      '/api/v1/orders/checkout',
      {
        deliveryMethod,
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
   * Get current customer's order history from backend:
   * GET /api/v1/orders/my-orders or GET /api/v1/customer/orders
   */
  getMyOrders: async ({ page = 0, size = 50 } = {}, config = {}) => {
    try {
      const res = await apiClient.get('/api/v1/orders/my-orders', {
        params: { page, size },
        ...config,
      });
      const data = res.data?.data ?? res.data;
      return Array.isArray(data) ? data : (data?.content ?? data?.orders ?? []);
    } catch {
      try {
        const res = await apiClient.get('/api/v1/customer/orders', {
          params: { page, size },
          ...config,
        });
        const data = res.data?.data ?? res.data;
        return Array.isArray(data) ? data : (data?.content ?? data?.orders ?? []);
      } catch {
        return [];
      }
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
