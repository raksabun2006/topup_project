import { Bell } from 'lucide-react';

/**
 * Reusable Notification Bell with unread count badge
 */
export default function NotificationBell({
  unreadCount = 0,
  isOpen = false,
  onClick,
  variant = 'default', // 'default' | 'navbar' | 'admin'
  className = '',
  title = 'Notifications',
}) {
  const isNavbar = variant === 'navbar';
  const isAdmin = variant === 'admin';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={title}
      aria-expanded={isOpen}
      aria-haspopup="true"
      title={title}
      className={`group relative transition-all duration-200 outline-none select-none active:scale-95 cursor-pointer flex items-center justify-center rounded-full ${
        isNavbar
          ? `h-9 w-9 sm:h-10 sm:w-10 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 ${
              isOpen ? 'bg-slate-100 dark:bg-slate-800 ring-2 ring-emerald-500/20' : ''
            }`
          : isAdmin
          ? `h-8.5 w-8.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-2xs ${
              isOpen ? 'ring-2 ring-emerald-500/30 border-emerald-500/50 text-emerald-600 dark:text-emerald-400' : ''
            }`
          : `h-9 w-9 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-2xs ${
              isOpen ? 'ring-2 ring-emerald-500/30 border-emerald-500/50 text-emerald-600 dark:text-emerald-400' : ''
            }`
      } ${className}`}
    >
      <Bell
        size={isNavbar ? 19 : 17}
        className={`transition-transform duration-200 group-hover:rotate-12 ${
          unreadCount > 0 ? 'text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-300'
        }`}
      />

      {/* Unread badge */}
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center pointer-events-none">
          <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-rose-400 opacity-60" />
          <span className="relative flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white ring-2 ring-white dark:ring-slate-900 shadow-xs">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        </span>
      )}
    </button>
  );
}
