import { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import SEO from '../components/SEO';
import { reportApi } from '../api/reportApi';
import { getErrorMessage } from '../api/client';
import { formatToDateString } from '../utils/dateFilter';
import ReportDateFilter from '../components/reports/ReportDateFilter';
import ReportSummaryCards from '../components/reports/ReportSummaryCards';
import FinancialTrendChart from '../components/reports/FinancialTrendChart';
import MonthlyReportSection from '../components/reports/MonthlyReportSection';
import ExpenseBreakdownSection from '../components/reports/ExpenseBreakdownSection';
import PaymentMethodsSection from '../components/reports/PaymentMethodsSection';
import TopProductsTable from '../components/reports/TopProductsTable';
import ExpenseList from '../components/expenses/ExpenseList';

export default function Reports() {
  const now = new Date();
  const todayStr = formatToDateString(now);

  // Active Tab
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'monthly' | 'expenses'

  // Date Filter State
  const [dateRange, setDateRange] = useState({
    preset: 'today',
    from: todayStr,
    to: todayStr,
  });

  // Trend Chart State (Monthly vs Daily)
  const [trendMode, setTrendMode] = useState('monthly'); // 'monthly' | 'daily'
  const [trendYear, setTrendYear] = useState(now.getFullYear());
  const [trendMonth, setTrendMonth] = useState(now.getMonth() + 1);

  // Overview Data States
  const [dashboardData, setDashboardData] = useState(null);
  const [salesSummaryData, setSalesSummaryData] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [expenseData, setExpenseData] = useState(null);
  const [paymentData, setPaymentData] = useState([]);
  const [topProductsData, setTopProductsData] = useState([]);

  // Loading & Error States
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [loadingTrend, setLoadingTrend] = useState(true);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [loadingTopProducts, setLoadingTopProducts] = useState(true);

  const [authError, setAuthError] = useState('');
  const [generalError, setGeneralError] = useState('');

  // 1. Fetch Dashboard / Daily KPI Cards
  const loadDashboard = useCallback(async () => {
    setLoadingDashboard(true);
    setAuthError('');
    setGeneralError('');
    try {
      // Step 5 & Step 20: GET /api/v1/reports/dashboard?date=YYYY-MM-DD
      const [dashRes, salesRes] = await Promise.allSettled([
        reportApi.getDashboardReport(dateRange.to || todayStr),
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
  }, [dateRange.from, dateRange.to, todayStr]);

  // 2. Fetch Trend Chart (Monthly or Daily)
  const loadTrend = useCallback(async () => {
    setLoadingTrend(true);
    try {
      if (trendMode === 'monthly') {
        const data = await reportApi.getMonthlyTrend(trendYear);
        setTrendData(Array.isArray(data) ? data : []);
      } else {
        const data = await reportApi.getDailyTrend(trendYear, trendMonth);
        setTrendData(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load trend chart:', err);
      setTrendData([]);
    } finally {
      setLoadingTrend(false);
    }
  }, [trendMode, trendYear, trendMonth]);

  // 3. Fetch Expense Breakdown
  const loadExpenseBreakdown = useCallback(async () => {
    setLoadingExpenses(true);
    try {
      const data = await reportApi.getExpenseSummary(dateRange.from, dateRange.to);
      setExpenseData(data);
    } catch (err) {
      console.error('Failed to load expense breakdown:', err);
      setExpenseData(null);
    } finally {
      setLoadingExpenses(false);
    }
  }, [dateRange.from, dateRange.to]);

  // 4. Fetch Payment Methods
  const loadPaymentMethods = useCallback(async () => {
    setLoadingPayments(true);
    try {
      const data = await reportApi.getPaymentMethods(dateRange.from, dateRange.to);
      setPaymentData(data || []);
    } catch (err) {
      console.error('Failed to load payment methods:', err);
      setPaymentData([]);
    } finally {
      setLoadingPayments(false);
    }
  }, [dateRange.from, dateRange.to]);

  // 5. Fetch Top Products
  const loadTopProducts = useCallback(async () => {
    setLoadingTopProducts(true);
    try {
      const data = await reportApi.getTopProducts(dateRange.from, dateRange.to, 10);
      setTopProductsData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load top products:', err);
      setTopProductsData([]);
    } finally {
      setLoadingTopProducts(false);
    }
  }, [dateRange.from, dateRange.to]);

  // Initial and reactive trigger
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
    loadDashboard();
    loadTrend();
    loadExpenseBreakdown();
    loadPaymentMethods();
    loadTopProducts();
  };

  // Resilient mapping matching backend DashboardReportResponse { today, thisMonth } & SalesSummaryResponse
  const isToday = dateRange.preset === 'today';
  const isThisMonth = dateRange.preset === 'this_month';

  let revenueVal = 0;
  let expensesVal = 0;
  let profitVal = 0;
  let salesCountVal = 0;

  if (isToday && dashboardData?.today) {
    revenueVal = Number(dashboardData.today.revenue ?? 0);
    expensesVal = Number(dashboardData.today.expenses ?? 0);
    profitVal = Number(dashboardData.today.profit ?? (revenueVal - expensesVal));
    salesCountVal = Number(dashboardData.today.salesCount ?? 0);
  } else if (isThisMonth && dashboardData?.thisMonth) {
    revenueVal = Number(dashboardData.thisMonth.revenue ?? 0);
    expensesVal = Number(dashboardData.thisMonth.expenses ?? 0);
    profitVal = Number(dashboardData.thisMonth.profit ?? (revenueVal - expensesVal));
    salesCountVal = Number(dashboardData.thisMonth.salesCount ?? 0);
  } else {
    revenueVal = Number(
      salesSummaryData?.totalRevenue ??
      dashboardData?.today?.revenue ??
      dashboardData?.revenue ??
      0
    );
    expensesVal = Number(
      expenseData?.totalExpenses ??
      dashboardData?.today?.expenses ??
      dashboardData?.expenses ??
      0
    );
    profitVal = Number(revenueVal - expensesVal);
    salesCountVal = Number(
      salesSummaryData?.salesCount ??
      dashboardData?.today?.salesCount ??
      dashboardData?.salesCount ??
      0
    );
  }

  const effectivePayments =
    paymentData?.methods?.length > 0
      ? paymentData.methods
      : Array.isArray(paymentData) && paymentData.length > 0
      ? paymentData
      : (dashboardData?.paymentMethods || []);

  const effectiveTopProducts =
    Array.isArray(topProductsData) && topProductsData.length > 0
      ? topProductsData
      : (dashboardData?.topProducts || []);

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

          <button
            type="button"
            onClick={handleRefreshAll}
            className="flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 cursor-pointer"
            title="ទាញយកទិន្នន័យឡើងវិញ"
          >
            <RefreshCw size={15} />
          </button>
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

            {/* 4 KPI Overview Cards (Step 5) */}
            <ReportSummaryCards
              revenue={revenueVal}
              expenses={expensesVal}
              profit={profitVal}
              salesCount={salesCountVal}
              loading={loadingDashboard}
              titlePrefix={titlePrefix}
            />

            {/* Financial Trend Line Chart Section (Step 7 & Step 8) */}
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
                data={trendData}
                loading={loadingTrend}
                mode={trendMode}
                title={
                  trendMode === 'monthly'
                    ? `និន្នាការហិរញ្ញវត្ថុប្រចាំខែ ឆ្នាំ ${trendYear}`
                    : `និន្នាការហិរញ្ញវត្ថុប្រចាំថ្ងៃ ខែ ${trendMonth} ឆ្នាំ ${trendYear}`
                }
                subtitle="ទិន្នន័យផ្ទាល់ពី API: ចំណូល vs ចំណាយ vs ចំណេញ"
              />
            </div>

            {/* 2-Column Row: Expense Breakdown & Payment Methods */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
              <ExpenseBreakdownSection
                data={expenseData}
                loading={loadingExpenses}
                totalExpenses={expensesVal}
              />
              <PaymentMethodsSection
                data={effectivePayments}
                loading={loadingPayments}
              />
            </div>

            {/* Top 10 Products Table (Step 12) */}
            <TopProductsTable
              data={effectiveTopProducts}
              loading={loadingTopProducts}
            />
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: MONTHLY REPORT STATEMENT (Step 6) */}
        {/* ======================================================== */}
        {activeTab === 'monthly' && (
          <div className="animate-fade-in space-y-4">
            <MonthlyReportSection />
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: EXPENSE MANAGEMENT (Step 10) */}
        {/* ======================================================== */}
        {activeTab === 'expenses' && (
          <div className="animate-fade-in space-y-4">
            <ExpenseList
              onExpenseChanged={() => {
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
