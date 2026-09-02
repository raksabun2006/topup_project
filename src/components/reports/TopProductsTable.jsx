import { useMemo } from 'react';
import { Award, Package, Loader2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

const RANK_BADGES = [
  'bg-amber-500 text-white shadow-xs ring-2 ring-amber-300 dark:ring-amber-600', // 1st
  'bg-slate-400 text-white shadow-xs ring-2 ring-slate-300 dark:ring-slate-600', // 2nd
  'bg-amber-700 text-white shadow-xs ring-2 ring-amber-600 dark:ring-amber-800', // 3rd
];

export default function TopProductsTable({
  data = [],
  loading = false,
  error = '',
}) {
  const products = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.map((item, idx) => ({
      rank: idx + 1,
      id: item.productId || item.id || idx,
      name: item.productName || item.name || 'ផលិតផល',
      quantitySold: Number(item.quantitySold ?? item.quantity ?? item.totalQuantity ?? 0),
      revenue: Number(item.revenue ?? item.totalRevenue ?? item.total ?? 0),
    }));
  }, [data]);

  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
            <Award size={18} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#172033] dark:text-white">
              ផលិតផលលក់ដាច់បំផុត (Top 10 Products)
            </h3>
            <p className="text-[11px] text-[#667085] dark:text-slate-500 font-medium">
              Ranked by total units and revenue
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mt-3 flex-1 flex flex-col justify-center">
        {loading && (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 size={24} className="animate-spin text-amber-500 mb-2" />
            <p className="text-xs text-[#667085] dark:text-slate-400">កំពុងទាញយកទំនិញលក់ដាច់...</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-8 text-center text-rose-500">
            <AlertCircle size={24} className="mb-1.5" />
            <p className="text-xs font-semibold">{error}</p>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="py-8 text-center text-xs text-[#667085] dark:text-slate-500">
            មិនមានទិន្នន័យផលិតផលក្នុងចន្លោះកាលបរិច្ឆេទនេះទេ
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-[#667085] dark:text-slate-400">
                  <th className="py-2.5 px-3 w-16 text-center">ចំណាត់ថ្នាក់</th>
                  <th className="py-2.5 px-3">ឈ្មោះទំនិញ</th>
                  <th className="py-2.5 px-3 text-right">ចំនួនលក់ (Units)</th>
                  <th className="py-2.5 px-3 text-right">ចំណូលសរុប</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {products.map((p) => {
                  const isTop3 = p.rank <= 3;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 text-center">
                        {isTop3 ? (
                          <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${
                              RANK_BADGES[p.rank - 1]
                            }`}
                          >
                            {p.rank}
                          </span>
                        ) : (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-500">
                            {p.rank}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <Package size={15} className="text-slate-400 shrink-0" />
                          <span className="font-bold text-[#172033] dark:text-white line-clamp-1" title={p.name}>
                            {p.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#172033] dark:text-slate-200">
                        {p.quantitySold.toLocaleString()} ឯកតា
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-[#009F6B] dark:text-emerald-400">
                        {formatCurrency(p.revenue)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
