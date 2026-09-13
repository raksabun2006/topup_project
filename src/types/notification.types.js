/**
 * Notification Types and Metadata Definitions
 * Handles both known backend events and unknown fallbacks gracefully.
 */

export const NOTIFICATION_TYPES = {
  // Customer & Staff Order Events
  ORDER_CREATED: 'ORDER_CREATED',
  ORDER_CONFIRMED: 'ORDER_CONFIRMED',
  ORDER_CANCELLED: 'ORDER_CANCELLED',
  NEW_ORDER: 'NEW_ORDER',

  // Payment Events
  PAYMENT_SUCCESS: 'PAYMENT_SUCCESS',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',

  // Fulfillment & Delivery Events
  SHIPMENT_CREATED: 'SHIPMENT_CREATED',
  ORDER_SHIPPED: 'ORDER_SHIPPED',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  ORDER_DELIVERED: 'ORDER_DELIVERED',
  DELIVERY_FAILED: 'DELIVERY_FAILED',
  ORDER_RETURNED: 'ORDER_RETURNED',
  COURIER_ERROR: 'COURIER_ERROR',

  // Inventory & Store Events
  LOW_STOCK: 'LOW_STOCK',

  // Marketing & System
  PROMOTION: 'PROMOTION',
  SYSTEM: 'SYSTEM',
};

export const NOTIFICATION_CATEGORIES = {
  ALL: 'all',
  ORDERS: 'orders',
  PAYMENTS: 'payments',
  DELIVERY: 'delivery',
  INVENTORY: 'inventory',
  SYSTEM: 'system',
};

/**
 * Maps notification type to high-level UI category
 */
export function getNotificationCategory(type) {
  if (!type || typeof type !== 'string') return NOTIFICATION_CATEGORIES.SYSTEM;
  const upper = type.toUpperCase();

  if (upper.includes('PAYMENT')) return NOTIFICATION_CATEGORIES.PAYMENTS;
  if (
    upper.includes('DELIVERY') ||
    upper.includes('SHIPMENT') ||
    upper.includes('SHIPPED') ||
    upper.includes('COURIER') ||
    upper.includes('RETURNED')
  ) {
    return NOTIFICATION_CATEGORIES.DELIVERY;
  }
  if (upper.includes('STOCK') || upper.includes('INVENTORY') || upper.includes('PRODUCT')) {
    return NOTIFICATION_CATEGORIES.INVENTORY;
  }
  if (upper.includes('ORDER')) return NOTIFICATION_CATEGORIES.ORDERS;
  return NOTIFICATION_CATEGORIES.SYSTEM;
}

/**
 * Maps notification type to visual theme (icon type, color scheme, severity)
 */
export function getNotificationVisuals(type) {
  const upper = typeof type === 'string' ? type.toUpperCase() : 'SYSTEM';

  switch (upper) {
    // Payment Success
    case NOTIFICATION_TYPES.PAYMENT_SUCCESS:
    case NOTIFICATION_TYPES.PAYMENT_RECEIVED:
      return {
        variant: 'success',
        iconName: 'CheckCircle2',
        badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60',
        badgeText: 'text-emerald-700 dark:text-emerald-300',
        ringColor: 'ring-emerald-500/20',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        iconBg: 'bg-emerald-50 dark:bg-emerald-950/50',
      };

    // Payment Failed
    case NOTIFICATION_TYPES.PAYMENT_FAILED:
      return {
        variant: 'danger',
        iconName: 'XCircle',
        badgeBg: 'bg-rose-100 dark:bg-rose-950/60',
        badgeText: 'text-rose-700 dark:text-rose-300',
        ringColor: 'ring-rose-500/20',
        iconColor: 'text-rose-600 dark:text-rose-400',
        iconBg: 'bg-rose-50 dark:bg-rose-950/50',
      };

    // Delivery Success / Delivered
    case NOTIFICATION_TYPES.ORDER_DELIVERED:
      return {
        variant: 'success',
        iconName: 'PackageCheck',
        badgeBg: 'bg-teal-100 dark:bg-teal-950/60',
        badgeText: 'text-teal-700 dark:text-teal-300',
        ringColor: 'ring-teal-500/20',
        iconColor: 'text-teal-600 dark:text-teal-400',
        iconBg: 'bg-teal-50 dark:bg-teal-950/50',
      };

    // Out for delivery / Shipped
    case NOTIFICATION_TYPES.OUT_FOR_DELIVERY:
    case NOTIFICATION_TYPES.ORDER_SHIPPED:
    case NOTIFICATION_TYPES.SHIPMENT_CREATED:
      return {
        variant: 'info',
        iconName: 'Truck',
        badgeBg: 'bg-sky-100 dark:bg-sky-950/60',
        badgeText: 'text-sky-700 dark:text-sky-300',
        ringColor: 'ring-sky-500/20',
        iconColor: 'text-sky-600 dark:text-sky-400',
        iconBg: 'bg-sky-50 dark:bg-sky-950/50',
      };

    // Delivery Failed / Courier Error / Order Returned
    case NOTIFICATION_TYPES.DELIVERY_FAILED:
    case NOTIFICATION_TYPES.COURIER_ERROR:
    case NOTIFICATION_TYPES.ORDER_RETURNED:
    case NOTIFICATION_TYPES.ORDER_CANCELLED:
      return {
        variant: 'danger',
        iconName: 'AlertTriangle',
        badgeBg: 'bg-rose-100 dark:bg-rose-950/60',
        badgeText: 'text-rose-700 dark:text-rose-300',
        ringColor: 'ring-rose-500/20',
        iconColor: 'text-rose-600 dark:text-rose-400',
        iconBg: 'bg-rose-50 dark:bg-rose-950/50',
      };

    // Order created / confirmed / new order
    case NOTIFICATION_TYPES.ORDER_CREATED:
    case NOTIFICATION_TYPES.NEW_ORDER:
    case NOTIFICATION_TYPES.ORDER_CONFIRMED:
      return {
        variant: 'primary',
        iconName: 'ShoppingBag',
        badgeBg: 'bg-indigo-100 dark:bg-indigo-950/60',
        badgeText: 'text-indigo-700 dark:text-indigo-300',
        ringColor: 'ring-indigo-500/20',
        iconColor: 'text-indigo-600 dark:text-indigo-400',
        iconBg: 'bg-indigo-50 dark:bg-indigo-950/50',
      };

    // Low stock
    case NOTIFICATION_TYPES.LOW_STOCK:
      return {
        variant: 'warning',
        iconName: 'AlertOctagon',
        badgeBg: 'bg-amber-100 dark:bg-amber-950/60',
        badgeText: 'text-amber-700 dark:text-amber-300',
        ringColor: 'ring-amber-500/20',
        iconColor: 'text-amber-600 dark:text-amber-400',
        iconBg: 'bg-amber-50 dark:bg-amber-950/50',
      };

    // Promotion
    case NOTIFICATION_TYPES.PROMOTION:
      return {
        variant: 'secondary',
        iconName: 'Tag',
        badgeBg: 'bg-purple-100 dark:bg-purple-950/60',
        badgeText: 'text-purple-700 dark:text-purple-300',
        ringColor: 'ring-purple-500/20',
        iconColor: 'text-purple-600 dark:text-purple-400',
        iconBg: 'bg-purple-50 dark:bg-purple-950/50',
      };

    // Generic / Fallback System Notification
    case NOTIFICATION_TYPES.SYSTEM:
    default:
      return {
        variant: 'default',
        iconName: 'Bell',
        badgeBg: 'bg-slate-100 dark:bg-slate-800',
        badgeText: 'text-slate-700 dark:text-slate-300',
        ringColor: 'ring-slate-500/20',
        iconColor: 'text-slate-600 dark:text-slate-400',
        iconBg: 'bg-slate-100 dark:bg-slate-800',
      };
  }
}

/**
 * Resolves safe frontend navigation target based on referenceType and referenceId.
 * Does not invent routes; uses existing app routes.
 */
export function resolveNotificationLink(notification, userRole = 'CUSTOMER') {
  if (!notification) return null;
  const refType = notification.referenceType ? String(notification.referenceType).toUpperCase() : '';
  const refId = notification.referenceId ? String(notification.referenceId).trim() : '';

  const isAdminOrStaff = userRole === 'ADMIN' || userRole === 'STAFF';

  if (!refId) {
    if (refType === 'ORDERS' || refType === 'ORDER') {
      return isAdminOrStaff ? '/dashboard/orders' : '/orders';
    }
    if (refType === 'DELIVERY' || refType === 'DELIVERIES') {
      return isAdminOrStaff ? '/dashboard/deliveries' : '/orders';
    }
    if (refType === 'INVENTORY' || refType === 'PRODUCT' || refType === 'PRODUCTS') {
      return isAdminOrStaff ? '/dashboard/products' : '/shop';
    }
    return null;
  }

  switch (refType) {
    case 'ORDER':
      return isAdminOrStaff ? `/dashboard/orders` : `/orders/${refId}`;
    case 'DELIVERY':
    case 'SHIPMENT':
      return isAdminOrStaff ? `/dashboard/deliveries/${refId}` : `/orders/${refId}/delivery`;
    case 'PAYMENT':
      return isAdminOrStaff ? `/dashboard/sales/${refId}` : `/orders/${refId}`;
    case 'SALE':
      return `/dashboard/sales/${refId}`;
    case 'PRODUCT':
      return isAdminOrStaff ? `/dashboard/products` : `/product/${refId}`;
    default:
      return null;
  }
}
