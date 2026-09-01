import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Receipt as ReceiptIcon, DollarSign, XCircle, Clock, AlertTriangle,
  AlertCircle, RefreshCw, Boxes, UserCheck, Filter, CheckCircle, Search,
  ShoppingCart, ArrowRight, X
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
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Top Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex flex-1 max-w-md items-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-3.5 pr-2 py-1.5 shadow-2xs focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ស្វែងរកលេខវិក្កយបត្រ ឬអតិថិជន..."
            className="w-full bg-transparent px-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Link
            to="/pos"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:from-emerald-500 hover:to-emerald-600 active:scale-95"
          >
            <ShoppingCart size={15} />
            <span>ចំណុចលក់ (POS)</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 sm:px-5 sm:py-4 text-xs sm:text-sm text-rose-700 dark:text-rose-400 animate-fade-in">
          <span className="flex items-center gap-2"><AlertCircle size={16} className="shrink-0" /> {error}</span>
          <button onClick={reload} className="flex items-center gap-1.5 font-semibold hover:underline shrink-0">
            <RefreshCw size={14} /> ព្យាយាមម្តងទៀត
          </button>
        </div>
      )}

      {/* ------- Stat cards ------- */}
      <div className="grid gap-3.5 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Revenue */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-2xs hover:shadow-md hover:border-emerald-500/30 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">ចំណូលសរុប (Revenue)</p>
              <p className="mt-1.5 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{loading ? '—' : formatCurrency(stats.revenue)}</p>
              {weekly.revenueChange != null && (
                <p className={`mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                  weekly.revenueChange >= 0
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40'
                    : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/40'
                }`}>
                  {weekly.revenueChange >= 0 ? '↑' : '↓'} {Math.abs(weekly.revenueChange).toFixed(1)}% ធៀបសប្តាហ៍មុន
                </p>
              )}
            </div>
            <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-3 shadow-md shadow-emerald-600/20">
              <DollarSign size={22} />
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-2xs hover:shadow-md hover:border-emerald-500/30 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">ការបញ្ជាទិញសរុប (Orders)</p>
              <p className="mt-1.5 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{loading ? '—' : stats.total}</p>
              {weekly.ordersChange != null && (
                <p className={`mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                  weekly.ordersChange >= 0
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40'
                    : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/40'
                }`}>
                  {weekly.ordersChange >= 0 ? '↑' : '↓'} {Math.abs(weekly.ordersChange).toFixed(1)}% ធៀបសប្តាហ៍មុន
                </p>
              )}
            </div>
            <div className="rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white p-3 shadow-md shadow-teal-600/20">
              <ReceiptIcon size={22} />
            </div>
          </div>
        </div>

        {/* Pending & Cancelled */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-2xs sm:col-span-2 lg:col-span-1">
          <p className="mb-2.5 sm:mb-3 text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">កំពុងរង់ចាំ & បោះបង់</p>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 p-2.5 border border-amber-200/50 dark:border-amber-800/30">
              <div className="rounded-lg bg-amber-500/20 dark:bg-amber-950/60 p-2 text-amber-700 dark:text-amber-400"><Clock size={16} /></div>
              <div>
                <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">{loading ? '—' : stats.pending}</p>
                <p className="text-[10px] sm:text-xs font-semibold text-amber-700 dark:text-amber-400">កំពុងរង់ចាំ</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 p-2.5 border border-rose-200/50 dark:border-rose-800/30">
              <div className="rounded-lg bg-rose-500/20 dark:bg-rose-950/60 p-2 text-rose-700 dark:text-rose-400"><XCircle size={16} /></div>
              <div>
                <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">{loading ? '—' : stats.cancelled}</p>
                <p className="text-[10px] sm:text-xs font-semibold text-rose-700 dark:text-rose-400">បោះបង់</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------- Chart + right column ------- */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WeeklyRevenueChart sales={sales} loading={loading} />
        </div>

        <div className="space-y-5">
          {/* Low stock widget */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
            <div className="border-b border-slate-100 dark:border-slate-800 px-5 py-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                <Boxes size={18} className="text-amber-600 dark:text-amber-400" />
                <span>ស្តុកជិតអស់ (Low Stock)</span>
              </h2>
              {lowStock.length > 0 && (
                <span className="rounded-full bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-400">
                  {lowStock.length} មុខ
                </span>
              )}
            </div>

            {lowStockLoading && (
              <div className="space-y-2.5 p-5">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-10 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                ))}
              </div>
            )}

            {!lowStockLoading && lowStockError && (
              <div className="p-6 text-center">
                <AlertCircle size={26} className="mx-auto mb-2 text-rose-600 dark:text-rose-400" />
                <p className="text-xs text-rose-600 dark:text-rose-400">{lowStockError}</p>
                <button
                  onClick={reloadLowStock}
                  className="mt-2 text-xs font-bold text-emerald-600 hover:underline"
                >
                  ព្យាយាមម្តងទៀត
                </button>
              </div>
            )}

            {!lowStockLoading && !lowStockError && lowStock.length === 0 && (
              <div className="p-8 text-center">
                <CheckCircle size={28} className="mx-auto mb-2 text-emerald-500/70 dark:text-emerald-400/70" />
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">គ្មានទំនិញជិតអស់ស្តុកទេ</p>
              </div>
            )}

            {!lowStockLoading && !lowStockError && lowStock.length > 0 && (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {lowStock.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    <div className="flex min-w-0 items-center gap-2">
                      <AlertTriangle size={14} className="shrink-0 text-amber-600 dark:text-amber-400" />
                      <span className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">{item.product}</span>
                    </div>
                    <span className="shrink-0 rounded-md bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-400 border border-amber-200/50">
                      {item.quantity}/{item.minimumStock}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Cashiers widget */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
            <div className="border-b border-slate-100 dark:border-slate-800 px-5 py-4">
              <h2 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                <UserCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
                <span>អ្នកគិតលុយឆ្នើម (Top Cashiers)</span>
              </h2>
            </div>

            {loading && (
              <div className="space-y-2.5 p-5">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-10 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                ))}
              </div>
            )}

            {!loading && cashierStats.length === 0 && (
              <p className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">មិនទាន់មានទិន្នន័យទេ</p>
            )}

            {!loading && cashierStats.length > 0 && (
              <div className="space-y-3.5 p-5">
                {cashierStats.slice(0, 4).map((c) => (
                  <div key={c.cashier}>
                    <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
                      <span className="flex min-w-0 items-center gap-2 truncate font-bold text-slate-800 dark:text-slate-200">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-[10px] font-black text-white shadow-2xs">
                          {c.cashier.charAt(0).toUpperCase()}
                        </span>
                        {c.cashier}
                      </span>
                      <span className="shrink-0 font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(c.revenue)}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 transition-all duration-300"
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

      {/* ------- Transactions + Top products ------- */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 px-5 py-4">
            <h2 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base flex items-center gap-2">
              <ReceiptIcon size={18} className="text-emerald-600 dark:text-emerald-400" />
              <span>ប្រតិបត្តិការលក់ថ្មីៗ</span>
            </h2>
            <div className="flex items-center gap-2">
              <Filter size={13} className="text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:border-emerald-500 focus:outline-none"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <Link
                to="/dashboard/sales"
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition"
              >
                <span>មើលទាំងអស់</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {loading && (
            <div className="space-y-2.5 p-5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-11 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
              ))}
            </div>
          )}

          {!loading && filteredSales.length === 0 && (
            <div className="p-12 text-center">
              <ReceiptIcon size={36} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-xs text-slate-500 dark:text-slate-400">គ្មានប្រតិបត្តិការត្រូវនឹងលក្ខខណ្ឌនេះទេ</p>
            </div>
          )}

          {!loading && filteredSales.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-140 text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-left text-slate-500 dark:text-slate-400">
                    <th className="px-5 py-3 font-semibold">No</th>
                    <th className="px-3 py-3 font-semibold">អតិថិជន</th>
                    <th className="px-3 py-3 font-semibold">កាលបរិច្ឆេទ</th>
                    <th className="px-3 py-3 font-semibold">ស្ថានភាព</th>
                    <th className="px-5 py-3 text-right font-semibold">ចំនួនទឹកប្រាក់</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredSales.slice(0, 8).map((sale, i) => (
                    <tr
                      key={sale.id}
                      onClick={() => navigate(`/dashboard/sales/${sale.id}`)}
                      className="cursor-pointer transition hover:bg-emerald-50/60 dark:hover:bg-emerald-950/20"
                    >
                      <td className="px-5 py-3 text-slate-400">{i + 1}</td>
                      <td className="px-3 py-3">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{customerNameById.get(sale.customer) ?? 'អតិថិជនទូទៅ'}</p>
                        <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">{sale.invoiceNumber}</p>
                      </td>
                      <td className="px-3 py-3 text-slate-500 dark:text-slate-400">{formatDate(sale.createdAt)}</td>
                      <td className="px-3 py-3"><SaleStatusBadge status={sale.status} /></td>
                      <td className="px-5 py-3 text-right font-black text-slate-900 dark:text-white">{formatCurrency(sale.total)}</td>
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
