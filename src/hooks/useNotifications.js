import { useMemo } from 'react';
import { useNotificationContext } from '../context/NotificationContext.jsx';
import { getNotificationCategory, NOTIFICATION_CATEGORIES } from '../types/notification.types.js';

/**
 * Hook for consuming notifications
 * Powered by NotificationContext
 */
export function useNotifications() {
  const context = useNotificationContext();

  const {
    notifications,
    unreadCount,
    loading,
    refreshing,
    connectionStatus,
    isConnected,
    isConnecting,
    refresh,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  } = context;

  // Compute category counts for tabs
  const { stockCount, salesCount, deliveryCount, ordersCount } = useMemo(() => {
    let stock = 0;
    let sales = 0;
    let delivery = 0;
    let orders = 0;

    for (const n of notifications) {
      const isUnread = n.read === false || n.isRead === false;
      if (!isUnread) continue;

      const category = getNotificationCategory(n.type);
      if (category === NOTIFICATION_CATEGORIES.INVENTORY) stock++;
      else if (category === NOTIFICATION_CATEGORIES.PAYMENTS) sales++;
      else if (category === NOTIFICATION_CATEGORIES.DELIVERY) delivery++;
      else if (category === NOTIFICATION_CATEGORIES.ORDERS) orders++;
    }

    return { stockCount: stock, salesCount: sales, deliveryCount: delivery, ordersCount: orders };
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    stockCount,
    salesCount,
    deliveryCount,
    ordersCount,
    totalCount: notifications.length,
    loading,
    refreshing,
    connectionStatus,
    isConnected,
    isConnecting,
    refresh,
    markAsRead,
    markAllAsRead,
    clearAll: clearNotifications,
  };
}
