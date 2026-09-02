import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Receipt, CheckCircle, DollarSign, ShoppingCart, AlertCircle, RefreshCw,
  Sparkles, TrendingUp, Calendar, ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSales } from '../../hooks/useSales';
import { formatCurrency, formatDate } from '../../utils/format';
import { StatCard } from '../ui/StatCard';
import { SaleStatusBadge } from '../ui/SaleStatusBadge';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'អរុណសួស្តី';
  if (hour < 17) return 'ទិវាសួស្តី';
  return 'សាយណ្ហសួស្តី';
}

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
    return {
      total: filteredMySales.length,
      completed: paid.length,
      revenue,
      avgTicket,
    };
  }, [filteredMySales]);

  return (
    <div className="mx-auto max-w-6xl px-3 sm:px-6 py-4 sm:py-8 space-y-5 sm:space-y-8 animate-fade-in">
      {/* Hero Welcome & POS Launcher */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-emerald-600/15 via-white to-teal-600/10 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-5 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs sm:text-sm">
              <Sparkles size={16} />
              <span>{getGreeting()}, {user?.displayName || user?.username}!</span>
            </div>
            <h1 className="mt-1 text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              ផ្ទាំងគិតលុយ & ប្រតិបត្តិការផ្ទាល់ខ្លួន
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              ចាប់ផ្តើមការលក់ថ្មី និងពិនិត្យមើលរបាយការណ៍វេនការងាររបស់អ្នក
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/pos"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:scale-105 hover:from-emerald-500 hover:to-teal-500 active:scale-95"
            >
              <ShoppingCart size={18} />
              <span>បើកចំណុចលក់ (POS)</span>
            </Link>
          </div>
        </div>

        {/* Period Selector Toggle */}
        <div className="mt-5 pt-4 border-t border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between gap-3">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Calendar size={14} />
            <span>បង្ហាញទិន្នន័យ:</span>
          </span>
          <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-1 text-xs font-bold">
            <button
              onClick={() => setPeriod('TODAY')}
              className={`rounded-lg px-3 py-1 transition ${
                period === 'TODAY'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ថ្ងៃនេះ (Today)
            </button>
            <button
              onClick={() => setPeriod('ALL')}
              className={`rounded-lg px-3 py-1 transition ${
                period === 'ALL'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ទាំងអស់ (All Time)
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-3 sm:gap-5 grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Receipt}
          label="ការលក់សរុប (ខ្ញុំ)"
          value={loading ? '—' : stats.total}
          accent="blue"
          loading={loading}
        />
        <StatCard
          icon={CheckCircle}
          label="បានបង់ប្រាក់រួច"
          value={loading ? '—' : stats.completed}
          accent="emerald"
          loading={loading}
        />
        <StatCard
          icon={DollarSign}
          label="ចំណូលខ្ញុំ (Revenue)"
          value={loading ? '—' : formatCurrency(stats.revenue)}
          accent="amber"
          loading={loading}
        />
        <StatCard
          icon={TrendingUp}
          label="មធ្យម/វិក្កយបត្រ"
          value={loading ? '—' : formatCurrency(stats.avgTicket)}
          accent="purple"
          loading={loading}
        />
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

