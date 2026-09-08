import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  RefreshCw,
  AlertTriangle,
  AlertOctagon,
  Clock,
  Package,
  ExternalLink,
  Receipt,
  Sparkles,
  X,
} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { useLanguage } from '../../context/LanguageContext';

function formatRelativeTime(dateString, isKhmer) {
  if (!dateString) return isKhmer ? 'ថ្មីៗ' : 'Just now';
  try {
    const diffMs = Date.now() - new Date(dateString).getTime();
    if (isNaN(diffMs)) return isKhmer ? 'ថ្មីៗ' : 'Just now';
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return isKhmer ? 'អម្បាញ់មិញ' : 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return isKhmer ? `${diffMin} នាទីមុន` : `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return isKhmer ? `${diffHours} ម៉ោងមុន` : `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return isKhmer ? 'ម្សិលមិញ' : 'Yesterday';
    if (diffDays < 7) return isKhmer ? `${diffDays} ថ្ងៃមុន` : `${diffDays}d ago`;
    return new Date(dateString).toLocaleDateString(isKhmer ? 'km-KH' : 'en-US', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return isKhmer ? 'ថ្មីៗ' : 'Just now';
  }
}

export default function NotificationDropdown({ variant = 'admin' }) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'stock' | 'sales'
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { isKhmer } = useLanguage();

  const {
    notifications,
    unreadCount,
    stockCount,
    salesCount,
    loading,
    refreshing,
    refresh,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

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

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'stock') {
      return notifications.filter((n) => n.category === 'stock');
    }
    if (activeTab === 'sales') {
      return notifications.filter((n) => n.category === 'sales');
    }
    return notifications;
  }, [notifications, activeTab]);

  const handleItemClick = (item) => {
    markAsRead(item.id);
    setOpen(false);
    if (item.link) {
      navigate(item.link);
    }
  };

  const isNavbarVariant = variant === 'navbar';

  const labels = {
    title: isKhmer ? 'ការជូនដំណឹង' : 'Notifications',
    subtitle: isKhmer ? 'បច្ចុប្បន្នភាពស្តុក និងការលក់' : 'Stock & sales updates',
    newBadge: isKhmer ? 'ថ្មី' : 'new',
    readAll: isKhmer ? 'អានទាំងអស់' : 'Mark all read',
    allTab: isKhmer ? 'ទាំងអស់' : 'All',
    stockTab: isKhmer ? 'ស្តុកទំនិញ' : 'Stock',
    salesTab: isKhmer ? 'ការលក់' : 'Sales',
    emptyTitle: isKhmer ? 'គ្មានការជូនដំណឹងថ្មីទេ' : 'No new notifications',
    emptyDescStock: isKhmer ? 'ស្តុកទំនិញទាំងអស់មានគ្រប់គ្រាន់' : 'All product inventory is well-stocked',
    emptyDescSales: isKhmer ? 'គ្មានការលក់ដែលរង់ចាំការទូទាត់ទេ' : 'No sales orders pending payment',
    emptyDescAll: isKhmer ? 'ប្រព័ន្ធដំណើរការប្រក្រតី និងគ្មានបញ្ហាត្រូវដោះស្រាយទេ' : 'Store operations running smoothly with no alerts',
    outOfStockBadge: isKhmer ? 'អស់ស្តុក (0)' : 'Out of stock (0)',
    lowStockBadge: (stock) => (isKhmer ? `នៅសល់ ${stock}` : `${stock} left in stock`),
    pendingBadge: isKhmer ? 'រង់ចាំទូទាត់' : 'Pending Payment',
    review: isKhmer ? 'ពិនិត្យ' : 'Review',
    manageStock: isKhmer ? 'គ្រប់គ្រងស្តុក' : 'Manage Inventory',
    salesHistory: isKhmer ? 'ប្រវត្តិការលក់' : 'Sales History',
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Mobile Dimmed Backdrop Overlay to prevent content bleed-through */}
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
            ? `h-10 w-10 text-white/90 hover:bg-white/15 hover:text-white ${
                open ? 'bg-white/20 text-white' : ''
              }`
            : `h-8.5 w-8.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-2xs ${
                open ? 'ring-2 ring-emerald-500/30 border-emerald-500/50 text-emerald-600 dark:text-emerald-400' : ''
              }`
        }`}
        title={`${labels.title}`}
      >
        <Bell
          size={isNavbarVariant ? 19 : 16}
          className={`transition-transform duration-200 group-hover:rotate-12 ${
            unreadCount > 0 ? 'text-slate-700 dark:text-slate-200' : ''
          }`}
        />

        {/* Unread count badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center pointer-events-none">
            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-rose-400 opacity-60" />
            <span className="relative flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white ring-2 ring-white dark:ring-slate-900 shadow-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Popover Dropdown Panel (100% Solid Opaque Background) */}
      {open && (
        <div className="fixed sm:absolute right-2 sm:right-0 top-14 sm:top-full mt-2 w-[calc(100vw-1rem)] sm:w-[410px] max-w-[420px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl z-50 overflow-hidden animate-scale-in origin-top-right">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 py-3 bg-slate-50 dark:bg-slate-850">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-600/25">
                <Bell size={15} />
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
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 border-b border-slate-100 dark:border-slate-800 px-3 py-2 bg-slate-50/80 dark:bg-slate-900 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`rounded-lg px-2.5 py-1 transition cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              {labels.allTab} ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('stock')}
              className={`rounded-lg px-2.5 py-1 transition cursor-pointer ${
                activeTab === 'stock'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              {labels.stockTab} {stockCount > 0 ? `(${stockCount})` : ''}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sales')}
              className={`rounded-lg px-2.5 py-1 transition cursor-pointer ${
                activeTab === 'sales'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              {labels.salesTab} {salesCount > 0 ? `(${salesCount})` : ''}
            </button>
          </div>

          {/* Notification Items List */}
          <div className="max-h-[340px] divide-y divide-slate-100 dark:divide-slate-800/80 overflow-y-auto touch-scroll bg-white dark:bg-slate-900">
            {loading ? (
              <div className="space-y-3 p-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="h-8 w-8 shrink-0 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-3/4 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                      <div className="h-2.5 w-1/2 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                  <Sparkles size={22} />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {labels.emptyTitle}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                  {activeTab === 'stock'
                    ? labels.emptyDescStock
                    : activeTab === 'sales'
                    ? labels.emptyDescSales
                    : labels.emptyDescAll}
                </p>
              </div>
            ) : (
              filteredNotifications.map((item) => {
                const isOutOfStock = item.type === 'out_of_stock';
                const isLowStock = item.type === 'low_stock';
                const isPendingSale = item.type === 'pending_payment';

                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`group relative flex items-start gap-3 p-3 sm:px-4 sm:py-3 transition cursor-pointer ${
                      item.isRead
                        ? 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 opacity-80 hover:opacity-100'
                        : 'bg-emerald-50/40 dark:bg-emerald-950/30 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/50'
                    }`}
                  >
                    {/* Icon Column */}
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition ${
                        isOutOfStock
                          ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                          : isLowStock
                          ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                          : isPendingSale
                          ? 'bg-sky-100 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {isOutOfStock ? (
                        <AlertOctagon size={16} />
                      ) : isLowStock ? (
                        <AlertTriangle size={16} />
                      ) : isPendingSale ? (
                        <Clock size={16} />
                      ) : (
                        <Receipt size={16} />
                      )}
                    </div>

                    {/* Text Column */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {item.title}
                          </p>
                          {!item.isRead && (
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
                          )}
                        </div>
                        <span className="shrink-0 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                          {formatRelativeTime(item.timestamp, isKhmer)}
                        </span>
                      </div>

                      <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-300 leading-snug line-clamp-2">
                        {item.message}
                      </p>

                      {/* Pill Badge */}
                      <div className="mt-1.5 flex items-center gap-2">
                        {isOutOfStock && (
                          <span className="rounded-md bg-rose-100 dark:bg-rose-950/60 px-1.5 py-0.5 text-[9px] font-bold text-rose-700 dark:text-rose-300">
                            {labels.outOfStockBadge}
                          </span>
                        )}
                        {isLowStock && (
                          <span className="rounded-md bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 text-[9px] font-bold text-amber-800 dark:text-amber-300">
                            {labels.lowStockBadge(item.meta?.stock)}
                          </span>
                        )}
                        {isPendingSale && (
                          <span className="rounded-md bg-sky-100 dark:bg-sky-950/60 px-1.5 py-0.5 text-[9px] font-bold text-sky-800 dark:text-sky-300">
                            {labels.pendingBadge}
                          </span>
                        )}

                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 group-hover:underline flex items-center gap-0.5 ml-auto">
                          <span>{labels.review}</span>
                          <ExternalLink size={10} />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Shortcuts */}
          <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-2.5 bg-slate-50 dark:bg-slate-850 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate('/dashboard/products');
              }}
              className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              <Package size={13} />
              <span>{labels.manageStock}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate('/dashboard/sales');
              }}
              className="inline-flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer"
            >
              <Receipt size={13} />
              <span>{labels.salesHistory}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
