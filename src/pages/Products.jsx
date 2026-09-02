import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Plus, Edit2, Trash2, Loader2, AlertCircle, RefreshCw,
  Package, ChevronLeft, ChevronRight, Tags, Search, X,
  LayoutGrid, List, AlertTriangle,
  Boxes, Layers, Tag
} from 'lucide-react';
import { adminProductApi } from '../api/adminProductApi';
import { getErrorMessage } from '../api/client';
import { formatCurrency } from '../utils/format';
import { useCategories } from '../hooks/useCategories';
import ProductFormModal from '../components/admin/ProductFormModal';
import CategoryManagerModal from '../components/admin/CategoryManagerModal';
import SEO from '../components/SEO';

const STATUS_CONFIG = {
  ACTIVE: {
    label: 'សកម្ម (Active)',
    badge: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
    dot: 'bg-emerald-500',
  },
  DRAFT: {
    label: 'ព្រាង (Draft)',
    badge: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    dot: 'bg-slate-400',
  },
  INACTIVE: {
    label: 'អសកម្ម (Inactive)',
    badge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
    dot: 'bg-amber-500',
  },
  ARCHIVED: {
    label: 'ទុកក្នុងប័ណ្ណសារ (Archived)',
    badge: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
    dot: 'bg-rose-500',
  },
};

export default function Products() {
  const [pageData, setPageData] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(24);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  // Filters & View State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('DEFAULT');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  const { categories, reload: reloadCategories } = useCategories();

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminProductApi.list({ page, size: pageSize });
      setPageData(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    load();
  }, [load]);

  const rawProducts = useMemo(() => {
    if (!pageData) return [];
    if (Array.isArray(pageData)) return pageData;
    return pageData.content ?? pageData.data?.content ?? [];
  }, [pageData]);

  const totalPages = pageData?.totalPages ?? pageData?.data?.totalPages ?? 0;
  const totalElements = pageData?.totalElements ?? pageData?.data?.totalElements ?? rawProducts.length;

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let result = [...rawProducts];

    // Search query filter
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.barcode?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== 'ALL') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Status filter
    if (selectedStatus !== 'ALL') {
      result = result.filter((p) => (p.status || 'ACTIVE') === selectedStatus);
    }

    // Stock level filter
    if (stockFilter === 'IN_STOCK') {
      result = result.filter((p) => (p.stockQuantity ?? 0) > 10);
    } else if (stockFilter === 'LOW_STOCK') {
      result = result.filter((p) => (p.stockQuantity ?? 0) > 0 && (p.stockQuantity ?? 0) <= 10);
    } else if (stockFilter === 'OUT_OF_STOCK') {
      result = result.filter((p) => (p.stockQuantity ?? 0) <= 0);
    }

    // Sorting
    if (sortBy === 'NAME_ASC') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'PRICE_ASC') {
      result.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    } else if (sortBy === 'PRICE_DESC') {
      result.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    } else if (sortBy === 'STOCK_ASC') {
      result.sort((a, b) => (a.stockQuantity ?? 0) - (b.stockQuantity ?? 0));
    } else if (sortBy === 'STOCK_DESC') {
      result.sort((a, b) => (b.stockQuantity ?? 0) - (a.stockQuantity ?? 0));
    }

    return result;
  }, [rawProducts, search, selectedCategory, selectedStatus, stockFilter, sortBy]);

  // Overall Stats based on loaded dataset
  const stats = useMemo(() => {
    const totalUnits = rawProducts.reduce((sum, p) => sum + (p.stockQuantity ?? 0), 0);
    const lowStockCount = rawProducts.filter((p) => (p.stockQuantity ?? 0) > 0 && (p.stockQuantity ?? 0) <= 10).length;
    const outOfStockCount = rawProducts.filter((p) => (p.stockQuantity ?? 0) <= 0).length;
    const activeCount = rawProducts.filter((p) => (p.status || 'ACTIVE') === 'ACTIVE').length;

    return {
      totalProducts: totalElements,
      totalUnits,
      lowStockCount,
      outOfStockCount,
      activeCount,
      categoriesCount: categories.length,
    };
  }, [rawProducts, totalElements, categories.length]);

  const openCreate = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleSaved = () => {
    setModalOpen(false);
    load();
    reloadCategories();
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`តើអ្នកពិតជាចង់លុបផលិតផល "${product.name}" មែនទេ?`)) return;
    setDeletingId(product.id);
    try {
      await adminProductApi.delete(product.id);
      load();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('ALL');
    setSelectedStatus('ALL');
    setStockFilter('ALL');
    setSortBy('DEFAULT');
  };

  const hasActiveFilters = search || selectedCategory !== 'ALL' || selectedStatus !== 'ALL' || stockFilter !== 'ALL' || sortBy !== 'DEFAULT';

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 animate-fade-in space-y-5">
      <SEO
        title="គ្រប់គ្រងផលិតផល (Products Management) | Mart System"
        robots="noindex, nofollow"
      />

      {/* Quick Actions Bar */}
      <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-2.5">
        <button
          onClick={() => setCategoryModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 shadow-2xs transition hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 active:scale-95"
        >
          <Tags size={16} className="text-emerald-600 dark:text-emerald-400" />
          <span>គ្រប់គ្រងប្រភេទ</span>
          <span className="ml-1 rounded-full bg-slate-100 dark:bg-slate-700 px-1.5 py-0.2 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
            {categories.length}
          </span>
        </button>

        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-sm hover:shadow-md shadow-emerald-600/25 transition-all hover:from-emerald-500 hover:to-emerald-600 active:scale-95"
        >
          <Plus size={17} />
          <span>ផលិតផលថ្មី</span>
        </button>
      </div>

      {/* KPI Overview Metrics Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {/* Total Products */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">ផលិតផលសរុប</p>
            <p className="mt-1 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {loading ? '—' : stats.totalProducts}
            </p>
            <p className="mt-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              {stats.activeCount} កំពុងសកម្ម
            </p>
          </div>
          <div className="rounded-xl bg-emerald-500/10 dark:bg-emerald-950/50 p-2.5 text-emerald-600 dark:text-emerald-400">
            <Package size={22} />
          </div>
        </div>

        {/* Total Inventory Units */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">ស្តុកសរុប (Units)</p>
            <p className="mt-1 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {loading ? '—' : stats.totalUnits.toLocaleString()}
            </p>
            <p className="mt-0.5 text-[10px] text-slate-400">
              ក្នុងទំព័របច្ចុប្បន្ន
            </p>
          </div>
          <div className="rounded-xl bg-sky-500/10 dark:bg-sky-950/50 p-2.5 text-sky-600 dark:text-sky-400">
            <Boxes size={22} />
          </div>
        </div>

        {/* Low Stock Warning */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">ជិតអស់ & អស់ស្តុក</p>
            <p className="mt-1 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {loading ? '—' : stats.lowStockCount + stats.outOfStockCount}
            </p>
            <p className="mt-0.5 text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
              {stats.outOfStockCount} អស់ស្តុក · {stats.lowStockCount} ជិតអស់
            </p>
          </div>
          <div className="rounded-xl bg-amber-500/10 dark:bg-amber-950/50 p-2.5 text-amber-600 dark:text-amber-400">
            <AlertTriangle size={22} />
          </div>
        </div>

        {/* Categories Count */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">ប្រភេទសរុប</p>
            <p className="mt-1 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {categories.length}
            </p>
            <p className="mt-0.5 text-[10px] text-slate-400">
              ប្រភេទទំនិញក្នុងប្រព័ន្ធ
            </p>
          </div>
          <div className="rounded-xl bg-purple-500/10 dark:bg-purple-950/50 p-2.5 text-purple-600 dark:text-purple-400">
            <Layers size={22} />
          </div>
        </div>
      </div>

      {/* Filter, Search & View Controls Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 sm:p-4 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ស្វែងរកតាមឈ្មោះ, SKU, Barcode, ប្រភេទ..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 py-2 pl-9 pr-8 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter Dropdowns & View Mode */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Category Selector */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:border-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="ALL">ប្រភេទទាំងអស់</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>

            {/* Status Selector */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:border-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="ALL">ស្ថានភាពទាំងអស់</option>
              <option value="ACTIVE">សកម្ម (ACTIVE)</option>
              <option value="DRAFT">ព្រាង (DRAFT)</option>
              <option value="INACTIVE">អសកម្ម (INACTIVE)</option>
              <option value="ARCHIVED">ប័ណ្ណសារ (ARCHIVED)</option>
            </select>

            {/* Stock Level Selector */}
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:border-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="ALL">ស្តុកទាំងអស់</option>
              <option value="IN_STOCK">មានស្តុកគ្រប់គ្រាន់</option>
              <option value="LOW_STOCK">ជិតអស់ស្តុក (≤ 10)</option>
              <option value="OUT_OF_STOCK">អស់ស្តុក (0)</option>
            </select>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:border-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="DEFAULT">តម្រៀប: លំនាំដើម</option>
              <option value="NAME_ASC">ឈ្មោះ: A - Z</option>
              <option value="PRICE_ASC">តម្លៃ: ទាប ទៅ ខ្ពស់</option>
              <option value="PRICE_DESC">តម្លៃ: ខ្ពស់ ទៅ ទាប</option>
              <option value="STOCK_ASC">ស្តុក: តិច ទៅ ច្រើន</option>
              <option value="STOCK_DESC">ស្តុក: ច្រើន ទៅ តិច</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-lg p-1.5 transition ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
                title="ទិដ្ឋភាពកាត (Grid View)"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`rounded-lg p-1.5 transition ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
                title="ទិដ្ឋភាពតារាង (Table View)"
              >
                <List size={16} />
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={load}
              disabled={loading}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition active:scale-95 disabled:opacity-50"
              title="ទាញយកឡើងវិញ"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin text-emerald-600' : ''} />
            </button>
          </div>
        </div>

        {/* Active Filters Reset Indicator */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <p className="text-slate-500 dark:text-slate-400">
              បង្ហាញ <strong className="text-slate-800 dark:text-slate-200">{filteredProducts.length}</strong> នៃ {rawProducts.length} ផលិតផលដែលត្រូវនឹងលក្ខខណ្ឌ
            </p>
            <button
              onClick={resetFilters}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
            >
              សម្អាតតម្រងទាំងអស់
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div>
        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-3 animate-pulse">
                <div className="h-32 rounded-xl bg-slate-100 dark:bg-slate-800" />
                <div className="h-4 w-3/4 rounded bg-slate-100 dark:bg-slate-800" />
                <div className="h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-800" />
                <div className="flex justify-between pt-2">
                  <div className="h-5 w-16 rounded bg-slate-100 dark:bg-slate-800" />
                  <div className="h-5 w-16 rounded bg-slate-100 dark:bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 p-8 text-center animate-fade-in">
            <AlertCircle size={36} className="mx-auto mb-3 text-rose-600 dark:text-rose-400" />
            <p className="mb-4 text-sm font-semibold text-rose-700 dark:text-rose-300">{error}</p>
            <button
              onClick={load}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-rose-500 active:scale-95"
            >
              <RefreshCw size={14} />
              ព្យាយាមម្តងទៀត
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center shadow-2xs animate-fade-in">
            <Package size={44} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">មិនមានផលិតផលត្រូវនឹងលក្ខខណ្ឌទេ</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {hasActiveFilters
                ? 'សូមព្យាយាមផ្លាស់ប្តូរពាក្យស្វែងរក ឬសម្អាតតម្រងទាំងអស់'
                : 'ចាប់ផ្តើមបន្ថែមផលិតផលដំបូងរបស់អ្នកទៅក្នុងប្រព័ន្ធ'}
            </p>
            <div className="mt-5 flex items-center justify-center gap-2.5">
              {hasActiveFilters ? (
                <button
                  onClick={resetFilters}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs transition hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  សម្អាតតម្រង
                </button>
              ) : (
                <button
                  onClick={openCreate}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/30 transition hover:bg-emerald-500"
                >
                  <Plus size={16} />
                  បន្ថែមផលិតផលថ្មី
                </button>
              )}
            </div>
          </div>
        )}

        {/* Product Cards Grid View */}
        {!loading && !error && filteredProducts.length > 0 && viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4.5">
            {filteredProducts.map((product) => {
              const statusCfg = STATUS_CONFIG[product.status] || STATUS_CONFIG.ACTIVE;
              const stock = product.stockQuantity ?? 0;
              const isOutOfStock = stock <= 0;
              const isLowStock = stock > 0 && stock <= 10;

              return (
                <div
                  key={product.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-xl hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all duration-200"
                >
                  {/* Card Media Header */}
                  <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full shrink-0 items-center justify-center bg-slate-50/90 dark:bg-slate-800/60 p-2 overflow-hidden flex border-b border-slate-100 dark:border-slate-800">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <Package size={32} className="text-slate-300 dark:text-slate-600" />
                    )}

                    {/* Top Left: Category Badge */}
                    {product.category && (
                      <span className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded-full bg-slate-900/80 backdrop-blur-md px-2 py-0.5 text-[9px] font-bold text-white shadow-xs border border-white/10">
                        <Tag size={9} className="text-emerald-400" />
                        <span className="truncate max-w-[90px]">{product.category}</span>
                      </span>
                    )}

                    {/* Top Right: Status Badge */}
                    <span className={`absolute top-2 right-2 z-10 flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold shadow-xs backdrop-blur-md ${statusCfg.badge}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                      <span>{product.status || 'ACTIVE'}</span>
                    </span>

                    {/* Bottom Stock Alert Badge */}
                    {isOutOfStock ? (
                      <div className="absolute inset-x-0 bottom-0 bg-rose-600/90 backdrop-blur-xs py-0.5 text-center text-[10px] font-black text-white">
                        អស់ស្តុក (Out of Stock)
                      </div>
                    ) : isLowStock ? (
                      <div className="absolute inset-x-0 bottom-0 bg-amber-500/90 backdrop-blur-xs py-0.5 text-center text-[10px] font-black text-white">
                        ជិតអស់ស្តុក (នៅសល់តែ {stock})
                      </div>
                    ) : null}
                  </div>

                  {/* Card Body */}
                  <div className="flex flex-1 flex-col p-3 sm:p-3.5 space-y-2">
                    {/* Title & SKU */}
                    <div>
                      <h3
                        className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition"
                        title={product.name}
                      >
                        {product.name}
                      </h3>
                      <div className="mt-0.5 flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500">
                        <span>SKU: {product.sku || '—'}</span>
                        {product.barcode && <span>• Barcode: {product.barcode}</span>}
                      </div>
                    </div>

                    {/* Pricing & Financials */}
                    <div className="mt-auto rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">តម្លៃលក់</p>
                          <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(product.price)}
                          </p>
                        </div>
                        {product.costPrice != null && Number(product.costPrice) > 0 && (
                          <div className="text-right">
                            <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">ថ្លៃដើម</p>
                            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                              {formatCurrency(product.costPrice)}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Stock Level Bar */}
                      <div className="mt-2 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-500 dark:text-slate-400 font-medium">ចំនួនក្នុងស្តុក:</span>
                          <span
                            className={`font-black ${
                              isOutOfStock
                                ? 'text-rose-600 dark:text-rose-400'
                                : isLowStock
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-slate-700 dark:text-slate-200'
                            }`}
                          >
                            {stock} {stock <= 1 ? 'unit' : 'units'}
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isOutOfStock
                                ? 'bg-rose-500 w-0'
                                : isLowStock
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: isOutOfStock ? '0%' : `${Math.min(100, Math.max(12, (stock / 100) * 100))}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="border-t border-slate-100 dark:border-slate-800 p-2 sm:p-2.5 bg-slate-50/60 dark:bg-slate-800/50 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEdit(product)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 px-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs transition hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 active:scale-95"
                    >
                      <Edit2 size={13} className="text-emerald-600 dark:text-emerald-400" />
                      <span>កែប្រែ</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(product)}
                      disabled={deletingId === product.id}
                      className="flex items-center justify-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 text-slate-400 hover:border-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 shadow-2xs transition active:scale-95 disabled:opacity-50"
                      title="លុបផលិតផល"
                    >
                      {deletingId === product.id ? (
                        <Loader2 size={15} className="animate-spin text-rose-600" />
                      ) : (
                        <Trash2 size={15} />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Product Table View */}
        {!loading && !error && filteredProducts.length > 0 && viewMode === 'table' && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400">
                    <th className="py-3.5 px-4 font-semibold">ផលិតផល</th>
                    <th className="py-3.5 px-3 font-semibold">ប្រភេទ</th>
                    <th className="py-3.5 px-3 font-semibold">SKU / Barcode</th>
                    <th className="py-3.5 px-3 font-semibold text-right">តម្លៃលក់</th>
                    <th className="py-3.5 px-3 font-semibold text-right">ថ្លៃដើម</th>
                    <th className="py-3.5 px-3 font-semibold text-center">ស្តុក</th>
                    <th className="py-3.5 px-3 font-semibold text-center">ស្ថានភាព</th>
                    <th className="py-3.5 px-4 font-semibold text-right">សកម្មភាព</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredProducts.map((product) => {
                    const statusCfg = STATUS_CONFIG[product.status] || STATUS_CONFIG.ACTIVE;
                    const stock = product.stockQuantity ?? 0;
                    return (
                      <tr
                        key={product.id}
                        className="transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                              {product.imageUrl ? (
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                              ) : (
                                <Package size={16} className="text-slate-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white truncate max-w-xs">{product.name}</p>
                              {product.description && (
                                <p className="text-[11px] text-slate-400 truncate max-w-xs">{product.description}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          {product.category ? (
                            <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                              {product.category}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
                          <div>{product.sku || '—'}</div>
                          {product.barcode && <div className="text-[10px] text-slate-400">{product.barcode}</div>}
                        </td>
                        <td className="py-3 px-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(product.price)}
                        </td>
                        <td className="py-3 px-3 text-right text-slate-600 dark:text-slate-300 font-medium">
                          {product.costPrice != null && Number(product.costPrice) > 0 ? formatCurrency(product.costPrice) : '—'}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-xs font-black ${
                              stock <= 0
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                                : stock <= 10
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                            }`}
                          >
                            {stock}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusCfg.badge}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                            <span>{product.status || 'ACTIVE'}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEdit(product)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-slate-800 dark:hover:text-emerald-400 transition active:scale-95"
                              title="កែប្រែ"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(product)}
                              disabled={deletingId === product.id}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-slate-800 dark:hover:text-rose-400 transition active:scale-95 disabled:opacity-50"
                              title="លុប"
                            >
                              {deletingId === product.id ? <Loader2 size={15} className="animate-spin text-rose-600" /> : <Trash2 size={15} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination Bar */}
        {!loading && !error && totalPages > 1 && (
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-2xs">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              ទំព័រ <strong className="text-slate-800 dark:text-slate-200">{page + 1}</strong> នៃ <strong>{totalPages}</strong> (សរុប {totalElements} ផលិតផល)
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(0)}
                disabled={page <= 0}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40"
              >
                ដំបូង
              </button>
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page <= 0}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40"
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
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40"
                title="ទំព័របន្ទាប់"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => setPage(totalPages - 1)}
                disabled={page >= totalPages - 1}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40"
              >
                ចុងក្រោយ
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Category Manager Modal */}
      {categoryModalOpen && (
        <CategoryManagerModal onClose={() => {
          setCategoryModalOpen(false);
          reloadCategories();
        }} />
      )}

      {/* Product Form Modal */}
      {modalOpen && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}