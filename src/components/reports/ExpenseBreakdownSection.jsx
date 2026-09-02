import { useMemo } from 'react';
import { WalletCards, Loader2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { getCategoryMeta, EXPENSE_CATEGORIES } from '../../utils/dateFilter';

export default function ExpenseBreakdownSection({
  data = null,
  loading = false,
  error = '',
  totalExpenses = 0,
}) {
  // Normalize breakdown list from ExpenseSummaryResponse
  const categories = useMemo(() => {
    if (!data) return [];
    const rawList = Array.isArray(data)
      ? data
      : Array.isArray(data.byCategory)
      ? data.byCategory
      : [];

    if (rawList.length > 0) {
      return rawList.map((item) => ({
        name: item.category || item.name || 'Other',
        amount: Number(item.amount || item.total || 0),
        count: item.count || 0,
      }));
    }

    if (typeof data === 'object') {
      const list = [];
      Object.keys(data).forEach((key) => {
        if (!['total', 'totalExpenses', 'from', 'to', 'byCategory'].includes(key)) {
          list.push({
            name: key,
            amount: Number(data[key] || 0),
          });
        }
      });
      return list;
    }
    return [];
  }, [data]);

  const computedTotal = useMemo(() => {
    if (data?.totalExpenses != null) return Number(data.totalExpenses);
    if (totalExpenses > 0) return totalExpenses;
    return categories.reduce((sum, c) => sum + c.amount, 0);
  }, [data, categories, totalExpenses]);

  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
            <WalletCards size={18} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#172033] dark:text-white">
              ការបែងចែកចំណាយតាមប្រភេទ
            </h3>
            <p className="text-[11px] text-[#667085] dark:text-slate-500 font-medium">
              Expense Breakdown by Category
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[10px] text-[#667085] dark:text-slate-400 font-medium">ចំណាយសរុប</p>
          <p className="text-sm sm:text-base font-black text-rose-600 dark:text-rose-400">
            {formatCurrency(computedTotal)}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="mt-3 flex-1 flex flex-col justify-center">
        {loading && (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 size={24} className="animate-spin text-rose-500 mb-2" />
            <p className="text-xs text-[#667085] dark:text-slate-400">កំពុងទាញយកការបែងចែកចំណាយ...</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-8 text-center text-rose-500">
            <AlertCircle size={24} className="mb-1.5" />
            <p className="text-xs font-semibold">{error}</p>
          </div>
        )}

        {!loading && !error && categories.length === 0 && (
          <div className="py-8 text-center text-xs text-[#667085] dark:text-slate-500">
            មិនមានទិន្នន័យចំណាយក្នុងចន្លោះកាលបរិច្ឆេទនេះទេ
          </div>
        )}

        {!loading && !error && categories.length > 0 && (
          <div className="space-y-3">
            {categories.map((cat, idx) => {
              const meta = getCategoryMeta(cat.name);
              const percentage = computedTotal > 0 ? (cat.amount / computedTotal) * 100 : 0;

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-[#172033] dark:text-slate-200">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.color }} />
                      <span>{meta.label}</span>
                    </span>
                    <span className="font-bold text-[#172033] dark:text-white">
                      {formatCurrency(cat.amount)}{' '}
                      <span className="text-[10px] text-[#667085] font-normal">
                        ({percentage.toFixed(1)}%)
                      </span>
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.max(0, percentage))}%`,
                        backgroundColor: meta.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
