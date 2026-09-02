import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Package, Award, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

const MAX_ITEMS = 5;

const RANK_BADGES = [
  'bg-amber-500 text-white shadow-sm shadow-amber-500/30 ring-2 ring-amber-300 dark:ring-amber-600', // 1st
  'bg-slate-400 text-white shadow-sm shadow-slate-400/30 ring-2 ring-slate-300 dark:ring-slate-600', // 2nd
  'bg-amber-700 text-white shadow-sm shadow-amber-700/30 ring-2 ring-amber-600 dark:ring-amber-800', // 3rd
];

export default function TopProductsPanel({ sales, loading }) {
  const top = useMemo(() => {
    const totals = new Map();
    sales
      .filter((s) => s.status === 'COMPLETED' && s.paymentStatus === 'PAID')
      .forEach((sale) => {
        (sale.items ?? []).forEach((item) => {
          const entry = totals.get(item.productId) ?? {
            id: item.productId,
            name: item.productName || 'ផលិតផលមិនស្គាល់',
            quantity: 0,
            revenue: 0,
          };
          entry.quantity += item.quantity || 0;
          entry.revenue += item.lineTotal || 0;
          totals.set(item.productId, entry);
        });
      });
    return Array.from(totals.values()).sort((a, b) => b.revenue - a.revenue).slice(0, MAX_ITEMS);
  }, [sales]);

  const maxRevenue = Math.max(1, ...top.map((p) => p.revenue));

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 sm:px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Award size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                ផលិតផលលក់ដាច់បំផុត
              </h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                Top Selling Products
              </p>
            </div>
          </div>
          <Link
            to="/dashboard/products"
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition"
          >
            <span>ស្តុក</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {loading && (
          <div className="space-y-3 p-4 sm:p-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        )}

        {!loading && top.length === 0 && (
          <div className="p-8 sm:p-10 text-center">
            <Package size={32} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              មិនទាន់មានទិន្នន័យលក់គ្រប់គ្រាន់ទេ
            </p>
          </div>
        )}

        {!loading && top.length > 0 && (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {top.map((p, i) => (
              <div
                key={p.id}
                className="p-3.5 sm:px-5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition"
              >
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-black ${
                        RANK_BADGES[i] ||
                        'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                        {p.name}
                      </p>
                      <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                        បានលក់ {p.quantity} មុខ
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                      {formatCurrency(p.revenue)}
                    </p>
                  </div>
                </div>

                {/* Relative share bar */}
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300"
                    style={{ width: `${(p.revenue / maxRevenue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

