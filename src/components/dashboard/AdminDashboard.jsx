import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Receipt as ReceiptIcon, DollarSign, XCircle, Clock, AlertTriangle,
  AlertCircle, RefreshCw, Boxes, UserCheck, Filter, CheckCircle, Search,
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

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'ស្ថានភាពទាំងអស់' },
  { value: 'PENDING', label: 'កំពុងរង់ចាំ' },
  { value: 'COMPLETED', label: 'បញ្ចប់' },
  { value: 'CANCELLED', label: 'បោះបង់' },
  { value: 'REFUNDED', label: 'សងប្រាក់វិញ' },
];

function startOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { sales, loading, error, reload } = useSales();
  const { items: lowStock, loading: lowStockLoading, error: lowStockError, reload: reloadLowStock } = useLowStockInventory();
  const { customers } = useCustomers();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const customerNameById = useMemo(
    () => new Map(customers.map((c) => [c.id, c.name])),
    [customers]
  );

  const stats = useMemo(() => {
    const paid = sales.filter((s) => s.status === 'COMPLETED' && s.paymentStatus === 'PAID');
    const cancelled = sales.filter((s) => s.status === 'CANCELLED');
    const pending = sales.filter((s) => s.status === 'PENDING');
    return {
      total: sales.length,
      revenue: paid.reduce((sum, s) => sum + (s.total || 0), 0),
      completed: paid.length,
      cancelled: cancelled.length,
      pending: pending.length,
    };
  }, [sales]);

  const weekly = useMemo(() => {
    const now = new Date();
    const thisStart = startOfWeek(now);
    const lastStart = new Date(thisStart.getTime() - 7 * 86400000);
    const pctChange = (curr, prev) => (prev > 0 ? ((curr - prev) / prev) * 100 : null);
    const isPaid = (s) => s.status === 'COMPLETED' && s.paymentStatus === 'PAID';

    let thisRevenue = 0;
    let lastRevenue = 0;
    let thisOrders = 0;
    let lastOrders = 0;
    sales.forEach((s) => {
      const created = new Date(s.createdAt);
      if (created >= thisStart && created <= now) {
        thisOrders += 1;
        if (isPaid(s)) thisRevenue += s.total || 0;
      } else if (created >= lastStart && created < thisStart) {
        lastOrders += 1;
        if (isPaid(s)) lastRevenue += s.total || 0;
      }
    });

    return {
      revenueChange: pctChange(thisRevenue, lastRevenue),
      ordersChange: pctChange(thisOrders, lastOrders),
    };
  }, [sales]);

  const cashierStats = useMemo(() => {
    const map = new Map();
    sales.forEach((s) => {
      const name = s.cashierName ?? s.cashier;
      if (!name) return;
      const entry = map.get(name) ?? { cashier: name, count: 0, revenue: 0 };
      entry.count += 1;
      if (s.status === 'COMPLETED' && s.paymentStatus === 'PAID') entry.revenue += s.total || 0;
      map.set(name, entry);
    });
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }, [sales]);
  const topCashierRevenue = Math.max(1, ...cashierStats.map((c) => c.revenue));

  const filteredSales = useMemo(() => {
    const term = search.trim().toLowerCase();
    return sales.filter((s) => {
      if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
      if (!term) return true;
      const customerName = (customerNameById.get(s.customer) ?? '').toLowerCase();
      return s.invoiceNumber?.toLowerCase().includes(term) || customerName.includes(term);
    });
  }, [sales, search, statusFilter, customerNameById]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Search & Filter Bar for Transactions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ស្វែងរកលេខវិក្កយបត្រ ឬអតិថិជន..."
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500/40 focus:outline-none shadow-2xs transition"
          />
        </div>
      </div>

      {error && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 sm:px-5 sm:py-4 text-xs sm:text-sm text-rose-700 dark:text-rose-400">
          <span className="flex items-center gap-2"><AlertCircle size={16} className="shrink-0" /> {error}</span>
          <button onClick={reload} className="flex items-center gap-1.5 font-semibold hover:underline shrink-0">
            <RefreshCw size={14} /> ព្យាយាមម្តងទៀត
          </button>
        </div>
      )}

      {/* ------- Stat cards ------- */}
      <div className="grid gap-3.5 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-2xs">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">ចំណូលសរុប</p>
              <p className="mt-1.5 text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{loading ? '—' : formatCurrency(stats.revenue)}</p>
              {weekly.revenueChange != null && (
                <p className={`mt-1 text-[11px] sm:text-xs font-medium ${weekly.revenueChange >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {weekly.revenueChange >= 0 ? '↑' : '↓'} {Math.abs(weekly.revenueChange).toFixed(1)}% ធៀបនឹងសប្តាហ៍មុន
                </p>
              )}
            </div>
            <div className="rounded-xl bg-emerald-500/10 dark:bg-emerald-950/60 p-2.5 sm:p-3 text-emerald-700 dark:text-emerald-400">
              <DollarSign size={20} className="sm:w-[22px] sm:h-[22px]" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-2xs">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">ការបញ្ជាទិញសរុប</p>
              <p className="mt-1.5 text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{loading ? '—' : stats.total}</p>
              {weekly.ordersChange != null && (
                <p className={`mt-1 text-[11px] sm:text-xs font-medium ${weekly.ordersChange >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {weekly.ordersChange >= 0 ? '↑' : '↓'} {Math.abs(weekly.ordersChange).toFixed(1)}% ធៀបនឹងសប្តាហ៍មុន
                </p>
              )}
            </div>
            <div className="rounded-xl bg-sky-500/10 dark:bg-sky-950/60 p-2.5 sm:p-3 text-sky-700 dark:text-sky-400">
              <ReceiptIcon size={20} className="sm:w-[22px] sm:h-[22px]" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-2xs sm:col-span-2 lg:col-span-1">
          <p className="mb-2 sm:mb-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400">កំពុងរង់ចាំ & បោះបង់</p>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="rounded-xl bg-amber-500/10 dark:bg-amber-950/60 p-2 sm:p-2.5 text-amber-700 dark:text-amber-400"><Clock size={16} /></div>
              <div>
                <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{loading ? '—' : stats.pending}</p>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">កំពុងរង់ចាំ</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-2.5 border-l border-slate-200 dark:border-slate-800 pl-3 sm:pl-4">
              <div className="rounded-xl bg-rose-500/10 dark:bg-rose-950/60 p-2 sm:p-2.5 text-rose-700 dark:text-rose-400"><XCircle size={16} /></div>
              <div>
                <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{loading ? '—' : stats.cancelled}</p>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">បោះបង់</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------- Chart + right column ------- */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WeeklyRevenueChart sales={sales} loading={loading} />
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-5">
              <h2 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                <Boxes size={18} className="text-amber-700 dark:text-amber-400" />
                ស្តុកជិតអស់
              </h2>
            </div>

            {lowStockLoading && (
              <div className="space-y-3 p-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-10 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                ))}
              </div>
            )}

            {!lowStockLoading && lowStockError && (
              <div className="p-8 text-center">
                <AlertCircle size={28} className="mx-auto mb-2 text-rose-700 dark:text-rose-400" />
                <p className="text-sm text-rose-700 dark:text-rose-400">{lowStockError}</p>
                <button
                  onClick={reloadLowStock}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"
                >
                  <RefreshCw size={13} /> ព្យាយាមម្តងទៀត
                </button>
              </div>
            )}

            {!lowStockLoading && !lowStockError && lowStock.length === 0 && (
              <div className="p-8 text-center">
                <CheckCircle size={28} className="mx-auto mb-2 text-emerald-500/60 dark:text-emerald-400/60" />
                <p className="text-sm text-slate-500 dark:text-slate-400">គ្មានទំនិញជិតអស់ស្តុកទេ</p>
              </div>
            )}

            {!lowStockLoading && !lowStockError && lowStock.length > 0 && (
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {lowStock.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 px-6 py-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <AlertTriangle size={14} className="shrink-0 text-amber-700 dark:text-amber-400" />
                      <span className="truncate text-sm text-slate-700 dark:text-slate-300">{item.product}</span>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-amber-700 dark:text-amber-400">
                      {item.quantity}/{item.minimumStock}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-5">
              <h2 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                <UserCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
                អ្នកគិតលុយឆ្នើម
              </h2>
            </div>

            {loading && (
              <div className="space-y-3 p-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-10 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                ))}
              </div>
            )}

            {!loading && cashierStats.length === 0 && (
              <p className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">មិនទាន់មានទិន្នន័យទេ</p>
            )}

            {!loading && cashierStats.length > 0 && (
              <div className="space-y-4 p-6">
                {cashierStats.slice(0, 4).map((c) => (
                  <div key={c.cashier}>
                    <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                      <span className="flex min-w-0 items-center gap-2 truncate font-medium text-slate-700 dark:text-slate-300">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 dark:bg-emerald-950/60 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                          {c.cashier.charAt(0).toUpperCase()}
                        </span>
                        {c.cashier}
                      </span>
                      <span className="shrink-0 font-semibold text-slate-900 dark:text-white">{formatCurrency(c.revenue)}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-emerald-600"
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

      {/* ------- Transactions + top products ------- */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 px-6 py-5">
            <h2 className="font-semibold text-slate-900 dark:text-white">ប្រតិបត្តិការ</h2>
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 focus:border-emerald-500/40 focus:outline-none"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <Link to="/sales" className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 transition hover:text-emerald-700 dark:hover:text-emerald-300">
                មើលទាំងអស់
              </Link>
            </div>
          </div>

          {loading && (
            <div className="space-y-3 p-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
              ))}
            </div>
          )}

          {!loading && filteredSales.length === 0 && (
            <div className="p-14 text-center">
              <ReceiptIcon size={36} className="mx-auto mb-3 text-slate-600 dark:text-slate-500" />
              <p className="text-slate-500 dark:text-slate-400">គ្មានប្រតិបត្តិការត្រូវនឹងលក្ខខណ្ឌនេះទេ</p>
            </div>
          )}

          {!loading && filteredSales.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-140 text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-xs text-slate-500 dark:text-slate-400">
                    <th className="px-6 py-3 font-medium">No</th>
                    <th className="px-3 py-3 font-medium">អតិថិជន</th>
                    <th className="px-3 py-3 font-medium">កាលបរិច្ឆេទ</th>
                    <th className="px-3 py-3 font-medium">ស្ថានភាព</th>
                    <th className="px-6 py-3 text-right font-medium">ចំនួនទឹកប្រាក់</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredSales.slice(0, 8).map((sale, i) => (
                    <tr
                      key={sale.id}
                      onClick={() => navigate(`/sales/${sale.id}`)}
                      className="cursor-pointer transition hover:bg-emerald-50 dark:hover:bg-slate-800/60"
                    >
                      <td className="px-6 py-3.5 text-slate-500 dark:text-slate-400">{i + 1}</td>
                      <td className="px-3 py-3.5">
                        <p className="font-medium text-slate-700 dark:text-slate-200">{customerNameById.get(sale.customer) ?? 'អតិថិជនទូទៅ'}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{sale.invoiceNumber}</p>
                      </td>
                      <td className="px-3 py-3.5 text-slate-500 dark:text-slate-400">{formatDate(sale.createdAt)}</td>
                      <td className="px-3 py-3.5"><SaleStatusBadge status={sale.status} /></td>
                      <td className="px-6 py-3.5 text-right font-semibold text-slate-900 dark:text-white">{formatCurrency(sale.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <TopProductsPanel sales={sales} loading={loading} />
      </div>

      <CategoryRevenuePie sales={sales} loading={loading} />

      <BakongDiagnostics />
    </div>
  );
}
