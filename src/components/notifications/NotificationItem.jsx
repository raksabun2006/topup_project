import {
  CheckCircle2,
  XCircle,
  PackageCheck,
  Truck,
  AlertTriangle,
  ShoppingBag,
  AlertOctagon,
  Tag,
  Bell,
  ExternalLink,
  Clock,
  Receipt,
} from 'lucide-react';
import { getNotificationVisuals, resolveNotificationLink } from '../../types/notification.types.js';

function renderIcon(iconName, size = 16) {
  switch (iconName) {
    case 'CheckCircle2':
      return <CheckCircle2 size={size} />;
    case 'XCircle':
      return <XCircle size={size} />;
    case 'PackageCheck':
      return <PackageCheck size={size} />;
    case 'Truck':
      return <Truck size={size} />;
    case 'AlertTriangle':
      return <AlertTriangle size={size} />;
    case 'ShoppingBag':
      return <ShoppingBag size={size} />;
    case 'AlertOctagon':
      return <AlertOctagon size={size} />;
    case 'Tag':
      return <Tag size={size} />;
    case 'Clock':
      return <Clock size={size} />;
    case 'Receipt':
      return <Receipt size={size} />;
    case 'Bell':
    default:
      return <Bell size={size} />;
  }
}

export function formatRelativeTime(dateString, isKhmer = false) {
  if (!dateString) return isKhmer ? 'ថ្មីៗ' : 'Just now';
  try {
    const timeMs = new Date(dateString).getTime();
    if (isNaN(timeMs)) return isKhmer ? 'ថ្មីៗ' : 'Just now';

    const diffMs = Date.now() - timeMs;
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec < 45) return isKhmer ? 'អម្បាញ់មិញ' : 'Just now';
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

export default function NotificationItem({
  notification,
  isKhmer = false,
  userRole = 'CUSTOMER',
  onItemClick,
}) {
  if (!notification) return null;

  const visuals = getNotificationVisuals(notification.type);
  const isRead = Boolean(notification.read ?? notification.isRead);
  const link = resolveNotificationLink(notification, userRole);

  const handleClick = () => {
    onItemClick?.(notification, link);
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className={`group relative flex items-start gap-3 p-3 sm:px-4 sm:py-3.5 transition cursor-pointer outline-none select-none ${
        isRead
          ? 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 opacity-80 hover:opacity-100'
          : 'bg-emerald-50/40 dark:bg-emerald-950/25 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/45'
      }`}
    >
      {/* Visual Type Icon Column */}
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${visuals.iconBg} ${visuals.iconColor}`}
      >
        {renderIcon(visuals.iconName, 17)}
      </div>

      {/* Content Column */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <p className={`text-xs font-bold truncate ${isRead ? 'text-slate-800 dark:text-slate-200' : 'text-slate-900 dark:text-white font-extrabold'}`}>
              {notification.title || 'System Notification'}
            </p>
            {!isRead && (
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
            )}
          </div>
          <span className="shrink-0 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            {formatRelativeTime(notification.createdAt || notification.timestamp, isKhmer)}
          </span>
        </div>

        <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-300 leading-snug line-clamp-2">
          {notification.message}
        </p>

        {/* Action Badges & Link */}
        <div className="mt-1.5 flex items-center gap-2">
          {notification.referenceType && (
            <span
              className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${visuals.badgeBg} ${visuals.badgeText}`}
            >
              {notification.referenceType}
            </span>
          )}

          {link && (
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 group-hover:underline flex items-center gap-0.5 ml-auto">
              <span>{isKhmer ? 'ពិនិត្យ' : 'View'}</span>
              <ExternalLink size={10} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
