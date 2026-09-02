import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Receipt, CheckCircle2, DollarSign, ShoppingCart, AlertCircle, RefreshCw,
  TrendingUp, Calendar, ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSales } from '../../hooks/useSales';
import { formatCurrency, formatDate } from '../../utils/format';
import { SaleStatusBadge } from '../ui/SaleStatusBadge';
import SEO from '../SEO';

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sales, loading, error, reload } = useSales();
  const [period, setPeriod] = useState('ALL');

  // Filter sales for the logged in cashier
  const mySales = useMemo(
    () => sales.filter((s) => s.cashier === user?.sub || s.cashierName === user?.username),
    [sales, user?.sub, user?.username]
  );

  const filteredMySales = useMemo(() => {
    if (period === 'TODAY') {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return mySales.filter((s) => new Date(s.createdAt) >= startOfToday);
    }
    return mySales;
  }, [mySales, period]);

  const stats = useMemo(() => {
    const paid = filteredMySales.filter((s) => s.status === 'COMPLETED' && s.paymentStatus === 'PAID');
    const revenue = paid.reduce((sum, s) => sum + (s.total || 0), 0);
    const avgTicket = paid.length > 0 ? revenue / paid.length : 0;
    const completionRate = filteredMySales.length > 0 ? Math.round((paid.length / filteredMySales.length) * 100) : 0;
    return {
      total: filteredMySales.length,
      completed: paid.length,
      revenue,
      avgTicket,
      completionRate,
    };
  }, [filteredMySales]);

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in max-w-6xl mx-auto">
      <SEO
        title="ផ្ទាំងគិតលុយផ្ទាល់ខ្លួន (Cashier Dashboard) | Mart System"
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

        <button
          onClick={reload}
          disabled={loading}
          className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition active:scale-95 disabled:opacity-50"
          title="ទាញយកឡើងវិញ"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin text-emerald-600' : ''} />
        </button>
      </div>

      {/* KPI Overview Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {/* Total Revenue */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">ចំណូលខ្ញុំ (PAID)</p>
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

        {/* Total Sales */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">ការលក់សរុប (ខ្ញុំ)</p>
            <p className="mt-1 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {loading ? '—' : stats.total}
            </p>
            <p className="mt-0.5 text-[10px] text-sky-600 dark:text-sky-400 font-semibold">
              ប្រតិបត្តិការផ្ទាល់ខ្លួន
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

        {/* Average Ticket */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">មធ្យម/វិក្កយបត្រ</p>
            <p className="mt-1 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {loading ? '—' : formatCurrency(stats.avgTicket)}
            </p>
            <p className="mt-0.5 text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
              Average Ticket
            </p>
          </div>
          <div className="rounded-xl bg-purple-500/10 dark:bg-purple-950/50 p-2.5 text-purple-600 dark:text-purple-400">
            <TrendingUp size={22} />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 sm:p-4 shadow-2xs flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Calendar size={14} />
          <span>បង្ហាញទិន្នន័យ:</span>
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
            ថ្ងៃនេះ (Today)
          </button>
          <button
            onClick={() => setPeriod('ALL')}
            className={`rounded-lg px-3 py-1 transition cursor-pointer ${
              period === 'ALL'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            ទាំងអស់ (All Time)
          </button>
        </div>
      </div>


      {/* Recent Sales List */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Receipt size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                ការលក់ថ្មីៗរបស់ខ្ញុំ
              </h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                My Recent Transactions
              </p>
            </div>
          </div>

          <Link
            to="/dashboard/sales"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition"
          >
            <span>មើលទាំងអស់</span>
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
              ព្យាយាមម្តងទៀត
            </button>
          </div>
        )}

        {!loading && !error && filteredMySales.length === 0 && (
          <div className="p-10 sm:p-14 text-center">
            <Receipt size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="mb-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              អ្នកមិនទាន់មានការលក់ក្នុងចន្លោះពេលនេះទេ
            </p>
            <Link
              to="/pos"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-600/30 transition hover:from-emerald-500 hover:to-teal-500"
            >
              <ShoppingCart size={16} />
              ចាប់ផ្តើមការលក់
            </Link>
          </div>
        )}

        {!loading && !error && filteredMySales.length > 0 && (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredMySales.slice(0, 6).map((sale) => (
              <div
                key={sale.id}
                onClick={() => navigate(`/dashboard/sales/${sale.id}`)}
                className="p-3.5 sm:px-6 sm:py-4 flex items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition cursor-pointer"
              >
                <div className="min-w-0">
                  <p className="font-mono text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 truncate">
                    {sale.invoiceNumber}
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

