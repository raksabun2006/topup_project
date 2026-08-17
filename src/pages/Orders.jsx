
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Package, AlertCircle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { ordersApi } from '../api/ordersApi';
import { getErrorMessage } from '../api/client';
import { formatCurrency, formatDate } from '../utils/format';
import { OrderStatusBadge } from '../components/ui/OrderStatusBadge';

const PAGE_SIZE = 20;

const STATUS_FILTERS = [
  { value: '', label: 'ទាំងអស់' },
  { value: 'PENDING_PAYMENT', label: 'រង់ចាំបង់ប្រាក់' },
  { value: 'PAID', label: 'បង់ប្រាក់រួច' },
  { value: 'PROCESSING', label: 'កំពុងបញ្ជូន' },
  { value: 'SUCCESS', label: 'ជោគជ័យ' },
  { value: 'FAILED', label: 'បរាជ័យ' },
  { value: 'REFUNDED', label: 'សងប្រាក់វិញ' },
  { value: 'CANCELLED', label: 'បោះបង់' },
];

export default function Orders() {
  const [page, setPage] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await ordersApi.list({ page: pageIndex, size: PAGE_SIZE, status: status || undefined });
      setPage(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [pageIndex, status]);

  useEffect(() => {
    load();
  }, [load]);

  const orders = page?.content ?? [];
  const totalPages = page?.totalPages ?? 0;
  const totalElements = page?.totalElements ?? 0;

  const handleStatusChange = (value) => {
    setStatus(value);
    setPageIndex(0);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-wide text-white">ការបញ្ជាទិញ</h1>
          <p className="mt-2 text-slate-400">
            {loading ? 'កំពុងផ្ទុក...' : `${totalElements} ការបញ្ជាទិញ`}
          </p>
        </div>

        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="rounded-xl border border-purple-900/40 bg-ink-900 px-3.5 py-2 text-sm text-slate-300 shadow-sm transition focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
        >
          {STATUS_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl border border-purple-900/30 bg-ink-900 shadow-sm">
        {loading && (
          <div className="space-y-3 p-6">
            {Array.from({ length: 6 }).map((_, i) => (
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
              <RefreshCw size={14} /> ព្យាយាមម្តងទៀត
            </button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="p-14 text-center">
            <Package size={40} className="mx-auto mb-4 text-slate-600" />
            <p className="mb-6 text-slate-400">
              {status ? 'គ្មានការបញ្ជាទិញត្រូវនឹងតម្រងនេះទេ' : 'អ្នកមិនទាន់មានការបញ្ជាទិញនៅឡើយ'}
            </p>
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
            {orders.map((order) => (
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
                    {order.orderNumber} · ID {order.gameUserId} · {formatDate(order.createdAt)}
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

        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-purple-900/30 px-6 py-4">
            <button
              onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
              disabled={pageIndex === 0}
              className="inline-flex items-center gap-1 rounded-xl border border-purple-900/40 bg-ink-950 px-3 py-2 text-sm text-slate-300 shadow-sm transition hover:border-purple-500/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft size={14} /> មុន
            </button>

            <span className="text-sm text-slate-500">
              ទំព័រ {pageIndex + 1} / {totalPages}
            </span>

            <button
              onClick={() => setPageIndex((p) => Math.min(totalPages - 1, p + 1))}
              disabled={pageIndex >= totalPages - 1}
              className="inline-flex items-center gap-1 rounded-xl border border-purple-900/40 bg-ink-950 px-3 py-2 text-sm text-slate-300 shadow-sm transition hover:border-purple-500/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              បន្ទាប់ <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
