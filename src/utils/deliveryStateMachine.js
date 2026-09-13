/**
 * Delivery State Machine Utility
 * Accurately implements backend state transitions defined in DeliveryStatus.java
 */

export const ALLOWED_TRANSITIONS = {
  PENDING: ['ASSIGNED', 'PICKED_UP', 'CANCELLED'],
  ASSIGNED: ['PICKED_UP', 'IN_TRANSIT', 'ARRIVED_AT_DESTINATION', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'PENDING'],
  READY_FOR_PICKUP: ['PICKED_UP', 'IN_TRANSIT', 'ARRIVED_AT_DESTINATION', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'PENDING'],
  PICKED_UP: ['IN_TRANSIT', 'ARRIVED_AT_DESTINATION', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'CANCELLED'],
  IN_TRANSIT: ['ARRIVED_AT_DESTINATION', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'CANCELLED'],
  ARRIVED_AT_DESTINATION: ['OUT_FOR_DELIVERY', 'IN_TRANSIT', 'DELIVERED', 'FAILED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'FAILED', 'RETURNING', 'CANCELLED'],
  FAILED: ['OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNING', 'CANCELLED'],
  FAILED_ATTEMPT: ['OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNING', 'CANCELLED'],
  RETURNING: ['RETURNED'],
  DELIVERED: [],
  RETURNED: [],
  CANCELLED: [],
};

/**
 * Checks if transitioning from currentStatus to targetStatus is permitted by backend rules
 */
export function canTransitionTo(currentStatus, targetStatus) {
  if (!currentStatus || !targetStatus) return false;
  if (currentStatus === targetStatus) return true; // Idempotent
  const allowed = ALLOWED_TRANSITIONS[String(currentStatus).toUpperCase()] || [];
  return allowed.includes(String(targetStatus).toUpperCase());
}

/**
 * Returns array of allowable target statuses for the given current status
 */
export function getAvailableTransitions(currentStatus) {
  if (!currentStatus) return [];
  const normalized = String(currentStatus).toUpperCase();
  return ALLOWED_TRANSITIONS[normalized] || [];
}

/**
 * Checks if status is a terminal state (cannot be changed anymore)
 */
export function isTerminalStatus(status) {
  const s = String(status || '').toUpperCase();
  return s === 'DELIVERED' || s === 'RETURNED' || s === 'CANCELLED';
}
