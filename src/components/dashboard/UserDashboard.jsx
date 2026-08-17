import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, CheckCircle, Clock, Zap, ArrowRight, AlertCircle, RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ordersApi } from '../../api/ordersApi';
import { getErrorMessage } from '../../api/client';
import { formatCurrency, formatDate } from '../../utils/format';
import { StatCard } from '../ui/StatCard';
import { OrderStatusBadge } from '../ui/OrderStatusBadge';

export default function UserDashboard() {
  const { user } = useAuth();

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');

    ordersApi.list({ page: 0, size: 10 })
      .then(setPage)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const orders = page?.content ?? [];

  // "សរុប" ត្រឹមត្រូវ (មកពី totalElements) តែ "ជោគជ័យ" រាប់តែ
  // ក្នុងទំព័រនេះ។ Backend គ្មាន endpoint ស្ថិតិទេ។
  const stats = {
    total: page?.totalElements ?? 0,
    success: orders.filter((o) => o.status === 'SUCCESS').length,
    pending: orders.filter((o) =>
      ['PENDING_PAYMENT', 'PAID', 'PROCESSING'].includes(o.status)
    ).length,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">

      {/* ---------- ស្វាគមន៍ ---------- */}
      <div className="relative mb-10 overflow-hidden rounded-3xl border border-purple-900/40 bg-gradient-to-r from-[#16122b] via-[#1a1438] to-[#120e24] p-8 shadow-2xl shadow-purple-950/50">
        <h1 className="text-2xl font-bold text-white">
          សួស្តី {user?.username}
        </h1>
        <p className="mt-2 text-slate-300">
          បញ្ចូលទឹកប្រាក់ហ្គេមរបស់អ្នកបានយ៉ាងលឿននិងសុវត្ថិភាព
        </p>

        <Link
          to="/games"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-5 py-3 font-semibold text-white shadow-lg shadow-purple-600/30 transition hover:scale-105 hover:from-purple-500 hover:to-fuchsia-500"
        >
          <Zap size={18} />
          បញ្ចូលទឹកប្រាក់ឥឡូវ
        </Link>
      </div>

      {/* ---------- ស្ថិតិ ---------- */}
      <div className="mb-10 grid gap-5 sm:grid-cols-3">
        <StatCard icon={Package} label="ការបញ្ជាទិញសរុប" value={loading ? '—' : stats.total} />
        <StatCard icon={CheckCircle} label="ជោគជ័យ" value={loading ? '—' : stats.success} hint="ក្នុង ១០ ថ្មីៗ" accent="emerald" />
        <StatCard icon={Clock} label="កំពុងដំណើរការ" value={loading ? '—' : stats.pending} hint="ក្នុង ១០ ថ្មីៗ" accent="amber" />
      </div>

      {/* ---------- ការបញ្ជាទិញថ្មីៗ ---------- */}
      <div className="rounded-2xl border border-purple-900/30 bg-ink-900 shadow-sm">
        <div className="flex items-center justify-between border-b border-purple-900/30 px-6 py-5">
          <h2 className="font-semibold text-white">ការបញ្ជាទិញថ្មីៗ</h2>
          <Link
            to="/orders"
            className="inline-flex items-center gap-1 text-sm font-bold text-purple-400 transition hover:text-purple-300"
          >
            មើលទាំងអស់
            <ArrowRight size={14} />
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
            <AlertCircle size={32} className="mx-auto mb-3 text-rose-400" />
            <p className="mb-5 text-sm text-rose-300">{error}</p>
            <button
              onClick={load}
              className="inline-flex items-center gap-2 rounded-xl border border-purple-900/40 bg-ink-950 px-4 py-2 text-sm text-slate-300 shadow-sm transition hover:border-purple-500/40 hover:text-white"
            >
              <RefreshCw size={14} />
              ព្យាយាមម្តងទៀត
            </button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="p-14 text-center">
            <Package size={40} className="mx-auto mb-4 text-slate-600" />
            <p className="mb-6 text-slate-400">អ្នកមិនទាន់មានការបញ្ជាទិញនៅឡើយ</p>
            <Link
              to="/games"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/30 transition hover:from-purple-500 hover:to-fuchsia-500"
            >
              ចាប់ផ្តើមបញ្ចូលទឹកប្រាក់
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="divide-y divide-purple-900/20">
            {orders.slice(0, 5).map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.orderNumber}`}
                className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-purple-950/20"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-200">
                    {order.gameName} · {order.productName}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {order.orderNumber} · {formatDate(order.createdAt)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-4">
                  <span className="font-semibold text-white">
                    {formatCurrency(order.amount, order.currency)}
                  </span>
                  <OrderStatusBadge status={order.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
