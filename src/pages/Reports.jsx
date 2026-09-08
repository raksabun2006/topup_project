import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  RefreshCw,
  AlertCircle,
  Calendar,
  FileSpreadsheet,
} from 'lucide-react';
import SEO from '../components/SEO';
import { reportApi } from '../api/reportApi';
import { saleApi } from '../api/saleApi';
import { adminApi } from '../api/adminApi';
import { expenseApi } from '../api/expenseApi';
import { formatToDateString, getDateRangeForPreset } from '../utils/dateFilter';
import { getCustomerOrders } from '../components/pos/CustomerOrdersModal';
import { exportFinancialReportToExcel } from '../utils/excelExport';
import ReportDateFilter from '../components/reports/ReportDateFilter';
import ReportSummaryCards from '../components/reports/ReportSummaryCards';
import FinancialTrendChart from '../components/reports/FinancialTrendChart';
import MonthlyReportSection from '../components/reports/MonthlyReportSection';
import ExpenseBreakdownSection from '../components/reports/ExpenseBreakdownSection';
import PaymentMethodsSection from '../components/reports/PaymentMethodsSection';
import TopProductsTable from '../components/reports/TopProductsTable';
import ExpenseList from '../components/expenses/ExpenseList';

function extractTransactionDate(tx) {
  if (!tx) return '';
  const rawDate = tx.createdAt || tx.orderDate || tx.createdDate || tx.date || tx.created_at;
  if (rawDate) {
    const dStr = formatToDateString(rawDate);
    if (dStr) return dStr;
  }
  // Check if invoiceNumber or orderNumber or id starts with ORD-YYYYMMDD or similar
  const str = String(tx.invoiceNumber || tx.orderNumber || tx.id || '');
  const match = str.match(/20\d{2}[0-1]\d[0-3]\d/);
  if (match) {
    const y = match[0].slice(0, 4);
    const m = match[0].slice(4, 6);
    const d = match[0].slice(6, 8);
    return `${y}-${m}-${d}`;
  }
  return formatToDateString(new Date());
}

export default function Reports() {
  const now = new Date();
  const initialTodayRange = useMemo(() => getDateRangeForPreset('today'), []);

  // Active Tab: 'overview' | 'monthly' | 'expenses'
  const [activeTab, setActiveTab] = useState('overview');

  // Date Filter State (default to 'today')
  const [dateRange, setDateRange] = useState({
    preset: 'today',
    from: initialTodayRange.from,
    to: initialTodayRange.to,
  });

  // Trend Chart State (Monthly vs Daily)
  const [trendMode, setTrendMode] = useState('daily');
  const [trendYear, setTrendYear] = useState(now.getFullYear());
  const [trendMonth, setTrendMonth] = useState(now.getMonth() + 1);

  // Overview Backend Data States
  const [dashboardData, setDashboardData] = useState(null);
  const [salesSummaryData, setSalesSummaryData] = useState(null);
  const [backendTrendData, setBackendTrendData] = useState([]);
  const [backendExpenseData, setBackendExpenseData] = useState(null);
  const [backendPaymentData, setBackendPaymentData] = useState([]);
  const [backendTopProductsData, setBackendTopProductsData] = useState([]);

  // Raw Live Store Transactions & Expenses
  const [rawSales, setRawSales] = useState([]);
  const [rawOrders, setRawOrders] = useState([]);
  const [rawExpenses, setRawExpenses] = useState([]);

  // Loading & Error States
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [loadingTrend, setLoadingTrend] = useState(true);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [loadingTopProducts, setLoadingTopProducts] = useState(true);

  const [authError, setAuthError] = useState('');
  const [generalError, setGeneralError] = useState('');

  // 1. Fetch Live Store Data (POS Sales, Online Orders, Expenses)
  const loadLiveStoreData = useCallback(async () => {
    try {
      const [salesRes, ordersRes, expensesRes] = await Promise.allSettled([
        saleApi.list({ page: 0, size: 1000, sort: 'createdAt,desc' }),
        adminApi.getAllOrders({ page: 0, size: 500, sort: 'createdAt,desc' }),
        expenseApi.getExpenses({ size: 500 }),
      ]);

      if (salesRes.status === 'fulfilled' && salesRes.value) {
        setRawSales(salesRes.value.sales || []);
      }
      if (ordersRes.status === 'fulfilled' && ordersRes.value) {
        const raw = ordersRes.value;
        const list = Array.isArray(raw) ? raw : (raw.content ?? raw.orders ?? []);
        setRawOrders(list);
      }
      if (expensesRes.status === 'fulfilled' && expensesRes.value) {
        const raw = expensesRes.value;
        const list = Array.isArray(raw) ? raw : (raw.content ?? raw.expenses ?? []);
        setRawExpenses(list);
      }
    } catch (err) {
      console.warn('Live store data fetch notice:', err);
    }
  }, []);

  // 2. Fetch Dashboard & Sales Summary Reports
  const loadDashboard = useCallback(async () => {
    setLoadingDashboard(true);
    setAuthError('');
    setGeneralError('');
    try {
      const [dashRes, salesRes] = await Promise.allSettled([
        reportApi.getDashboardReport(dateRange.to || formatToDateString(new Date())),
        reportApi.getSalesSummary(dateRange.from, dateRange.to),
      ]);

      if (dashRes.status === 'fulfilled') {
        setDashboardData(dashRes.value || {});
      } else if (dashRes.reason?.response?.status === 403) {
        setAuthError('អ្នកមិនមានសិទ្ធិមើលរបាយការណ៍នេះទេ');
      }

      if (salesRes.status === 'fulfilled') {
        setSalesSummaryData(salesRes.value || null);
      }
    } catch (err) {
      if (err?.response?.status === 403) {
        setAuthError('អ្នកមិនមានសិទ្ធិមើលរបាយការណ៍នេះទេ');
      } else {
        setGeneralError('មិនអាចទាញយករបាយការណ៍បានទេ');
      }
    } finally {
      setLoadingDashboard(false);
    }
  }, [dateRange.from, dateRange.to]);

  // 3. Fetch Trend Chart (Monthly or Daily)
  const loadTrend = useCallback(async () => {
    setLoadingTrend(true);
    try {
      if (trendMode === 'monthly') {
        const data = await reportApi.getMonthlyTrend(trendYear);
        setBackendTrendData(Array.isArray(data) ? data : []);
      } else {
        const data = await reportApi.getDailyTrend(trendYear, trendMonth);
        setBackendTrendData(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.warn('Failed to load backend trend chart:', err);
      setBackendTrendData([]);
    } finally {
      setLoadingTrend(false);
    }
  }, [trendMode, trendYear, trendMonth]);

  // 4. Fetch Expense Breakdown
  const loadExpenseBreakdown = useCallback(async () => {
    setLoadingExpenses(true);
    try {
      const data = await reportApi.getExpenseSummary(dateRange.from, dateRange.to);
      setBackendExpenseData(data);
    } catch (err) {
      console.warn('Failed to load backend expense breakdown:', err);
      setBackendExpenseData(null);
    } finally {
      setLoadingExpenses(false);
    }
  }, [dateRange.from, dateRange.to]);

  // 5. Fetch Payment Methods
  const loadPaymentMethods = useCallback(async () => {
    setLoadingPayments(true);
    try {
      const data = await reportApi.getPaymentMethods(dateRange.from, dateRange.to);
      setBackendPaymentData(data || []);
    } catch (err) {
      console.warn('Failed to load backend payment methods:', err);
      setBackendPaymentData([]);
    } finally {
      setLoadingPayments(false);
    }
  }, [dateRange.from, dateRange.to]);

  // 6. Fetch Top Products
  const loadTopProducts = useCallback(async () => {
    setLoadingTopProducts(true);
    try {
      const data = await reportApi.getTopProducts(dateRange.from, dateRange.to, 10);
      setBackendTopProductsData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Failed to load backend top products:', err);
      setBackendTopProductsData([]);
    } finally {
      setLoadingTopProducts(false);
    }
  }, [dateRange.from, dateRange.to]);

  // Initial & reactive data triggers
  useEffect(() => {
    loadLiveStoreData();
  }, [loadLiveStoreData]);

  useEffect(() => {
    loadDashboard();
    loadExpenseBreakdown();
    loadPaymentMethods();
    loadTopProducts();
  }, [loadDashboard, loadExpenseBreakdown, loadPaymentMethods, loadTopProducts]);

  useEffect(() => {
    loadTrend();
  }, [loadTrend]);

  const handleRefreshAll = () => {
    loadLiveStoreData();
    loadDashboard();
    loadTrend();
    loadExpenseBreakdown();
    loadPaymentMethods();
    loadTopProducts();
  };

  // =========================================================================
  // LIVE STORE UNIFIED TRANSACTION & METRIC AGGREGATIONS
  // =========================================================================
  const allTransactions = useMemo(() => {
    const map = new Map();

    // 1. Normalize POS Sales
    (rawSales ?? []).forEach((s) => {
      const id = String(s.id);
      const invoiceNumber = s.invoiceNumber || `INV-${id.slice(0, 8).toUpperCase()}`;
      map.set(id, {
        id: s.id,
        invoiceNumber,
        type: 'POS',
        total: Number(s.total ?? s.finalTotal ?? 0),
        subtotal: Number(s.subtotal ?? s.total ?? 0),
        discount: Number(s.discount ?? 0),
        tax: Number(s.tax ?? 0),
        status: (s.status || 'COMPLETED').toUpperCase(),
        paymentStatus: (s.paymentStatus || (s.status === 'COMPLETED' ? 'PAID' : 'PENDING')).toUpperCase(),
        paymentMethod: typeof s.paymentMethod === 'string' ? s.paymentMethod : s.paymentMethod?.name || 'CASH',
        items: s.items || [],
        customerName: s.customerName || (typeof s.customer === 'string' ? s.customer : '') || 'Store Customer',
        createdAt: s.createdAt || new Date().toISOString(),
        raw: s,
      });
    });

    // 2. Normalize Online Orders from adminApi
    (rawOrders ?? []).forEach((o) => {
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
          discount: Number(o.discount ?? 0),
          tax: Number(o.tax ?? 0),
          status: (o.status || 'COMPLETED').toUpperCase(),
          paymentStatus: (o.paymentStatus || (o.status === 'COMPLETED' ? 'PAID' : 'PAID')).toUpperCase(),
          paymentMethod: typeof o.paymentMethod === 'string' ? o.paymentMethod : o.paymentMethod?.name || 'KHQR',
          items: o.items || o.orderItems || [],
          customerName: o.customerName || o.customer?.name || o.receiverName || 'Online Shopper',
          createdAt: o.createdAt || o.orderDate || o.createdDate || new Date().toISOString(),
          raw: o,
        });
      }
    });

    // 3. Normalize Local Session Customer Orders
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
          discount: Number(lo.rawOrder?.discount ?? 0),
          tax: Number(lo.rawOrder?.tax ?? 0),
          status: (lo.status || 'COMPLETED').toUpperCase(),
          paymentStatus: (lo.paymentStatus || 'PAID').toUpperCase(),
          paymentMethod: lo.paymentMethod || 'KHQR',
          items: lo.rawOrder?.items || [],
          customerName: lo.rawOrder?.customerName || 'Online Shopper',
          createdAt: lo.createdAt || new Date().toISOString(),
          raw: lo.rawOrder || lo,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [rawSales, rawOrders]);

  // Filtered by Selected Date Range [from, to]
  const rangeTransactions = useMemo(() => {
    const from = dateRange.from;
    const to = dateRange.to;
    return allTransactions.filter((tx) => {
      const dStr = extractTransactionDate(tx);
      const inRange = (!from || dStr >= from) && (!to || dStr <= to);
      const statusUpper = (tx.status || '').toUpperCase();
      const notCancelled = statusUpper !== 'CANCELLED' && statusUpper !== 'REFUNDED' && statusUpper !== 'FAILED';
      return inRange && notCancelled;
    });
  }, [allTransactions, dateRange.from, dateRange.to]);

  const rangeExpenses = useMemo(() => {
    const from = dateRange.from;
    const to = dateRange.to;
    return (rawExpenses ?? []).filter((exp) => {
      const dStr = formatToDateString(exp.expenseDate || exp.createdAt);
      return (!from || dStr >= from) && (!to || dStr <= to);
    });
  }, [rawExpenses, dateRange.from, dateRange.to]);

  // Live Metric Totals for active date range
  const liveRevenue = useMemo(() => rangeTransactions.reduce((sum, t) => sum + t.total, 0), [rangeTransactions]);
  const liveSalesCount = useMemo(() => rangeTransactions.length, [rangeTransactions]);
  const liveExpenses = useMemo(() => rangeExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0), [rangeExpenses]);

  // Final Resilient KPI Card Values
  const isToday = dateRange.preset === 'today';
  const isThisMonth = dateRange.preset === 'this_month';

  const backendRevenue = isToday
    ? Number(dashboardData?.today?.revenue ?? 0)
    : isThisMonth
    ? Number(dashboardData?.thisMonth?.revenue ?? 0)
    : Number(salesSummaryData?.totalRevenue ?? dashboardData?.revenue ?? 0);

  const revenueVal = Math.max(liveRevenue, backendRevenue);

  const backendExpenses = isToday
    ? Number(dashboardData?.today?.expenses ?? 0)
    : isThisMonth
    ? Number(dashboardData?.thisMonth?.expenses ?? 0)
    : Number(backendExpenseData?.totalExpenses ?? dashboardData?.expenses ?? 0);

  const expensesVal = Math.max(liveExpenses, backendExpenses);
  const profitVal = revenueVal - expensesVal;

  const backendSalesCount = isToday
    ? Number(dashboardData?.today?.salesCount ?? 0)
    : isThisMonth
    ? Number(dashboardData?.thisMonth?.salesCount ?? 0)
    : Number(salesSummaryData?.salesCount ?? dashboardData?.salesCount ?? 0);

  const salesCountVal = Math.max(liveSalesCount, backendSalesCount);

  // Resilient Expense Breakdown
  const effectiveExpenseData = useMemo(() => {
    if (backendExpenseData && Array.isArray(backendExpenseData.byCategory) && backendExpenseData.byCategory.length > 0) {
      return backendExpenseData;
    }
    if (rangeExpenses.length > 0) {
      const catMap = new Map();
      rangeExpenses.forEach((e) => {
        const cat = e.category || 'Other';
        const prev = catMap.get(cat) || { category: cat, amount: 0, count: 0 };
        prev.amount += Number(e.amount || 0);
        prev.count += 1;
        catMap.set(cat, prev);
      });
      return {
        totalExpenses: expensesVal,
        byCategory: Array.from(catMap.values()).sort((a, b) => b.amount - a.amount),
      };
    }
    return backendExpenseData || null;
  }, [backendExpenseData, rangeExpenses, expensesVal]);

  // Resilient Payment Methods Breakdown
  const effectivePayments = useMemo(() => {
    if (rangeTransactions.length > 0) {
      const methodMap = new Map();
      rangeTransactions.forEach((t) => {
        const method = (t.paymentMethod || 'OTHER').toUpperCase();
        const prev = methodMap.get(method) || { method, amount: 0, count: 0 };
        prev.amount += t.total;
        prev.count += 1;
        methodMap.set(method, prev);
      });
      return Array.from(methodMap.values()).sort((a, b) => b.amount - a.amount);
    }
    const rawList = backendPaymentData?.methods || (Array.isArray(backendPaymentData) ? backendPaymentData : []);
    if (rawList.length > 0) return rawList;
    return dashboardData?.paymentMethods || [];
  }, [backendPaymentData, rangeTransactions, dashboardData]);

  // Resilient Top Products
  const effectiveTopProducts = useMemo(() => {
    if (rangeTransactions.length > 0) {
      const prodMap = new Map();
      rangeTransactions.forEach((t) => {
        (t.items || []).forEach((item) => {
          const id = item.productId || item.id || item.product?.id || item.productName || item.name || item.title;
          if (!id) return;
          const name = item.productName || item.name || item.title || item.product?.name || 'ផលិតផល';
          const qty = Number(item.quantity || item.qty || 1);
          const price = Number(item.price || item.unitPrice || 0);
          const lineTotal = Number(item.lineTotal || (price * qty) || 0);

          const prev = prodMap.get(id) || { id, name, quantitySold: 0, revenue: 0 };
          prev.quantitySold += qty;
          prev.revenue += lineTotal;
          prodMap.set(id, prev);
        });
      });
      const list = Array.from(prodMap.values())
        .sort((a, b) => b.quantitySold - a.quantitySold || b.revenue - a.revenue)
        .slice(0, 10);
      if (list.length > 0) return list;
    }
    if (Array.isArray(backendTopProductsData) && backendTopProductsData.length > 0) {
      return backendTopProductsData;
    }
    return dashboardData?.topProducts || [];
  }, [backendTopProductsData, rangeTransactions, dashboardData]);

  // Resilient Financial Trend Data (Blending Backend with Live Calculations)
  const effectiveTrendData = useMemo(() => {
    // If Daily Trend Mode
    if (trendMode === 'daily') {
      const daysInMonth = new Date(trendYear, trendMonth, 0).getDate();
      const list = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const dayStr = `${trendYear}-${String(trendMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayTx = allTransactions.filter((t) => {
          const isMatch = extractTransactionDate(t) === dayStr;
          const statusUpper = (t.status || '').toUpperCase();
          const notCancelled = statusUpper !== 'CANCELLED' && statusUpper !== 'REFUNDED' && statusUpper !== 'FAILED';
          return isMatch && notCancelled;
        });
        const dayExp = (rawExpenses ?? []).filter((e) => formatToDateString(e.expenseDate || e.createdAt) === dayStr);

        const rev = dayTx.reduce((sum, t) => sum + t.total, 0);
        const exp = dayExp.reduce((sum, e) => sum + Number(e.amount || 0), 0);
        list.push({
          day,
          date: dayStr,
          revenue: rev,
          expenses: exp,
          profit: rev - exp,
          salesCount: dayTx.length,
        });
      }
      return list;
    } else {
      // Monthly Trend Mode (Months 1..12)
      const list = [];
      for (let m = 1; m <= 12; m++) {
        const mTx = allTransactions.filter((t) => {
          const dStr = extractTransactionDate(t);
          const [y, monthPart] = dStr.split('-');
          const isMatch = Number(y) === trendYear && Number(monthPart) === m;
          const statusUpper = (t.status || '').toUpperCase();
          const notCancelled = statusUpper !== 'CANCELLED' && statusUpper !== 'REFUNDED' && statusUpper !== 'FAILED';
          return isMatch && notCancelled;
        });
        const mExp = (rawExpenses ?? []).filter((e) => {
          const d = new Date(e.expenseDate || e.createdAt);
          return d.getFullYear() === trendYear && d.getMonth() + 1 === m;
        });

        const rev = mTx.reduce((sum, t) => sum + t.total, 0);
        const exp = mExp.reduce((sum, e) => sum + Number(e.amount || 0), 0);
        list.push({
          month: m,
          revenue: rev,
          expenses: exp,
          profit: rev - exp,
          salesCount: mTx.length,
        });
      }
      return list;
    }
  }, [trendMode, trendYear, trendMonth, allTransactions, rawExpenses]);

  const titlePrefix =
    dateRange.preset === 'today'
      ? 'ថ្ងៃនេះ'
      : dateRange.preset === 'this_month'
      ? 'ខែនេះ'
      : dateRange.preset === 'this_week'
      ? 'សប្តាហ៍នេះ'
      : dateRange.preset === 'yesterday'
      ? 'ម្សិលមិញ'
      : dateRange.preset === 'last_month'
      ? 'ខែមុន'
      : '';

  return (
    <>
      <SEO title="របាយការណ៍ហិរញ្ញវត្ថុ (Financial Reports) | Mart System" robots="noindex, nofollow" />

      <div className="flex-1 overflow-y-auto bg-[#F7F9FA] dark:bg-slate-950 p-3.5 sm:p-5 lg:p-6 space-y-5">
        {/* Tab Switcher & Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#009F6B] text-white shadow-xs'
                  : 'text-[#667085] dark:text-slate-400 hover:text-[#172033] dark:hover:text-white'
              }`}
            >
              ទិដ្ឋភាពទូទៅ & និន្នាការ
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('monthly')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'monthly'
                  ? 'bg-[#009F6B] text-white shadow-xs'
                  : 'text-[#667085] dark:text-slate-400 hover:text-[#172033] dark:hover:text-white'
              }`}
            >
              របាយការណ៍ប្រចាំខែ
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('expenses')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'expenses'
                  ? 'bg-[#009F6B] text-white shadow-xs'
                  : 'text-[#667085] dark:text-slate-400 hover:text-[#172033] dark:hover:text-white'
              }`}
            >
              ការគ្រប់គ្រងចំណាយ
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                exportFinancialReportToExcel({
                  dateRangeLabel: `${dateRange.from} ដល់ ${dateRange.to} (${titlePrefix || 'Custom'})`,
                  summaryCards: {
                    revenue: revenueVal,
                    expenses: expensesVal,
                    profit: profitVal,
                    salesCount: salesCountVal,
                  },
                  expenseBreakdown: effectiveExpenseData?.byCategory || [],
                  paymentMethods: effectivePayments,
                  topProducts: effectiveTopProducts,
                })
              }
              className="flex items-center gap-1.5 rounded-2xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 shadow-2xs transition active:scale-95 cursor-pointer"
              title="ទាញយករបាយការណ៍ជាឯកសារ Excel (.xls)"
            >
              <FileSpreadsheet size={15} className="text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Export Excel</span>
            </button>

            <button
              type="button"
              onClick={handleRefreshAll}
              className="flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 cursor-pointer"
              title="ទាញយកទិន្នន័យឡើងវិញ"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Global Error Alerts */}
        {authError && (
          <div className="flex items-center gap-2.5 rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/40 p-4 text-xs font-bold text-rose-700 dark:text-rose-400 animate-shake">
            <AlertCircle size={18} />
            <span>{authError}</span>
          </div>
        )}

        {generalError && !authError && (
          <div className="flex items-center gap-2.5 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/40 p-4 text-xs font-bold text-amber-800 dark:text-amber-400">
            <AlertCircle size={18} />
            <span>{generalError}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 1: OVERVIEW & TRENDS */}
        {/* ======================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-5 animate-fade-in">
            {/* Date Filter Bar */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 sm:p-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <span className="text-xs font-bold text-[#172033] dark:text-white flex items-center gap-1.5">
                  <Calendar size={15} className="text-[#009F6B]" />
                  <span>ចន្លោះកាលបរិច្ឆេទរបាយការណ៍ (Date Range):</span>
                </span>
                <ReportDateFilter
                  currentPreset={dateRange.preset}
                  fromDate={dateRange.from}
                  toDate={dateRange.to}
                  onChange={(r) => setDateRange(r)}
                />
              </div>
            </div>

            {/* 4 KPI Overview Cards */}
            <ReportSummaryCards
              revenue={revenueVal}
              expenses={expensesVal}
              profit={profitVal}
              salesCount={salesCountVal}
              loading={loadingDashboard && rawOrders.length === 0 && rawSales.length === 0}
              titlePrefix={titlePrefix}
            />

            {/* Financial Trend Line Chart Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#667085] dark:text-slate-400">របៀបមើលនិន្នាការ៖</span>
                  <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-0.5 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setTrendMode('monthly')}
                      className={`rounded-lg px-2.5 py-1 transition cursor-pointer ${
                        trendMode === 'monthly'
                          ? 'bg-[#009F6B] text-white'
                          : 'text-[#667085] hover:text-[#172033] dark:hover:text-white'
                      }`}
                    >
                      ប្រចាំខែ (Jan–Dec)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTrendMode('daily')}
                      className={`rounded-lg px-2.5 py-1 transition cursor-pointer ${
                        trendMode === 'daily'
                          ? 'bg-[#009F6B] text-white'
                          : 'text-[#667085] hover:text-[#172033] dark:hover:text-white'
                      }`}
                    >
                      ប្រចាំថ្ងៃ (Daily Trend)
                    </button>
                  </div>
                </div>

                {trendMode === 'daily' && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <select
                      value={trendMonth}
                      onChange={(e) => setTrendMonth(Number(e.target.value))}
                      className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 font-bold text-[#172033] dark:text-white cursor-pointer"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                        <option key={m} value={m}>
                          ខែ {m}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <FinancialTrendChart
                data={effectiveTrendData}
                loading={loadingTrend && rawOrders.length === 0 && rawSales.length === 0}
                mode={trendMode}
                title={
                  trendMode === 'monthly'
                    ? `និន្នាការហិរញ្ញវត្ថុប្រចាំខែ ឆ្នាំ ${trendYear}`
                    : `និន្នាការហិរញ្ញវត្ថុប្រចាំថ្ងៃ ខែ ${trendMonth} ឆ្នាំ ${trendYear}`
                }
                subtitle="ទិន្នន័យផ្ទាល់ពីប្រព័ន្ធហាង៖ ចំណូល vs ចំណាយ vs ចំណេញ"
              />
            </div>

            {/* 2-Column Row: Expense Breakdown & Payment Methods */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
              <ExpenseBreakdownSection
                data={effectiveExpenseData}
                loading={loadingExpenses && rawExpenses.length === 0}
                totalExpenses={expensesVal}
              />
              <PaymentMethodsSection
                data={effectivePayments}
                loading={loadingPayments && rawOrders.length === 0 && rawSales.length === 0}
              />
            </div>

            {/* Top 10 Products Table */}
            <TopProductsTable
              data={effectiveTopProducts}
              loading={loadingTopProducts && rawOrders.length === 0 && rawSales.length === 0}
            />
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: MONTHLY REPORT STATEMENT */}
        {/* ======================================================== */}
        {activeTab === 'monthly' && (
          <div className="animate-fade-in space-y-4">
            <MonthlyReportSection
              allTransactions={allTransactions}
              rawExpenses={rawExpenses}
            />
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: EXPENSE MANAGEMENT */}
        {/* ======================================================== */}
        {activeTab === 'expenses' && (
          <div className="animate-fade-in space-y-4">
            <ExpenseList
              onExpenseChanged={() => {
                loadLiveStoreData();
                loadDashboard();
                loadExpenseBreakdown();
              }}
            />
          </div>
        )}
      </div>
    </>
  );
}
