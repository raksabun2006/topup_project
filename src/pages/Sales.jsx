import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, RefreshCw, Receipt, Search, User } from 'lucide-react';
import { useSales } from '../hooks/useSales';
import { useCustomers } from '../hooks/useCustomers';
import { formatCurrency, formatDate } from '../utils/format';
import { SaleStatusBadge, PaymentStatusBadge } from '../components/ui/SaleStatusBadge';
import SEO from '../components/SEO';

export default function Sales() {
  const { sales, loading, error, reload } = useSales();
  const { customers } = useCustomers();
  const [search, setSearch] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const cashierFilter = searchParams.get('cashier') ?? '';

  const customerNameById = useMemo(
    () => new Map(customers.map((c) => [c.id, c.name])),
    [customers]
  );

  const cashiers = useMemo(
    () => Array.from(new Set(sales.map((s) => s.cashierName ?? s.cashier).filter(Boolean))).sort(),
    [sales]
  );

  const setCashierFilter = (value) => {
    setSearchParams(value ? { cashier: value } : {});
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sales.filter((s) => {
      const cashierName = s.cashierName ?? s.cashier;
      if (cashierFilter && cashierName !== cashierFilter) return false;
      if (!q) return true;
      const customerName = customerNameById.get(s.customer) ?? '';
      return (
        s.invoiceNumber?.toLowerCase().includes(q) ||
        customerName.toLowerCase().includes(q) ||
        cashierName?.toLowerCase().includes(q)
      );
    });
  }, [sales, search, cashierFilter, customerNameById]);

  return (
    <div className="mx-auto max-w-6xl px-3 sm:px-6 py-6 sm:py-10">
      <SEO
        title="ប្រវត្តិការលក់ (Sales) | Mart System"
        robots="noindex, nofollow"
      />
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-slate-900 dark:text-white">ប្រវត្តិការលក់</h1>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1 sm:flex-initial">
            <User size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={cashierFilter}
              onChange={(e) => setCashierFilter(e.target.value)}
              className="w-full sm:w-auto rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-9 pr-8 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">អ្នកគិតលុយទាំងអស់</option>
              {cashiers.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="relative flex-1 sm:w-64">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ស្វែងរកវិក្កយបត្រ / អតិថិជន..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        {loading && (
          <div className="space-y-3 p-4 sm:p-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="p-8 sm:p-10 text-center">
            <AlertCircle size={32} className="mx-auto mb-3 text-rose-600 dark:text-rose-400" />
            <p className="mb-5 text-sm text-rose-600 dark:text-rose-400">{error}</p>
            <button
              onClick={reload}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 shadow-xs transition hover:border-emerald-500 hover:text-slate-900 dark:hover:text-white"
            >
              <RefreshCw size={14} />
              ព្យាយាមម្តងទៀត
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="p-12 sm:p-16 text-center">
            <Receipt size={40} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <p className="text-sm text-slate-500 dark:text-slate-400">មិនទាន់មានការលក់នៅឡើយទេ</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((sale) => (
              <Link
                key={sale.id}
                to={`/sales/${sale.id}`}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:px-6 sm:py-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/60 active:bg-slate-100 dark:active:bg-slate-800"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-bold text-slate-900 dark:text-white text-sm">{sale.invoiceNumber}</p>
                    <span className="sm:hidden font-black text-emerald-600 dark:text-emerald-400 text-sm ml-auto">
                      {formatCurrency(sale.total)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {customerNameById.get(sale.customer) ?? 'អតិថិជនទូទៅ'} · {formatDate(sale.createdAt)}
                  </p>
                  {sale.cashier && (
                    <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                      <User size={11} />
                      {sale.cashierName ?? sale.cashier}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t border-slate-50 dark:border-slate-800 sm:border-0">
                  <span className="hidden sm:block font-bold text-slate-900 dark:text-white text-sm mr-1">
                    {formatCurrency(sale.total)}
                  </span>
                  <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
                    <PaymentStatusBadge status={sale.paymentStatus} />
                    <SaleStatusBadge status={sale.status} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
