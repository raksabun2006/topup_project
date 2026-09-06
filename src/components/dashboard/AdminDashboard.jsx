import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon, Search, SlidersHorizontal,
  Package, CheckSquare, XSquare, Users, ChevronLeft, ChevronRight,
  TrendingUp, ArrowRight, ShoppingCart, RefreshCw, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSales } from '../../hooks/useSales';
import { useProducts } from '../../hooks/useProducts';
import { useCustomers } from '../../hooks/useCustomers';
import { formatCurrency, formatDate } from '../../utils/format';
import UserAvatar from '../ui/UserAvatar';
import ThemeToggle from '../ui/ThemeToggle';
import NotificationDropdown from '../ui/NotificationDropdown';
import SEO from '../SEO';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Des'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { sales, loading: salesLoading, error: salesError, reload: reloadSales } = useSales();
  const { products, totalElements: totalProductsCount } = useProducts();
  const { customers } = useCustomers();

  const [activeRange, setActiveRange] = useState('7d');
  const [selectedReportType, setSelectedReportType] = useState('Total Sales');
  const [activePointIndex, setActivePointIndex] = useState(null);
  const [searchTx, setSearchTx] = useState('');
  const [selectedTxIds, setSelectedTxIds] = useState(new Set());
  const [spotlightIndex, setSpotlightIndex] = useState(0);

  // Time-based Greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  const displayName = user?.displayName || user?.name || user?.username || 'Admin';

  // Current formatted real date
  const todayFormatted = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }, []);

  // Compute Real KPI Metrics
  const kpiStats = useMemo(() => {
    const completed = sales.filter((s) => s.status === 'COMPLETED' || s.paymentStatus === 'PAID');
    const cancelled = sales.filter((s) => s.status === 'CANCELLED' || s.status === 'REFUNDED');
    const totalRevenue = completed.reduce((sum, s) => sum + (s.total || s.finalTotal || 0), 0);

    // Calculate real total products from catalog
    const totalProducts = totalProductsCount > 0 ? totalProductsCount : products.length;

    // Unique customers count
    const uniqueCustomers = customers.length > 0
      ? customers.length
      : new Set(sales.map((s) => s.customer || s.customerName).filter(Boolean)).size;

    // Real completion rate
    const completionRate = sales.length > 0 ? Math.round((completed.length / sales.length) * 100) : 100;

    return {
      totalProducts,
      completedOrders: completed.length,
      canceledOrders: cancelled.length,
      topProducts: uniqueCustomers,
      totalRevenue,
      completionRate,
    };
  }, [sales, products, totalProductsCount, customers]);

  // Compute Real Top Selling Products from Sales
  const topSellingProducts = useMemo(() => {
    const salesMap = new Map();

    sales.forEach((s) => {
      (s.items ?? []).forEach((item) => {
        if (!item.productId && !item.productName) return;
        const key = item.productId || item.productName;
        const prev = salesMap.get(key) || {
          id: key,
          name: item.productName || 'Product',
          soldQty: 0,
          revenue: 0,
          image: item.image || item.imageUrl || '',
        };
        prev.soldQty += item.quantity || 1;
        prev.revenue += item.lineTotal || (item.price * (item.quantity || 1)) || 0;
        salesMap.set(key, prev);
      });
    });

    const ranked = Array.from(salesMap.values()).sort((a, b) => b.soldQty - a.soldQty);

    // Join with catalog products to enrich images
    const catalogMap = new Map(products.map((p) => [p.id, p]));

    const enriched = ranked.map((item) => {
      const p = catalogMap.get(item.id);
      return {
        ...item,
        name: p?.name || item.name,
        image: p?.image || p?.imageUrl || item.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60',
      };
    });

    // If no sales items yet, show top products from catalog
    if (enriched.length === 0 && products.length > 0) {
      return products.slice(0, 5).map((p) => ({
        id: p.id,
        name: p.name,
        soldQty: p.stock || 12,
        image: p.image || p.imageUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60',
      }));
    }

    return enriched.length > 0 ? enriched : [
      {
        id: 'default',
        name: 'Mart Premium Item',
        soldQty: 0,
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60',
      }
    ];
  }, [sales, products]);

  // Compute Real Chart Data based on selected Time Range
  const chartData = useMemo(() => {
    const completedSales = sales.filter((s) => s.status === 'COMPLETED' || s.paymentStatus === 'PAID');

    if (activeRange === '7d') {
      // Group by the last 7 days
      const days = [];
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);

        const nextD = new Date(d);
        nextD.setDate(nextD.getDate() + 1);

        const daySales = completedSales.filter((s) => {
          const sDate = new Date(s.createdAt);
          return sDate >= d && sDate < nextD;
        });

        const dayRevenue = daySales.reduce((sum, s) => sum + (s.total || s.finalTotal || 0), 0);
        const dayProducts = daySales.reduce((sum, s) => sum + (s.items?.reduce((isum, item) => isum + (item.quantity || 1), 0) || 1), 0);

        days.push({
          label: DAY_NAMES[d.getDay()],
          fullDate: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          revenue: dayRevenue,
          transactions: daySales.length,
          products: dayProducts,
        });
      }
      return days;
    }

    // Default: Group by 12 Months
    const currentYear = new Date().getFullYear();
    const months = MONTH_NAMES.map((mName, mIdx) => {
      const mSales = completedSales.filter((s) => {
        const sDate = new Date(s.createdAt);
        return sDate.getMonth() === mIdx && sDate.getFullYear() === currentYear;
      });

      const mRevenue = mSales.reduce((sum, s) => sum + (s.total || s.finalTotal || 0), 0);
      const mProducts = mSales.reduce((sum, s) => sum + (s.items?.reduce((isum, item) => isum + (item.quantity || 1), 0) || 1), 0);

      return {
        label: mName,
        fullDate: `${mName} ${currentYear}`,
        revenue: mRevenue,
        transactions: mSales.length,
        products: mProducts,
      };
    });

    return months;
  }, [sales, activeRange]);

  // Real Chart Geometry
  const chartWidth = 700;
  const chartHeight = 220;
  const padX = 30;
  const padY = 30;

  const maxRevenue = Math.max(10, ...chartData.map((d) => d.revenue));
  const maxTransactions = Math.max(5, ...chartData.map((d) => d.transactions));

  const pointsBlue = chartData.map((d, i) => {
    const x = padX + (i / Math.max(1, chartData.length - 1)) * (chartWidth - padX * 2);
    const y = chartHeight - padY - (d.revenue / maxRevenue) * (chartHeight - padY * 2);
    return { x, y, ...d };
  });

  const pointsOrange = chartData.map((d, i) => {
    const x = padX + (i / Math.max(1, chartData.length - 1)) * (chartWidth - padX * 2);
    const y = chartHeight - padY - (d.transactions / maxTransactions) * (chartHeight - padY * 2);
    return { x, y, ...d };
  });

  const makeSmoothPath = (pts) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? i : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  const bluePath = makeSmoothPath(pointsBlue);
  const orangePath = makeSmoothPath(pointsOrange);

  // Active point index defaults to last point or current month
  const resolvedActiveIndex = activePointIndex !== null
    ? activePointIndex
    : (activeRange === '7d' ? pointsBlue.length - 1 : new Date().getMonth());

  const activePoint = pointsBlue[resolvedActiveIndex] || pointsBlue[pointsBlue.length - 1];

  // Real Last Transactions Filtered
  const filteredSalesList = useMemo(() => {
    const term = searchTx.trim().toLowerCase();
    return sales.filter((s) => {
      if (!term) return true;
      const inv = (s.invoiceNumber || '').toLowerCase();
      const cust = (s.customerName || s.customer || '').toLowerCase();
      const firstItem = (s.items?.[0]?.productName || '').toLowerCase();
      return inv.includes(term) || cust.includes(term) || firstItem.includes(term);
    });
  }, [sales, searchTx]);

  const toggleSelectTx = (id) => {
    const next = new Set(selectedTxIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedTxIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedTxIds.size === filteredSalesList.length) {
      setSelectedTxIds(new Set());
    } else {
      setSelectedTxIds(new Set(filteredSalesList.map((s) => s.id)));
    }
  };

  const activeSpotlight = topSellingProducts[spotlightIndex % topSellingProducts.length];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-fade-in font-sans pb-12">
      <SEO title="Admin Overview | Saledash" robots="noindex, nofollow" />

      {/* ------- 1. Top Header Bar (Greeting + Date + Profile) ------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-lg xs:text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
            {greeting}, {displayName}!
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
            Here's what's happening with your store today
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Real Live Date Badge Pill */}
          <div className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 sm:px-3.5 py-1.5 text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 shadow-2xs shrink-0">
            <CalendarIcon size={13} className="text-slate-400 shrink-0" />
            <span>{todayFormatted}</span>
          </div>

          {/* Refresh Data Button */}
          <button
            type="button"
            onClick={reloadSales}
            disabled={salesLoading}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs transition active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
            title="Reload live store data"
          >
            <RefreshCw size={13} className={salesLoading ? 'animate-spin text-emerald-600' : ''} />
          </button>

          {/* Notification Bell */}
          <div className="relative shrink-0">
            <NotificationDropdown variant="admin" />
          </div>

          {/* Theme Toggle */}
          <div className="shrink-0">
            <ThemeToggle variant="admin" />
          </div>

          {/* User Profile Pill */}
          <Link
            to="/dashboard/profile"
            className="flex items-center gap-2 rounded-full border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 pl-1 pr-2.5 py-1 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition shrink-0"
          >
            <UserAvatar user={user} className="h-6 w-6 sm:h-7 sm:w-7 text-xs" />
            <span className="hidden sm:inline text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[120px] truncate">
              {displayName}
            </span>
          </Link>
        </div>
      </div>

      {salesError && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 text-xs font-semibold text-rose-700 dark:text-rose-400">
          <span className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{salesError}</span>
          </span>
          <button
            onClick={reloadSales}
            className="font-bold underline cursor-pointer hover:text-rose-900"
          >
            Try again
          </button>
        </div>
      )}

      {/* ------- 2. Top 4 Metric KPI Cards Row (Real Data, Responsive 2-4 cols) ------- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {/* Card 1: Total products */}
        <div className="rounded-xl border border-slate-200/70 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-2 sm:p-2.5 lg:p-3 shadow-2xs flex items-center justify-between min-w-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 dark:bg-slate-800 text-white shadow-2xs">
              <Package size={14} className="sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-500 truncate">Total products</p>
              <div className="flex items-baseline gap-1 sm:gap-1.5 mt-0.2">
                <span className="text-sm sm:text-base lg:text-lg font-black text-slate-900 dark:text-white leading-tight">
                  {kpiStats.totalProducts}
                </span>
                <span className="inline-flex items-center gap-0.5 text-[8px] sm:text-[9px] font-bold text-emerald-500 shrink-0">
                  <span className="h-1 w-1 rounded-full bg-emerald-500 inline-block" />
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Completed order */}
        <div className="rounded-xl border border-slate-200/70 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-2 sm:p-2.5 lg:p-3 shadow-2xs flex items-center justify-between min-w-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 dark:bg-slate-800 text-white shadow-2xs">
              <CheckSquare size={14} className="sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-500 truncate">Completed order</p>
              <div className="flex items-baseline gap-1 sm:gap-1.5 mt-0.2">
                <span className="text-sm sm:text-base lg:text-lg font-black text-slate-900 dark:text-white leading-tight">
                  {kpiStats.completedOrders}
                </span>
                <span className="inline-flex items-center gap-0.5 text-[8px] sm:text-[9px] font-bold text-emerald-500 shrink-0">
                  <span className="h-1 w-1 rounded-full bg-emerald-500 inline-block" />
                  {kpiStats.completionRate}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Canceled order */}
        <div className="rounded-xl border border-slate-200/70 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-2 sm:p-2.5 lg:p-3 shadow-2xs flex items-center justify-between min-w-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 dark:bg-slate-800 text-white shadow-2xs">
              <XSquare size={14} className="sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-500 truncate">Canceled order</p>
              <div className="flex items-baseline gap-1 sm:gap-1.5 mt-0.2">
                <span className="text-sm sm:text-base lg:text-lg font-black text-slate-900 dark:text-white leading-tight">
                  {kpiStats.canceledOrders}
                </span>
                <span className="inline-flex items-center gap-0.5 text-[8px] sm:text-[9px] font-bold text-rose-500 shrink-0">
                  <span className="h-1 w-1 rounded-full bg-rose-500 inline-block" />
                  {kpiStats.canceledOrders > 0 ? `-${Math.round((kpiStats.canceledOrders / Math.max(1, sales.length)) * 100)}%` : '0%'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Top customers */}
        <div className="rounded-xl border border-slate-200/70 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-2 sm:p-2.5 lg:p-3 shadow-2xs flex items-center justify-between min-w-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 dark:bg-slate-800 text-white shadow-2xs">
              <Users size={14} className="sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-500 truncate">Top customers</p>
              <div className="flex items-baseline gap-1 sm:gap-1.5 mt-0.2">
                <span className="text-sm sm:text-base lg:text-lg font-black text-slate-900 dark:text-white leading-tight">
                  {kpiStats.topProducts}
                </span>
                <span className="inline-flex items-center gap-0.5 text-[8px] sm:text-[9px] font-bold text-emerald-500 shrink-0">
                  <span className="h-1 w-1 rounded-full bg-emerald-500 inline-block" />
                  Profiles
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------- 3. Main Chart: "Your sales report" (Real Revenue Spline) ------- */}
      <div className="rounded-3xl border border-slate-200/70 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-4 sm:p-6 lg:p-7 shadow-2xs space-y-4 sm:space-y-6">
        {/* Top Header of Chart */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Your sales report
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              Live store performance and sales volume
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <select
              value={selectedReportType}
              onChange={(e) => setSelectedReportType(e.target.value)}
              className="rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs focus:outline-none cursor-pointer"
            >
              <option value="Total Sales">Total Sales</option>
              <option value="Gross Revenue">Gross Revenue</option>
              <option value="Orders Volume">Orders Volume</option>
            </select>
          </div>
        </div>

        {/* Large Amount & Growth */}
        <div>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(kpiStats.totalRevenue)}
          </h3>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 mt-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
            <span>{kpiStats.completedOrders} Completed Orders ({kpiStats.completionRate}% Paid)</span>
          </div>
        </div>

        {/* SVG Spline Graph with Responsive Safe-Anchored Tooltip */}
        <div className="relative select-none pt-8 sm:pt-10 overflow-visible">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-36 xs:h-44 sm:h-56 md:h-64 overflow-visible"
          >
            <defs>
              <linearGradient id="blueGlowReal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal guideline */}
            <line
              x1={padX}
              y1={chartHeight - padY}
              x2={chartWidth - padX}
              y2={chartHeight - padY}
              stroke="currentColor"
              className="text-slate-100 dark:text-slate-800"
              strokeWidth={1}
            />

            {/* Orange Secondary Spline Line (Orders / Volume) */}
            <path
              d={orangePath}
              fill="none"
              stroke="#f97316"
              strokeWidth={2.5}
              strokeLinecap="round"
              className="opacity-80"
            />

            {/* Blue Primary Spline Line (Revenue) */}
            <path
              d={bluePath}
              fill="none"
              stroke="#3b82f6"
              strokeWidth={3}
              strokeLinecap="round"
            />

            {/* Points & Interactive Click Targets */}
            {pointsBlue.map((p, i) => {
              const isActive = resolvedActiveIndex === i;
              return (
                <g
                  key={p.label + i}
                  className="cursor-pointer"
                  onClick={() => setActivePointIndex(i)}
                >
                  <rect
                    x={p.x - 20}
                    y={0}
                    width={40}
                    height={chartHeight}
                    fill="transparent"
                  />
                  {isActive && (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={7}
                      fill="#3b82f6"
                      stroke="#ffffff"
                      strokeWidth={3}
                      className="shadow-md"
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Floating Tooltip Card: dynamically anchored to never overflow left or right */}
          {activePoint && (() => {
            const rawPercent = (activePoint.x / chartWidth) * 100;
            // Dynamic placement:
            // > 65%: anchor to the left of the point (-translate-x-full) so it stays inside the right edge
            // < 35%: anchor to the right of the point (translate-x-0) so it stays inside the left edge
            // Middle: center directly above point (-translate-x-1/2)
            let alignClass = '-translate-x-1/2';
            let extraOffset = '0px';
            if (rawPercent > 65) {
              alignClass = '-translate-x-full';
              extraOffset = '-10px';
            } else if (rawPercent < 35) {
              alignClass = 'translate-x-0';
              extraOffset = '10px';
            }

            return (
              <div
                className={`pointer-events-none absolute top-0 rounded-2xl bg-[#18181B] dark:bg-slate-800 text-white p-2.5 sm:p-3 shadow-2xl z-20 min-w-32 sm:min-w-36 text-left animate-scale-in border border-slate-700/50 ${alignClass} -translate-y-full`}
                style={{
                  left: `calc(${rawPercent}% + ${extraOffset})`,
                }}
              >
                <p className="text-[11px] sm:text-xs font-bold text-white mb-1">
                  {activePoint.fullDate}
                </p>
                <div className="space-y-0.5 sm:space-y-1 text-[10px] sm:text-[11px] font-medium text-slate-300">
                  <p className="flex items-center gap-1.5 font-bold text-emerald-400">
                    <span className="h-2.5 w-0.5 bg-emerald-400 rounded-full" />
                    <span>{formatCurrency(activePoint.revenue)}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="h-2.5 w-0.5 bg-blue-500 rounded-full" />
                    <span>{activePoint.transactions} Transactions</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="h-2.5 w-0.5 bg-orange-500 rounded-full" />
                    <span>{activePoint.products} Products Sold</span>
                  </p>
                </div>
              </div>
            );
          })()}

          {/* Labels along the bottom */}
          <div className="flex justify-between items-center text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 pt-2 px-1 sm:px-2">
            {chartData.map((d, i) => (
              <button
                key={d.label + i}
                onClick={() => setActivePointIndex(i)}
                className={`transition-colors cursor-pointer px-1 py-0.5 rounded ${
                  resolvedActiveIndex === i
                    ? 'text-slate-900 dark:text-white font-black scale-105 sm:scale-110'
                    : 'hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Time Period Filter Pills */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 overflow-x-auto pb-1 scrollbar-none">
          {[
            { key: '1d', label: '1d' },
            { key: '7d', label: '7d' },
            { key: '30d', label: '30d' },
            { key: '16m', label: 'Year' },
            { key: 'Max', label: 'Max' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setActiveRange(key); setActivePointIndex(null); }}
              className={`rounded-full px-3.5 py-1 text-xs font-bold transition cursor-pointer shrink-0 ${
                activeRange === key
                  ? 'bg-[#18181B] dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ------- 4. Bottom Grid: Real "Last transaction" + Real "Congratulations!" Spotlight ------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Left: Real Last transaction Table (7 cols on lg) */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200/70 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-4 sm:p-5 lg:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                Last transaction
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                {filteredSalesList.length} recent orders from API
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:flex-initial flex items-center rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs">
                <Search size={13} className="text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Search invoice/item..."
                  value={searchTx}
                  onChange={(e) => setSearchTx(e.target.value)}
                  className="w-full sm:w-36 bg-transparent text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              <Link
                to="/dashboard/sales"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer shrink-0"
                title="View All Sales"
              >
                <SlidersHorizontal size={14} />
              </Link>
            </div>
          </div>

          {/* Clean Transaction Table with Real Data & Touch Scroll */}
          <div className="overflow-x-auto -mx-1 sm:mx-0">
            {filteredSalesList.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400">
                No transactions found.
              </div>
            ) : (
              <table className="w-full text-xs min-w-[500px]">
                <thead>
                  <tr className="text-left text-[11px] font-bold text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/60 pb-2">
                    <th className="py-2.5 px-2 font-bold w-8">
                      <input
                        type="checkbox"
                        checked={selectedTxIds.size === filteredSalesList.length && filteredSalesList.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                      />
                    </th>
                    <th className="py-2.5 px-2 font-bold">Order ID</th>
                    <th className="py-2.5 px-2 font-bold">Item</th>
                    <th className="py-2.5 px-2 font-bold">Date</th>
                    <th className="py-2.5 px-2 font-bold">Price</th>
                    <th className="py-2.5 px-2 font-bold text-right">Platform</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold">
                  {filteredSalesList.slice(0, 6).map((sale) => {
                    const isSelected = selectedTxIds.has(sale.id);
                    const isBakong = sale.paymentMethod === 'KHQR';
                    const firstItemName = sale.items?.[0]?.productName || sale.customerName || 'Store Order';
                    const itemsExtra = (sale.items?.length || 0) > 1 ? ` (+${sale.items.length - 1})` : '';

                    return (
                      <tr
                        key={sale.id}
                        onClick={() => navigate(`/dashboard/sales/${sale.id}`)}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition cursor-pointer ${
                          isSelected ? 'bg-slate-50/60 dark:bg-slate-800/30' : ''
                        }`}
                      >
                        <td className="py-3 px-2" onClick={(e) => { e.stopPropagation(); toggleSelectTx(sale.id); }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectTx(sale.id)}
                            className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-2 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          {sale.invoiceNumber || sale.id}
                        </td>
                        <td className="py-3 px-2 text-slate-700 dark:text-slate-300 truncate max-w-[130px]">
                          {firstItemName}{itemsExtra}
                        </td>
                        <td className="py-3 px-2 text-slate-400 dark:text-slate-500 font-mono text-[11px] whitespace-nowrap">
                          {formatDate(sale.createdAt)}
                        </td>
                        <td className="py-3 px-2 font-black text-slate-900 dark:text-white whitespace-nowrap">
                          {formatCurrency(sale.total || sale.finalTotal || 0)}
                        </td>
                        <td className="py-3 px-2 text-right whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                            <span className={`h-4 w-4 rounded flex items-center justify-center text-[8px] font-black shrink-0 ${
                              isBakong
                                ? 'bg-rose-500 text-white'
                                : 'bg-emerald-600 text-white'
                            }`}>
                              {isBakong ? 'KH' : 'POS'}
                            </span>
                            <span>{isBakong ? 'Bakong KHQR' : 'Point of Sale'}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right: Real Top Products Spotlight (5 cols on lg) */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200/70 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-4 sm:p-5 lg:p-6 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
              Congratulations!
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
              Some of your products already have the highest buyers
            </p>
          </div>

          {/* 3D-style Stacked Showcase Carousel with Arrow Navigation */}
          <div className="relative flex items-center justify-center py-4 sm:py-6 select-none">
            {/* Left navigation arrow */}
            <button
              type="button"
              onClick={() => setSpotlightIndex((prev) => (prev === 0 ? topSellingProducts.length - 1 : prev - 1))}
              className="absolute left-0 sm:left-1 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-sm hover:scale-105 transition cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>

            {/* Product Display Stack */}
            <div className="flex items-center justify-center gap-2 sm:gap-2.5">
              {/* Left Back Preview */}
              {topSellingProducts.length > 1 && (
                <div className="hidden xs:block h-20 w-14 sm:h-24 sm:w-16 rounded-xl bg-slate-100 dark:bg-slate-800 shadow-sm opacity-50 scale-90 rotate-[-4deg] overflow-hidden border border-slate-200 dark:border-slate-700">
                  <img
                    src={topSellingProducts[(spotlightIndex + 1) % topSellingProducts.length].image}
                    alt="Side product"
                    className="h-full w-full object-cover"
                    onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60'; }}
                  />
                </div>
              )}

              {/* Center Elevated Active Card */}
              <div className="relative z-10 h-26 w-22 xs:h-30 xs:w-26 sm:h-34 sm:w-30 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 p-1.5 shadow-md hover:scale-105 transition-transform duration-300">
                <img
                  src={activeSpotlight?.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60'}
                  alt={activeSpotlight?.name}
                  className="h-full w-full rounded-lg object-contain bg-slate-50 dark:bg-slate-900"
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60'; }}
                />
              </div>

              {/* Right Back Preview */}
              {topSellingProducts.length > 2 && (
                <div className="hidden xs:block h-20 w-14 sm:h-24 sm:w-16 rounded-xl bg-slate-100 dark:bg-slate-800 shadow-sm opacity-50 scale-90 rotate-[4deg] overflow-hidden border border-slate-200 dark:border-slate-700">
                  <img
                    src={topSellingProducts[(spotlightIndex + 2) % topSellingProducts.length].image}
                    alt="Side product"
                    className="h-full w-full object-cover"
                    onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60'; }}
                  />
                </div>
              )}
            </div>

            {/* Right navigation arrow */}
            <button
              type="button"
              onClick={() => setSpotlightIndex((prev) => (prev + 1) % topSellingProducts.length)}
              className="absolute right-0 sm:right-1 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-sm hover:scale-105 transition cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Product Info at Bottom */}
          <div className="text-center pt-2">
            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate max-w-[200px] mx-auto">
              {activeSpotlight?.name}
            </h4>
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">
              {activeSpotlight?.soldQty || 0} sold
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

