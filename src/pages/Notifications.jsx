import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  RefreshCw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { notificationApi } from '../api/notificationApi.js';
import { useNotificationContext } from '../context/NotificationContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { getNotificationCategory, NOTIFICATION_CATEGORIES } from '../types/notification.types.js';
import NotificationItem from '../components/notifications/NotificationItem.jsx';
import NotificationSkeleton from '../components/notifications/NotificationSkeleton.jsx';
import SEO from '../components/SEO.jsx';

function getDateGroup(dateString, isKhmer) {
  if (!dateString) return isKhmer ? 'មុនៗ' : 'Older';
  try {
    const d = new Date(dateString);
    const now = new Date();
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    if (isToday) return isKhmer ? 'ថ្ងៃនេះ' : 'Today';

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday =
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear();

    if (isYesterday) return isKhmer ? 'ម្សិលមិញ' : 'Yesterday';

    return isKhmer ? 'មុនៗ' : 'Older';
  } catch {
    return isKhmer ? 'មុនៗ' : 'Older';
  }
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { isKhmer } = useLanguage();
  const { markAsRead, markAllAsRead, refresh: refreshContext } = useNotificationContext();

  const [page, setPage] = useState(0);
  const pageSize = 20;
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'unread' | 'orders' | 'payments' | 'delivery'
  const [data, setData] = useState({
    content: [],
    totalElements: 0,
    totalPages: 1,
    page: 0,
    size: pageSize,
    last: true,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPage = useCallback(async (targetPage = 0, isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await notificationApi.getNotifications({ page: targetPage, size: pageSize });
      setData(res);
      setPage(targetPage);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, [pageSize]);

  useEffect(() => {
    fetchPage(0);
  }, [fetchPage]);

  const handleRefresh = () => {
    fetchPage(page, true);
    refreshContext();
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setData((prev) => ({
        ...prev,
        content: prev.content.map((n) => ({ ...n, read: true, isRead: true, readAt: new Date().toISOString() })),
      }));
    } catch {
      // error handled in context
    }
  };

  const handleItemClick = async (item, link) => {
    if (item.id) {
      await markAsRead(item.id).catch(() => {});
      setData((prev) => ({
        ...prev,
        content: prev.content.map((n) =>
          n.id === item.id ? { ...n, read: true, isRead: true, readAt: new Date().toISOString() } : n
        ),
      }));
    }
    if (link) {
      navigate(link);
    }
  };

  // Filter items in current page
  const filteredItems = useMemo(() => {
    const list = data.content || [];
    if (activeFilter === 'unread') {
      return list.filter((n) => n.read === false || n.isRead === false);
    }
    if (activeFilter === 'orders') {
      return list.filter((n) => getNotificationCategory(n.type) === NOTIFICATION_CATEGORIES.ORDERS);
    }
    if (activeFilter === 'payments') {
      return list.filter((n) => getNotificationCategory(n.type) === NOTIFICATION_CATEGORIES.PAYMENTS);
    }
    if (activeFilter === 'delivery') {
      return list.filter((n) => getNotificationCategory(n.type) === NOTIFICATION_CATEGORIES.DELIVERY);
    }
    return list;
  }, [data.content, activeFilter]);

  // Group items by Today, Yesterday, Older
  const groupedItems = useMemo(() => {
    const groups = {
      Today: [],
      Yesterday: [],
      Older: [],
    };

    for (const item of filteredItems) {
      const g = getDateGroup(item.createdAt || item.timestamp, false);
      if (groups[g]) {
        groups[g].push(item);
      } else {
        groups.Older.push(item);
      }
    }

    return groups;
  }, [filteredItems]);

  const unreadOnPage = useMemo(() => {
    return (data.content || []).filter((n) => n.read === false || n.isRead === false).length;
  }, [data.content]);

  const labels = {
    title: isKhmer ? 'ការជូនដំណឹងទាំងអស់' : 'Notifications',
    subtitle: isKhmer
      ? 'តាមដានបច្ចុប្បន្នភាពការបញ្ជាទិញ ការទូទាត់ និងការដឹកជញ្ជូនរបស់អ្នក'
      : 'Track your orders, payments, shipments and store activity',
    all: isKhmer ? 'ទាំងអស់' : 'All',
    unread: isKhmer ? 'មិនទាន់អាន' : 'Unread',
    orders: isKhmer ? 'ការបញ្ជាទិញ' : 'Orders',
    payments: isKhmer ? 'ការទូទាត់' : 'Payments',
    delivery: isKhmer ? 'ការដឹកជញ្ជូន' : 'Delivery',
    markAllRead: isKhmer ? 'សម្គាល់ថាបានអានទាំងអស់' : 'Mark all as read',
    emptyTitle: isKhmer ? 'មិនមានការជូនដំណឹងទេ' : 'No notifications',
    emptyDesc: isKhmer ? 'អ្នកបានពិនិត្យមើលព័ត៌មានទាំងអស់រួចរាល់ហើយ' : "You're all caught up.",
    page: isKhmer ? 'ទំព័រ' : 'Page',
    of: isKhmer ? 'នៃ' : 'of',
    prev: isKhmer ? 'ថយក្រោយ' : 'Previous',
    next: isKhmer ? 'បន្ទាប់' : 'Next',
    today: isKhmer ? 'ថ្ងៃនេះ' : 'Today',
    yesterday: isKhmer ? 'ម្សិលមិញ' : 'Yesterday',
    older: isKhmer ? 'មុនៗ' : 'Older',
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 py-6 sm:py-10">
      <SEO
        title={isKhmer ? 'ការជូនដំណឹង | Mart System' : 'Notifications | Mart System'}
        description="Stay updated with order tracking, payments, deliveries and store announcements."
        noindex={true}
        robots="noindex, nofollow"
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Top Header Card */}
        <div className="mb-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/20">
                <Bell size={22} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {labels.title}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {labels.subtitle}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={14} className={refreshing ? 'animate-spin text-emerald-500' : ''} />
                <span className="hidden sm:inline">{isKhmer ? 'ផ្ទុកឡើងវិញ' : 'Refresh'}</span>
              </button>

              {unreadOnPage > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-bold transition shadow-sm cursor-pointer active:scale-95"
                >
                  <CheckCheck size={14} />
                  <span>{labels.markAllRead}</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills Bar */}
          <div className="mt-6 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-t border-slate-100 dark:border-slate-800 pt-4">
            <div className="flex items-center gap-1 text-slate-400 text-xs mr-1">
              <Filter size={13} />
            </div>

            {[
              { id: 'all', label: labels.all, count: data.totalElements },
              { id: 'unread', label: labels.unread, count: unreadOnPage },
              { id: 'orders', label: labels.orders },
              { id: 'payments', label: labels.payments },
              { id: 'delivery', label: labels.delivery },
            ].map((tab) => {
              const active = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tab.label}
                  {typeof tab.count === 'number' && tab.count > 0 && (
                    <span className={`ml-1.5 rounded-full px-1.5 py-0.2 text-[10px] ${
                      active
                        ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notifications List Container */}
        <div className="overflow-hidden rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          {loading ? (
            <NotificationSkeleton count={6} />
          ) : filteredItems.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                <Sparkles size={28} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {labels.emptyTitle}
              </h3>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
                {labels.emptyDesc}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {/* Group: Today */}
              {groupedItems.Today.length > 0 && (
                <div>
                  <div className="bg-slate-50/80 dark:bg-slate-850 px-4 py-2 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    {labels.today} ({groupedItems.Today.length})
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {groupedItems.Today.map((item) => (
                      <NotificationItem
                        key={item.id}
                        notification={item}
                        isKhmer={isKhmer}
                        userRole={role}
                        onItemClick={handleItemClick}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Group: Yesterday */}
              {groupedItems.Yesterday.length > 0 && (
                <div>
                  <div className="bg-slate-50/80 dark:bg-slate-850 px-4 py-2 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    {labels.yesterday} ({groupedItems.Yesterday.length})
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {groupedItems.Yesterday.map((item) => (
                      <NotificationItem
                        key={item.id}
                        notification={item}
                        isKhmer={isKhmer}
                        userRole={role}
                        onItemClick={handleItemClick}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Group: Older */}
              {groupedItems.Older.length > 0 && (
                <div>
                  <div className="bg-slate-50/80 dark:bg-slate-850 px-4 py-2 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    {labels.older} ({groupedItems.Older.length})
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {groupedItems.Older.map((item) => (
                      <NotificationItem
                        key={item.id}
                        notification={item}
                        isKhmer={isKhmer}
                        userRole={role}
                        onItemClick={handleItemClick}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pagination Controls */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-850 text-xs font-bold">
              <button
                type="button"
                onClick={() => fetchPage(page - 1)}
                disabled={page <= 0 || loading}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={14} />
                <span>{labels.prev}</span>
              </button>

              <span className="text-slate-500 dark:text-slate-400">
                {labels.page} {page + 1} {labels.of} {data.totalPages}
              </span>

              <button
                type="button"
                onClick={() => fetchPage(page + 1)}
                disabled={data.last || page >= data.totalPages - 1 || loading}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition"
              >
                <span>{labels.next}</span>
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
