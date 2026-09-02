import { useMemo, useState } from 'react';
import { TrendingUp, Zap } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

const DAY_LABELS = ['អាទិត្យ', 'ចន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];
const SHORT_DAY_LABELS = ['អា', 'ចន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហ', 'សុក្រ', 'សៅរ៍'];
const WIDTH = 600;
const HEIGHT = 200;
const PAD_X = 24;
const PAD_Y = 24;

function startOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function dailyRevenue(sales, weekStart) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + i);
    return { date: day, total: 0, orderCount: 0 };
  });

  sales
    .filter((s) => s.status === 'COMPLETED' && s.paymentStatus === 'PAID')
    .forEach((sale) => {
      const diffDays = Math.floor((new Date(sale.createdAt) - weekStart) / 86400000);
      if (diffDays >= 0 && diffDays < 7) {
        days[diffDays].total += sale.total || 0;
        days[diffDays].orderCount += 1;
      }
    });

  return days;
}

export default function WeeklyRevenueChart({ sales, loading }) {
  const [view, setView] = useState('this');
  const [activeIndex, setActiveIndex] = useState(null);

  const days = useMemo(() => {
    const thisWeekStart = startOfWeek(new Date());
    const weekStart = view === 'this' ? thisWeekStart : new Date(thisWeekStart.getTime() - 7 * 86400000);
    return dailyRevenue(sales, weekStart);
  }, [sales, view]);

  const summary = useMemo(() => {
    const total = days.reduce((sum, d) => sum + d.total, 0);
    const totalOrders = days.reduce((sum, d) => sum + d.orderCount, 0);
    const avg = total / 7;
    let peakIndex = 0;
    days.forEach((d, i) => {
      if (d.total > days[peakIndex].total) peakIndex = i;
    });
    return {
      total,
      totalOrders,
      avg,
      peakDay: DAY_LABELS[peakIndex],
      peakAmount: days[peakIndex].total,
    };
  }, [days]);

  const max = Math.max(1, ...days.map((d) => d.total));

  const points = days.map((d, i) => ({
    x: PAD_X + (i / 6) * (WIDTH - PAD_X * 2),
    y: HEIGHT - PAD_Y - (d.total / max) * (HEIGHT - PAD_Y * 2),
    total: d.total,
    orderCount: d.orderCount,
    date: d.date,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[6].x} ${HEIGHT - PAD_Y} L ${points[0].x} ${HEIGHT - PAD_Y} Z`;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-2xs">
      {/* Header & View Switcher */}
      <div className="mb-4 sm:mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <TrendingUp size={18} />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              របាយការណ៍ចំណូលប្រចាំសប្តាហ៍
            </h2>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              Weekly Revenue Analytics
            </p>
          </div>
        </div>

        <div className="flex rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-100/80 dark:bg-slate-800/80 p-1 text-xs font-bold">
          <button
            onClick={() => { setView('this'); setActiveIndex(null); }}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              view === 'this'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            សប្តាហ៍នេះ
          </button>
          <button
            onClick={() => { setView('last'); setActiveIndex(null); }}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              view === 'last'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            សប្តាហ៍មុន
          </button>
        </div>
      </div>

      {/* Summary Mini Metrics */}
      <div className="mb-5 grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
        <div className="rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 p-2.5 sm:p-3">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 block">ចំណូលសរុប (Total)</span>
          <span className="text-sm sm:text-lg font-black text-emerald-600 dark:text-emerald-400">
            {loading ? '—' : formatCurrency(summary.total)}
          </span>
        </div>
        <div className="rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 p-2.5 sm:p-3">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 block">មធ្យម/ថ្ងៃ (Daily Avg)</span>
          <span className="text-sm sm:text-lg font-black text-slate-800 dark:text-slate-200">
            {loading ? '—' : formatCurrency(summary.avg)}
          </span>
        </div>
        <div className="col-span-2 sm:col-span-1 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 p-2.5 sm:p-3 flex items-center justify-between sm:block">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 block">ថ្ងៃលក់ដាច់បំផុត (Peak)</span>
          <span className="text-sm sm:text-base font-black text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <Zap size={14} className="shrink-0" />
            {summary.peakAmount > 0 ? `${summary.peakDay}` : '—'}
          </span>
        </div>
      </div>

      {/* Interactive SVG Line & Area Chart */}
      {loading ? (
        <div className="h-[200px] animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
      ) : (
        <div className="relative select-none">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="w-full h-auto overflow-visible"
            onMouseLeave={() => setActiveIndex(null)}
          >
            <defs>
              <linearGradient id="weeklyRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#059669" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = HEIGHT - PAD_Y - ratio * (HEIGHT - PAD_Y * 2);
              return (
                <line
                  key={ratio}
                  x1={PAD_X}
                  y1={y}
                  x2={WIDTH - PAD_X}
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-800/80"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                />
              );
            })}

            {/* Area Fill */}
            <path d={areaPath} fill="url(#weeklyRevenueGradient)" />

            {/* Main Smooth Line */}
            <path
              d={linePath}
              fill="none"
              stroke="#059669"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Touch/Hover vertical cursor line */}
            {activeIndex !== null && (
              <line
                x1={points[activeIndex].x}
                y1={PAD_Y}
                x2={points[activeIndex].x}
                y2={HEIGHT - PAD_Y}
                stroke="#10b981"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                className="opacity-75"
              />
            )}

            {/* Data Points with generous click/touch targets */}
            {points.map((p, i) => {
              const isActive = activeIndex === i;
              return (
                <g
                  key={i}
                  className="cursor-pointer"
                  onClick={() => setActiveIndex(i)}
                  onMouseEnter={() => setActiveIndex(i)}
                  onTouchStart={() => setActiveIndex(i)}
                >
                  {/* Invisible broad touch target */}
                  <rect
                    x={p.x - 20}
                    y={0}
                    width={40}
                    height={HEIGHT}
                    fill="transparent"
                  />
                  {/* Outer pulse circle when active */}
                  {isActive && (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={9}
                      fill="#10b981"
                      fillOpacity={0.25}
                      className="animate-ping"
                    />
                  )}
                  {/* Point circle */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isActive ? 6 : 4}
                    fill="#059669"
                    stroke="#ffffff"
                    strokeWidth={2}
                    className="transition-all duration-150"
                  />
                </g>
              );
            })}
          </svg>

          {/* Floating Tooltip */}
          {activeIndex !== null && (
            <div
              className="pointer-events-none absolute -top-3 -translate-y-full -translate-x-1/2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-900/95 dark:bg-slate-800/95 text-white p-2.5 shadow-xl backdrop-blur-md z-20 min-w-32 text-center animate-scale-in"
              style={{
                left: `${Math.min(90, Math.max(10, (points[activeIndex].x / WIDTH) * 100))}%`,
              }}
            >
              <p className="text-[11px] font-medium text-slate-300">
                {DAY_LABELS[activeIndex]}
              </p>
              <p className="text-sm font-black text-emerald-400">
                {formatCurrency(points[activeIndex].total)}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {points[activeIndex].orderCount} ការបញ្ជាទិញ
              </p>
            </div>
          )}

          {/* Bottom Day Badges (Tap to highlight) */}
          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs">
            {SHORT_DAY_LABELS.map((label, i) => (
              <button
                key={label}
                onClick={() => setActiveIndex(i)}
                className={`py-1 rounded-lg text-[11px] font-bold transition ${
                  activeIndex === i
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

