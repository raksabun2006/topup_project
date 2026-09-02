import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertCircle, RefreshCw, Receipt, Search, User, DollarSign,
  CheckCircle2, Clock, LayoutGrid, List,
  ArrowRight, Calendar, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { useSales } from '../hooks/useSales';
import { useCustomers } from '../hooks/useCustomers';
import { formatCurrency, formatDate } from '../utils/format';
import { SaleStatusBadge, PaymentStatusBadge } from '../components/ui/SaleStatusBadge';
import SEO from '../components/SEO';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'ស្ថានភាពទាំងអស់' },
  { value: 'COMPLETED', label: 'បញ្ចប់ (Completed)' },
  { value: 'PENDING', label: 'កំពុងរង់ចាំ (Pending)' },
  { value: 'CANCELLED', label: 'បោះបង់ (Cancelled)' },
  { value: 'REFUNDED', label: 'សងប្រាក់វិញ (Refunded)' },
];

const PAYMENT_OPTIONS = [
  { value: 'ALL', label: 'ការទូទាត់ទាំងអស់' },
  { value: 'PAID', label: 'បានបង់ប្រាក់ (PAID)' },
  { value: 'UNPAID', label: 'មិនទាន់បង់ (UNPAID)' },
];

export default function Sales() {
  const { sales, loading, error, reload } = useSales();
  const { customers } = useCustomers();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('DATE_DESC');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [page, setPage] = useState(0);
  const pageSize = 20;

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
    setPage(0);
  };

  // KPIs
  const kpis = useMemo(() => {
    const paid = sales.filter((s) => s.status === 'COMPLETED' && s.paymentStatus === 'PAID');
    const pending = sales.filter((s) => s.status === 'PENDING');
    const cancelled = sales.filter((s) => s.status === 'CANCELLED');
    const totalRevenue = paid.reduce((sum, s) => sum + (s.total || 0), 0);

    return {
      totalSales: sales.length,
      totalRevenue,
      paidCount: paid.length,
      pendingCount: pending.length,
      cancelledCount: cancelled.length,
    };
  }, [sales]);

  // Filtered & Sorted Sales
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = sales.filter((s) => {
      const cashierName = s.cashierName ?? s.cashier;
      if (cashierFilter && cashierName !== cashierFilter) return false;
      if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
      if (paymentFilter !== 'ALL' && s.paymentStatus !== paymentFilter) return false;

      if (!q) return true;
      const customerName = customerNameById.get(s.customer) ?? '';
      return (
        s.invoiceNumber?.toLowerCase().includes(q) ||
        customerName.toLowerCase().includes(q) ||
        cashierName?.toLowerCase().includes(q)
      );
    });

    // Sort
    if (sortBy === 'DATE_DESC') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'DATE_ASC') {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === 'AMOUNT_DESC') {
      result.sort((a, b) => (b.total || 0) - (a.total || 0));
    } else if (sortBy === 'AMOUNT_ASC') {
      result.sort((a, b) => (a.total || 0) - (b.total || 0));
    }

    return result;
  }, [sales, search, cashierFilter, statusFilter, paymentFilter, sortBy, customerNameById]);

  // Paginated chunk
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedSales = useMemo(() => {
    const start = page * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setPaymentFilter('ALL');
    setSortBy('DATE_DESC');
    setCashierFilter('');
    setPage(0);
  };

  const hasActiveFilters = search || cashierFilter || statusFilter !== 'ALL' || paymentFilter !== 'ALL' || sortBy !== 'DATE_DESC';

  return (
    <div className="space-y-5 animate-fade-in">
      <SEO
        title="ប្រវត្តិការលក់ (Sales) | Mart System"
        robots="noindex, nofollow"
      />



      {/* KPI Overview Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {/* Total Revenue */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">ចំណូលសរុប (PAID)</p>
            <p className="mt-1 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {loading ? '—' : formatCurrency(kpis.totalRevenue)}
            </p>
            <p className="mt-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              {kpis.paidCount} ការលក់បានបង់ប្រាក់
            </p>
          </div>
          <div className="rounded-xl bg-emerald-500/10 dark:bg-emerald-950/50 p-2.5 text-emerald-600 dark:text-emerald-400">
            <DollarSign size={22} />
          </div>
        </div>

        {/* Total Invoices */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">វិក្កយបត្រសរុប</p>
            <p className="mt-1 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {loading ? '—' : kpis.totalSales.toLocaleString()}
            </p>
            <p className="mt-0.5 text-[10px] text-slate-400">
              ប្រតិបត្តិការក្នុងប្រព័ន្ធ
            </p>
          </div>
          <div className="rounded-xl bg-sky-500/10 dark:bg-sky-950/50 p-2.5 text-sky-600 dark:text-sky-400">
            <Receipt size={22} />
          </div>
        </div>

        {/* Completed & Paid */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">បានបញ្ចប់ជោគជ័យ</p>
            <p className="mt-1 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {loading ? '—' : kpis.paidCount}
            </p>
            <p className="mt-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              {kpis.totalSales > 0 ? ((kpis.paidCount / kpis.totalSales) * 100).toFixed(0) : 0}% នៃចំនួនសរុប
            </p>
          </div>
          <div className="rounded-xl bg-emerald-500/10 dark:bg-emerald-950/50 p-2.5 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={22} />
          </div>
        </div>

        {/* Pending & Cancelled */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">រង់ចាំ & បោះបង់</p>
            <p className="mt-1 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {loading ? '—' : kpis.pendingCount + kpis.cancelledCount}
            </p>
            <p className="mt-0.5 text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
              {kpis.pendingCount} រង់ចាំ · {kpis.cancelledCount} បោះបង់
            </p>
          </div>
          <div className="rounded-xl bg-amber-500/10 dark:bg-amber-950/50 p-2.5 text-amber-600 dark:text-amber-400">
            <Clock size={22} />
          </div>
        </div>
      </div>

      {/* Filter & Controls Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 sm:p-4 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder="ស្វែងរកលេខវិក្កយបត្រ, អតិថិជន, អ្នកគិតលុយ..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 py-2 pl-9 pr-8 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter Dropdowns & View Mode */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Status Selector */}
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:border-emerald-500 focus:outline-none cursor-pointer"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* Payment Status Selector */}
            <select
              value={paymentFilter}
              onChange={(e) => { setPaymentFilter(e.target.value); setPage(0); }}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:border-emerald-500 focus:outline-none cursor-pointer"
            >
              {PAYMENT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* Cashier Selector */}
            {cashiers.length > 0 && (
              <select
                value={cashierFilter}
                onChange={(e) => setCashierFilter(e.target.value)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:border-emerald-500 focus:outline-none cursor-pointer"
              >
                <option value="">អ្នកគិតលុយទាំងអស់</option>
                {cashiers.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(0); }}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:border-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="DATE_DESC">កាលបរិច្ឆេទ: ថ្មី ទៅ ចាស់</option>
              <option value="DATE_ASC">កាលបរិច្ឆេទ: ចាស់ ទៅ ថ្មី</option>
              <option value="AMOUNT_DESC">តម្លៃ: ខ្ពស់ ទៅ ទាប</option>
              <option value="AMOUNT_ASC">តម្លៃ: ទាប ទៅ ខ្ពស់</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-0.5">
              <button
                onClick={() => setViewMode('table')}
                className={`rounded-lg p-1.5 transition ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
                title="ទិដ្ឋភាពតារាង (Table View)"
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-lg p-1.5 transition ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
                title="ទិដ្ឋភាពកាត (Grid View)"
              >
                <LayoutGrid size={16} />
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={reload}
              disabled={loading}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition active:scale-95 disabled:opacity-50"
              title="ទាញយកឡើងវិញ"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin text-emerald-600' : ''} />
            </button>
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <p className="text-slate-500 dark:text-slate-400">
              បង្ហាញ <strong className="text-slate-800 dark:text-slate-200">{filtered.length}</strong> នៃ {sales.length} ការលក់ដែលត្រូវនឹងលក្ខខណ្ឌ
            </p>
            <button
              onClick={resetFilters}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
            >
              សម្អាតតម្រងទាំងអស់
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div>
        {loading && (
          <div className="space-y-3 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 p-8 text-center animate-fade-in">
            <AlertCircle size={36} className="mx-auto mb-3 text-rose-600 dark:text-rose-400" />
            <p className="mb-4 text-sm font-semibold text-rose-700 dark:text-rose-300">{error}</p>
            <button
              onClick={reload}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-rose-500 active:scale-95"
            >
              <RefreshCw size={14} />
              ព្យាយាមម្តងទៀត
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center shadow-2xs animate-fade-in">
            <Receipt size={44} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">មិនមានប្រតិបត្តិការលក់ត្រូវនឹងលក្ខខណ្ឌនេះទេ</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {hasActiveFilters
                ? 'សូមព្យាយាមសម្អាតតម្រង ឬផ្លាស់ប្តូរពាក្យស្វែងរក'
                : 'មិនទាន់មានការលក់នៅក្នុងប្រព័ន្ធនៅឡើយទេ'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="mt-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs transition hover:bg-slate-100"
              >
                សម្អាតតម្រង
              </button>
            )}
          </div>
        )}

        {/* Table View */}
        {!loading && !error && filtered.length > 0 && viewMode === 'table' && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400">
                    <th className="py-3.5 px-4 font-semibold">លេខវិក្កយបត្រ</th>
                    <th className="py-3.5 px-3 font-semibold">អតិថិជន</th>
                    <th className="py-3.5 px-3 font-semibold">កាលបរិច្ឆេទ</th>
                    <th className="py-3.5 px-3 font-semibold">អ្នកគិតលុយ</th>
                    <th className="py-3.5 px-3 font-semibold text-center">ការទូទាត់</th>
                    <th className="py-3.5 px-3 font-semibold text-center">ស្ថានភាព</th>
                    <th className="py-3.5 px-4 font-semibold text-right">ចំនួនទឹកប្រាក់</th>
                    <th className="py-3.5 px-3 font-semibold text-center">ព័ត៌មាន</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedSales.map((sale) => (
                    <tr
                      key={sale.id}
                      className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                    >
                      <td className="py-3 px-4">
                        <Link
                          to={`/dashboard/sales/${sale.id}`}
                          className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          {sale.invoiceNumber}
                        </Link>
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {customerNameById.get(sale.customer) ?? 'អតិថិជនទូទៅ'}
                        </p>
                      </td>
                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                        {formatDate(sale.createdAt)}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
                          <User size={12} className="text-slate-400" />
                          {sale.cashierName ?? sale.cashier ?? '—'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <PaymentStatusBadge status={sale.paymentStatus} />
                      </td>
                      <td className="py-3 px-3 text-center">
                        <SaleStatusBadge status={sale.status} />
                      </td>
                      <td className="py-3 px-4 text-right font-black text-slate-900 dark:text-white sm:text-base">
                        {formatCurrency(sale.total)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Link
                          to={`/dashboard/sales/${sale.id}`}
                          className="inline-flex items-center justify-center rounded-lg p-1.5 text-slate-400 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-600 transition"
                          title="មើលព័ត៌មានលម្អិត"
                        >
                          <ArrowRight size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Card Grid View */}
        {!loading && !error && filtered.length > 0 && viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {paginatedSales.map((sale) => (
              <Link
                key={sale.id}
                to={`/dashboard/sales/${sale.id}`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs hover:shadow-xl hover:border-emerald-500/40 dark:hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                    <span className="font-mono text-xs font-black text-emerald-600 dark:text-emerald-400">
                      {sale.invoiceNumber}
                    </span>
                    <SaleStatusBadge status={sale.status} />
                  </div>

                  <div className="mt-3 space-y-1.5">
                    <p className="font-bold text-slate-900 dark:text-white text-sm truncate">
                      {customerNameById.get(sale.customer) ?? 'អតិថិជនទូទៅ'}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Calendar size={12} />
                      <span>{formatDate(sale.createdAt)}</span>
                    </div>
                    {sale.cashier && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <User size={12} />
                        <span>អ្នកគិតលុយ: {sale.cashierName ?? sale.cashier}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">សរុប</p>
                    <p className="text-base font-black text-slate-900 dark:text-white">
                      {formatCurrency(sale.total)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <PaymentStatusBadge status={sale.paymentStatus} />
                    <span className="rounded-lg p-1 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition">
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {!loading && !error && totalPages > 1 && (
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-2xs">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              ទំព័រ <strong className="text-slate-800 dark:text-slate-200">{page + 1}</strong> នៃ <strong>{totalPages}</strong> (សរុប {filtered.length} ការលក់)
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(0)}
                disabled={page <= 0}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40"
              >
                ដំបូង
              </button>
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page <= 0}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40"
                title="ទំព័រមុន"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {page + 1}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40"
                title="ទំព័របន្ទាប់"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => setPage(totalPages - 1)}
                disabled={page >= totalPages - 1}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40"
              >
                ចុងក្រោយ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
