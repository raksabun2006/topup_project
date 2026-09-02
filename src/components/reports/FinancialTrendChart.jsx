import { useState, useMemo } from 'react';
import { TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function FinancialTrendChart({
  data = [],
  loading = false,
  error = '',
  mode = 'monthly', // 'monthly' | 'daily'
  title = 'និន្នាការហិរញ្ញវត្ថុ',
  subtitle = 'Revenue vs Expenses vs Profit',
}) {
  const [activeIndex, setActiveIndex] = useState(null);

  // Normalize points directly from backend without recalculating
  const points = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];
    return data.map((item, idx) => {
      const revenue = Number(item.revenue ?? item.totalRevenue ?? 0);
      const expenses = Number(item.expenses ?? item.totalExpenses ?? 0);
      const profit = Number(item.profit ?? item.netProfit ?? (revenue - expenses));
      const salesCount = Number(item.salesCount ?? item.totalSales ?? item.count ?? 0);

      let label = '';
      if (mode === 'monthly') {
        const m = Number(item.month ?? idx + 1);
        label = MONTH_NAMES[m - 1] || `M${m}`;
      } else {
        // Daily mode
        const day = item.day || item.date?.split('-')[2] || `${idx + 1}`;
        label = `ថ្ងៃទី ${parseInt(day, 10)}`;
      }

      return {
        label,
        revenue,
        expenses,
        profit,
        salesCount,
        raw: item,
      };
    });
  }, [data, mode]);

  // Determine bounds for SVG coordinate mapping
  const { maxVal, minVal } = useMemo(() => {
    if (points.length === 0) return { maxVal: 100, minVal: 0 };
    let max = 0;
    let min = 0;
    points.forEach((p) => {
      max = Math.max(max, p.revenue, p.expenses, p.profit);
      min = Math.min(min, p.revenue, p.expenses, p.profit);
    });
    // Add 10% breathing room on top
    return {
      maxVal: max > 0 ? max * 1.15 : 100,
      minVal: min < 0 ? min * 1.15 : 0,
    };
  }, [points]);

  // Chart dimensions
  const SVG_WIDTH = 760;
  const SVG_HEIGHT = 260;
  const PADDING_TOP = 25;
  const PADDING_BOTTOM = 35;
  const PADDING_LEFT = 50;
  const PADDING_RIGHT = 30;

  const chartWidth = SVG_WIDTH - PADDING_LEFT - PADDING_RIGHT;
  const chartHeight = SVG_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

  const valRange = maxVal - minVal || 1;

  const getCoordinates = (val, index, total) => {
    const x = PADDING_LEFT + (index / Math.max(1, total - 1)) * chartWidth;
    const y = PADDING_TOP + chartHeight - ((val - minVal) / valRange) * chartHeight;
    return { x, y };
  };

  // Build SVG path strings
  const revenuePath = useMemo(() => {
    if (points.length === 0) return '';
    return points
      .map((p, i) => {
        const { x, y } = getCoordinates(p.revenue, i, points.length);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  }, [points, maxVal, minVal]);

  const expensesPath = useMemo(() => {
    if (points.length === 0) return '';
    return points
      .map((p, i) => {
        const { x, y } = getCoordinates(p.expenses, i, points.length);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  }, [points, maxVal, minVal]);

  const profitPath = useMemo(() => {
    if (points.length === 0) return '';
    return points
      .map((p, i) => {
        const { x, y } = getCoordinates(p.profit, i, points.length);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  }, [points, maxVal, minVal]);

  // Zero-line Y coordinate
  const zeroY = PADDING_TOP + chartHeight - ((0 - minVal) / valRange) * chartHeight;

  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs flex flex-col">
      {/* Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 dark:bg-emerald-950/40 text-[#009F6B] dark:text-emerald-400">
              <TrendingUp size={16} />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-[#172033] dark:text-white">
              {title}
            </h3>
          </div>
          <p className="text-[11px] text-[#667085] dark:text-slate-500 mt-0.5 font-medium">
            {subtitle}
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#009F6B]" />
            <span className="text-[#172033] dark:text-slate-200">ចំណូល (Revenue)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#F04438]" />
            <span className="text-[#172033] dark:text-slate-200">ចំណាយ (Expense)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#0284C7]" />
            <span className="text-[#172033] dark:text-slate-200">ចំណេញ (Profit)</span>
          </div>
        </div>
      </div>

      {/* Main Chart Body */}
      <div className="relative mt-3 flex-1 min-h-[240px] flex items-center justify-center">
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
            <Loader2 size={28} className="animate-spin text-[#009F6B] mb-2" />
            <p className="text-xs font-semibold text-[#667085] dark:text-slate-400">កំពុងទាញយកទិន្នន័យ...</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in">
            <AlertCircle size={28} className="text-rose-500 mb-2" />
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">{error}</p>
          </div>
        )}

        {!loading && !error && points.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center text-[#667085] dark:text-slate-500">
            <p className="text-xs font-medium">គ្មានទិន្នន័យសម្រាប់បង្ហាញ</p>
          </div>
        )}

        {!loading && !error && points.length > 0 && (
          <div className="w-full overflow-x-auto scrollbar-none">
            <svg
              viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              className="w-full h-auto min-w-[550px] overflow-visible select-none"
            >
              {/* Horizontal Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = PADDING_TOP + chartHeight * ratio;
                const val = maxVal - ratio * valRange;
                return (
                  <g key={ratio}>
                    <line
                      x1={PADDING_LEFT}
                      y1={y}
                      x2={SVG_WIDTH - PADDING_RIGHT}
                      y2={y}
                      stroke="currentColor"
                      className="text-slate-100 dark:text-slate-800/80"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={PADDING_LEFT - 8}
                      y={y + 3}
                      textAnchor="end"
                      className="text-[9px] fill-slate-400 font-medium"
                    >
                      {Math.round(val)}
                    </text>
                  </g>
                );
              })}

              {/* Zero baseline if in range */}
              {minVal < 0 && maxVal > 0 && (
                <line
                  x1={PADDING_LEFT}
                  y1={zeroY}
                  x2={SVG_WIDTH - PADDING_RIGHT}
                  y2={zeroY}
                  stroke="#94A3B8"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />
              )}

              {/* Revenue Line */}
              <path
                d={revenuePath}
                fill="none"
                stroke="#009F6B"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Expenses Line */}
              <path
                d={expensesPath}
                fill="none"
                stroke="#F04438"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Profit Line */}
              <path
                d={profitPath}
                fill="none"
                stroke="#0284C7"
                strokeWidth="2"
                strokeDasharray="4 2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Point Dots & Hitboxes */}
              {points.map((p, i) => {
                const revCoord = getCoordinates(p.revenue, i, points.length);
                const expCoord = getCoordinates(p.expenses, i, points.length);
                const isHovered = activeIndex === i;

                return (
                  <g key={i}>
                    {/* X-axis Label */}
                    {(points.length <= 15 || i % 2 === 0 || i === points.length - 1) && (
                      <text
                        x={revCoord.x}
                        y={SVG_HEIGHT - 10}
                        textAnchor="middle"
                        className={`text-[9px] font-semibold transition-colors ${
                          isHovered ? 'fill-[#009F6B] font-bold' : 'fill-slate-400'
                        }`}
                      >
                        {p.label}
                      </text>
                    )}

                    {/* Active vertical guide line on hover */}
                    {isHovered && (
                      <line
                        x1={revCoord.x}
                        y1={PADDING_TOP}
                        x2={revCoord.x}
                        y2={PADDING_TOP + chartHeight}
                        stroke="#009F6B"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                        className="opacity-60"
                      />
                    )}

                    {/* Revenue Dot */}
                    <circle
                      cx={revCoord.x}
                      cy={revCoord.y}
                      r={isHovered ? 5 : 3}
                      fill="#009F6B"
                      stroke="#FFFFFF"
                      strokeWidth={1.5}
                      className="transition-all"
                    />

                    {/* Expense Dot */}
                    <circle
                      cx={expCoord.x}
                      cy={expCoord.y}
                      r={isHovered ? 5 : 3}
                      fill="#F04438"
                      stroke="#FFFFFF"
                      strokeWidth={1.5}
                      className="transition-all"
                    />

                    {/* Invisible Hitbox for easier hovering */}
                    <rect
                      x={revCoord.x - chartWidth / (points.length * 2)}
                      y={PADDING_TOP}
                      width={chartWidth / points.length}
                      height={chartHeight + 15}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setActiveIndex(i)}
                      onMouseLeave={() => setActiveIndex(null)}
                    />
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* Hover Tooltip Overlay */}
        {activeIndex !== null && points[activeIndex] && (
          <div className="absolute top-2 right-2 sm:right-4 z-20 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 p-2.5 text-xs shadow-lg backdrop-blur-xs animate-fade-in pointer-events-none">
            <p className="font-bold text-[#172033] dark:text-white border-b border-slate-100 dark:border-slate-700 pb-1 mb-1.5">
              {points[activeIndex].label}
            </p>
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-3 text-[#009F6B] font-semibold">
                <span>ចំណូល៖</span>
                <span>{formatCurrency(points[activeIndex].revenue)}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-[#F04438] font-semibold">
                <span>ចំណាយ៖</span>
                <span>{formatCurrency(points[activeIndex].expenses)}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-[#0284C7] font-bold border-t border-slate-100 dark:border-slate-700/80 pt-1">
                <span>ចំណេញសុទ្ធ៖</span>
                <span>{formatCurrency(points[activeIndex].profit)}</span>
              </div>
              {points[activeIndex].salesCount > 0 && (
                <div className="flex items-center justify-between gap-3 text-slate-500 dark:text-slate-400 text-[11px] pt-0.5">
                  <span>ការលក់៖</span>
                  <span>{points[activeIndex].salesCount} លើក</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
