import { useMemo, useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertCircle, RefreshCw, Receipt, Search, User, DollarSign,
  CheckCircle2, Clock, LayoutGrid, List,
  ArrowRight, Calendar, ChevronLeft, ChevronRight, X, Globe, ShoppingCart, Eye,
  FileSpreadsheet, Download
} from 'lucide-react';
import { useSales } from '../hooks/useSales';
import { useCustomers } from '../hooks/useCustomers';
import { adminApi } from '../api/adminApi';
import { getCustomerOrders } from '../components/pos/CustomerOrdersModal';
import SaleSuccessModal from '../components/pos/SaleSuccessModal';
import { formatCurrency, formatDate } from '../utils/format';
import { exportOrdersAndSalesToExcel } from '../utils/excelExport';
import { SaleStatusBadge, PaymentStatusBadge } from '../components/ui/SaleStatusBadge';
import SEO from '../components/SEO';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'ស្ថានភាពទាំងអស់' },
  { value: 'COMPLETED', label: 'បញ្ចប់ (Completed)' },
  { value: 'PENDING', label: 'កំពុងរង់ចាំ (Pending)' },
  { value: 'CANCELLED', label: 'បោះបង់ (Cancelled)' },
  { value: 'REFUNDED', label: 'សងប្រាក់វិញ (Refunded)' },
];

const PAYMENT_OPTIONS = [
  { value: 'ALL', label: 'ការទូទាត់ទាំងអស់' },
  { value: 'PAID', label: 'បានបង់ប្រាក់ (PAID)' },
  { value: 'UNPAID', label: 'មិនទាន់បង់ (UNPAID)' },
];

const CHANNEL_OPTIONS = [
  { value: 'ALL', label: 'គ្រប់ប្រភពលក់ (All)' },
  { value: 'POS', label: 'Point of Sale (POS)' },
  { value: 'ONLINE', label: 'ហាងអនឡាញ (Online)' },
];

export default function Sales() {
  const { sales, loading: salesLoading, error: salesError, reload: reloadSales } = useSales();
  const { customers } = useCustomers();

  // Online Orders from API
  const [onlineOrders, setOnlineOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [channelFilter, setChannelFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('DATE_DESC');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [page, setPage] = useState(0);
  const [selectedReceiptItem, setSelectedReceiptItem] = useState(null);
  const pageSize = 20;

  const [searchParams, setSearchParams] = useSearchParams();
  const cashierFilter = searchParams.get('cashier') ?? '';

  // Fetch online customer orders from adminApi
  const fetchOnlineOrders = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError('');
    try {
      const res = await adminApi.getAllOrders({ page: 0, size: 500, sort: 'createdAt,desc' });
      const list = Array.isArray(res) ? res : (res?.content ?? res?.orders ?? []);
      setOnlineOrders(list);
    } catch (err) {
      console.warn('Online orders fetch notice:', err);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOnlineOrders();
  }, [fetchOnlineOrders]);

  const handleRefreshAll = async () => {
    await Promise.allSettled([
      reloadSales(),
      fetchOnlineOrders(),
    ]);
  };

  const loading = salesLoading || ordersLoading;
  const error = salesError || ordersError;

  const customerNameById = useMemo(
    () => new Map(customers.map((c) => [c.id, c.name])),
    [customers]
  );

  // Merge POS sales + Online orders + Local session orders
  const allTransactions = useMemo(() => {
    const map = new Map();

    // 1. Process POS Sales
    (sales ?? []).forEach((s) => {
      const id = String(s.id);
      const invoiceNumber = s.invoiceNumber || `INV-${id.slice(0, 8).toUpperCase()}`;
      map.set(id, {
        id: s.id,
        invoiceNumber,
        type: 'POS',
        total: Number(s.total ?? s.finalTotal ?? 0),
        subtotal: Number(s.subtotal ?? s.total ?? 0),
        status: (s.status || 'COMPLETED').toUpperCase(),
        paymentStatus: (s.paymentStatus || (s.status === 'COMPLETED' ? 'PAID' : 'PENDING')).toUpperCase(),
        paymentMethod: typeof s.paymentMethod === 'string' ? s.paymentMethod : s.paymentMethod?.name || 'CASH',
        items: s.items || [],
        customerName: customerNameById.get(s.customer) || s.customerName || (typeof s.customer === 'string' ? s.customer : '') || 'អតិថិជនទូទៅ',
        cashierName: s.cashierName || s.cashier || '—',
        createdAt: s.createdAt || new Date().toISOString(),
        raw: s,
      });
    });

    // 2. Process Online Orders from adminApi
    (onlineOrders ?? []).forEach((o) => {
      const id = String(o.id);
      const invoiceNumber = o.invoiceNumber || o.orderNumber || `ORD-${id.slice(0, 8).toUpperCase()}`;
      if (!map.has(id)) {
        map.set(id, {
          id: o.id,
          invoiceNumber,
          type: 'ONLINE',
          deliveryMethod: o.deliveryMethod || 'DELIVERY',
          total: Number(o.finalTotal ?? o.total ?? o.amount ?? o.grandTotal ?? 0),
          subtotal: Number(o.subtotal ?? o.total ?? 0),
          status: (o.status || 'COMPLETED').toUpperCase(),
          paymentStatus: (o.paymentStatus || (o.status === 'COMPLETED' ? 'PAID' : 'PAID')).toUpperCase(),
          paymentMethod: typeof o.paymentMethod === 'string' ? o.paymentMethod : o.paymentMethod?.name || 'KHQR',
          items: o.items || o.orderItems || [],
          customerName: o.customerName || o.customer?.name || o.receiverName || 'Online Shopper',
          cashierName: 'Online Store',
          createdAt: o.createdAt || o.orderDate || o.createdDate || new Date().toISOString(),
          raw: o,
        });
      }
    });

    // 3. Process Local Session Customer Orders
    const localOrders = getCustomerOrders();
    (localOrders ?? []).forEach((lo) => {
      const id = String(lo.id);
      if (!map.has(id)) {
        map.set(id, {
          id: lo.id,
          invoiceNumber: lo.invoiceNumber || `ORD-${id.slice(0, 8).toUpperCase()}`,
          type: 'ONLINE',
          deliveryMethod: lo.rawOrder?.deliveryMethod || 'DELIVERY',
          total: Number(lo.total ?? lo.rawOrder?.finalTotal ?? 0),
          subtotal: Number(lo.rawOrder?.subtotal ?? lo.total ?? 0),
          status: (lo.status || 'COMPLETED').toUpperCase(),
          paymentStatus: (lo.paymentStatus || 'PAID').toUpperCase(),
          paymentMethod: lo.paymentMethod || 'KHQR',
          items: lo.rawOrder?.items || [],
          customerName: lo.rawOrder?.customerName || 'Online Shopper',
          cashierName: 'Online Store',
          createdAt: lo.createdAt || new Date().toISOString(),
          raw: lo.rawOrder || lo,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [sales, onlineOrders, customerNameById]);

  const cashiers = useMemo(
    () => Array.from(new Set(allTransactions.map((s) => s.cashierName).filter((c) => c && c !== '—'))).sort(),
    [allTransactions]
  );

  const setCashierFilter = (value) => {
    setSearchParams(value ? { cashier: value } : {});
    setPage(0);
  };

  // KPIs
  const kpis = useMemo(() => {
    const paid = allTransactions.filter((s) => s.paymentStatus === 'PAID' || s.status === 'COMPLETED' || s.status === 'DELIVERED');
    const pending = allTransactions.filter((s) => s.status === 'PENDING' && s.paymentStatus !== 'PAID');
    const cancelled = allTransactions.filter((s) => s.status === 'CANCELLED' || s.status === 'REFUNDED');
    const totalRevenue = paid.reduce((sum, s) => sum + s.total, 0);

    return {
      totalSales: allTransactions.length,
      totalRevenue,
      paidCount: paid.length,
      pendingCount: pending.length,
      cancelledCount: cancelled.length,
    };
  }, [allTransactions]);

  // Filtered & Sorted Sales
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = allTransactions.filter((s) => {
      if (channelFilter !== 'ALL' && s.type !== channelFilter) return false;
      if (cashierFilter && s.cashierName !== cashierFilter) return false;
      if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
      if (paymentFilter !== 'ALL' && s.paymentStatus !== paymentFilter) return false;

      if (!q) return true;
      const inv = (s.invoiceNumber || '').toLowerCase();
      const cust = (s.customerName || '').toLowerCase();
      const cash = (s.cashierName || '').toLowerCase();
      const firstItem = (s.items?.[0]?.productName || s.items?.[0]?.name || s.items?.[0]?.title || '').toLowerCase();
      return inv.includes(q) || cust.includes(q) || cash.includes(q) || firstItem.includes(q);
    });

    // Sort
    if (sortBy === 'DATE_DESC') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'DATE_ASC') {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === 'AMOUNT_DESC') {
      result.sort((a, b) => b.total - a.total);
    } else if (sortBy === 'AMOUNT_ASC') {
      result.sort((a, b) => a.total - b.total);
    }

    return result;
  }, [allTransactions, search, channelFilter, cashierFilter, statusFilter, paymentFilter, sortBy]);

  // Paginated chunk
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedSales = useMemo(() => {
    const start = page * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setPaymentFilter('ALL');
    setChannelFilter('ALL');
    setSortBy('DATE_DESC');
    setCashierFilter('');
    setPage(0);
  };

  const hasActiveFilters = search || cashierFilter || channelFilter !== 'ALL' || statusFilter !== 'ALL' || paymentFilter !== 'ALL' || sortBy !== 'DATE_DESC';

  return (
    <div className="space-y-5 animate-fade-in">
      <SEO
        title="ប្រវត្តិការលក់ & ការបញ្ជាទិញ (Orders & Sales) | Mart System"
        robots="noindex, nofollow"
      />

      {/* KPI Overview Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {/* Total Revenue */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">ចំណូលសរុប (PAID)</p>
            <p className="mt-1 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {loading && allTransactions.length === 0 ? '—' : formatCurrency(kpis.totalRevenue)}
            </p>
            <p className="mt-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              {kpis.paidCount} ការលក់បានបង់ប្រាក់
            </p>
          </div>
          <div className="rounded-xl bg-emerald-500/10 dark:bg-emerald-950/50 p-2.5 text-emerald-600 dark:text-emerald-400">
            <DollarSign size={22} />
          </div>
        </div>

        {/* Total Invoices */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">វិក្កយបត្រសរុប</p>
            <p className="mt-1 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {loading && allTransactions.length === 0 ? '—' : kpis.totalSales.toLocaleString()}
            </p>
            <p className="mt-0.5 text-[10px] text-slate-400">
              ប្រតិបត្តិការក្នុងប្រព័ន្ធ (POS & Online)
            </p>
          </div>
          <div className="rounded-xl bg-sky-500/10 dark:bg-sky-950/50 p-2.5 text-sky-600 dark:text-sky-400">
            <Receipt size={22} />
          </div>
        </div>

        {/* Completed & Paid */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">បានបញ្ចប់ជោគជ័យ</p>
            <p className="mt-1 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {loading && allTransactions.length === 0 ? '—' : kpis.paidCount}
            </p>
            <p className="mt-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              {kpis.totalSales > 0 ? ((kpis.paidCount / kpis.totalSales) * 100).toFixed(0) : 0}% នៃចំនួនសរុប
            </p>
          </div>
          <div className="rounded-xl bg-emerald-500/10 dark:bg-emerald-950/50 p-2.5 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={22} />
          </div>
        </div>

        {/* Pending & Cancelled */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">រង់ចាំ & បោះបង់</p>
            <p className="mt-1 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {loading && allTransactions.length === 0 ? '—' : kpis.pendingCount + kpis.cancelledCount}
            </p>
            <p className="mt-0.5 text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
              {kpis.pendingCount} រង់ចាំ · {kpis.cancelledCount} បោះបង់
            </p>
          </div>
          <div className="rounded-xl bg-amber-500/10 dark:bg-amber-950/50 p-2.5 text-amber-600 dark:text-amber-400">
            <Clock size={22} />
          </div>
        </div>
      </div>

      {/* Filter & Controls Bar */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs space-y-3.5">
        {/* Row 1: Search Input (Full prominent width) + View Actions (Export Excel, Grid/Table, Refresh) */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box with Search Icon and Clear Button */}
          <div className="relative flex-1 min-w-0 sm:min-w-[320px]">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder="ស្វែងរកលេខវិក្កយបត្រ (INV/ORD), អតិថិជន, មុខទំនិញ, អ្នកគិតលុយ..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 py-2.5 pl-9 pr-9 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition shadow-2xs"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition cursor-pointer"
                title="លុបពាក្យស្វែងរក"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Quick Action Tools: Export Excel, View Mode, Refresh */}
          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            {/* Export to Excel Button */}
            <button
              type="button"
              onClick={() => exportOrdersAndSalesToExcel(filtered, 'Mart_Orders_Sales')}
              disabled={filtered.length === 0}
              className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 shadow-2xs transition active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
              title="ទាញយកជាឯកសារ Excel (.xls) សម្រាប់គណនេយ្យ"
            >
              <FileSpreadsheet size={16} className="text-emerald-600 dark:text-emerald-400" />
              <span>Export Excel</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-1 shrink-0">
              <button
                onClick={() => setViewMode('table')}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="ទិដ្ឋភាពតារាង (Table View)"
              >
                <List size={15} />
                <span className="hidden sm:inline">តារាង</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="ទិដ្ឋភាពកាត (Grid View)"
              >
                <LayoutGrid size={15} />
                <span className="hidden sm:inline">កាត</span>
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefreshAll}
              disabled={loading}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-2xs transition active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
              title="ទាញយកឡើងវិញ"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin text-emerald-600' : ''} />
            </button>
          </div>
        </div>

        {/* Row 2: Filter Selectors (Responsive Grid) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/70">
          {/* Channel Selector (POS vs Online) */}
          <div className="relative">
            <select
              value={channelFilter}
              onChange={(e) => { setChannelFilter(e.target.value); setPage(0); }}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer transition"
            >
              {CHANNEL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Status Selector */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer transition"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Payment Status Selector */}
          <div className="relative">
            <select
              value={paymentFilter}
              onChange={(e) => { setPaymentFilter(e.target.value); setPage(0); }}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer transition"
            >
              {PAYMENT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Cashier Selector */}
          <div className="relative">
            <select
              value={cashierFilter}
              onChange={(e) => setCashierFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer transition"
            >
              <option value="">អ្នកគិតលុយទាំងអស់</option>
              {cashiers.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Sort Selector */}
          <div className="relative col-span-2 sm:col-span-1">
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(0); }}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer transition"
            >
              <option value="DATE_DESC">កាលបរិច្ឆេទ: ថ្មី ទៅ ចាស់</option>
              <option value="DATE_ASC">កាលបរិច្ឆេទ: ចាស់ ទៅ ថ្មី</option>
              <option value="AMOUNT_DESC">តម្លៃ: ខ្ពស់ ទៅ ទាប</option>
              <option value="AMOUNT_ASC">តម្លៃ: ទាប ទៅ ខ្ពស់</option>
            </select>
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <p className="text-slate-500 dark:text-slate-400">
              បង្ហាញ <strong className="text-slate-800 dark:text-slate-200">{filtered.length}</strong> នៃ {allTransactions.length} ការលក់ដែលត្រូវនឹងលក្ខខណ្ឌ
            </p>
            <button
              onClick={resetFilters}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold cursor-pointer"
            >
              សម្អាតតម្រងទាំងអស់
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div>
        {loading && allTransactions.length === 0 && (
          <div className="space-y-3 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        )}

        {!loading && error && allTransactions.length === 0 && (
          <div className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 p-8 text-center animate-fade-in">
            <AlertCircle size={36} className="mx-auto mb-3 text-rose-600 dark:text-rose-400" />
            <p className="mb-4 text-sm font-semibold text-rose-700 dark:text-rose-300">{error}</p>
            <button
              onClick={handleRefreshAll}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-rose-500 active:scale-95 cursor-pointer"
            >
              <RefreshCw size={14} />
              ព្យាយាមម្តងទៀត
            </button>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center shadow-2xs animate-fade-in">
            <Receipt size={44} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">មិនមានប្រតិបត្តិការលក់ត្រូវនឹងលក្ខខណ្ឌនេះទេ</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {hasActiveFilters
                ? 'សូមព្យាយាមសម្អាតតម្រង ឬផ្លាស់ប្តូរពាក្យស្វែងរក'
                : 'មិនទាន់មានការលក់នៅក្នុងប្រព័ន្ធនៅឡើយទេ'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="mt-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs transition hover:bg-slate-100 cursor-pointer"
              >
                សម្អាតតម្រង
              </button>
            )}
          </div>
        )}

        {/* Table View */}
        {filtered.length > 0 && viewMode === 'table' && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400">
                    <th className="py-3.5 px-4 font-semibold">លេខវិក្កយបត្រ / កូដ</th>
                    <th className="py-3.5 px-3 font-semibold">អតិថិជន / ទំនិញ</th>
                    <th className="py-3.5 px-3 font-semibold">កាលបរិច្ឆេទ</th>
                    <th className="py-3.5 px-3 font-semibold">ប្រភព / អ្នកគិតលុយ</th>
                    <th className="py-3.5 px-3 font-semibold text-center">ការទូទាត់</th>
                    <th className="py-3.5 px-3 font-semibold text-center">ស្ថានភាព</th>
                    <th className="py-3.5 px-4 font-semibold text-right">ចំនួនទឹកប្រាក់</th>
                    <th className="py-3.5 px-3 font-semibold text-center">ព័ត៌មាន</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedSales.map((sale) => (
                    <tr
                      key={sale.id}
                      className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                            sale.type === 'POS'
                              ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200/60'
                              : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60'
                          }`}>
                            {sale.type === 'POS' ? <ShoppingCart size={9} /> : <Globe size={9} />}
                            <span>{sale.type}</span>
                          </span>
                          {sale.type === 'POS' ? (
                            <Link
                              to={`/dashboard/sales/${sale.id}`}
                              className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline truncate max-w-[150px]"
                            >
                              {sale.invoiceNumber}
                            </Link>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSelectedReceiptItem(sale.raw || sale)}
                              className="font-bold text-blue-600 dark:text-blue-400 hover:underline truncate max-w-[150px] cursor-pointer text-left"
                            >
                              {sale.invoiceNumber}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                          {sale.customerName}
                        </p>
                        {sale.items?.[0] && (
                          <p className="text-[11px] text-slate-400 truncate max-w-[180px]">
                            {sale.items[0].productName || sale.items[0].title || sale.items[0].name}
                            {sale.items.length > 1 ? ` (+${sale.items.length - 1} មុខទៀត)` : ''}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {formatDate(sale.createdAt)}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                          <User size={12} className="text-slate-400" />
                          {sale.cashierName}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <PaymentStatusBadge status={sale.paymentStatus} />
                      </td>
                      <td className="py-3 px-3 text-center">
                        <SaleStatusBadge status={sale.status} />
                      </td>
                      <td className="py-3 px-4 text-right font-black text-slate-900 dark:text-white sm:text-base whitespace-nowrap">
                        {formatCurrency(sale.total)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {sale.type === 'POS' ? (
                          <Link
                            to={`/dashboard/sales/${sale.id}`}
                            className="inline-flex items-center justify-center rounded-lg p-1.5 text-slate-400 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-600 transition"
                            title="មើលព័ត៌មានលម្អិត"
                          >
                            <ArrowRight size={16} />
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedReceiptItem(sale.raw || sale)}
                            className="inline-flex items-center justify-center rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 transition cursor-pointer"
                            title="មើលវិក្កយបត្រ"
                          >
                            <Eye size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Card Grid View */}
        {filtered.length > 0 && viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {paginatedSales.map((sale) => (
              <div
                key={sale.id}
                onClick={() => {
                  if (sale.type === 'ONLINE') setSelectedReceiptItem(sale.raw || sale);
                }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs hover:shadow-xl hover:border-emerald-500/40 dark:hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                    <span className="font-mono text-xs font-black text-emerald-600 dark:text-emerald-400 truncate">
                      {sale.invoiceNumber}
                    </span>
                    <SaleStatusBadge status={sale.status} />
                  </div>

                  <div className="mt-3 space-y-1.5">
                    <p className="font-bold text-slate-900 dark:text-white text-sm truncate">
                      {sale.customerName}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Calendar size={12} />
                      <span>{formatDate(sale.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <User size={12} />
                      <span>{sale.cashierName}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">សរុប</p>
                    <p className="text-base font-black text-slate-900 dark:text-white">
                      {formatCurrency(sale.total)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <PaymentStatusBadge status={sale.paymentStatus} />
                    {sale.type === 'POS' ? (
                      <Link
                        to={`/dashboard/sales/${sale.id}`}
                        className="rounded-lg p-1 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition"
                      >
                        <ArrowRight size={14} />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedReceiptItem(sale.raw || sale)}
                        className="rounded-lg p-1 text-slate-400 group-hover:text-blue-600 group-hover:scale-105 transition cursor-pointer"
                      >
                        <Eye size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-2xs">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              ទំព័រ <strong className="text-slate-800 dark:text-slate-200">{page + 1}</strong> នៃ <strong>{totalPages}</strong> (សរុប {filtered.length} ការលក់ & ការបញ្ជាទិញ)
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(0)}
                disabled={page <= 0}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
              >
                ដំបូង
              </button>
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page <= 0}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
                title="ទំព័រមុន"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {page + 1}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
                title="ទំព័របន្ទាប់"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => setPage(totalPages - 1)}
                disabled={page >= totalPages - 1}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
              >
                ចុងក្រោយ
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Online Order Receipt Modal Popup */}
      {selectedReceiptItem && (
        <SaleSuccessModal
          sale={selectedReceiptItem}
          onClose={() => setSelectedReceiptItem(null)}
        />
      )}
    </div>
  );
}
