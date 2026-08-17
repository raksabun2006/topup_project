import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, AlertCircle, RefreshCw, Gamepad2, User, Server,
  CreditCard, Calendar, Truck, Zap,
} from 'lucide-react';
import { ordersApi } from '../api/ordersApi';
import { topupApi } from '../api/topupApi';
import { getErrorMessage } from '../api/client';
import { formatCurrency, formatDate } from '../utils/format';
import { OrderStatusBadge } from '../components/ui/OrderStatusBadge';

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-4">
      <span className="flex items-center gap-3 text-sm text-slate-400">
        <Icon size={16} className="text-slate-500" /> {label}
      </span>
      <div className="truncate text-sm font-medium text-white">{value}</div>
    </div>
  );
}

export default function OrderDetails() {
  const { orderNumber } = useParams();

  const [order, setOrder] = useState(null);
  const [topup, setTopup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const orderData = await ordersApi.getByNumber(orderNumber);
      setOrder(orderData);

      // គ្មាន endpoint ស្វែងរក topup តាម orderNumber ដោយផ្ទាល់ទេ -
      // ត្រូវទាញបញ្ជីមកហើយស្វែងរកតាម orderNumber ខាង client។
      // បើអ្នកប្រើមាន topup ច្រើនជាង 100 នេះអាចខកខានបាន។
      try {
        const topupPage = await topupApi.list({ size: 100 });
        const match = topupPage?.content?.find((t) => t.orderNumber === orderData.orderNumber);
        setTopup(match ?? null);
      } catch {
        // ព័ត៌មានបញ្ជូនជាការបន្ថែម - កុំបំបែក order ដោយសារវាបរាជ័យ។
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [orderNumber]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-6 h-5 w-24 animate-pulse rounded bg-ink-800" />
        <div className="rounded-2xl border border-purple-900/30 bg-ink-900 p-6 shadow-sm">
          <div className="h-6 w-48 animate-pulse rounded bg-ink-800" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-ink-800" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="rounded-2xl border border-purple-900/30 bg-ink-900 p-10 text-center shadow-sm">
          <AlertCircle size={32} className="mx-auto mb-3 text-rose-400" />
          <p className="mb-5 text-sm text-rose-300">{error}</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={load}
              className="inline-flex items-center gap-2 rounded-xl border border-purple-900/40 bg-ink-950 px-4 py-2 text-sm text-slate-300 shadow-sm transition hover:border-purple-500/40 hover:text-white"
            >
              <RefreshCw size={14} /> ព្យាយាមម្តងទៀត
            </button>
            <Link
              to="/orders"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-600/30 transition hover:from-purple-500 hover:to-fuchsia-500"
            >
              ត្រឡប់ទៅការបញ្ជាទិញ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link
        to="/orders"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-white"
      >
        <ArrowLeft size={16} />
        ត្រឡប់ក្រោយ
      </Link>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-purple-900/30 bg-ink-900 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-sm text-slate-500">{order.orderNumber}</p>
          <h1 className="mt-1 text-xl font-bold text-white">
            {order.gameName} · {order.productName}
          </h1>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Order details */}
      <div className="mb-6 rounded-2xl border border-purple-900/30 bg-ink-900 shadow-sm">
        <div className="border-b border-purple-900/30 px-6 py-4">
          <h2 className="font-semibold text-white">ព័ត៌មានការបញ្ជាទិញ</h2>
        </div>
        <div className="divide-y divide-purple-900/20">
          <DetailRow icon={Gamepad2} label="ហ្គេម" value={`${order.gameName} (${order.gameCode})`} />
          <DetailRow icon={User} label="ID គណនីហ្គេម" value={order.gameUserId} />
          {order.serverId && <DetailRow icon={Server} label="Server" value={order.serverId} />}
          <DetailRow
            icon={CreditCard}
            label="កញ្ចប់"
            value={`${order.productName} (${order.productAmount} Units)`}
          />
          <DetailRow icon={CreditCard} label="ចំនួនទឹកប្រាក់" value={formatCurrency(order.amount, order.currency)} />
          <DetailRow icon={Calendar} label="ថ្ងៃបញ្ជាទិញ" value={formatDate(order.createdAt)} />
          <DetailRow icon={Calendar} label="ថ្ងៃកែប្រែចុងក្រោយ" value={formatDate(order.updatedAt)} />
        </div>
      </div>

      {/* Continue payment CTA */}
      {order.status === 'PENDING_PAYMENT' && (
        <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-center">
          <p className="mb-4 text-sm font-medium text-amber-300">
            ការបញ្ជាទិញនេះកំពុងរង់ចាំការបង់ប្រាក់
          </p>
          <Link
            to={`/payment/${order.id}`}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/30 transition hover:from-purple-500 hover:to-fuchsia-500"
          >
            <Zap size={16} />
            បន្តទៅការទូទាត់
          </Link>
        </div>
      )}

      {/* Delivery status */}
      {topup && (
        <div className="rounded-2xl border border-purple-900/30 bg-ink-900 shadow-sm">
          <div className="flex items-center justify-between border-b border-purple-900/30 px-6 py-4">
            <h2 className="flex items-center gap-2 font-semibold text-white">
              <Truck size={16} className="text-slate-500" />
              ស្ថានភាពការបញ្ជូន
            </h2>
            <OrderStatusBadge status={topup.status} />
          </div>
          <div className="divide-y divide-purple-900/20">
            <DetailRow icon={CreditCard} label="លេខប្រតិបត្តិការ" value={<span className="font-mono">{topup.transactionId}</span>} />
            <DetailRow icon={Truck} label="ក្រុមហ៊ុនផ្តល់សេវា" value={topup.provider} />
            {topup.message && <DetailRow icon={AlertCircle} label="សារ" value={topup.message} />}
            <DetailRow icon={Calendar} label="ថ្ងៃកែប្រែចុងក្រោយ" value={formatDate(topup.updatedAt)} />
          </div>
        </div>
      )}
    </div>
  );
}
