import { useMemo, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

const DAY_LABELS = ['អា', 'ចន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហ', 'សុក្រ', 'សៅរ៍'];
const WIDTH = 560;
const HEIGHT = 180;
const PAD_X = 12;
const PAD_Y = 16;

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
    return { date: day, total: 0 };
  });
  sales
    .filter((s) => s.status === 'COMPLETED' && s.paymentStatus === 'PAID')
    .forEach((sale) => {
      const diffDays = Math.floor((new Date(sale.createdAt) - weekStart) / 86400000);
      if (diffDays >= 0 && diffDays < 7) days[diffDays].total += sale.total || 0;
    });
  return days;
}

/**
 * ចំណូលប្រចាំថ្ងៃសម្រាប់សប្តាហ៍នេះ/មុន - backend គ្មាន report endpoint ទេ
 * ដូច្នេះគណនានៅ client ពី sales (COMPLETED) ដែលទាញយករួច (ដូច CategoryRevenuePie)។
 */
export default function WeeklyRevenueChart({ sales, loading }) {
  const [view, setView] = useState('this');
  const [hover, setHover] = useState(null);

  const days = useMemo(() => {
    const thisWeekStart = startOfWeek(new Date());
    const weekStart = view === 'this' ? thisWeekStart : new Date(thisWeekStart.getTime() - 7 * 86400000);
    return dailyRevenue(sales, weekStart);
  }, [sales, view]);

  const max = Math.max(1, ...days.map((d) => d.total));

  const points = days.map((d, i) => ({
    x: PAD_X + (i / 6) * (WIDTH - PAD_X * 2),
    y: HEIGHT - PAD_Y - (d.total / max) * (HEIGHT - PAD_Y * 2),
    total: d.total,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[6].x} ${HEIGHT - PAD_Y} L ${points[0].x} ${HEIGHT - PAD_Y} Z`;

  return (
    <div className="rounded-2xl border border-slate-200 bg-ink-900 p-4 sm:p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-semibold text-slate-900 text-sm sm:text-base">
          <TrendingUp size={18} className="text-emerald-600" />
          របាយការណ៍ប្រចាំសប្តាហ៍
        </h2>
        <div className="flex rounded-lg border border-slate-200 p-0.5 text-xs font-medium">
          {[
            { key: 'this', label: 'សប្តាហ៍នេះ' },
            { key: 'last', label: 'សប្តាហ៍មុន' },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => { setView(opt.key); setHover(null); }}
              className={`rounded-md px-3 py-1.5 transition ${view === opt.key ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-900'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-[180px] animate-pulse rounded-xl bg-ink-800" />
      ) : (
        <div className="relative">
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" onMouseLeave={() => setHover(null)}>
            <defs>
              <linearGradient id="weeklyRevenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={areaPath} fill="url(#weeklyRevenueFill)" />
            <path d={linePath} fill="none" stroke="#059669" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            {points.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={hover === i ? 5 : 3.5}
                fill="#059669"
                stroke="#ffffff"
                strokeWidth={1.5}
                style={{ cursor: 'pointer', transition: 'r 0.15s' }}
                onMouseEnter={() => setHover(i)}
              />
            ))}
          </svg>

          {hover != null && (
            <div
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg border border-slate-200 bg-ink-900 px-3 py-1.5 text-center text-xs shadow-lg shadow-black/10"
              style={{ left: `${(points[hover].x / WIDTH) * 100}%`, top: `${(points[hover].y / HEIGHT) * 100}%` }}
            >
              <p className="font-semibold text-slate-900">{formatCurrency(points[hover].total)}</p>
              <p className="text-slate-500">{DAY_LABELS[hover]}</p>
            </div>
          )}

          <div className="mt-2 flex justify-between text-[11px] text-slate-500">
            {DAY_LABELS.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
