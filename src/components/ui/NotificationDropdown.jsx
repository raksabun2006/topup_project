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

function formatRelativeKhmerTime(dateString) {
  if (!dateString) return 'ថ្មីៗ';
  try {
    const diffMs = Date.now() - new Date(dateString).getTime();
    if (isNaN(diffMs)) return 'ថ្មីៗ';
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'អម្បាញ់មិញ';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} នាទីមុន`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} ម៉ោងមុន`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'ម្សិលមិញ';
    if (diffDays < 7) return `${diffDays} ថ្ងៃមុន`;
    return new Date(dateString).toLocaleDateString('km-KH', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'ថ្មីៗ';
  }
}

export default function NotificationDropdown({ variant = 'admin' }) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'stock' | 'sales'
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="ការជូនដំណឹង"
        aria-expanded={open}
        className={`relative transition-all duration-200 outline-none select-none active:scale-95 cursor-pointer flex items-center justify-center rounded-full ${
          isNavbarVariant
            ? `h-10 w-10 text-white/90 hover:bg-white/15 hover:text-white ${
                open ? 'bg-white/20 text-white' : ''
              }`
            : `h-9 w-9 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white ${
                open ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : ''
              }`
        }`}
        title="ការជូនដំណឹង (Notifications)"
      >
        <Bell
          size={isNavbarVariant ? 19 : 17}
          className={`transition-transform duration-200 ${
            unreadCount > 0 ? 'animate-wiggle' : ''
          }`}
        />

        {/* Unread count badge */}
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-black text-white shadow-sm shadow-rose-600/50 animate-scale-in">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {open && (
        <div className="fixed sm:absolute right-2 sm:right-0 top-14 sm:top-full mt-2 w-[calc(100vw-1rem)] sm:w-[410px] max-w-[420px] rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl backdrop-blur-xl z-50 overflow-hidden animate-scale-in origin-top-right">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 py-3 bg-gradient-to-r from-emerald-600/10 via-emerald-600/5 to-transparent">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-600/25">
                <Bell size={15} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    ការជូនដំណឹង
                  </h3>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-rose-500/15 px-2 py-0.2 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                      {unreadCount} ថ្មី
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  បច្ចុប្បន្នភាពស្តុក និងការលក់
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
                title="ទាញយកទិន្នន័យឡើងវិញ (Refresh)"
              >
                <RefreshCw size={14} className={refreshing ? 'animate-spin text-emerald-500' : ''} />
              </button>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="សម្គាល់ថាបានអានទាំងអស់"
                >
                  <CheckCheck size={13} />
                  <span>អានទាំងអស់</span>
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
          <div className="flex items-center gap-1 border-b border-slate-100 dark:border-slate-800 px-3 py-2 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`rounded-lg px-2.5 py-1 transition cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              ទាំងអស់ ({notifications.length})
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
              ស្តុកទំនិញ {stockCount > 0 ? `(${stockCount})` : ''}
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
              ការលក់ {salesCount > 0 ? `(${salesCount})` : ''}
            </button>
          </div>

          {/* Notification Items List */}
          <div className="max-h-[340px] divide-y divide-slate-100 dark:divide-slate-800/80 overflow-y-auto touch-scroll">
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
              <div className="p-8 text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                  <Sparkles size={22} />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  គ្មានការជូនដំណឹងថ្មីទេ
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                  {activeTab === 'stock'
                    ? 'ស្តុកទំនិញទាំងអស់មានគ្រប់គ្រាន់'
                    : activeTab === 'sales'
                    ? 'គ្មានការលក់ដែលរង់ចាំការទូទាត់ទេ'
                    : 'ប្រព័ន្ធដំណើរការប្រក្រតី និងគ្មានបញ្ហាត្រូវដោះស្រាយទេ'}
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
                        ? 'bg-transparent hover:bg-slate-50/80 dark:hover:bg-slate-800/40 opacity-75 hover:opacity-100'
                        : 'bg-emerald-50/30 dark:bg-emerald-950/20 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40'
                    }`}
                  >
                    {/* Icon Column */}
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition ${
                        isOutOfStock
                          ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                          : isLowStock
                          ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'
                          : isPendingSale
                          ? 'bg-sky-100 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400'
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
                        <span className="shrink-0 text-[10px] text-slate-400 dark:text-slate-500">
                          {formatRelativeKhmerTime(item.timestamp)}
                        </span>
                      </div>

                      <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-300 leading-snug line-clamp-2">
                        {item.message}
                      </p>

                      {/* Pill Badge */}
                      <div className="mt-1.5 flex items-center gap-2">
                        {isOutOfStock && (
                          <span className="rounded-md bg-rose-100 dark:bg-rose-950/60 px-1.5 py-0.5 text-[9px] font-bold text-rose-700 dark:text-rose-300">
                            អស់ស្តុក (0)
                          </span>
                        )}
                        {isLowStock && (
                          <span className="rounded-md bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 text-[9px] font-bold text-amber-800 dark:text-amber-300">
                            នៅសល់ {item.meta?.stock}
                          </span>
                        )}
                        {isPendingSale && (
                          <span className="rounded-md bg-sky-100 dark:bg-sky-950/60 px-1.5 py-0.5 text-[9px] font-bold text-sky-800 dark:text-sky-300">
                            រង់ចាំទូទាត់
                          </span>
                        )}

                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 group-hover:underline flex items-center gap-0.5 ml-auto">
                          <span>ពិនិត្យ</span>
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
          <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-2.5 bg-slate-50/70 dark:bg-slate-900 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate('/dashboard/products');
              }}
              className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              <Package size={13} />
              <span>គ្រប់គ្រងស្តុក</span>
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
              <span>ប្រវត្តិការលក់</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
