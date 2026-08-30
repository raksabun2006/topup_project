import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Receipt, CheckCircle, DollarSign, ShoppingCart, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSales } from '../../hooks/useSales';
import { formatCurrency, formatDate } from '../../utils/format';
import { StatCard } from '../ui/StatCard';
import { SaleStatusBadge } from '../ui/SaleStatusBadge';

export default function UserDashboard() {
  const { user } = useAuth();
  const { sales, loading, error, reload } = useSales();

  // Backend គ្មាន endpoint ស្ថិតិផ្ទាល់ខ្លួនទេ - គណនានៅ client ពី
  // /api/sales ដែលត្រូវបានទាញយកទាំងអស់រួចហើយ។ sale.cashier ជា Keycloak
  // user id (JWT sub claim) មិនមែន username ទេ - ត្រូវប្រៀបធៀបនឹង user.sub។
  const mySales = useMemo(
    () => sales.filter((s) => s.cashier === user?.sub),
    [sales, user?.sub]
  );
  const stats = useMemo(() => {
    const paid = mySales.filter((s) => s.status === 'COMPLETED' && s.paymentStatus === 'PAID');
    return {
      total: mySales.length,
      completed: paid.length,
      revenue: paid.reduce((sum, s) => sum + (s.total || 0), 0),
    };
  }, [mySales]);

  return (
    <div className="mx-auto max-w-6xl px-3 sm:px-6 py-6 sm:py-10">
      <div className="relative mb-6 sm:mb-10 overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-300 dark:border-slate-800 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 p-5 sm:p-8 shadow-xl shadow-emerald-200/50 dark:shadow-none">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">សួស្តី {user?.username}</h1>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">ចាប់ផ្តើមការលក់ថ្មីនៅចំណុចលក់</p>

        <Link
          to="/pos"
          className="mt-5 sm:mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-600 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:scale-105 hover:from-emerald-500 hover:to-emerald-500 active:scale-95"
        >
          <ShoppingCart size={17} />
          បើកចំណុចលក់ (POS)
        </Link>
      </div>

      <div className="mb-6 sm:mb-10 grid gap-3.5 sm:gap-5 grid-cols-1 sm:grid-cols-3">
        <StatCard icon={Receipt} label="ការលក់សរុប (ខ្ញុំ)" value={loading ? '—' : stats.total} />
        <StatCard icon={CheckCircle} label="បញ្ចប់រួច" value={loading ? '—' : stats.completed} accent="emerald" />
        <StatCard icon={DollarSign} label="ចំណូល (ខ្ញុំ)" value={loading ? '—' : formatCurrency(stats.revenue)} accent="amber" />
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-ink-900 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-4 sm:py-5">
          <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">ការលក់ថ្មីៗរបស់ខ្ញុំ</h2>
          <Link
            to="/sales"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 transition hover:text-emerald-700 dark:hover:text-emerald-300"
          >
            មើលទាំងអស់
          </Link>
        </div>

        {loading && (
          <div className="space-y-3 p-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-ink-800" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="p-10 text-center">
            <AlertCircle size={32} className="mx-auto mb-3 text-rose-700 dark:text-rose-400" />
            <p className="mb-5 text-sm text-rose-700 dark:text-rose-400">{error}</p>
            <button
              onClick={reload}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-ink-950 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 shadow-sm transition hover:border-emerald-500/40 hover:text-slate-900 dark:hover:text-white"
            >
              <RefreshCw size={14} />
              ព្យាយាមម្តងទៀត
            </button>
          </div>
        )}

        {!loading && !error && mySales.length === 0 && (
          <div className="p-14 text-center">
            <Receipt size={40} className="mx-auto mb-4 text-slate-600 dark:text-slate-500" />
            <p className="mb-6 text-slate-500 dark:text-slate-400">អ្នកមិនទាន់មានការលក់នៅឡើយទេ</p>
            <Link
              to="/pos"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:from-emerald-500 hover:to-emerald-500"
            >
              ចាប់ផ្តើមការលក់
            </Link>
          </div>
        )}

        {!loading && !error && mySales.length > 0 && (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {mySales.slice(0, 5).map((sale) => (
              <Link
                key={sale.id}
                to={`/sales/${sale.id}`}
                className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-emerald-50 dark:hover:bg-slate-800/60"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-700 dark:text-slate-200">{sale.invoiceNumber}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatDate(sale.createdAt)}</p>
                </div>

                <div className="flex shrink-0 items-center gap-4">
                  <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(sale.total)}</span>
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
