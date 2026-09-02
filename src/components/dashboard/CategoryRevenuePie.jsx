import { useEffect, useMemo, useState } from 'react';
import { PieChart, Layers } from 'lucide-react';
import { adminProductApi } from '../../api/adminProductApi';
import { formatCurrency } from '../../utils/format';
import { CATEGORICAL_PALETTE, OTHER_SLICE_COLOR, OTHER_SLICE_LABEL } from '../../utils/chartPalette';

const MAX_SLICES = 5;
const SIZE = 240;
const CENTER = SIZE / 2;
const OUTER_RADIUS = 100;
const INNER_RADIUS = 68;

function polarToCartesian(angleDeg, radius) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CENTER + radius * Math.cos(rad), y: CENTER + radius * Math.sin(rad) };
}

function donutSlicePath(startAngle, endAngle, outerR = OUTER_RADIUS, innerR = INNER_RADIUS) {
  const adjustedEnd = endAngle - startAngle >= 359.99 ? startAngle + 359.99 : endAngle;
  const startOuter = polarToCartesian(startAngle, outerR);
  const endOuter = polarToCartesian(adjustedEnd, outerR);
  const startInner = polarToCartesian(adjustedEnd, innerR);
  const endInner = polarToCartesian(startAngle, innerR);
  const largeArc = adjustedEnd - startAngle > 180 ? 1 : 0;

  return `M ${startOuter.x} ${startOuter.y} A ${outerR} ${outerR} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y} L ${startInner.x} ${startInner.y} A ${innerR} ${innerR} 0 ${largeArc} 0 ${endInner.x} ${endInner.y} Z`;
}

export default function CategoryRevenuePie({ sales, loading }) {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(false);
  const [hover, setHover] = useState(null);

  useEffect(() => {
    let cancelled = false;
    adminProductApi.list({ page: 0, size: 500 })
      .then((data) => {
        if (!cancelled) setProducts(data.content ?? []);
      })
      .catch(() => {
        if (!cancelled) setProductsError(true);
      })
      .finally(() => {
        if (!cancelled) setProductsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const slices = useMemo(() => {
    if (products.length === 0) return [];
    const categoryByProductId = new Map(products.map((p) => [p.id, p.category || OTHER_SLICE_LABEL]));

    const totals = new Map();
    sales
      .filter((s) => s.status === 'COMPLETED' && s.paymentStatus === 'PAID')
      .forEach((sale) => {
        (sale.items ?? []).forEach((item) => {
          const category = categoryByProductId.get(item.productId) || OTHER_SLICE_LABEL;
          totals.set(category, (totals.get(category) ?? 0) + (item.lineTotal || 0));
        });
      });

    const entries = Array.from(totals.entries())
      .map(([name, value]) => ({ name, value }))
      .filter((e) => e.value > 0)
      .sort((a, b) => b.value - a.value);

    const top = entries.slice(0, MAX_SLICES);
    const restTotal = entries.slice(MAX_SLICES).reduce((sum, e) => sum + e.value, 0);
    if (restTotal > 0) top.push({ name: OTHER_SLICE_LABEL, value: restTotal });

    const namedOrder = top.filter((e) => e.name !== OTHER_SLICE_LABEL).map((e) => e.name).sort();
    const colorByName = new Map(namedOrder.map((name, i) => [name, CATEGORICAL_PALETTE[i % CATEGORICAL_PALETTE.length]]));

    const total = top.reduce((sum, e) => sum + e.value, 0);
    let cursor = 0;
    return top.map((e) => {
      const pct = total > 0 ? (e.value / total) * 100 : 0;
      const startAngle = cursor;
      const endAngle = cursor + (e.value / total) * 360;
      cursor = endAngle;
      return {
        ...e,
        pct,
        startAngle,
        endAngle,
        color: e.name === OTHER_SLICE_LABEL ? OTHER_SLICE_COLOR : colorByName.get(e.name),
      };
    });
  }, [products, sales]);

  const totalRevenue = slices.reduce((sum, s) => sum + s.value, 0);
  const busy = loading || productsLoading;
  const activeSlice = hover !== null ? slices[hover] : null;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 sm:px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
            <PieChart size={18} />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              ចំណូលតាមប្រភេទផលិតផល
            </h2>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              Category Revenue Breakdown
            </p>
          </div>
        </div>
        {slices.length > 0 && (
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-600 dark:text-slate-300">
            <Layers size={13} />
            {slices.length} ប្រភេទ
          </span>
        )}
      </div>

      {busy && (
        <div className="flex flex-col items-center justify-center p-8 sm:p-12">
          <div className="h-44 w-44 animate-pulse rounded-full border-8 border-slate-200 dark:border-slate-800 bg-transparent" />
        </div>
      )}

      {!busy && productsError && (
        <p className="p-8 sm:p-10 text-center text-xs sm:text-sm text-rose-600 dark:text-rose-400 font-medium">
          មិនអាចទាញយកទិន្នន័យប្រភេទបានទេ
        </p>
      )}

      {!busy && !productsError && slices.length === 0 && (
        <div className="p-8 sm:p-12 text-center">
          <PieChart size={32} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            មិនទាន់មានទិន្នន័យលក់គ្រប់គ្រាន់សម្រាប់វិភាគទេ
          </p>
        </div>
      )}

      {!busy && !productsError && slices.length > 0 && (
        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Donut Chart Visual */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-52 sm:w-60 max-w-full">
              <svg
                viewBox={`0 0 ${SIZE} ${SIZE}`}
                className="h-auto w-full overflow-visible select-none"
                onMouseLeave={() => setHover(null)}
              >
                {slices.map((s, i) => {
                  const isHovered = hover === i;
                  return (
                    <path
                      key={s.name}
                      d={donutSlicePath(
                        s.startAngle,
                        s.endAngle,
                        isHovered ? OUTER_RADIUS + 4 : OUTER_RADIUS,
                        isHovered ? INNER_RADIUS - 2 : INNER_RADIUS
                      )}
                      fill={s.color}
                      stroke="#ffffff"
                      strokeWidth={2}
                      className="cursor-pointer transition-all duration-200"
                      opacity={hover !== null && !isHovered ? 0.45 : 1}
                      onClick={() => setHover(hover === i ? null : i)}
                      onMouseEnter={() => setHover(i)}
                      onTouchStart={() => setHover(i)}
                    />
                  );
                })}
              </svg>

              {/* Centered Donut Content */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {activeSlice ? activeSlice.name : 'ចំណូលសរុប'}
                </span>
                <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5">
                  {formatCurrency(activeSlice ? activeSlice.value : totalRevenue)}
                </span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {activeSlice ? `${activeSlice.pct.toFixed(1)}%` : `${slices.length} ប្រភេទ`}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Legend with Percentage Progress Bars */}
          <div className="lg:col-span-7 space-y-3">
            {slices.map((s, i) => {
              const isHovered = hover === i;
              return (
                <div
                  key={s.name}
                  onClick={() => setHover(hover === i ? null : i)}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  className={`p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer ${
                    isHovered
                      ? 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-xs'
                      : 'border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="h-3 w-3 rounded-full shrink-0 shadow-2xs"
                        style={{ backgroundColor: s.color }}
                      />
                      <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                        {s.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                        {formatCurrency(s.value)}
                      </span>
                      <span className="rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                        {s.pct.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${s.pct}%`,
                        backgroundColor: s.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

