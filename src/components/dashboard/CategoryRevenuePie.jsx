import { useEffect, useMemo, useState } from 'react';
import { PieChart } from 'lucide-react';
import { adminProductApi } from '../../api/adminProductApi';
import { formatCurrency } from '../../utils/format';
import { CATEGORICAL_PALETTE, OTHER_SLICE_COLOR, OTHER_SLICE_LABEL, readableTextOn } from '../../utils/chartPalette';

const MAX_SLICES = 6;
const SIZE = 240;
const CENTER = SIZE / 2;
const RADIUS = 100;
const INLINE_LABEL_MIN_PCT = 8;

function polarToCartesian(angleDeg, radius) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CENTER + radius * Math.cos(rad), y: CENTER + radius * Math.sin(rad) };
}

function sliceArcPath(startAngle, endAngle) {
  const start = polarToCartesian(endAngle, RADIUS);
  const end = polarToCartesian(startAngle, RADIUS);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${CENTER} ${CENTER} L ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}

/**
 * ចំណូលតាមប្រភេទផលិតផល - backend គ្មាន report endpoint ទេ ដូច្នេះគណនាពី
 * sales ដែលបានបង់ប្រាក់ពិត (status COMPLETED និង paymentStatus PAID ទាំងពីរ
 * ព្រោះ Sale អាចជា COMPLETED តែមិនទាន់បង់ - ឧ. UNPAID) ដែលទាញយករួច
 * ផ្គូផ្គង item.productId ទៅនឹង category របស់ផលិតផលនោះ។ កំណត់ត្រឹម ៦
 * ប្រភេទធំបំផុត - ដែលនៅសល់បញ្ចូលរួមជា "ផ្សេងៗ" (ដូច choosing-a-form:
 * part-to-whole pie ≤ 6 segments)។
 */
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

    // ពណ៌តាមលំដាប់អក្សរក្រម (ថេរ) - កុំឲ្យពណ៌ប្តូរតាម rank ចំណូលរាល់ពេល reload
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

  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const busy = loading || productsLoading;

  return (
    <div className="rounded-2xl border border-slate-200 bg-ink-900 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
        <h2 className="flex items-center gap-2 font-semibold text-slate-900">
          <PieChart size={18} className="text-emerald-600" />
          ចំណូលតាមប្រភេទ
        </h2>
      </div>

      {busy && (
        <div className="flex items-center justify-center p-10">
          <div className="h-40 w-40 animate-pulse rounded-full bg-ink-800" />
        </div>
      )}

      {!busy && productsError && (
        <p className="p-10 text-center text-sm text-rose-700">មិនអាចទាញយកទិន្នន័យប្រភេទបានទេ</p>
      )}

      {!busy && !productsError && slices.length === 0 && (
        <p className="p-10 text-center text-sm text-slate-500">មិនទាន់មានទិន្នន័យលក់គ្រប់គ្រាន់សម្រាប់វិភាគទេ</p>
      )}

      {/* ប្រភេទតែមួយ = 100% - pie មិនចាំបាច់ទេ (ដូចលេខតែមួយមិនត្រូវការ chart) */}
      {!busy && !productsError && slices.length === 1 && (
        <div className="flex items-center gap-4 p-6">
          <span className="h-4 w-4 shrink-0 rounded-full" style={{ backgroundColor: slices[0].color }} />
          <p className="text-sm text-slate-700">
            ចំណូលទាំងអស់ ({formatCurrency(slices[0].value)}) មកពីប្រភេទ <strong>{slices[0].name}</strong> តែមួយ
          </p>
        </div>
      )}

      {!busy && !productsError && slices.length > 1 && (
        <div className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-center sm:justify-around">
          <div className="relative w-60 max-w-full shrink-0">
            <svg
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              className="h-auto w-full"
              role="img"
              aria-label={`ចំណូលតាមប្រភេទ សរុប ${formatCurrency(total)}`}
              onMouseLeave={() => setHover(null)}
            >
              {slices.map((s, i) => {
                const isHovered = hover === i;
                const midAngle = (s.startAngle + s.endAngle) / 2;
                const labelPos = polarToCartesian(midAngle, RADIUS * 0.64);
                return (
                  <g key={s.name}>
                    <path
                      d={sliceArcPath(s.startAngle, s.endAngle)}
                      fill={s.color}
                      stroke="#ffffff"
                      strokeWidth={2}
                      opacity={hover != null && !isHovered ? 0.55 : 1}
                      style={{ transition: 'opacity 0.15s, transform 0.15s', transformOrigin: `${CENTER}px ${CENTER}px`, transform: isHovered ? 'scale(1.03)' : 'scale(1)' }}
                      tabIndex={0}
                      role="button"
                      aria-label={`${s.name}: ${formatCurrency(s.value)} (${s.pct.toFixed(1)}%)`}
                      onMouseEnter={() => setHover(i)}
                      onFocus={() => setHover(i)}
                      onBlur={() => setHover((h) => (h === i ? null : h))}
                    >
                      <title>{`${s.name}: ${formatCurrency(s.value)} (${s.pct.toFixed(1)}%)`}</title>
                    </path>
                    {s.pct >= INLINE_LABEL_MIN_PCT && (
                      <text
                        x={labelPos.x}
                        y={labelPos.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={12}
                        fontWeight={700}
                        fill={readableTextOn(s.color)}
                        pointerEvents="none"
                      >
                        {s.pct.toFixed(0)}%
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {hover != null && (
              <div className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 translate-y-full rounded-lg border border-slate-200 bg-ink-900 px-3 py-1.5 text-center text-xs shadow-lg shadow-black/10">
                <p className="font-semibold text-slate-900">{formatCurrency(slices[hover].value)}</p>
                <p className="text-slate-500">{slices[hover].name} · {slices[hover].pct.toFixed(1)}%</p>
              </div>
            )}
          </div>

          {/* Legend - ក៏ជា table-view ជំនួស សម្រាប់តម្លៃទាំងអស់ */}
          <ul className="flex w-full flex-col gap-2 sm:w-56">
            {slices.map((s, i) => (
              <li
                key={s.name}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                className={`flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 transition ${hover === i ? 'bg-emerald-50' : ''}`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="truncate text-sm text-slate-700">{s.name}</span>
                </span>
                <span className="shrink-0 text-xs font-semibold text-slate-500">
                  {formatCurrency(s.value)} · {s.pct.toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
