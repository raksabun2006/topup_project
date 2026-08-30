import { useMemo, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Receipt as ReceiptIcon, Package, Users, User, LogOut,
  Search, Bell, Menu, X, DollarSign, XCircle, Clock, AlertTriangle,
  AlertCircle, RefreshCw, Boxes, UserCheck, Filter, Store, CheckCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSales } from '../../hooks/useSales';
import { useLowStockInventory } from '../../hooks/useInventory';
import { useCustomers } from '../../hooks/useCustomers';
import { formatCurrency, formatDate } from '../../utils/format';
import { SaleStatusBadge } from '../ui/SaleStatusBadge';
import CategoryRevenuePie from './CategoryRevenuePie';
import WeeklyRevenueChart from './WeeklyRevenueChart';
import TopProductsPanel from './TopProductsPanel';
import BakongDiagnostics from '../admin/BakongDiagnostics';
import { env } from '../../config/env';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'ផ្ទាំងគ្រប់គ្រង' },
  { to: '/pos', icon: ShoppingCart, label: 'ចំណុចលក់' },
  { to: '/sales', icon: ReceiptIcon, label: 'ការលក់' },
  { to: '/products', icon: Package, label: 'ផលិតផល' },
  { to: '/customers', icon: Users, label: 'អតិថិជន' },
];

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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { sales, loading, error, reload } = useSales();
  const { items: lowStock, loading: lowStockLoading, error: lowStockError, reload: reloadLowStock } = useLowStockInventory();
  const { customers } = useCustomers();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const customerNameById = useMemo(
    () => new Map(customers.map((c) => [c.id, c.name])),
    [customers]
  );

  // Backend គ្មាន endpoint ស្ថិតិទេ - គណនាពី /api/sales ដែលទាញយករួច។ ចំណូល
  // រាប់តែ sale ដែលទាំង COMPLETED និង paymentStatus PAID ព្រោះ sale អាច
  // COMPLETED ខណៈមិនទាន់បង់ (ឧ. "បង់ក្រោយ")។
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

  // ប្រៀបធៀបសប្តាហ៍នេះនឹងសប្តាហ៍មុន សម្រាប់ % ព្រួញនៅលើកាតស្ថិតិ
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

  // Backend គ្មាន entity Cashier list ដាច់ដោយឡែកទេ - ដកស្រង់ចេញពី sales។
  // cashier ជា Keycloak user id - ប្រើ cashierName សម្រាប់ key/display
  // ព្រោះនោះជាអ្វីដែលអាចអានយល់បាន, fallback ទៅ cashier បើគ្មាន។
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

  const initial = (user?.username || '?').charAt(0).toUpperCase();

  return (
    <div className="flex h-full bg-ink-950">
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMobileNavOpen(false)} />
      )}

      {/* ------- Sidebar ------- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-slate-200 bg-ink-900 transition-transform lg:static lg:translate-x-0 ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2 border-b border-slate-200 px-6 py-5">
          <Store size={22} className="text-emerald-600" />
          <span className="text-lg font-bold text-slate-900">{env.appName}</span>
          <button
            onClick={() => setMobileNavOpen(false)}
            className="ml-auto rounded-lg p-1 text-slate-500 hover:bg-emerald-50 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">ម៉ឺនុយ</p>
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileNavOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-emerald-50 hover:text-slate-900'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-3">
          <Link
            to="/profile"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-emerald-50 hover:text-slate-900"
          >
            <User size={17} />
            ព័ត៌មានផ្ទាល់ខ្លួន
          </Link>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-700 transition hover:bg-rose-500/10"
          >
            <LogOut size={17} />
            ចាកចេញ
          </button>
        </div>
      </aside>

      {/* ------- Content ------- */}
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        {/* ------- Header ------- */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 bg-ink-900 px-3 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-emerald-50 lg:hidden"
              aria-label="បើកម៉ឺនុយ"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-base font-bold text-slate-900 sm:text-xl">Dashboard</h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative hidden md:block">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ស្វែងរកលេខវិក្កយបត្រ ឬអតិថិជន..."
                className="w-48 lg:w-56 rounded-xl border border-slate-300 bg-ink-950 py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-500/40 focus:outline-none"
              />
            </div>

            <button className="relative rounded-full p-2 text-slate-600 transition hover:bg-emerald-50" title="ស្តុកជិតអស់">
              <Bell size={18} />
              {lowStock.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
                  {lowStock.length}
                </span>
              )}
            </button>

            <div className="flex items-center gap-2 border-l border-slate-200 pl-2.5 sm:pl-3">
              <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-emerald-500/10 text-xs sm:text-sm font-bold text-emerald-700">
                {initial}
              </span>
              <div className="hidden sm:block">
                <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate max-w-[120px]">{user?.username}</p>
                <p className="text-[10px] sm:text-xs text-slate-500">អ្នកគ្រប់គ្រង</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 space-y-4 sm:space-y-6 p-3 sm:p-6">
          {/* Mobile Search input when on mobile */}
          <div className="relative md:hidden">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ស្វែងរកលេខវិក្កយបត្រ ឬអតិថិជន..."
              className="w-full rounded-xl border border-slate-300 bg-ink-900 py-2 pl-9 pr-3 text-xs text-slate-700 placeholder:text-slate-400 focus:border-emerald-500/40 focus:outline-none shadow-2xs"
            />
          </div>

          {error && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 sm:px-5 sm:py-4 text-xs sm:text-sm text-rose-700">
              <span className="flex items-center gap-2"><AlertCircle size={16} className="shrink-0" /> {error}</span>
              <button onClick={reload} className="flex items-center gap-1.5 font-semibold hover:underline shrink-0">
                <RefreshCw size={14} /> ព្យាយាមម្តងទៀត
              </button>
            </div>
          )}

          {/* ------- Stat cards ------- */}
          <div className="grid gap-3.5 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-ink-900 p-4 sm:p-6 shadow-2xs">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-slate-500">ចំណូលសរុប</p>
                  <p className="mt-1.5 text-2xl sm:text-3xl font-bold text-slate-900">{loading ? '—' : formatCurrency(stats.revenue)}</p>
                  {weekly.revenueChange != null && (
                    <p className={`mt-1 text-[11px] sm:text-xs font-medium ${weekly.revenueChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {weekly.revenueChange >= 0 ? '↑' : '↓'} {Math.abs(weekly.revenueChange).toFixed(1)}% ធៀបនឹងសប្តាហ៍មុន
                    </p>
                  )}
                </div>
                <div className="rounded-xl bg-emerald-500/10 p-2.5 sm:p-3 text-emerald-700">
                  <DollarSign size={20} className="sm:w-[22px] sm:h-[22px]" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-ink-900 p-4 sm:p-6 shadow-2xs">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-slate-500">ការបញ្ជាទិញសរុប</p>
                  <p className="mt-1.5 text-2xl sm:text-3xl font-bold text-slate-900">{loading ? '—' : stats.total}</p>
                  {weekly.ordersChange != null && (
                    <p className={`mt-1 text-[11px] sm:text-xs font-medium ${weekly.ordersChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {weekly.ordersChange >= 0 ? '↑' : '↓'} {Math.abs(weekly.ordersChange).toFixed(1)}% ធៀបនឹងសប្តាហ៍មុន
                    </p>
                  )}
                </div>
                <div className="rounded-xl bg-sky-500/10 p-2.5 sm:p-3 text-sky-700">
                  <ReceiptIcon size={20} className="sm:w-[22px] sm:h-[22px]" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-ink-900 p-4 sm:p-6 shadow-2xs sm:col-span-2 lg:col-span-1">
              <p className="mb-2 sm:mb-3 text-xs sm:text-sm text-slate-500">កំពុងរង់ចាំ & បោះបង់</p>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <div className="rounded-xl bg-amber-500/10 p-2 sm:p-2.5 text-amber-700"><Clock size={16} /></div>
                  <div>
                    <p className="text-lg sm:text-xl font-bold text-slate-900">{loading ? '—' : stats.pending}</p>
                    <p className="text-[11px] sm:text-xs text-slate-500">កំពុងរង់ចាំ</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-2.5 border-l border-slate-200 pl-3 sm:pl-4">
                  <div className="rounded-xl bg-rose-500/10 p-2 sm:p-2.5 text-rose-700"><XCircle size={16} /></div>
                  <div>
                    <p className="text-lg sm:text-xl font-bold text-slate-900">{loading ? '—' : stats.cancelled}</p>
                    <p className="text-[11px] sm:text-xs text-slate-500">បោះបង់</p>
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
              <div className="rounded-2xl border border-slate-200 bg-ink-900 shadow-sm">
                <div className="border-b border-slate-200 px-6 py-5">
                  <h2 className="flex items-center gap-2 font-semibold text-slate-900">
                    <Boxes size={18} className="text-amber-700" />
                    ស្តុកជិតអស់
                  </h2>
                </div>

                {lowStockLoading && (
                  <div className="space-y-3 p-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-10 animate-pulse rounded-xl bg-ink-800" />
                    ))}
                  </div>
                )}

                {!lowStockLoading && lowStockError && (
                  <div className="p-8 text-center">
                    <AlertCircle size={28} className="mx-auto mb-2 text-rose-700" />
                    <p className="text-sm text-rose-700">{lowStockError}</p>
                    <button
                      onClick={reloadLowStock}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                      <RefreshCw size={13} /> ព្យាយាមម្តងទៀត
                    </button>
                  </div>
                )}

                {!lowStockLoading && !lowStockError && lowStock.length === 0 && (
                  <div className="p-8 text-center">
                    <CheckCircle size={28} className="mx-auto mb-2 text-emerald-500/60" />
                    <p className="text-sm text-slate-500">គ្មានទំនិញជិតអស់ស្តុកទេ</p>
                  </div>
                )}

                {!lowStockLoading && !lowStockError && lowStock.length > 0 && (
                  <div className="divide-y divide-slate-200">
                    {lowStock.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3 px-6 py-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <AlertTriangle size={14} className="shrink-0 text-amber-700" />
                          <span className="truncate text-sm text-slate-700">{item.product}</span>
                        </div>
                        <span className="shrink-0 text-xs font-semibold text-amber-700">
                          {item.quantity}/{item.minimumStock}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-ink-900 shadow-sm">
                <div className="border-b border-slate-200 px-6 py-5">
                  <h2 className="flex items-center gap-2 font-semibold text-slate-900">
                    <UserCheck size={18} className="text-emerald-600" />
                    អ្នកគិតលុយឆ្នើម
                  </h2>
                </div>

                {loading && (
                  <div className="space-y-3 p-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-10 animate-pulse rounded-xl bg-ink-800" />
                    ))}
                  </div>
                )}

                {!loading && cashierStats.length === 0 && (
                  <p className="p-8 text-center text-sm text-slate-500">មិនទាន់មានទិន្នន័យទេ</p>
                )}

                {!loading && cashierStats.length > 0 && (
                  <div className="space-y-4 p-6">
                    {cashierStats.slice(0, 4).map((c) => (
                      <div key={c.cashier}>
                        <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                          <span className="flex min-w-0 items-center gap-2 truncate font-medium text-slate-700">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-[11px] font-bold text-emerald-700">
                              {c.cashier.charAt(0).toUpperCase()}
                            </span>
                            {c.cashier}
                          </span>
                          <span className="shrink-0 font-semibold text-slate-900">{formatCurrency(c.revenue)}</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-ink-800">
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
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-ink-900 shadow-sm lg:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-5">
                <h2 className="font-semibold text-slate-900">ប្រតិបត្តិការ</h2>
                <div className="flex items-center gap-2">
                  <Filter size={14} className="text-slate-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-lg border border-slate-300 bg-ink-950 px-2.5 py-1.5 text-xs font-medium text-slate-600 focus:border-emerald-500/40 focus:outline-none"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <Link to="/sales" className="text-sm font-semibold text-emerald-600 transition hover:text-emerald-700">
                    មើលទាំងអស់
                  </Link>
                </div>
              </div>

              {loading && (
                <div className="space-y-3 p-6">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 animate-pulse rounded-xl bg-ink-800" />
                  ))}
                </div>
              )}

              {!loading && filteredSales.length === 0 && (
                <div className="p-14 text-center">
                  <ReceiptIcon size={36} className="mx-auto mb-3 text-slate-600" />
                  <p className="text-slate-500">គ្មានប្រតិបត្តិការត្រូវនឹងលក្ខខណ្ឌនេះទេ</p>
                </div>
              )}

              {!loading && filteredSales.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-140 text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                        <th className="px-6 py-3 font-medium">No</th>
                        <th className="px-3 py-3 font-medium">អតិថិជន</th>
                        <th className="px-3 py-3 font-medium">កាលបរិច្ឆេទ</th>
                        <th className="px-3 py-3 font-medium">ស្ថានភាព</th>
                        <th className="px-6 py-3 text-right font-medium">ចំនួនទឹកប្រាក់</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredSales.slice(0, 8).map((sale, i) => (
                        <tr
                          key={sale.id}
                          onClick={() => navigate(`/sales/${sale.id}`)}
                          className="cursor-pointer transition hover:bg-emerald-50"
                        >
                          <td className="px-6 py-3.5 text-slate-500">{i + 1}</td>
                          <td className="px-3 py-3.5">
                            <p className="font-medium text-slate-700">{customerNameById.get(sale.customer) ?? 'អតិថិជនទូទៅ'}</p>
                            <p className="text-xs text-slate-500">{sale.invoiceNumber}</p>
                          </td>
                          <td className="px-3 py-3.5 text-slate-500">{formatDate(sale.createdAt)}</td>
                          <td className="px-3 py-3.5"><SaleStatusBadge status={sale.status} /></td>
                          <td className="px-6 py-3.5 text-right font-semibold text-slate-900">{formatCurrency(sale.total)}</td>
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
        </main>
      </div>
    </div>
  );
}
