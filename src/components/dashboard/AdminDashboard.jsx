import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Receipt, DollarSign, Clock, AlertTriangle,
  AlertCircle, RefreshCw, Boxes, UserCheck, CheckCircle2, Search,
  ArrowRight, X, ShoppingCart, Plus
} from 'lucide-react';
import { useSales } from '../../hooks/useSales';
import { useLowStockInventory } from '../../hooks/useInventory';
import { useCustomers } from '../../hooks/useCustomers';
import { formatCurrency, formatDate } from '../../utils/format';
import { SaleStatusBadge } from '../ui/SaleStatusBadge';
import CategoryRevenuePie from './CategoryRevenuePie';
import WeeklyRevenueChart from './WeeklyRevenueChart';
import TopProductsPanel from './TopProductsPanel';
import BakongDiagnostics from '../admin/BakongDiagnostics';
import SEO from '../SEO';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'ស្ថានភាពទាំងអស់' },
  { value: 'PENDING', label: 'កំពុងរង់ចាំ (Pending)' },
  { value: 'COMPLETED', label: 'បញ្ចប់ (Completed)' },
  { value: 'CANCELLED', label: 'បោះបង់ (Cancelled)' },
  { value: 'REFUNDED', label: 'សងប្រាក់វិញ (Refunded)' },
];

const PERIOD_OPTIONS = [
  { value: 'ALL', label: 'ទាំងអស់' },
  { value: 'TODAY', label: 'ថ្ងៃនេះ' },
  { value: '7DAYS', label: '៧ ថ្ងៃ' },
  { value: 'MONTH', label: 'ខែនេះ' },
];

export default function AdminDashboard() {

  const navigate = useNavigate();
  const { sales, loading, error, reload } = useSales();

  const { items: lowStock, loading: lowStockLoading, error: lowStockError, reload: reloadLowStock } = useLowStockInventory();
  const { customers } = useCustomers();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [periodFilter, setPeriodFilter] = useState('ALL');

  const customerNameById = useMemo(
    () => new Map(customers.map((c) => [c.id, c.name])),
    [customers]
  );

  // Filter sales based on selected period
  const periodFilteredSales = useMemo(() => {
    if (periodFilter === 'ALL') return sales;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (periodFilter === 'TODAY') {
      return sales.filter((s) => new Date(s.createdAt) >= startOfToday);
    }
    if (periodFilter === '7DAYS') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
      return sales.filter((s) => new Date(s.createdAt) >= sevenDaysAgo);
    }
    if (periodFilter === 'MONTH') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return sales.filter((s) => new Date(s.createdAt) >= startOfMonth);
    }
    return sales;
  }, [sales, periodFilter]);

  const stats = useMemo(() => {
    const paid = periodFilteredSales.filter((s) => s.status === 'COMPLETED' && s.paymentStatus === 'PAID');
    const cancelled = periodFilteredSales.filter((s) => s.status === 'CANCELLED');
    const pending = periodFilteredSales.filter((s) => s.status === 'PENDING');
    const revenue = paid.reduce((sum, s) => sum + (s.total || 0), 0);
    const avgOrderValue = paid.length > 0 ? revenue / paid.length : 0;
    const completionRate = periodFilteredSales.length > 0 ? Math.round((paid.length / periodFilteredSales.length) * 100) : 0;

    return {
      total: periodFilteredSales.length,
      revenue,
      completed: paid.length,
      cancelled: cancelled.length,
      pending: pending.length,
      avgOrderValue,
      completionRate,
    };
  }, [periodFilteredSales]);

  const cashierStats = useMemo(() => {
    const map = new Map();
    periodFilteredSales.forEach((s) => {
      const name = s.cashierName ?? s.cashier;
      if (!name) return;
      const entry = map.get(name) ?? { cashier: name, count: 0, revenue: 0 };
      entry.count += 1;
      if (s.status === 'COMPLETED' && s.paymentStatus === 'PAID') entry.revenue += s.total || 0;
      map.set(name, entry);
    });
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }, [periodFilteredSales]);
  const topCashierRevenue = Math.max(1, ...cashierStats.map((c) => c.revenue));

  const filteredSales = useMemo(() => {
    const term = search.trim().toLowerCase();
    return periodFilteredSales.filter((s) => {
      if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
      if (!term) return true;
      const customerName = (customerNameById.get(s.customer) ?? '').toLowerCase();
      return s.invoiceNumber?.toLowerCase().includes(term) || customerName.includes(term);
    });
  }, [periodFilteredSales, search, statusFilter, customerNameById]);

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in max-w-7xl mx-auto">
      <SEO
        title="ផ្ទាំងគ្រប់គ្រងទូទៅ (Dashboard) | Mart System"
        robots="noindex, nofollow"
      />

      {/* Quick Actions Bar */}
      <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-2.5">
        <Link
          to="/pos"
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-sm hover:shadow-md shadow-emerald-600/25 transition-all hover:from-emerald-500 hover:to-emerald-600 active:scale-95"
        >
          <ShoppingCart size={17} />
          <span>បើក POS</span>
        </Link>

        <Link
          to="/dashboard/products"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 shadow-2xs transition hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 active:scale-95"
        >
          <Plus size={16} className="text-emerald-600 dark:text-emerald-400" />
          <span>ផលិតផលថ្មី</span>
        </Link>

        <button
          onClick={reload}
          disabled={loading}
          className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition active:scale-95 disabled:opacity-50"
          title="ទាញយកឡើងវិញ"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin text-emerald-600' : ''} />
        </button>
        </div>

      {error && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 text-xs sm:text-sm text-rose-700 dark:text-rose-400 animate-fade-in">
          <span className="flex items-center gap-2 font-medium">
            <AlertCircle size={16} className="shrink-0" /> {error}
          </span>
          <button
            onClick={reload}
            className="flex items-center gap-1.5 font-bold hover:underline shrink-0 cursor-pointer"
          >
            <RefreshCw size={14} /> ព្យាយាមម្តងទៀត
          </button>
        </div>
      )}

      {/* KPI Overview Metric Cards (Matching Sales.jsx exact format) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {/* Total Revenue */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">ចំណូលសរុប (PAID)</p>
            <p className="mt-1 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {loading ? '—' : formatCurrency(stats.revenue)}
            </p>
            <p className="mt-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              {stats.completed} ការលក់បានបង់ប្រាក់
            </p>
          </div>
          <div className="rounded-xl bg-emerald-500/10 dark:bg-emerald-950/50 p-2.5 text-emerald-600 dark:text-emerald-400">
            <DollarSign size={22} />
          </div>
        </div>

        {/* Total Orders / Invoices */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">វិក្កយបត្រសរុប</p>
            <p className="mt-1 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {loading ? '—' : stats.total}
            </p>
            <p className="mt-0.5 text-[10px] text-sky-600 dark:text-sky-400 font-semibold">
              ប្រតិបត្តិការក្នុងប្រព័ន្ធ
            </p>
          </div>
          <div className="rounded-xl bg-sky-500/10 dark:bg-sky-950/50 p-2.5 text-sky-600 dark:text-sky-400">
            <Receipt size={22} />
          </div>
        </div>

        {/* Completed Sales */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">បានបញ្ចប់ជោគជ័យ</p>
            <p className="mt-1 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {loading ? '—' : stats.completed}
            </p>
            <p className="mt-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              {stats.completionRate}% នៃចំនួនសរុប
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
              {loading ? '—' : stats.pending + stats.cancelled}
            </p>
            <p className="mt-0.5 text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
              {stats.pending} រង់ចាំ · {stats.cancelled} បោះបង់
            </p>
          </div>
          <div className="rounded-xl bg-amber-500/10 dark:bg-amber-950/50 p-2.5 text-amber-600 dark:text-amber-400">
            <Clock size={22} />
          </div>
        </div>
      </div>

      {/* Filter, Search & Period Controls Bar (Matching Sales.jsx / Products.jsx) */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 sm:p-4 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ស្វែងរកតាមលេខវិក្កយបត្រ, អតិថិជន..."
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

          {/* Period Selector and Status Filters */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Period Segmented Toggle */}
            <div className="flex items-center rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1 text-xs font-bold">
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPeriodFilter(opt.value)}
                  className={`rounded-lg px-2.5 py-1 transition ${periodFilter === opt.value
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Status Selector */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:border-emerald-500 focus:outline-none cursor-pointer"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>


      {/* ------- Chart + Side Widgets (Weekly Chart + Low Stock + Cashiers) ------- */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WeeklyRevenueChart sales={sales} loading={loading} />
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Low Stock Alert Widget */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
            <div className="border-b border-slate-100 dark:border-slate-800 px-4 sm:px-5 py-3.5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                <Boxes size={18} className="text-amber-600 dark:text-amber-400" />
                <span>ស្តុកជិតអស់ (Low Stock)</span>
              </h2>
              {lowStock.length > 0 ? (
                <Link
                  to="/dashboard/products"
                  className="rounded-full bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-400 hover:underline"
                >
                  {lowStock.length} មុខ
                </Link>
              ) : null}
            </div>

            {lowStockLoading && (
              <div className="space-y-2.5 p-4 sm:p-5">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-10 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                ))}
              </div>
            )}

            {!lowStockLoading && lowStockError && (
              <div className="p-6 text-center">
                <AlertCircle size={24} className="mx-auto mb-2 text-rose-600 dark:text-rose-400" />
                <p className="text-xs text-rose-600 dark:text-rose-400">{lowStockError}</p>
                <button
                  onClick={reloadLowStock}
                  className="mt-2 text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
                >
                  ព្យាយាមម្តងទៀត
                </button>
              </div>
            )}

            {!lowStockLoading && !lowStockError && lowStock.length === 0 && (
              <div className="p-6 text-center">
                <CheckCircle2 size={26} className="mx-auto mb-1.5 text-emerald-500/70 dark:text-emerald-400/70" />
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  ស្តុកទាំងអស់មានគ្រប់គ្រាន់
                </p>
              </div>
            )}


            {!lowStockLoading && !lowStockError && lowStock.length > 0 && (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {lowStock.slice(0, 4).map((item) => (
                  <Link
                    key={item.id}
                    to="/dashboard/products"
                    className="flex items-center justify-between gap-3 px-4 sm:px-5 py-2.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <AlertTriangle size={14} className="shrink-0 text-amber-600 dark:text-amber-400" />
                      <span className="truncate text-xs font-bold text-slate-800 dark:text-slate-200">
                        {item.product}
                      </span>
                    </div>
                    <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-bold border ${item.quantity === 0
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200/50'
                        : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200/50'
                      }`}>
                      {item.quantity}/{item.minimumStock}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Top Cashiers Leaderboard */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
            <div className="border-b border-slate-100 dark:border-slate-800 px-4 sm:px-5 py-3.5">
              <h2 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                <UserCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
                <span>អ្នកគិតលុយឆ្នើម (Top Staff)</span>
              </h2>
            </div>

            {loading && (
              <div className="space-y-2.5 p-4 sm:p-5">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-10 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                ))}
              </div>
            )}

            {!loading && cashierStats.length === 0 && (
              <p className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                មិនទាន់មានទិន្នន័យលក់ទេ
              </p>
            )}

            {!loading && cashierStats.length > 0 && (
              <div className="space-y-3 p-4 sm:p-5">
                {cashierStats.slice(0, 3).map((c, idx) => (
                  <div key={c.cashier}>
                    <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
                      <span className="flex min-w-0 items-center gap-2 truncate font-bold text-slate-800 dark:text-slate-200">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-[10px] font-black text-white shadow-2xs">
                          {idx + 1}
                        </span>
                        <span className="truncate">{c.cashier}</span>
                        <span className="text-[10px] text-slate-400">({c.count} លើក)</span>
                      </span>
                      <span className="shrink-0 font-black text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(c.revenue)}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 transition-all duration-300"
                        style={{ width: `${(c.revenue / topCashierRevenue) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ------- Bottom Analytics & Transactions (Recent Sales + Top Products) ------- */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Recent Transactions (Dual-mode: Cards on Mobile, Table on Desktop) */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 px-4 sm:px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <Receipt size={18} />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    ប្រតិបត្តិការលក់ថ្មីៗ
                  </h2>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                    Recent Sales Transactions
                  </p>
                </div>
              </div>


              {/* Search & Status Filter */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-44 flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-xs">
                  <Search size={13} className="text-slate-400 shrink-0" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ស្វែងរក..."
                    className="w-full bg-transparent px-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
                      <X size={12} />
                    </button>
                  )}
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>

                <Link
                  to="/dashboard/sales"
                  className="hidden xs:inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition shrink-0"
                >
                  <span>ទាំងអស់</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {loading && (
              <div className="space-y-3 p-4 sm:p-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                ))}
              </div>
            )}

            {!loading && filteredSales.length === 0 && (
              <div className="p-10 text-center">
                <Receipt size={36} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                  គ្មានប្រតិបត្តិការត្រូវនឹងលក្ខខណ្ឌនេះទេ
                </p>
              </div>
            )}


            {!loading && filteredSales.length > 0 && (
              <>
                {/* Mobile View: High-density interactive cards (< 640px) */}
                <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredSales.slice(0, 6).map((sale) => (
                    <div
                      key={sale.id}
                      onClick={() => navigate(`/dashboard/sales/${sale.id}`)}
                      className="p-3.5 hover:bg-emerald-50/40 dark:hover:bg-slate-800/50 transition cursor-pointer active:scale-99"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white text-xs truncate">
                            {customerNameById.get(sale.customer) ?? 'អតិថិជនទូទៅ'}
                          </p>
                          <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                            {sale.invoiceNumber}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-black text-slate-900 dark:text-white">
                            {formatCurrency(sale.total)}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {formatDate(sale.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100/60 dark:border-slate-800/60">
                        <SaleStatusBadge status={sale.status} />
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                          <span>មើលលម្អិត</span>
                          <ArrowRight size={10} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tablet/Desktop View: Tabular Layout (>= 640px) */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-left text-slate-500 dark:text-slate-400">
                        <th className="px-5 py-3 font-semibold">No</th>
                        <th className="px-3 py-3 font-semibold">អតិថិជន / លេខវិក្កយបត្រ</th>
                        <th className="px-3 py-3 font-semibold">កាលបរិច្ឆេទ</th>
                        <th className="px-3 py-3 font-semibold">ស្ថានភាព</th>
                        <th className="px-5 py-3 text-right font-semibold">ចំនួនទឹកប្រាក់</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredSales.slice(0, 7).map((sale, i) => (
                        <tr
                          key={sale.id}
                          onClick={() => navigate(`/dashboard/sales/${sale.id}`)}
                          className="cursor-pointer transition hover:bg-emerald-50/60 dark:hover:bg-emerald-950/20"
                        >
                          <td className="px-5 py-3 text-slate-400">{i + 1}</td>
                          <td className="px-3 py-3">
                            <p className="font-bold text-slate-800 dark:text-slate-200">
                              {customerNameById.get(sale.customer) ?? 'អតិថិជនទូទៅ'}
                            </p>
                            <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                              {sale.invoiceNumber}
                            </p>
                          </td>
                          <td className="px-3 py-3 text-slate-500 dark:text-slate-400">
                            {formatDate(sale.createdAt)}
                          </td>
                          <td className="px-3 py-3">
                            <SaleStatusBadge status={sale.status} />
                          </td>
                          <td className="px-5 py-3 text-right font-black text-slate-900 dark:text-white">
                            {formatCurrency(sale.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/50 text-center">
            <Link
              to="/dashboard/sales"
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              <span>មើលប្រវត្តិការលក់ទាំងអស់ ({filteredSales.length})</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Top Selling Products */}
        <TopProductsPanel sales={sales} loading={loading} />
      </div>

      {/* Category Revenue Breakdown */}
      <CategoryRevenuePie sales={sales} loading={loading} />

      {/* Bakong Connectivity Diagnostics */}
      <BakongDiagnostics />
    </div>
  );
}

