import { Client } from '@stomp/stompjs';
import { env } from '../config/env.js';
import { authClient } from '../config/authClient.js';

// Polyfill window.global if undefined for legacy libraries
if (typeof window !== 'undefined' && typeof window.global === 'undefined') {
  window.global = window;
}

export const ConnectionStatus = {
  DISCONNECTED: 'DISCONNECTED',
  CONNECTING: 'CONNECTING',
  CONNECTED: 'CONNECTED',
  RECONNECTING: 'RECONNECTING',
  ERROR: 'ERROR',
};

const BACKOFF_DELAYS = [1000, 2000, 5000, 10000, 30000];
const USER_DESTINATION = '/user/queue/notifications';

class NotificationWebSocketService {
  constructor() {
    this.stompClient = null;
    this.subscription = null;
    this.status = ConnectionStatus.DISCONNECTED;
    this.statusListeners = new Set();
    this.messageListeners = new Set();
    this.reconnectAttempt = 0;
    this.reconnectTimer = null;
    this.isExplicitlyDisconnected = true;
    this.useSockJsFallback = false;

    // Browser Online / Offline listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());
    }
  }

  /**
   * Register listener for connection status changes
   */
  onStatusChange(listener) {
    this.statusListeners.add(listener);
    // Immediate callback with current status
    try {
      listener(this.status);
    } catch {
      // ignore
    }
    return () => this.statusListeners.delete(listener);
  }

  /**
   * Register listener for incoming notifications
   */
  onNotification(listener) {
    this.messageListeners.add(listener);
    return () => this.messageListeners.delete(listener);
  }

  /**
   * Broadcast status update to all registered listeners
   */
  updateStatus(newStatus) {
    this.status = newStatus;
    for (const listener of this.statusListeners) {
      try {
        listener(newStatus);
      } catch {
        // ignore listener exceptions
      }
    }
  }

  /**
   * Get active JWT token safely
   */
  async getValidToken() {
    try {
      const freshToken = await authClient.ensureFreshToken();
      if (freshToken) return freshToken;
    } catch {
      // fallback
    }
    return authClient.getAccessToken();
  }

  /**
   * Connect to WebSocket STOMP broker
   */
  async connect() {
    if (this.status === ConnectionStatus.CONNECTED || this.status === ConnectionStatus.CONNECTING) {
      return;
    }

    this.isExplicitlyDisconnected = false;

    const token = await this.getValidToken();
    if (!token) {
      this.updateStatus(ConnectionStatus.DISCONNECTED);
      return;
    }

    this.clearReconnectTimer();
    this.updateStatus(this.reconnectAttempt > 0 ? ConnectionStatus.RECONNECTING : ConnectionStatus.CONNECTING);

    this.cleanupClient();

    try {
      const connectHeaders = {
        Authorization: `Bearer ${token.trim()}`,
      };

      const clientConfig = {
        connectHeaders,
        reconnectDelay: 0, // Managed manually with custom exponential backoff
        heartbeatIncoming: 15000,
        heartbeatOutgoing: 15000,
        debug: () => {
          // Never log credentials, headers or tokens to console
        },
        beforeConnect: async () => {
          // Refresh token before each STOMP connect attempt
          const currentToken = await this.getValidToken();
          if (currentToken && this.stompClient) {
            this.stompClient.connectHeaders = {
              Authorization: `Bearer ${currentToken.trim()}`,
            };
          }
        },
        onConnect: (frame) => {
          this.reconnectAttempt = 0;
          this.updateStatus(ConnectionStatus.CONNECTED);
          this.subscribe();
        },
        onStompError: (frame) => {
          this.handleDisconnectOrError('STOMP_ERROR');
        },
        onWebSocketClose: (event) => {
          if (!this.isExplicitlyDisconnected) {
            this.handleDisconnectOrError('WS_CLOSE');
          }
        },
        onWebSocketError: (error) => {
          if (!this.useSockJsFallback) {
            // Enable SockJS fallback on next attempt if raw WebSocket failed
            this.useSockJsFallback = true;
          }
          this.handleDisconnectOrError('WS_ERROR');
        },
      };

      // Set broker transport (native WebSocket by default, SockJS fallback on failure)
      if (this.useSockJsFallback) {
        try {
          const sockjsModule = await import('sockjs-client');
          const SockJSClass = sockjsModule.default || sockjsModule;
          clientConfig.webSocketFactory = () => new SockJSClass(env.sockJsUrl);
        } catch {
          clientConfig.brokerURL = env.wsUrl;
        }
      } else {
        clientConfig.brokerURL = env.wsUrl;
      }

      this.stompClient = new Client(clientConfig);
      this.stompClient.activate();
    } catch (err) {
      this.handleDisconnectOrError(err?.message);
    }
  }

  /**
   * Subscribe to user-specific private notification destination
   */
  subscribe() {
    if (!this.stompClient || !this.stompClient.connected) return;

    try {
      if (this.subscription) {
        this.subscription.unsubscribe();
        this.subscription = null;
      }

      this.subscription = this.stompClient.subscribe(USER_DESTINATION, (message) => {
        try {
          if (!message.body) return;
          const notification = JSON.parse(message.body);
          if (notification && typeof notification === 'object') {
            this.dispatchNotification(notification);
          }
        } catch {
          // Ignore malformed JSON without crashing
        }
      });
    } catch {
      // ignore
    }
  }

  /**
   * Dispatch parsed notification to all listeners
   */
  dispatchNotification(notification) {
    for (const listener of this.messageListeners) {
      try {
        listener(notification);
      } catch {
        // ignore listener errors
      }
    }
  }

  /**
   * Handle connection interruption with controlled exponential backoff
   */
  handleDisconnectOrError(reason) {
    if (this.isExplicitlyDisconnected) {
      this.updateStatus(ConnectionStatus.DISCONNECTED);
      return;
    }

    this.cleanupClient();

    // Do not reconnect if browser is offline
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.updateStatus(ConnectionStatus.DISCONNECTED);
      return;
    }

    // Do not reconnect if user logged out or token is missing
    const token = authClient.getAccessToken();
    if (!token) {
      this.updateStatus(ConnectionStatus.DISCONNECTED);
      return;
    }

    const delayIndex = Math.min(this.reconnectAttempt, BACKOFF_DELAYS.length - 1);
    const delayMs = BACKOFF_DELAYS[delayIndex];
    this.reconnectAttempt += 1;

    this.updateStatus(ConnectionStatus.RECONNECTING);

    this.clearReconnectTimer();
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delayMs);
  }

  /**
   * Network came back online
   */
  handleOnline() {
    if (!this.isExplicitlyDisconnected && this.status !== ConnectionStatus.CONNECTED) {
      this.reconnectAttempt = 0;
      this.connect();
    }
  }

  /**
   * Network went offline
   */
  handleOffline() {
    this.clearReconnectTimer();
    this.updateStatus(ConnectionStatus.DISCONNECTED);
  }

  /**
   * Clear active backoff timer
   */
  clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Clean up active client instance
   */
  cleanupClient() {
    try {
      if (this.subscription) {
        this.subscription.unsubscribe();
        this.subscription = null;
      }
    } catch {
      // ignore
    }

    try {
      if (this.stompClient) {
        this.stompClient.deactivate();
        this.stompClient = null;
      }
    } catch {
      // ignore
    }
  }

  /**
   * Disconnect and cleanup (e.g. on logout or app destruction)
   */
  disconnect() {
    this.isExplicitlyDisconnected = true;
    this.reconnectAttempt = 0;
    this.clearReconnectTimer();
    this.cleanupClient();
    this.updateStatus(ConnectionStatus.DISCONNECTED);
  }

  /**
   * Check connection status
   */
  isConnected() {
    return this.status === ConnectionStatus.CONNECTED && !!(this.stompClient && this.stompClient.connected);
  }
}

export const notificationWebSocket = new NotificationWebSocketService();
