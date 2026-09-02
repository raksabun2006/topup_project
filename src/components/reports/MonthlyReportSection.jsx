import { useState, useEffect, useCallback } from 'react';
import { Calendar, DollarSign, Package, Percent, Receipt, ArrowUpDown, Loader2, AlertCircle } from 'lucide-react';
import { reportApi } from '../../api/reportApi';
import { getErrorMessage } from '../../api/client';
import { formatCurrency } from '../../utils/format';

const MONTH_OPTIONS = [
  { value: 1, label: 'មករា (Jan)' },
  { value: 2, label: 'កុម្ភៈ (Feb)' },
  { value: 3, label: 'មីនា (Mar)' },
  { value: 4, label: 'មេសា (Apr)' },
  { value: 5, label: 'ឧសភា (May)' },
  { value: 6, label: 'មិថុនា (Jun)' },
  { value: 7, label: 'កក្កដា (Jul)' },
  { value: 8, label: 'សីហា (Aug)' },
  { value: 9, label: 'កញ្ញា (Sep)' },
  { value: 10, label: 'តុលា (Oct)' },
  { value: 11, label: 'វិច្ឆិកា (Nov)' },
  { value: 12, label: 'ធ្នូ (Dec)' },
];

export default function MonthlyReportSection() {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await reportApi.getMonthlyReport(selectedYear, selectedMonth);
      setReport(data || {});
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  // Normalized values supporting different DTO namings
  const totalSales = Number(report?.totalSales ?? report?.salesCount ?? 0);
  const revenue = Number(report?.revenue ?? report?.totalRevenue ?? 0);
  const discount = Number(report?.discount ?? report?.totalDiscount ?? 0);
  const tax = Number(report?.tax ?? report?.totalTax ?? 0);
  const expenses = Number(report?.expenses ?? report?.totalExpenses ?? 0);
  const cogs = Number(report?.cogs ?? report?.costOfGoodsSold ?? 0);
  const profit = Number(report?.profit ?? report?.netProfit ?? (revenue - expenses - cogs));
  const itemsSold = Number(report?.itemsSold ?? report?.totalItemsSold ?? 0);
  const aov = Number(report?.averageOrderValue ?? report?.aov ?? (totalSales > 0 ? revenue / totalSales : 0));

  const years = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

  const metrics = [
    {
      title: 'ការលក់សរុប (Total Sales)',
      value: `${totalSales.toLocaleString()} លើក`,
      icon: Receipt,
      color: '#3B82F6',
      bg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
    },
    {
      title: 'ចំណូលសរុប (Revenue)',
      value: formatCurrency(revenue),
      icon: DollarSign,
      color: '#009F6B',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-[#009F6B] dark:text-emerald-400',
      bold: true,
    },
    {
      title: 'ចំណាយសរុប (Expenses)',
      value: formatCurrency(expenses),
      icon: DollarSign,
      color: '#F04438',
      bg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
    },
    {
      title: 'ថ្លៃដើមទំនិញ (COGS)',
      value: formatCurrency(cogs),
      icon: Package,
      color: '#F59E0B',
      bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
    },
    {
      title: 'ចំណេញសុទ្ធ (Net Profit)',
      value: formatCurrency(profit),
      icon: DollarSign,
      color: profit >= 0 ? '#009F6B' : '#F04438',
      bg: profit >= 0 ? 'bg-emerald-50 dark:bg-emerald-950/40 text-[#009F6B]' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600',
      bold: true,
    },
    {
      title: 'ការបញ្ចុះតម្លៃ (Discount)',
      value: formatCurrency(discount),
      icon: Percent,
      color: '#8B5CF6',
      bg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
    },
    {
      title: 'ពន្ធសរុប (Tax)',
      value: formatCurrency(tax),
      icon: Percent,
      color: '#64748B',
      bg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
    },
    {
      title: 'ទំនិញបានលក់ (Items Sold)',
      value: `${itemsSold.toLocaleString()} មុខ`,
      icon: Package,
      color: '#06B6D4',
      bg: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400',
    },
    {
      title: 'ចំណាយមធ្យម/ការលក់ (AOV)',
      value: formatCurrency(aov),
      icon: ArrowUpDown,
      color: '#10B981',
      bg: 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400',
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs flex flex-col space-y-4">
      {/* Month/Year Picker Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-[#172033] dark:text-white flex items-center gap-2">
            <Calendar size={18} className="text-[#009F6B]" />
            <span>របាយការណ៍ហិរញ្ញវត្ថុប្រចាំខែ (Monthly Financial Statement)</span>
          </h3>
          <p className="text-xs text-[#667085] dark:text-slate-500 mt-0.5">
            ជ្រើសរើសខែ និងឆ្នាំដើម្បីទាញយករបាយការណ៍ពេញលេញ
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Month Dropdown */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-[#172033] dark:text-white focus:border-[#009F6B] focus:outline-none cursor-pointer"
          >
            {MONTH_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          {/* Year Dropdown */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-[#172033] dark:text-white focus:border-[#009F6B] focus:outline-none cursor-pointer"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                ឆ្នាំ {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 size={28} className="animate-spin text-[#009F6B] mb-2" />
          <p className="text-xs font-semibold text-[#667085] dark:text-slate-400">កំពុងទាញយករបាយការណ៍ប្រចាំខែ...</p>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-8 text-center text-rose-500">
          <AlertCircle size={28} className="mb-2" />
          <p className="text-xs font-semibold">{error}</p>
        </div>
      )}

      {/* Grid of 9 Monthly Metrics */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {metrics.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 p-3.5 flex items-center justify-between"
              >
                <div>
                  <p className="text-[11px] font-semibold text-[#667085] dark:text-slate-400">
                    {m.title}
                  </p>
                  <p className={`mt-1 text-lg ${m.bold ? 'font-black text-[#009F6B] dark:text-emerald-400' : 'font-bold text-[#172033] dark:text-white'}`}>
                    {m.value}
                  </p>
                </div>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${m.bg}`}>
                  <Icon size={18} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
