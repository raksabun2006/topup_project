import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  RefreshCw,
  Sparkles,
  X,
  ExternalLink,
} from 'lucide-react';
import { useNotificationContext } from '../../context/NotificationContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { getNotificationCategory, NOTIFICATION_CATEGORIES } from '../../types/notification.types.js';
import NotificationItem from '../notifications/NotificationItem.jsx';
import NotificationSkeleton from '../notifications/NotificationSkeleton.jsx';
import { ConnectionStatus } from '../../services/notificationWebSocket.js';

export default function NotificationDropdown({ variant = 'admin' }) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread' | 'orders' | 'payments' | 'delivery'
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { isKhmer } = useLanguage();
  const { role } = useAuth();

  const {
    notifications,
    unreadCount,
    loading,
    refreshing,
    connectionStatus,
    refresh,
    markAsRead,
    markAllAsRead,
  } = useNotificationContext();

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  // Filter notifications based on active tab
  const filteredNotifications = useMemo(() => {
    if (activeTab === 'unread') {
      return notifications.filter((n) => n.read === false || n.isRead === false);
    }
    if (activeTab === 'orders') {
      return notifications.filter((n) => getNotificationCategory(n.type) === NOTIFICATION_CATEGORIES.ORDERS);
    }
    if (activeTab === 'payments') {
      return notifications.filter((n) => getNotificationCategory(n.type) === NOTIFICATION_CATEGORIES.PAYMENTS);
    }
    if (activeTab === 'delivery') {
      return notifications.filter((n) => getNotificationCategory(n.type) === NOTIFICATION_CATEGORIES.DELIVERY);
    }
    return notifications;
  }, [notifications, activeTab]);

  const handleItemClick = (item, link) => {
    if (item.id) {
      markAsRead(item.id).catch(() => {});
    }
    setOpen(false);
    if (link) {
      navigate(link);
    }
  };

  const isNavbarVariant = variant === 'navbar';

  const labels = {
    title: isKhmer ? 'ការជូនដំណឹង' : 'Notifications',
    subtitle: isKhmer ? 'បច្ចុប្បន្នភាពទាន់ហេតុការណ៍' : 'Real-time store updates',
    newBadge: isKhmer ? 'ថ្មី' : 'unread',
    readAll: isKhmer ? 'អានទាំងអស់' : 'Mark all read',
    allTab: isKhmer ? 'ទាំងអស់' : 'All',
    unreadTab: isKhmer ? 'មិនទាន់អាន' : 'Unread',
    ordersTab: isKhmer ? 'ការបញ្ជាទិញ' : 'Orders',
    paymentsTab: isKhmer ? 'ការទូទាត់' : 'Payments',
    deliveryTab: isKhmer ? 'ការដឹកជញ្ជូន' : 'Delivery',
    viewAll: isKhmer ? 'មើលការជូនដំណឹងទាំងអស់' : 'View all notifications',
    emptyTitle: isKhmer ? 'គ្មានការជូនដំណឹងទេ' : 'No notifications',
    emptyDesc: isKhmer ? 'លោកអ្នកបានអានការជូនដំណឹងទាំងអស់រួចរាល់ហើយ' : "You're all caught up.",
  };

  // Connection status dot color
  const statusColor =
    connectionStatus === ConnectionStatus.CONNECTED
      ? 'bg-emerald-500'
      : connectionStatus === ConnectionStatus.RECONNECTING || connectionStatus === ConnectionStatus.CONNECTING
      ? 'bg-amber-500'
      : 'bg-slate-400';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Mobile Dimmed Backdrop Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 sm:hidden animate-fade-in"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={labels.title}
        aria-expanded={open}
        className={`group relative transition-all duration-200 outline-none select-none active:scale-95 cursor-pointer flex items-center justify-center rounded-full ${
          isNavbarVariant
            ? `h-9 w-9 sm:h-10 sm:w-10 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 ${
                open ? 'bg-slate-100 dark:bg-slate-800 ring-2 ring-emerald-500/20' : ''
              }`
            : `h-8.5 w-8.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-2xs ${
                open ? 'ring-2 ring-emerald-500/30 border-emerald-500/50 text-emerald-600 dark:text-emerald-400' : ''
              }`
        }`}
        title={labels.title}
      >
        <Bell
          size={isNavbarVariant ? 19 : 16}
          className={`transition-transform duration-200 group-hover:rotate-12 ${
            unreadCount > 0 ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'
          }`}
        />

        {/* Unread count badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center pointer-events-none">
            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-rose-400 opacity-60" />
            <span className="relative flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white ring-2 ring-white dark:ring-slate-900 shadow-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Popover Dropdown Panel */}
      {open && (
        <div className="fixed sm:absolute right-2 sm:right-0 top-14 sm:top-full mt-2 w-[calc(100vw-1rem)] sm:w-[410px] max-w-[420px] rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl z-50 overflow-hidden animate-scale-in origin-top-right">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 py-3 bg-slate-50 dark:bg-slate-850">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-600/25">
                <Bell size={15} />
                {/* Live connection dot */}
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${statusColor}`}
                  title={`Status: ${connectionStatus}`}
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {labels.title}
                  </h3>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-rose-500/15 px-2 py-0.2 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                      {unreadCount} {labels.newBadge}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {labels.subtitle}
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={refresh}
                disabled={refreshing}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw size={14} className={refreshing ? 'animate-spin text-emerald-500' : ''} />
              </button>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 transition cursor-pointer"
                  title={labels.readAll}
                >
                  <CheckCheck size={13} />
                  <span>{labels.readAll}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition sm:hidden cursor-pointer"
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 border-b border-slate-100 dark:border-slate-800 px-3 py-1.5 bg-slate-50/80 dark:bg-slate-900 text-[11px] font-bold overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`rounded-lg px-2.5 py-1 transition cursor-pointer whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              {labels.allTab} ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('unread')}
              className={`rounded-lg px-2.5 py-1 transition cursor-pointer whitespace-nowrap ${
                activeTab === 'unread'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              {labels.unreadTab} {unreadCount > 0 ? `(${unreadCount})` : ''}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`rounded-lg px-2.5 py-1 transition cursor-pointer whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              {labels.ordersTab}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('payments')}
              className={`rounded-lg px-2.5 py-1 transition cursor-pointer whitespace-nowrap ${
                activeTab === 'payments'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              {labels.paymentsTab}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('delivery')}
              className={`rounded-lg px-2.5 py-1 transition cursor-pointer whitespace-nowrap ${
                activeTab === 'delivery'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              {labels.deliveryTab}
            </button>
          </div>

          {/* Notification Items List */}
          <div className="max-h-[340px] divide-y divide-slate-100 dark:divide-slate-800/80 overflow-y-auto touch-scroll bg-white dark:bg-slate-900">
            {loading && notifications.length === 0 ? (
              <NotificationSkeleton count={3} />
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                  <Sparkles size={22} />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {labels.emptyTitle}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                  {labels.emptyDesc}
                </p>
              </div>
            ) : (
              filteredNotifications.map((item) => (
                <NotificationItem
                  key={item.id}
                  notification={item}
                  isKhmer={isKhmer}
                  userRole={role}
                  onItemClick={handleItemClick}
                />
              ))
            )}
          </div>

          {/* Footer Navigation */}
          <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-2.5 bg-slate-50 dark:bg-slate-850 flex items-center justify-between text-xs">
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={markAllAsRead}
                className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                {labels.readAll}
              </button>
            ) : (
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                {labels.emptyDesc}
              </span>
            )}

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate('/notifications');
              }}
              className="inline-flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer"
            >
              <span>{labels.viewAll}</span>
              <ExternalLink size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
