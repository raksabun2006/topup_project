import { useNavigate } from 'react-router-dom';
import { X, ExternalLink } from 'lucide-react';
import { useNotificationContext } from '../../context/NotificationContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { getNotificationVisuals, resolveNotificationLink } from '../../types/notification.types.js';
import { formatRelativeTime } from './NotificationItem.jsx';

export default function NotificationToast() {
  const { activeToasts, dismissToast, markAsRead } = useNotificationContext();
  const { role } = useAuth();
  const { isKhmer } = useLanguage();
  const navigate = useNavigate();

  if (!activeToasts || activeToasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-4 right-4 sm:top-20 sm:bottom-auto z-50 flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2rem)] sm:w-[380px] pointer-events-none select-none"
    >
      {activeToasts.map((toast) => {
        const notif = toast.notification;
        if (!notif) return null;

        const visuals = getNotificationVisuals(notif.type);
        const link = resolveNotificationLink(notif, role);

        const handleToastClick = () => {
          if (notif.id) {
            markAsRead(notif.id).catch(() => {});
          }
          dismissToast(toast.id);
          if (link) {
            navigate(link);
          }
        };

        return (
          <div
            key={toast.id}
            role="alert"
            className="pointer-events-auto group relative flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-2xl shadow-slate-900/15 transition-all duration-300 transform translate-y-0 animate-scale-in"
          >
            {/* Status indicator pill on the left border */}
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${visuals.iconBg} ${visuals.iconColor}`}
            >
              <span className="font-bold text-xs">🔔</span>
            </div>

            {/* Content area */}
            <div
              className="flex-1 min-w-0 cursor-pointer"
              onClick={handleToastClick}
            >
              <div className="flex items-center justify-between gap-1.5">
                <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                  {notif.title || 'Notification'}
                </p>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium shrink-0">
                  {formatRelativeTime(notif.createdAt, isKhmer)}
                </span>
              </div>

              <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-300 leading-snug line-clamp-2">
                {notif.message}
              </p>

              {link && (
                <div className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 group-hover:underline">
                  <span>{isKhmer ? 'ចុចដើម្បីមើល' : 'Click to view'}</span>
                  <ExternalLink size={10} />
                </div>
              )}
            </div>

            {/* Dismiss Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                dismissToast(toast.id);
              }}
              className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
