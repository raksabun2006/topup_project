import { useMemo } from 'react';
import { CreditCard, Banknote, QrCode, Clock, Loader2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

export default function PaymentMethodsSection({
  data = [],
  loading = false,
  error = '',
}) {
  const methods = useMemo(() => {
    if (!data) return [];
    const list = Array.isArray(data)
      ? data
      : Array.isArray(data.methods)
      ? data.methods
      : [];
    return list.map((item) => {
      const name = item.method || item.paymentMethod || item.name || 'OTHER';
      const count = Number(item.count || item.transactionCount || item.totalTransactions || 0);
      const amount = Number(item.amount || item.totalAmount || item.total || 0);

      let icon = Clock;
      let label = 'ផ្សេងៗ (Other)';
      let color = '#94A3B8';
      let bg = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300';

      const upper = String(name).toUpperCase();
      if (upper.includes('CASH') || upper.includes('សាច់ប្រាក់')) {
        icon = Banknote;
        label = 'សាច់ប្រាក់ (Cash)';
        color = '#009F6B';
        bg = 'bg-emerald-50 dark:bg-emerald-950/40 text-[#009F6B] dark:text-emerald-400';
      } else if (upper.includes('KHQR') || upper.includes('BAKONG')) {
        icon = QrCode;
        label = 'បាគង KHQR (Bakong)';
        color = '#E11D48';
        bg = 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400';
      } else if (upper.includes('CARD') || upper.includes('កាត') || upper.includes('VISA')) {
        icon = CreditCard;
        label = 'កាតធនាគារ (Card)';
        color = '#3B82F6';
        bg = 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400';
      }

      return {
        name,
        label,
        count,
        amount,
        icon,
        color,
        bg,
      };
    });
  }, [data]);

  const totalAmount = useMemo(() => methods.reduce((sum, m) => sum + m.amount, 0), [methods]);

  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
            <CreditCard size={18} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#172033] dark:text-white">
              របាយការណ៍វិធីសាស្រ្តទូទាត់
            </h3>
            <p className="text-[11px] text-[#667085] dark:text-slate-500 font-medium">
              Payment Method Breakdown
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mt-3 flex-1 flex flex-col justify-center">
        {loading && (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 size={24} className="animate-spin text-blue-500 mb-2" />
            <p className="text-xs text-[#667085] dark:text-slate-400">កំពុងទាញយកទិន្នន័យទូទាត់...</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-8 text-center text-rose-500">
            <AlertCircle size={24} className="mb-1.5" />
            <p className="text-xs font-semibold">{error}</p>
          </div>
        )}

        {!loading && !error && methods.length === 0 && (
          <div className="py-8 text-center text-xs text-[#667085] dark:text-slate-500">
            មិនមានទិន្នន័យទូទាត់ក្នុងចន្លោះកាលបរិច្ឆេទនេះទេ
          </div>
        )}

        {!loading && !error && methods.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {methods.map((m, idx) => {
              const Icon = m.icon;
              const pct = totalAmount > 0 ? (m.amount / totalAmount) * 100 : 0;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 p-3.5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${m.bg}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#172033] dark:text-white">{m.label}</p>
                      <p className="text-[11px] text-[#667085] dark:text-slate-400">
                        {m.count.toLocaleString()} ប្រតិបត្តិការ ({pct.toFixed(0)}%)
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-[#009F6B] dark:text-emerald-400">
                      {formatCurrency(m.amount)}
                    </p>
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
