import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { notificationApi } from '../api/notificationApi.js';
import { notificationWebSocket, ConnectionStatus } from '../services/notificationWebSocket.js';
import { useAuth } from './AuthContext.jsx';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { isAuthenticated, user, token } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(ConnectionStatus.DISCONNECTED);
  const [lastError, setLastError] = useState(null);

  // Active Real-Time Toasts (for real-time popups)
  const [activeToasts, setActiveToasts] = useState([]);

  // In-memory deduplication set of seen notification IDs
  const seenIdsRef = useRef(new Set());
  // Track previous connection status to trigger synchronization on reconnect
  const prevConnectionStatusRef = useRef(ConnectionStatus.DISCONNECTED);
  // Flag to know if initial REST hydration has completed
  const isHydratedRef = useRef(false);

  /**
   * Clear all notification state (called on logout or account switch)
   */
  const clearNotifications = useCallback(() => {
    seenIdsRef.current.clear();
    setNotifications([]);
    setUnreadCount(0);
    setActiveToasts([]);
    setLastError(null);
    isHydratedRef.current = false;
  }, []);

  /**
   * Remove a toast from display
   */
  const dismissToast = useCallback((toastId) => {
    setActiveToasts((prev) => prev.filter((t) => t.id !== toastId));
  }, []);

  /**
   * Display a real-time toast banner
   */
  const triggerToast = useCallback((notification) => {
    const toastId = notification.id || `toast-${Date.now()}-${Math.random()}`;
    const newToast = {
      id: toastId,
      notification,
      createdAt: Date.now(),
    };

    setActiveToasts((prev) => [newToast, ...prev].slice(0, 3)); // Show at most 3 simultaneous toasts

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      dismissToast(toastId);
    }, 5000);
  }, [dismissToast]);

  /**
   * Deduplicate and insert a single notification (e.g. from WebSocket)
   */
  const addNotification = useCallback((incoming, fromWebSocket = false) => {
    if (!incoming || !incoming.id) return;

    const notifId = String(incoming.id);

    // Strict deduplication check by notification.id
    if (seenIdsRef.current.has(notifId)) {
      return;
    }

    seenIdsRef.current.add(notifId);

    const isUnread = incoming.read === false || incoming.isRead === false;

    setNotifications((prev) => {
      // Secondary array check
      if (prev.some((n) => String(n.id) === notifId)) {
        return prev;
      }
      return [incoming, ...prev];
    });

    if (isUnread) {
      setUnreadCount((prev) => prev + 1);
    }

    // Trigger toast only if genuinely new real-time WebSocket event and not during initial hydration
    if (fromWebSocket && isHydratedRef.current) {
      triggerToast(incoming);
    }
  }, [triggerToast]);

  // Guard against overlapping concurrent fetches
  const isFetchingRef = useRef(false);

  /**
   * Hydrate notifications and unread count from REST
   */
  const fetchRecent = useCallback(async (isManualRefresh = false) => {
    if (!isAuthenticated) return;
    if (isFetchingRef.current) return;

    isFetchingRef.current = true;
    if (isManualRefresh) setRefreshing(true);
    else if (!isHydratedRef.current) setLoading(true);

    try {
      // Concurrent fetch: recent notifications + unread count
      const [notifsRes, countRes] = await Promise.allSettled([
        notificationApi.getNotifications({ page: 0, size: 25 }),
        notificationApi.getUnreadCount(),
      ]);

      if (countRes.status === 'fulfilled') {
        setUnreadCount(Number(countRes.value) || 0);
      }

      if (notifsRes.status === 'fulfilled') {
        const list = notifsRes.value?.content || (Array.isArray(notifsRes.value) ? notifsRes.value : []);

        // Populate deduplication set and list
        const uniqueItems = [];
        for (const item of list) {
          if (item?.id) {
            const notifId = String(item.id);
            seenIdsRef.current.add(notifId);
            uniqueItems.push(item);
          }
        }

        setNotifications((prev) => {
          // Merge preserving any newer real-time notifications already captured
          const existingMap = new Map();
          for (const item of prev) {
            if (item?.id) existingMap.set(String(item.id), item);
          }
          for (const item of uniqueItems) {
            if (!existingMap.has(String(item.id))) {
              existingMap.set(String(item.id), item);
            }
          }
          const merged = Array.from(existingMap.values());
          merged.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          return merged;
        });

        isHydratedRef.current = true;
      }
    } catch (err) {
      setLastError(err);
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
      if (isManualRefresh) setRefreshing(false);
    }
  }, [isAuthenticated]);

  /**
   * Optimistically mark a single notification as read
   */
  const markAsRead = useCallback(async (id) => {
    if (!id) return;
    const notifId = String(id);

    // Optimistic UI update
    let wasUnread = false;
    setNotifications((prev) =>
      prev.map((n) => {
        if (String(n.id) === notifId) {
          if (n.read === false || n.isRead === false) {
            wasUnread = true;
          }
          return { ...n, read: true, isRead: true, readAt: new Date().toISOString() };
        }
        return n;
      })
    );

    if (wasUnread) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    try {
      await notificationApi.markAsRead(notifId);
    } catch (err) {
      // Revert on failure
      if (wasUnread) {
        setNotifications((prev) =>
          prev.map((n) => {
            if (String(n.id) === notifId) {
              return { ...n, read: false, isRead: false, readAt: null };
            }
            return n;
          })
        );
        setUnreadCount((prev) => prev + 1);
      }
      throw err;
    }
  }, []);

  /**
   * Optimistically mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    // Snapshot previous state in case of network failure
    const prevNotifications = [...notifications];
    const prevCount = unreadCount;

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true, isRead: true, readAt: n.readAt || new Date().toISOString() }))
    );
    setUnreadCount(0);

    try {
      await notificationApi.markAllAsRead();
    } catch (err) {
      // Rollback
      setNotifications(prevNotifications);
      setUnreadCount(prevCount);
      throw err;
    }
  }, [notifications, unreadCount]);

  /**
   * Manage WebSocket connection lifecycle based on authentication state
   */
  useEffect(() => {
    if (!isAuthenticated || !token) {
      notificationWebSocket.disconnect();
      clearNotifications();
      return;
    }

    // 1. Initial REST Hydration
    fetchRecent();

    // 2. Establish WebSocket Connection
    notificationWebSocket.connect();

    // 3. Listen to connection status
    const unbindStatus = notificationWebSocket.onStatusChange((status) => {
      setConnectionStatus(status);

      // Reconnect Synchronization: ONLY when re-establishing after an active disconnect/reconnect
      if (
        status === ConnectionStatus.CONNECTED &&
        prevConnectionStatusRef.current === ConnectionStatus.RECONNECTING
      ) {
        // Recover missed events during offline/disconnection
        fetchRecent();
      }

      prevConnectionStatusRef.current = status;
    });

    // 4. Listen to incoming real-time messages
    const unbindMessage = notificationWebSocket.onNotification((rawNotification) => {
      addNotification(rawNotification, true);
    });

    return () => {
      unbindStatus();
      unbindMessage();
      notificationWebSocket.disconnect();
    };
  }, [isAuthenticated, token, user?.id, clearNotifications, fetchRecent, addNotification]);

  const isConnected = connectionStatus === ConnectionStatus.CONNECTED;
  const isConnecting = connectionStatus === ConnectionStatus.CONNECTING || connectionStatus === ConnectionStatus.RECONNECTING;

  const value = {
    notifications,
    unreadCount,
    loading,
    refreshing,
    connectionStatus,
    isConnected,
    isConnecting,
    lastError,
    activeToasts,
    dismissToast,
    refresh: () => fetchRecent(true),
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    setNotifications,
    setUnreadCount,
    connect: () => notificationWebSocket.connect(),
    disconnect: () => notificationWebSocket.disconnect(),
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}
