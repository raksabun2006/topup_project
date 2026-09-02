import { TrendingUp, TrendingDown } from 'lucide-react';

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  trend,
  accent = 'emerald',
  loading = false,
  onClick,
  className = '',
}) {
  const accentStyles = {
    emerald: {
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25',
      glow: 'group-hover:border-emerald-500/40',
      pill: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40',
    },
    amber: {
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/25',
      glow: 'group-hover:border-amber-500/40',
      pill: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/40',
    },
    rose: {
      iconBg: 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/25',
      glow: 'group-hover:border-rose-500/40',
      pill: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/40',
    },
    blue: {
      iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/25',
      glow: 'group-hover:border-blue-500/40',
      pill: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/40',
    },
    purple: {
      iconBg: 'bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-md shadow-purple-500/25',
      glow: 'group-hover:border-purple-500/40',
      pill: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 border-purple-200/60 dark:border-purple-800/40',
    },
  };

  const currentAccent = accentStyles[accent] || accentStyles.emerald;

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all duration-200 ${currentAccent.glow} ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 truncate">
            {label}
          </p>
          <div className="mt-1.5 flex items-baseline gap-2">
            {loading ? (
              <div className="h-8 w-24 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
            ) : (
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {value}
              </p>
            )}
          </div>

          {(hint || trend) && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
              {trend && (
                <span
                  className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-bold border ${
                    trend.isPositive !== false
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40'
                      : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/40'
                  }`}
                >
                  {trend.isPositive !== false ? (
                    <TrendingUp size={11} className="shrink-0" />
                  ) : (
                    <TrendingDown size={11} className="shrink-0" />
                  )}
                  {trend.value}
                </span>
              )}
              {hint && (
                <span className="text-slate-400 dark:text-slate-500 font-medium">
                  {hint}
                </span>
              )}
            </div>
          )}
        </div>

        {Icon && (
          <div
            className={`flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl p-2.5 transition-transform duration-200 group-hover:scale-110 ${currentAccent.iconBg}`}
          >
            <Icon size={22} />
          </div>
        )}
      </div>
    </div>
  );
}