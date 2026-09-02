import { DollarSign, TrendingUp, TrendingDown, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

export default function ReportSummaryCards({
  revenue = 0,
  expenses = 0,
  profit = 0,
  salesCount = 0,
  loading = false,
  titlePrefix = 'ថ្ងៃនេះ',
}) {
  const cards = [
    {
      id: 'revenue',
      title: `ចំណូល${titlePrefix}`,
      subtitle: 'Total Revenue',
      value: formatCurrency(revenue),
      rawNumber: revenue,
      icon: DollarSign,
      color: '#009F6B',
      lightBg: 'bg-emerald-50 dark:bg-emerald-950/40',
      iconColor: 'text-[#009F6B] dark:text-emerald-400',
      borderColor: 'border-slate-200/90 dark:border-slate-800',
    },
    {
      id: 'expenses',
      title: `ចំណាយ${titlePrefix}`,
      subtitle: 'Total Expenses',
      value: formatCurrency(expenses),
      rawNumber: expenses,
      icon: TrendingDown,
      color: '#F04438',
      lightBg: 'bg-rose-50 dark:bg-rose-950/40',
      iconColor: 'text-[#F04438] dark:text-rose-400',
      borderColor: 'border-slate-200/90 dark:border-slate-800',
    },
    {
      id: 'profit',
      title: `ចំណេញ${titlePrefix}`,
      subtitle: 'Net Profit',
      value: formatCurrency(profit),
      rawNumber: profit,
      icon: TrendingUp,
      color: profit >= 0 ? '#0284C7' : '#F04438',
      lightBg: profit >= 0 ? 'bg-sky-50 dark:bg-sky-950/40' : 'bg-rose-50 dark:bg-rose-950/40',
      iconColor: profit >= 0 ? 'text-[#0284C7] dark:text-sky-400' : 'text-[#F04438] dark:text-rose-400',
      borderColor: 'border-slate-200/90 dark:border-slate-800',
    },
    {
      id: 'salesCount',
      title: `ការលក់${titlePrefix}`,
      subtitle: 'Total Orders',
      value: `${Number(salesCount || 0).toLocaleString()} លើក`,
      rawNumber: salesCount,
      icon: ShoppingCart,
      color: '#8B5CF6',
      lightBg: 'bg-purple-50 dark:bg-purple-950/40',
      iconColor: 'text-[#8B5CF6] dark:text-purple-400',
      borderColor: 'border-slate-200/90 dark:border-slate-800',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.id}
            className={`rounded-2xl border ${c.borderColor} bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs transition-all hover:shadow-md flex items-center justify-between`}
          >
            <div className="min-w-0 flex-1 pr-3">
              <p className="text-xs font-semibold text-[#667085] dark:text-slate-400 truncate">
                {c.title}
              </p>

              {loading ? (
                <div className="mt-2 h-7 w-28 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
              ) : (
                <p className="mt-1 text-xl sm:text-2xl font-black text-[#172033] dark:text-white tracking-tight truncate">
                  {c.value}
                </p>
              )}

              <p className="mt-0.5 text-[10px] font-medium text-[#667085] dark:text-slate-500">
                {c.subtitle}
              </p>
            </div>

            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${c.lightBg} ${c.iconColor}`}>
              <Icon size={22} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
