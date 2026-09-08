import { useState, useMemo, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon, Search, SlidersHorizontal,
  Package, CheckSquare, XSquare, Users, ChevronLeft, ChevronRight,
  TrendingUp, ArrowRight, ShoppingCart, RefreshCw, AlertCircle,
  Receipt as ReceiptIcon, Eye, ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSales } from '../../hooks/useSales';
import { useProducts } from '../../hooks/useProducts';
import { useCustomers } from '../../hooks/useCustomers';
import { adminApi } from '../../api/adminApi';
import { reportApi } from '../../api/reportApi';
import { getCustomerOrders } from '../pos/CustomerOrdersModal';
import SaleSuccessModal from '../pos/SaleSuccessModal';
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

  // Online Customer Orders & Backend Stats from API
  const [onlineOrders, setOnlineOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');
  const [reportStats, setReportStats] = useState(null);

  const [activeRange, setActiveRange] = useState('7d');
  const [selectedReportType, setSelectedReportType] = useState('Total Sales');
  const [activePointIndex, setActivePointIndex] = useState(null);
  const [searchTx, setSearchTx] = useState('');
  const [selectedTxIds, setSelectedTxIds] = useState(new Set());
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [selectedReceiptSale, setSelectedReceiptSale] = useState(null);

  // Fetch online customer orders and backend dashboard report
  const fetchOrdersAndReports = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError('');
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const [ordersRes, reportRes] = await Promise.allSettled([
        adminApi.getAllOrders({ page: 0, size: 500, sort: 'createdAt,desc' }),
        reportApi.getDashboardReport(todayStr),
      ]);

      if (ordersRes.status === 'fulfilled' && ordersRes.value) {
        const raw = ordersRes.value;
        const list = Array.isArray(raw) ? raw : (raw.content ?? raw.orders ?? []);
        setOnlineOrders(list);
      }

      if (reportRes.status === 'fulfilled' && reportRes.value) {
        setReportStats(reportRes.value);
      }
    } catch (err) {
      console.warn('Dashboard orders/reports fetch error:', err);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrdersAndReports();
  }, [fetchOrdersAndReports]);

  // Combined Refresh Handler
  const handleRefreshAll = async () => {
    await Promise.allSettled([
      reloadSales(),
      fetchOrdersAndReports(),
    ]);
  };

  const isLoading = salesLoading || ordersLoading;

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

  // Merge and Normalize all Transactions (POS sales + Online customer orders + Local session orders)
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
        customerName: s.customerName || (typeof s.customer === 'string' ? s.customer : '') || 'Store Customer',
        cashierName: s.cashierName || s.cashier || '',
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
          total: Number(o.finalTotal ?? o.total ?? o.amount ?? 0),
          subtotal: Number(o.subtotal ?? o.total ?? 0),
          status: (o.status || 'COMPLETED').toUpperCase(),
          paymentStatus: (o.paymentStatus || (o.status === 'COMPLETED' ? 'PAID' : 'PENDING')).toUpperCase(),
          paymentMethod: typeof o.paymentMethod === 'string' ? o.paymentMethod : o.paymentMethod?.name || 'KHQR',
          items: o.items || o.orderItems || [],
          customerName: o.customerName || o.customer?.name || o.receiverName || 'Online Shopper',
          cashierName: 'Online Store',
          createdAt: o.createdAt || o.orderDate || new Date().toISOString(),
          raw: o,
        });
      }
    });

    // 3. Process Local Customer Orders (if any from session)
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
  }, [sales, onlineOrders]);

  // Compute Real KPI Metrics
  const kpiStats = useMemo(() => {
    const completed = allTransactions.filter(
      (t) => t.status === 'COMPLETED' || t.paymentStatus === 'PAID' || t.status === 'DELIVERED'
    );
    const cancelled = allTransactions.filter(
      (t) => t.status === 'CANCELLED' || t.status === 'REFUNDED'
    );
    const totalRevenue = completed.reduce((sum, t) => sum + t.total, 0);

    // Real total catalog products
    const totalProducts = totalProductsCount > 0 ? totalProductsCount : products.length;

    // Real unique customers count (combining catalog customers & order customers)
    const customerNamesSet = new Set(
      allTransactions.map((t) => t.customerName).filter((c) => c && c !== 'Store Customer')
    );
    const uniqueCustomers = Math.max(customers.length, customerNamesSet.size, 1);

    // Completion Rate
    const completionRate = allTransactions.length > 0
      ? Math.round((completed.length / allTransactions.length) * 100)
      : 100;

    return {
      totalProducts,
      completedOrders: completed.length,
      canceledOrders: cancelled.length,
      topProducts: uniqueCustomers,
      totalRevenue,
      completionRate,
      totalCount: allTransactions.length,
    };
  }, [allTransactions, products, totalProductsCount, customers]);

  // Compute Real Top Selling Products from All Sales & Orders
  const topSellingProducts = useMemo(() => {
    const salesMap = new Map();

    allTransactions.forEach((tx) => {
      (tx.items ?? []).forEach((item) => {
        const key = item.productId || item.product?.id || item.productName || item.title || item.name;
        if (!key) return;
        const name = item.productName || item.product?.name || item.title || item.name || 'Mart Item';
        const image = item.image || item.imageUrl || item.product?.image || item.product?.imageUrl || '';
        const prev = salesMap.get(key) || {
          id: key,
          name,
          soldQty: 0,
          revenue: 0,
          image,
        };
        const qty = Number(item.quantity || item.qty || 1);
        const price = Number(item.price || item.unitPrice || 0);
        const lineTotal = Number(item.lineTotal || (price * qty) || 0);

        prev.soldQty += qty;
        prev.revenue += lineTotal;
        if (!prev.image && image) prev.image = image;
        salesMap.set(key, prev);
      });
    });

    const ranked = Array.from(salesMap.values()).sort((a, b) => b.soldQty - a.soldQty);

    // Join with catalog products to enrich images
    const catalogMap = new Map(products.map((p) => [String(p.id), p]));

    const enriched = ranked.map((item) => {
      const p = catalogMap.get(String(item.id));
      return {
        ...item,
        name: p?.name || item.name,
        image: p?.image || p?.imageUrl || item.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60',
      };
    });

    // Fallback if no order items yet: populate from catalog
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
  }, [allTransactions, products]);

  // Compute Real Chart Data based on selected Time Range
  const chartData = useMemo(() => {
    const completedTx = allTransactions.filter(
      (t) => t.status === 'COMPLETED' || t.paymentStatus === 'PAID' || t.status === 'DELIVERED'
    );

    if (activeRange === '1d') {
      // Group by Today's 2-hour slots (08:00, 10:00, 12:00, 14:00, 16:00, 18:00, 20:00, 22:00)
      const slots = [
        { label: '08:00', startH: 8, endH: 10 },
        { label: '10:00', startH: 10, endH: 12 },
        { label: '12:00', startH: 12, endH: 14 },
        { label: '14:00', startH: 14, endH: 16 },
        { label: '16:00', startH: 16, endH: 18 },
        { label: '18:00', startH: 18, endH: 20 },
        { label: '20:00', startH: 20, endH: 22 },
        { label: '22:00', startH: 22, endH: 24 },
      ];

      const now = new Date();
      return slots.map((s) => {
        const slotTx = completedTx.filter((t) => {
          const d = new Date(t.createdAt);
          const isToday = d.toDateString() === now.toDateString();
          const hour = d.getHours();
          return isToday && hour >= s.startH && hour < s.endH;
        });

        const revenue = slotTx.reduce((sum, t) => sum + t.total, 0);
        const productsCount = slotTx.reduce((sum, t) => sum + (t.items?.reduce((isum, i) => isum + (i.quantity || 1), 0) || 1), 0);

        return {
          label: s.label,
          fullDate: `Today at ${s.label}`,
          revenue,
          transactions: slotTx.length,
          products: productsCount,
        };
      });
    }

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

        const dayTx = completedTx.filter((t) => {
          const tDate = new Date(t.createdAt);
          return tDate >= d && tDate < nextD;
        });

        const dayRevenue = dayTx.reduce((sum, t) => sum + t.total, 0);
        const dayProducts = dayTx.reduce((sum, t) => sum + (t.items?.reduce((isum, item) => isum + (item.quantity || 1), 0) || 1), 0);

        days.push({
          label: DAY_NAMES[d.getDay()],
          fullDate: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          revenue: dayRevenue,
          transactions: dayTx.length,
          products: dayProducts,
        });
      }
      return days;
    }

    if (activeRange === '30d') {
      // Group by 6 intervals of 5 days
      const intervals = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const endDay = new Date(now);
        endDay.setDate(endDay.getDate() - (i * 5));
        const startDay = new Date(endDay);
        startDay.setDate(startDay.getDate() - 5);

        const intTx = completedTx.filter((t) => {
          const tDate = new Date(t.createdAt);
          return tDate >= startDay && tDate <= endDay;
        });

        const intRevenue = intTx.reduce((sum, t) => sum + t.total, 0);
        const intProducts = intTx.reduce((sum, t) => sum + (t.items?.reduce((isum, item) => isum + (item.quantity || 1), 0) || 1), 0);

        intervals.push({
          label: `${startDay.getDate()}-${endDay.getDate()} ${MONTH_NAMES[endDay.getMonth()]}`,
          fullDate: `${startDay.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - ${endDay.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`,
          revenue: intRevenue,
          transactions: intTx.length,
          products: intProducts,
        });
      }
      return intervals;
    }

    // Default (Year / Max): Group by 12 Months
    const currentYear = new Date().getFullYear();
    const months = MONTH_NAMES.map((mName, mIdx) => {
      const mTx = completedTx.filter((t) => {
        const tDate = new Date(t.createdAt);
        return tDate.getMonth() === mIdx && tDate.getFullYear() === currentYear;
      });

      const mRevenue = mTx.reduce((sum, t) => sum + t.total, 0);
      const mProducts = mTx.reduce((sum, t) => sum + (t.items?.reduce((isum, item) => isum + (item.quantity || 1), 0) || 1), 0);

      return {
        label: mName,
        fullDate: `${mName} ${currentYear}`,
        revenue: mRevenue,
        transactions: mTx.length,
        products: mProducts,
      };
    });

    return months;
  }, [allTransactions, activeRange]);

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
    return allTransactions.filter((tx) => {
      if (!term) return true;
      const inv = (tx.invoiceNumber || '').toLowerCase();
      const cust = (tx.customerName || '').toLowerCase();
      const firstItem = (tx.items?.[0]?.productName || tx.items?.[0]?.title || tx.items?.[0]?.name || '').toLowerCase();
      const method = (tx.paymentMethod || '').toLowerCase();
      return inv.includes(term) || cust.includes(term) || firstItem.includes(term) || method.includes(term);
    });
  }, [allTransactions, searchTx]);

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

          {/* Notification Bell */}
          <div className="relative shrink-0">
            <NotificationDropdown variant="admin" />
          </div>

          {/* Refresh Data Button */}
          <button
            type="button"
            onClick={handleRefreshAll}
            disabled={isLoading}
            className="flex h-8.5 w-8.5 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-2xs transition active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
            title="Reload live store & order data"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin text-emerald-600' : ''} />
          </button>

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

      {(salesError || ordersError) && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 text-xs font-semibold text-rose-700 dark:text-rose-400">
          <span className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{salesError || ordersError}</span>
          </span>
          <button
            onClick={handleRefreshAll}
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
                  {kpiStats.canceledOrders > 0 ? `-${Math.round((kpiStats.canceledOrders / Math.max(1, kpiStats.totalCount)) * 100)}%` : '0%'}
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
              Live store performance and sales volume from POS & online orders
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
                {filteredSalesList.length} live orders & POS sales from API
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
              <table className="w-full text-xs min-w-[520px]">
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
                    <th className="py-2.5 px-2 font-bold">Item / Customer</th>
                    <th className="py-2.5 px-2 font-bold">Date</th>
                    <th className="py-2.5 px-2 font-bold">Price</th>
                    <th className="py-2.5 px-2 font-bold text-right">Platform & Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold">
                  {filteredSalesList.slice(0, 8).map((tx) => {
                    const isSelected = selectedTxIds.has(tx.id);
                    const isBakong = tx.paymentMethod === 'KHQR';
                    const isOnline = tx.type === 'ONLINE';
                    const firstItemName = tx.items?.[0]?.productName || tx.items?.[0]?.title || tx.items?.[0]?.name || tx.customerName || 'Store Order';
                    const itemsExtra = (tx.items?.length || 0) > 1 ? ` (+${tx.items.length - 1})` : '';

                    return (
                      <tr
                        key={tx.id}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition ${
                          isSelected ? 'bg-slate-50/60 dark:bg-slate-800/30' : ''
                        }`}
                      >
                        <td className="py-3 px-2" onClick={(e) => { e.stopPropagation(); toggleSelectTx(tx.id); }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectTx(tx.id)}
                            className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                          />
                        </td>
                        <td
                          onClick={() => {
                            if (tx.type === 'POS') {
                              navigate(`/dashboard/sales/${tx.id}`);
                            } else {
                              setSelectedReceiptSale(tx.raw);
                            }
                          }}
                          className="py-3 px-2 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap cursor-pointer hover:underline"
                        >
                          {tx.invoiceNumber || tx.id}
                        </td>
                        <td className="py-3 px-2 text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{firstItemName}</span>
                          {itemsExtra && <span className="text-slate-400 text-[10px] ml-1">{itemsExtra}</span>}
                          {tx.customerName && tx.customerName !== 'Store Customer' && (
                            <p className="text-[10px] text-slate-400 truncate">{tx.customerName}</p>
                          )}
                        </td>
                        <td className="py-3 px-2 text-slate-400 dark:text-slate-500 font-mono text-[11px] whitespace-nowrap">
                          {formatDate(tx.createdAt)}
                        </td>
                        <td className="py-3 px-2 font-black text-slate-900 dark:text-white whitespace-nowrap">
                          {formatCurrency(tx.total)}
                        </td>
                        <td className="py-3 px-2 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <span className="inline-flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                              <span className={`h-4.5 px-1.5 rounded flex items-center justify-center text-[9px] font-black shrink-0 ${
                                isBakong
                                  ? 'bg-rose-500 text-white'
                                  : isOnline
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-emerald-600 text-white'
                              }`}>
                                {isBakong ? 'KHQR' : isOnline ? 'ONLINE' : 'POS'}
                              </span>
                            </span>

                            {/* View Receipt Trigger Button */}
                            <button
                              type="button"
                              onClick={() => setSelectedReceiptSale(tx.raw)}
                              title="View & Print Receipt"
                              className="flex h-6.5 w-6.5 items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                            >
                              <ReceiptIcon size={12} />
                            </button>
                          </div>
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
              Top products with highest sales volume across store
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
              {activeSpotlight?.soldQty || 0} units sold
            </p>
          </div>
        </div>
      </div>

      {/* ------- 5. Real Receipt Modal Viewer ------- */}
      {selectedReceiptSale && (
        <SaleSuccessModal
          sale={selectedReceiptSale}
          onClose={() => setSelectedReceiptSale(null)}
        />
      )}
    </div>
  );
}

