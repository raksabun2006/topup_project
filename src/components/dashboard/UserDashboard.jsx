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
  // /api/sales ដែលត្រូវបានទាញយកទាំងអស់រួចហើយ។
  const mySales = useMemo(
    () => sales.filter((s) => s.cashier === user?.username),
    [sales, user?.username]
  );
  const stats = useMemo(() => {
    const completed = mySales.filter((s) => s.status === 'COMPLETED');
    return {
      total: mySales.length,
      completed: completed.length,
      revenue: completed.reduce((sum, s) => sum + (s.total || 0), 0),
    };
  }, [mySales]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="relative mb-10 overflow-hidden rounded-3xl border border-slate-300 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 p-8 shadow-2xl shadow-emerald-200/60">
        <h1 className="text-2xl font-bold text-slate-900">សួស្តី {user?.username}</h1>
        <p className="mt-2 text-slate-600">ចាប់ផ្តើមការលក់ថ្មីនៅចំណុចលក់</p>

        <Link
          to="/pos"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-600 px-5 py-3 font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:scale-105 hover:from-emerald-500 hover:to-emerald-500"
        >
          <ShoppingCart size={18} />
          បើកចំណុចលក់
        </Link>
      </div>

      <div className="mb-10 grid gap-5 sm:grid-cols-3">
        <StatCard icon={Receipt} label="ការលក់សរុប (ខ្ញុំ)" value={loading ? '—' : stats.total} />
        <StatCard icon={CheckCircle} label="បញ្ចប់រួច" value={loading ? '—' : stats.completed} accent="emerald" />
        <StatCard icon={DollarSign} label="ចំណូល (ខ្ញុំ)" value={loading ? '—' : formatCurrency(stats.revenue)} accent="amber" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-ink-900 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <h2 className="font-semibold text-slate-900">ការលក់ថ្មីៗរបស់ខ្ញុំ</h2>
          <Link
            to="/sales"
            className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600 transition hover:text-emerald-700"
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

        {!loading && !error && mySales.length === 0 && (
          <div className="p-14 text-center">
            <Receipt size={40} className="mx-auto mb-4 text-slate-600" />
            <p className="mb-6 text-slate-500">អ្នកមិនទាន់មានការលក់នៅឡើយទេ</p>
            <Link
              to="/pos"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:from-emerald-500 hover:to-emerald-500"
            >
              ចាប់ផ្តើមការលក់
            </Link>
          </div>
        )}

        {!loading && !error && mySales.length > 0 && (
          <div className="divide-y divide-slate-200">
            {mySales.slice(0, 5).map((sale) => (
              <Link
                key={sale.id}
                to={`/sales/${sale.id}`}
                className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-emerald-50"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-700">{sale.invoiceNumber}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatDate(sale.createdAt)}</p>
                </div>

                <div className="flex shrink-0 items-center gap-4">
                  <span className="font-semibold text-slate-900">{formatCurrency(sale.total)}</span>
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
