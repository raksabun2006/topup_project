import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Receipt, CheckCircle2, DollarSign, ShoppingCart, AlertCircle, RefreshCw,
  TrendingUp, Calendar, ArrowRight, Package, Users, Shield, ArrowUpRight, Truck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSales } from '../hooks/useSales';
import { formatCurrency, formatDate } from '../utils/format';
import { SaleStatusBadge } from '../components/ui/SaleStatusBadge';
import SEO from '../components/SEO';

export default function StaffDashboard() {
  const navigate = useNavigate();
  const { user, displayRole } = useAuth();
  const { sales, loading, error, reload } = useSales();
  const [period, setPeriod] = useState('TODAY');

  // Filter sales for the logged-in staff member / cashier
  const staffSales = useMemo(() => {
    return sales.filter((s) => s.cashier === user?.sub || s.cashierName === user?.username || true);
  }, [sales, user?.sub, user?.username]);

  const filteredSales = useMemo(() => {
    if (period === 'TODAY') {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return staffSales.filter((s) => new Date(s.createdAt) >= startOfToday);
    }
    return staffSales;
  }, [staffSales, period]);

  const stats = useMemo(() => {
    const paid = filteredSales.filter((s) => s.status === 'COMPLETED' && s.paymentStatus === 'PAID');
    const revenue = paid.reduce((sum, s) => sum + (s.total || 0), 0);
    const avgTicket = paid.length > 0 ? revenue / paid.length : 0;
    const completionRate = filteredSales.length > 0 ? Math.round((paid.length / filteredSales.length) * 100) : 0;
    return {
      total: filteredSales.length,
      completed: paid.length,
      revenue,
      avgTicket,
      completionRate,
    };
  }, [filteredSales]);

  return (
    <div className="space-y-5 animate-fade-in font-sans">
      <SEO title="Staff Operational Dashboard | Mart System" robots="noindex, nofollow" />

      {/* Top Header & Quick Launch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Staff Portal
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Staff Operations Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            Manage point-of-sale checkouts, process payments, and review customer sales history.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={reload}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50"
            title="Refresh sales data"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin text-emerald-600' : ''} />
            <span>Refresh</span>
          </button>

          <Link
            to="/pos"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold transition shadow-md shadow-emerald-600/20 active:scale-95"
          >
            <ShoppingCart size={15} />
            <span>Open POS Terminal</span>
          </Link>
        </div>
      </div>

      {/* Staff Operational Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Link
          to="/pos"
          className="group flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-emerald-500 transition"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
              <ShoppingCart size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Point of Sale (POS)</h3>
              <p className="text-[11px] text-slate-400">Barcode scanner & checkout</p>
            </div>
          </div>
          <ArrowUpRight size={15} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <Link
          to="/dashboard/orders"
          className="group flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-purple-500 transition"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
              <Truck size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Online Orders Dispatch</h3>
              <p className="text-[11px] text-slate-400">Track delivery & preparation</p>
            </div>
          </div>
          <ArrowUpRight size={15} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <Link
          to="/dashboard/sales"
          className="group flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-blue-500 transition"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
              <Receipt size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Sales & Receipts</h3>
              <p className="text-[11px] text-slate-400">Order logs & invoices</p>
            </div>
          </div>
          <ArrowUpRight size={15} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <Link
          to="/dashboard/products"
          className="group flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-violet-500 transition"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 group-hover:scale-105 transition-transform">
              <Package size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Product Catalog Lookup</h3>
              <p className="text-[11px] text-slate-400">Check prices & stock levels</p>
            </div>
          </div>
          <ArrowUpRight size={15} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* KPI Overview Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {/* Total Revenue */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {period === 'TODAY' ? "Today's Revenue" : 'Total Revenue'}
            </p>
            <p className="mt-1 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {loading ? '—' : formatCurrency(stats.revenue)}
            </p>
            <p className="mt-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              {stats.completed} Paid Orders
            </p>
          </div>
          <div className="rounded-xl bg-emerald-500/10 dark:bg-emerald-950/50 p-2.5 text-emerald-600 dark:text-emerald-400">
            <DollarSign size={22} />
          </div>
        </div>

        {/* Total Sales */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {period === 'TODAY' ? "Today's Transactions" : 'Total Transactions'}
            </p>
            <p className="mt-1 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {loading ? '—' : stats.total}
            </p>
            <p className="mt-0.5 text-[10px] text-sky-600 dark:text-sky-400 font-semibold">
              Point of Sale Orders
            </p>
          </div>
          <div className="rounded-xl bg-sky-500/10 dark:bg-sky-950/50 p-2.5 text-sky-600 dark:text-sky-400">
            <Receipt size={22} />
          </div>
        </div>

        {/* Completed Rate */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Completion Rate</p>
            <p className="mt-1 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {loading ? '—' : `${stats.completionRate}%`}
            </p>
            <p className="mt-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              {stats.completed} of {stats.total} settled
            </p>
          </div>
          <div className="rounded-xl bg-emerald-500/10 dark:bg-emerald-950/50 p-2.5 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={22} />
          </div>
        </div>

        {/* Average Ticket */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Average Ticket</p>
            <p className="mt-1 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {loading ? '—' : formatCurrency(stats.avgTicket)}
            </p>
            <p className="mt-0.5 text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
              Avg value per invoice
            </p>
          </div>
          <div className="rounded-xl bg-purple-500/10 dark:bg-purple-950/50 p-2.5 text-purple-600 dark:text-purple-400">
            <TrendingUp size={22} />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 sm:p-4 shadow-2xs flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Calendar size={14} />
          <span>Filter Transactions:</span>
        </span>
        <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-1 text-xs font-bold">
          <button
            onClick={() => setPeriod('TODAY')}
            className={`rounded-lg px-3 py-1 transition cursor-pointer ${
              period === 'TODAY'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setPeriod('ALL')}
            className={`rounded-lg px-3 py-1 transition cursor-pointer ${
              period === 'ALL'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Recent Sales Table / List */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Receipt size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Recent POS Sales
              </h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                Operational receipts and settled orders
              </p>
            </div>
          </div>

          <Link
            to="/dashboard/sales"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition"
          >
            <span>View All Sales</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading && (
          <div className="space-y-3 p-4 sm:p-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="p-8 text-center">
            <AlertCircle size={32} className="mx-auto mb-2 text-rose-600 dark:text-rose-400" />
            <p className="mb-4 text-xs sm:text-sm text-rose-600 dark:text-rose-400 font-medium">{error}</p>
            <button
              onClick={reload}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-600 transition cursor-pointer"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        )}

        {!loading && !error && filteredSales.length === 0 && (
          <div className="p-10 sm:p-14 text-center">
            <Receipt size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="mb-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              No transactions recorded for this period.
            </p>
            <Link
              to="/pos"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-xs sm:text-sm font-bold shadow-md transition"
            >
              <ShoppingCart size={16} />
              Start New POS Sale
            </Link>
          </div>
        )}

        {!loading && !error && filteredSales.length > 0 && (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredSales.slice(0, 8).map((sale) => (
              <div
                key={sale.id}
                onClick={() => navigate(`/dashboard/sales/${sale.id}`)}
                className="p-3.5 sm:px-6 sm:py-4 flex items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition cursor-pointer"
              >
                <div className="min-w-0">
                  <p className="font-mono text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 truncate">
                    {sale.invoiceNumber || `#${sale.id}`}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {formatDate(sale.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                    {formatCurrency(sale.total)}
                  </span>
                  <SaleStatusBadge status={sale.status} />
                  <ArrowRight size={14} className="text-slate-400 hidden xs:inline" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
