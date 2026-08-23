import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, RefreshCw, Receipt, Search, User } from 'lucide-react';
import { useSales } from '../hooks/useSales';
import { formatCurrency, formatDate } from '../utils/format';
import { SaleStatusBadge, PaymentStatusBadge } from '../components/ui/SaleStatusBadge';

export default function Sales() {
  const { sales, loading, error, reload } = useSales();
  const [search, setSearch] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const cashierFilter = searchParams.get('cashier') ?? '';

  const cashiers = useMemo(
    () => Array.from(new Set(sales.map((s) => s.cashier).filter(Boolean))).sort(),
    [sales]
  );

  const setCashierFilter = (value) => {
    setSearchParams(value ? { cashier: value } : {});
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sales.filter((s) => {
      if (cashierFilter && s.cashier !== cashierFilter) return false;
      if (!q) return true;
      return (
        s.invoiceNumber?.toLowerCase().includes(q) ||
        s.customer?.toLowerCase().includes(q) ||
        s.cashier?.toLowerCase().includes(q)
      );
    });
  }, [sales, search, cashierFilter]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-black uppercase tracking-wide text-slate-900">ប្រវត្តិការលក់</h1>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <User size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <select
              value={cashierFilter}
              onChange={(e) => setCashierFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-ink-950 py-2 pl-9 pr-8 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">អ្នកគិតលុយទាំងអស់</option>
              {cashiers.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ស្វែងរកលេខវិក្កយបត្រ/អតិថិជន..."
              className="w-64 rounded-xl border border-slate-300 bg-ink-950 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-ink-900 shadow-sm">
        {loading && (
          <div className="space-y-3 p-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-ink-800" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="p-10 text-center">
            <AlertCircle size={32} className="mx-auto mb-3 text-rose-700" />
            <p className="mb-5 text-sm text-rose-700">{error}</p>
            <button
              onClick={reload}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-ink-950 px-4 py-2 text-sm text-slate-600 shadow-sm transition hover:border-emerald-500/40 hover:text-slate-900"
            >
              <RefreshCw size={14} />
              ព្យាយាមម្តងទៀត
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="p-14 text-center">
            <Receipt size={40} className="mx-auto mb-4 text-slate-600" />
            <p className="text-slate-500">មិនទាន់មានការលក់នៅឡើយទេ</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="divide-y divide-slate-200">
            {filtered.map((sale) => (
              <Link
                key={sale.id}
                to={`/sales/${sale.id}`}
                className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-emerald-50"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-700">{sale.invoiceNumber}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {sale.customer ?? 'អតិថិជនទូទៅ'} · {formatDate(sale.createdAt)}
                  </p>
                  {sale.cashier && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-emerald-700">
                      <User size={11} />
                      {sale.cashier}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <span className="font-semibold text-slate-900">{formatCurrency(sale.total)}</span>
                  <PaymentStatusBadge status={sale.paymentStatus} />
                  <SaleStatusBadge status={sale.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
