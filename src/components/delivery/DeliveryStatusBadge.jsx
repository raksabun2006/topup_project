import {
  Clock, CheckCircle2, Truck, Package, MapPin,
  AlertTriangle, RotateCcw, XCircle, Send, CornerDownLeft
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const STATUS_CONFIG = {
  PENDING: {
    icon: Clock,
    labelEn: 'Pending',
    labelKm: 'រង់ចាំការចាត់ចែង',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200/80 dark:border-amber-800/50',
    dot: 'bg-amber-500',
  },
  ASSIGNED: {
    icon: Package,
    labelEn: 'Ready for Pickup',
    labelKm: 'បានចាត់ចែង / រង់ចាំទទួល',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200/80 dark:border-blue-800/50',
    dot: 'bg-blue-500',
  },
  READY_FOR_PICKUP: {
    icon: Package,
    labelEn: 'Ready for Pickup',
    labelKm: 'រួចរាល់សម្រាប់ការទទួល',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200/80 dark:border-blue-800/50',
    dot: 'bg-blue-500',
  },
  PICKED_UP: {
    icon: Send,
    labelEn: 'Picked Up',
    labelKm: 'បានទទួលកញ្ចប់',
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    text: 'text-indigo-700 dark:text-indigo-400',
    border: 'border-indigo-200/80 dark:border-indigo-800/50',
    dot: 'bg-indigo-500',
  },
  IN_TRANSIT: {
    icon: Truck,
    labelEn: 'In Transit',
    labelKm: 'កំពុងស្ថិតលើផ្លូវដឹក',
    bg: 'bg-sky-50 dark:bg-sky-950/40',
    text: 'text-sky-700 dark:text-sky-400',
    border: 'border-sky-200/80 dark:border-sky-800/50',
    dot: 'bg-sky-500 animate-pulse',
  },
  ARRIVED_AT_DESTINATION: {
    icon: MapPin,
    labelEn: 'Arrived at Hub',
    labelKm: 'មកដល់ឃ្លាំងគោលដៅ',
    bg: 'bg-cyan-50 dark:bg-cyan-950/40',
    text: 'text-cyan-700 dark:text-cyan-400',
    border: 'border-cyan-200/80 dark:border-cyan-800/50',
    dot: 'bg-cyan-500',
  },
  OUT_FOR_DELIVERY: {
    icon: Truck,
    labelEn: 'Out for Delivery',
    labelKm: 'កំពុងចេញដឹកជញ្ជូន',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-200/80 dark:border-purple-800/50',
    dot: 'bg-purple-500 animate-pulse',
  },
  DELIVERED: {
    icon: CheckCircle2,
    labelEn: 'Delivered',
    labelKm: 'បានប្រគល់ជោគជ័យ',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200/80 dark:border-emerald-800/50',
    dot: 'bg-emerald-500',
  },
  FAILED: {
    icon: AlertTriangle,
    labelEn: 'Delivery Failed',
    labelKm: 'ការដឹកមិនបានសម្រេច',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-200/80 dark:border-rose-800/50',
    dot: 'bg-rose-500',
  },
  FAILED_ATTEMPT: {
    icon: AlertTriangle,
    labelEn: 'Failed Attempt',
    labelKm: 'ការព្យាយាមមិនបានសម្រេច',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-200/80 dark:border-rose-800/50',
    dot: 'bg-rose-500',
  },
  RETURNING: {
    icon: CornerDownLeft,
    labelEn: 'Returning',
    labelKm: 'កំពុងត្រឡប់មកវិញ',
    bg: 'bg-orange-50 dark:bg-orange-950/40',
    text: 'text-orange-700 dark:text-orange-400',
    border: 'border-orange-200/80 dark:border-orange-800/50',
    dot: 'bg-orange-500',
  },
  RETURNED: {
    icon: RotateCcw,
    labelEn: 'Returned',
    labelKm: 'បានត្រឡប់មកវិញ',
    bg: 'bg-slate-100 dark:bg-slate-800/60',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-300/80 dark:border-slate-700/60',
    dot: 'bg-slate-500',
  },
  CANCELLED: {
    icon: XCircle,
    labelEn: 'Cancelled',
    labelKm: 'បានបោះបង់',
    bg: 'bg-zinc-100 dark:bg-zinc-800/60',
    text: 'text-zinc-600 dark:text-zinc-400',
    border: 'border-zinc-300/80 dark:border-zinc-700/60',
    dot: 'bg-zinc-400',
  },
};

export default function DeliveryStatusBadge({
  status,
  size = 'md',
  showDot = true,
  className = '',
}) {
  const { isKhmer } = useLanguage();
  const normalized = String(status || 'PENDING').toUpperCase();
  const config = STATUS_CONFIG[normalized] || STATUS_CONFIG.PENDING;
  const Icon = config.icon;

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px] gap-1',
    sm: 'px-2 py-0.5 text-[11px] gap-1.5',
    md: 'px-2.5 py-1 text-xs gap-1.5 font-bold',
    lg: 'px-3 py-1.5 text-sm gap-2 font-black',
  };

  const iconSizes = {
    xs: 11,
    sm: 12,
    md: 14,
    lg: 16,
  };

  const label = isKhmer ? config.labelKm : config.labelEn;

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      {showDot && (
        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${config.dot}`} />
      )}
      <Icon size={iconSizes[size] || 14} className="shrink-0" />
      <span className="truncate">{label}</span>
    </span>
  );
}
