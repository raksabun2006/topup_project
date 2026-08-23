import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Receipt, DollarSign, CheckCircle, XCircle, AlertTriangle,
  AlertCircle, RefreshCw, ShieldCheck, ShoppingCart, Boxes, Package, Users, UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSales } from '../../hooks/useSales';
import { useLowStockInventory } from '../../hooks/useInventory';
import { useCustomers } from '../../hooks/useCustomers';
import { formatCurrency, formatDate } from '../../utils/format';
import { StatCard } from '../ui/StatCard';
import { SaleStatusBadge, PaymentStatusBadge } from '../ui/SaleStatusBadge';
import BakongDiagnostics from '../admin/BakongDiagnostics';
import CategoryRevenuePie from './CategoryRevenuePie';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { sales, loading, error, reload } = useSales();
  const { items: lowStock, loading: lowStockLoading } = useLowStockInventory();
  const { customers, loading: customersLoading } = useCustomers();

  // Backend គ្មាន endpoint ស្ថិតិទេ - គណនាពី /api/sales ដែលទាញយករួច
  const stats = useMemo(() => {
    const completed = sales.filter((s) => s.status === 'COMPLETED');
    const cancelled = sales.filter((s) => s.status === 'CANCELLED');
    return {
      total: sales.length,
      revenue: completed.reduce((sum, s) => sum + (s.total || 0), 0),
      completed: completed.length,
      cancelled: cancelled.length,
    };
  }, [sales]);

  // Backend គ្មាន entity Cashier/User list ដាច់ដោយឡែកទេ - cashier ជាឈ្មោះ
  // string ដែលកត់ត្រានៅលើ Sale ម្តងៗ ដូច្នេះទាញយក "អ្នកគិតលុយទាំងអស់" ដោយ
  // ដកស្រង់ចេញពី sales ដែលទាញយករួច (មិនមែនហៅ API ដាច់ដោយឡែកទេ)។
  const cashierStats = useMemo(() => {
    const map = new Map();
    sales.forEach((s) => {
      if (!s.cashier) return;
      const entry = map.get(s.cashier) ?? { cashier: s.cashier, count: 0, revenue: 0 };
      entry.count += 1;
      if (s.status === 'COMPLETED') entry.revenue += s.total || 0;
      map.set(s.cashier, entry);
    });
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }, [sales]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-10 rounded-2xl border border-slate-300 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 p-8 shadow-2xl shadow-emerald-200/60">
        <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
          <ShieldCheck size={16} />
          អ្នកគ្រប់គ្រង
        </div>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">ផ្ទាំងគ្រប់គ្រង</h1>
        <p className="mt-2 text-slate-600">សួស្តី {user?.username} — ទិដ្ឋភាពរួមនៃប្រព័ន្ធលក់</p>
        <div className="mt-5 flex flex-wrap gap-3">
        <Link
          to="/pos"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:from-emerald-500 hover:to-emerald-500"
        >
          <ShoppingCart size={16} />
          បើកចំណុចលក់
        </Link>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-ink-950 px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-500/40 hover:text-slate-900"
        >
          <Package size={16} />
          គ្រប់គ្រងផលិតផល
        </Link>
        <Link
          to="/customers"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-ink-950 px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-500/40 hover:text-slate-900"
        >
          <Users size={16} />
          គ្រប់គ្រងអតិថិជន
        </Link>
        </div>
      </div>

      <div className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={Receipt} label="ការលក់សរុប" value={loading ? '—' : stats.total} />
        <StatCard icon={DollarSign} label="ចំណូល" value={loading ? '—' : formatCurrency(stats.revenue)} accent="emerald" />
        <StatCard icon={CheckCircle} label="បញ្ចប់រួច" value={loading ? '—' : stats.completed} accent="emerald" />
        <StatCard icon={XCircle} label="បោះបង់" value={loading ? '—' : stats.cancelled} accent="rose" />
        <Link to="/customers">
          <StatCard icon={Users} label="អតិថិជនសរុប" value={customersLoading ? '—' : customers.length} />
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ការលក់ថ្មីៗ */}
        <div className="rounded-2xl border border-slate-200 bg-ink-900 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <h2 className="font-semibold text-slate-900">ការលក់ថ្មីៗ</h2>
            <Link to="/sales" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition">
              មើលទាំងអស់
            </Link>
          </div>

          {loading && (
            <div className="space-y-3 p-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-ink-800" />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="p-10 text-center">
              <AlertCircle size={32} className="mx-auto mb-3 text-rose-700" />
              <p className="mb-5 text-sm text-rose-700">{error}</p>
              <button
                onClick={reload}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-ink-950 px-4 py-2 text-sm text-slate-600 shadow-sm hover:border-emerald-500/40 hover:text-slate-900 transition"
              >
                <RefreshCw size={14} /> ព្យាយាមម្តងទៀត
              </button>
            </div>
          )}

          {!loading && !error && sales.length === 0 && (
            <div className="p-14 text-center">
              <Receipt size={40} className="mx-auto mb-4 text-slate-600" />
              <p className="text-slate-500">មិនទាន់មានការលក់នៅឡើយទេ</p>
            </div>
          )}

          {!loading && !error && sales.length > 0 && (
            <div className="divide-y divide-slate-200">
              {sales.slice(0, 8).map((sale) => (
                <Link
                  key={sale.id}
                  to={`/sales/${sale.id}`}
                  className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-emerald-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-700">{sale.invoiceNumber}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {sale.cashier} · {formatDate(sale.createdAt)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm font-semibold text-slate-900">{formatCurrency(sale.total)}</span>
                    <PaymentStatusBadge status={sale.paymentStatus} />
                    <SaleStatusBadge status={sale.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ស្តុកទាប */}
        <div className="rounded-2xl border border-slate-200 bg-ink-900 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <h2 className="flex items-center gap-2 font-semibold text-slate-900">
              <Boxes size={18} className="text-amber-700" />
              ស្តុកជិតអស់
            </h2>
          </div>

          {lowStockLoading && (
            <div className="space-y-3 p-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-ink-800" />
              ))}
            </div>
          )}

          {!lowStockLoading && lowStock.length === 0 && (
            <div className="p-10 text-center">
              <CheckCircle size={32} className="mx-auto mb-3 text-emerald-500/60" />
              <p className="text-sm text-slate-500">គ្មានទំនិញជិតអស់ស្តុកទេ</p>
            </div>
          )}

          {!lowStockLoading && lowStock.length > 0 && (
            <div className="divide-y divide-slate-200">
              {lowStock.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-6 py-3.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <AlertTriangle size={15} className="shrink-0 text-amber-700" />
                    <span className="truncate text-sm text-slate-700">{item.product}</span>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-amber-700">
                    {item.quantity} / {item.minimumStock}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* អ្នកគិតលុយទាំងអស់ */}
        <div className="rounded-2xl border border-slate-200 bg-ink-900 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <h2 className="flex items-center gap-2 font-semibold text-slate-900">
              <UserCheck size={18} className="text-emerald-600" />
              អ្នកគិតលុយទាំងអស់
            </h2>
          </div>

          {loading && (
            <div className="space-y-3 p-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-ink-800" />
              ))}
            </div>
          )}

          {!loading && cashierStats.length === 0 && (
            <div className="p-10 text-center">
              <p className="text-sm text-slate-500">មិនទាន់មានទិន្នន័យអ្នកគិតលុយទេ</p>
            </div>
          )}

          {!loading && cashierStats.length > 0 && (
            <div className="divide-y divide-slate-200">
              {cashierStats.map((c) => (
                <Link
                  key={c.cashier}
                  to={`/sales?cashier=${encodeURIComponent(c.cashier)}`}
                  className="flex items-center justify-between gap-4 px-6 py-3.5 transition hover:bg-emerald-50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-700">
                      {c.cashier.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-700">{c.cashier}</p>
                      <p className="text-xs text-slate-500">{c.count} ការលក់</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-slate-900">{formatCurrency(c.revenue)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <CategoryRevenuePie sales={sales} loading={loading} />
      </div>

      <BakongDiagnostics />
    </div>
  );
}
