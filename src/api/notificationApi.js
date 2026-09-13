import { apiClient } from './client.js';

/**
 * Official Notification REST API Client
 *
 * Backend endpoints:
 * - GET   /api/v1/notifications?page=0&size=20
 * - GET   /api/v1/notifications/{id}
 * - GET   /api/v1/notifications/unread-count
 * - PATCH /api/v1/notifications/{id}/read
 * - PATCH /api/v1/notifications/read-all
 */
export const notificationApi = {
  /**
   * Fetch paginated notifications
   * @param {Object} params
   * @param {number} [params.page=0]
   * @param {number} [params.size=20]
   * @returns {Promise<{ content: Array, totalElements: number, totalPages: number, page: number, size: number, last: boolean }>}
   */
  getNotifications: async ({ page = 0, size = 20 } = {}) => {
    const res = await apiClient.get('/api/v1/notifications', {
      params: { page, size },
    });

    const payload = res.data?.data ?? res.data;

    // Normalizes Spring Data Page or raw array
    if (Array.isArray(payload)) {
      return {
        content: payload,
        totalElements: payload.length,
        totalPages: Math.ceil(payload.length / size) || 1,
        page,
        size,
        last: true,
      };
    }

    if (payload && Array.isArray(payload.content)) {
      return {
        content: payload.content,
        totalElements: Number(payload.totalElements ?? payload.content.length),
        totalPages: Number(payload.totalPages ?? 1),
        page: Number(payload.number ?? page),
        size: Number(payload.size ?? size),
        last: Boolean(payload.last ?? true),
      };
    }

    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      page,
      size,
      last: true,
    };
  },

  /**
   * Fetch a single notification by UUID
   * @param {string} id
   * @returns {Promise<Object>}
   */
  getNotification: async (id) => {
    if (!id) throw new Error('Notification ID is required');
    const res = await apiClient.get(`/api/v1/notifications/${id}`);
    return res.data?.data ?? res.data;
  },

  /**
   * Fetch current unread notification count
   * @returns {Promise<number>}
   */
  getUnreadCount: async () => {
    const res = await apiClient.get('/api/v1/notifications/unread-count');
    const data = res.data;

    if (typeof data === 'number') {
      return Math.max(0, data);
    }

    const payload = data?.data ?? data;
    if (typeof payload === 'number') {
      return Math.max(0, payload);
    }

    const count = payload?.count ?? payload?.unreadCount ?? payload?.total ?? 0;
    return Math.max(0, Number(count) || 0);
  },

  /**
   * Mark a single notification as read
   * @param {string} id
   * @returns {Promise<Object>}
   */
  markAsRead: async (id) => {
    if (!id) throw new Error('Notification ID is required');
    const res = await apiClient.patch(`/api/v1/notifications/${id}/read`);
    return res.data?.data ?? res.data;
  },

  /**
   * Mark all notifications as read
   * @returns {Promise<Object>}
   */
  markAllAsRead: async () => {
    const res = await apiClient.patch('/api/v1/notifications/read-all');
    return res.data?.data ?? res.data;
  },
};
