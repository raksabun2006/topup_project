import { MapPin, Clock } from 'lucide-react';
import DeliveryStatusBadge, { STATUS_CONFIG } from './DeliveryStatusBadge';
import { formatDate } from '../../utils/format';
import { useLanguage } from '../../context/LanguageContext';

export function formatEventDescription(desc, isKhmer) {
  if (!desc || typeof desc !== 'string') return desc;
  if (!isKhmer) return desc;

  // "Delivery status changed to IN_TRANSIT"
  const statusMatch = desc.match(/^Delivery status changed to\s+([A-Z_]+)/i);
  if (statusMatch) {
    const rawSt = statusMatch[1].toUpperCase();
    const config = STATUS_CONFIG[rawSt];
    const khmerStatus = config?.labelKm || rawSt;
    return `ស្ថានភាពដឹកជញ្ជូនត្រូវបានប្តូរទៅជា «${khmerStatus}»`;
  }

  // "Tracking updated: DRV91118759"
  const trackingMatch = desc.match(/^Tracking updated:\s*(.*)/i);
  if (trackingMatch) {
    return `បានធ្វើបច្ចុប្បន្នភាពលេខតាមដាន: ${trackingMatch[1]}`;
  }

  // "Order placed and delivery created"
  if (desc.toLowerCase().includes('order placed and delivery created')) {
    return 'ការបញ្ជាទិញត្រូវបានបង្កើត និងរៀបចំការដឹកជញ្ជូន';
  }

  // "Delivery created"
  if (desc.toLowerCase().includes('delivery created')) {
    return 'ការដឹកជញ្ជូនត្រូវបានបង្កើតឡើង';
  }

  // "Courier assigned: ..."
  const courierMatch = desc.match(/^Courier assigned:\s*(.*)/i);
  if (courierMatch) {
    return `បានចាត់ចែងក្រុមហ៊ុនដឹកជញ្ជូន: ${courierMatch[1]}`;
  }

  // "Driver assigned: ..."
  const driverMatch = desc.match(/^Driver assigned:\s*(.*)/i);
  if (driverMatch) {
    return `បានចាត់ចែងអ្នកដឹកជញ្ជូន: ${driverMatch[1]}`;
  }

  // "Delivery cancelled: ..."
  const cancelMatch = desc.match(/^Delivery cancelled:\s*(.*)/i);
  if (cancelMatch) {
    return `ការដឹកជញ្ជូនត្រូវបានបោះបង់: ${cancelMatch[1]}`;
  }

  return desc;
}

export default function TrackingTimeline({
  events = [],
  currentStatus,
  emptyMessage,
  className = '',
}) {
  const { isKhmer } = useLanguage();

  if (!events || events.length === 0) {
    return (
      <div className={`text-center py-8 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 ${className}`}>
        <Clock size={28} className="mx-auto text-slate-400 mb-2 opacity-60" />
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
          {emptyMessage ||
            (isKhmer
              ? 'មិនទាន់មានព្រឹត្តិការណ៍តាមដាននៅឡើយទេ'
              : 'Tracking information is not available yet.')}
        </p>
      </div>
    );
  }

  // Sort events chronologically (most recent first for reverse-chronological timeline or earliest first)
  // Backend returns them in chronological order
  const sortedEvents = [...events].sort((a, b) => {
    const timeA = new Date(a.eventTime || a.createdAt || 0).getTime();
    const timeB = new Date(b.eventTime || b.createdAt || 0).getTime();
    return timeB - timeA; // Most recent on top
  });

  return (
    <div className={`relative space-y-6 ${className}`}>
      {sortedEvents.map((event, index) => {
        const isLatest = index === 0;
        const normalizedStatus = String(event.status || currentStatus || 'PENDING').toUpperCase();
        const config = STATUS_CONFIG[normalizedStatus] || STATUS_CONFIG.PENDING;
        const Icon = config.icon;
        const eventDate = event.eventTime || event.createdAt;

        return (
          <div key={event.id || `${normalizedStatus}-${index}`} className="relative flex items-start gap-3.5 group">
            {/* Vertical Connector Line */}
            {index < sortedEvents.length - 1 && (
              <span
                className="absolute left-4 top-8 bottom-0 -mb-6 w-0.5 bg-slate-200 dark:bg-slate-800 group-hover:bg-slate-300 dark:group-hover:bg-slate-700 transition-colors"
                aria-hidden="true"
              />
            )}

            {/* Step Icon Node */}
            <div
              className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-transform duration-200 ${
                isLatest
                  ? `${config.bg} ${config.border} text-slate-900 dark:text-white shadow-xs scale-105 ring-4 ring-emerald-500/10`
                  : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400'
              }`}
            >
              <Icon size={14} className={isLatest ? config.text : 'text-slate-500'} />
            </div>

            {/* Event Details Card */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <DeliveryStatusBadge status={event.status} size="xs" showDot={false} />
                  {isLatest && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300/40">
                      {isKhmer ? 'បច្ចុប្បន្ន' : 'Latest'}
                    </span>
                  )}
                </div>

                {eventDate && (
                  <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <Clock size={11} />
                    {formatDate(eventDate, 'full')}
                  </span>
                )}
              </div>

              {/* Remarks / Description */}
              {event.description && (
                <p className="text-xs text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                  {formatEventDescription(event.description, isKhmer)}
                </p>
              )}

              {/* Location Tag */}
              {event.location && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1 font-semibold">
                  <MapPin size={11} className="text-slate-400 shrink-0" />
                  <span>{event.location}</span>
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
