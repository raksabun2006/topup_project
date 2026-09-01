import { useMemo, useState } from 'react';
import {
  Plus, Edit2, Trash2, Loader2, AlertCircle, RefreshCw,
  Users, Search, Star, Phone, Mail, Calendar, X,
  LayoutGrid, List, Award, Sparkles, UserCheck
} from 'lucide-react';
import { customerApi } from '../api/customerApi';
import { getErrorMessage } from '../api/client';
import { useCustomers } from '../hooks/useCustomers';
import { formatDate } from '../utils/format';
import CustomerFormModal from '../components/admin/CustomerFormModal';
import SEO from '../components/SEO';

export default function Customers() {
  const { customers, loading, error, reload } = useCustomers();
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('DEFAULT');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // KPIs
  const kpis = useMemo(() => {
    const total = customers.length;
    const totalPoints = customers.reduce((sum, c) => sum + (c.loyaltyPoint ?? 0), 0);
    const withPoints = customers.filter((c) => (c.loyaltyPoint ?? 0) > 0).length;
    const vipCount = customers.filter((c) => (c.loyaltyPoint ?? 0) >= 50).length;

    return {
      total,
      totalPoints,
      withPoints,
      vipCount,
      avgPoints: total > 0 ? (totalPoints / total).toFixed(1) : 0,
    };
  }, [customers]);

  // Filtered & Sorted Customers
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = customers.filter((c) => {
      const points = c.loyaltyPoint ?? 0;
      if (tierFilter === 'WITH_POINTS' && points <= 0) return false;
      if (tierFilter === 'VIP' && points < 50) return false;
      if (tierFilter === 'NO_POINTS' && points > 0) return false;

      if (!q) return true;
      return (
        c.name?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
      );
    });

    if (sortBy === 'NAME_ASC') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'POINTS_DESC') {
      result.sort((a, b) => (b.loyaltyPoint ?? 0) - (a.loyaltyPoint ?? 0));
    } else if (sortBy === 'POINTS_ASC') {
      result.sort((a, b) => (a.loyaltyPoint ?? 0) - (b.loyaltyPoint ?? 0));
    } else if (sortBy === 'DATE_DESC') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return result;
  }, [customers, search, tierFilter, sortBy]);

  const openCreate = () => {
    setEditingCustomer(null);
    setModalOpen(true);
  };

  const openEdit = (customer) => {
    setEditingCustomer(customer);
    setModalOpen(true);
  };

  const handleSaved = () => {
    setModalOpen(false);
    reload();
  };

  const handleDelete = async (customer) => {
    if (!window.confirm(`តើអ្នកពិតជាចង់លុបអតិថិជន "${customer.name}" មែនទេ?`)) return;
    setDeletingId(customer.id);
    try {
      await customerApi.delete(customer.id);
      reload();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setTierFilter('ALL');
    setSortBy('DEFAULT');
  };

  const hasActiveFilters = search || tierFilter !== 'ALL' || sortBy !== 'DEFAULT';

  return (
    <div className="space-y-5 animate-fade-in">
      <SEO
        title="គ្រប់គ្រងអតិថិជន (Customers) | Mart System"
        robots="noindex, nofollow"
      />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
            <Users size={22} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              គ្រប់គ្រងអតិថិជន (Customers)
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Dashboard / Customers — គ្រប់គ្រងបញ្ជីអតិថិជន ព័ត៌មានទំនាក់ទំនង និងពិន្ទុសន្សំ
            </p>
          </div>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:from-emerald-500 hover:to-emerald-600 active:scale-95"
        >
          <Plus size={17} />
          <span>អតិថិជនថ្មី</span>
        </button>
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {/* Total Customers */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">អតិថិជនសរុប</p>
            <p className="mt-1 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {loading ? '—' : kpis.total}
            </p>
            <p className="mt-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              {kpis.withPoints} នាក់មានពិន្ទុសន្សំ
            </p>
          </div>
          <div className="rounded-xl bg-emerald-500/10 dark:bg-emerald-950/50 p-2.5 text-emerald-600 dark:text-emerald-400">
            <Users size={22} />
          </div>
        </div>

        {/* Total Points */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">ពិន្ទុសន្សំបូកសរុប</p>
            <p className="mt-1 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {loading ? '—' : kpis.totalPoints.toLocaleString()}
            </p>
            <p className="mt-0.5 text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
              មធ្យម {kpis.avgPoints} ពិន្ទុ/នាក់
            </p>
          </div>
          <div className="rounded-xl bg-amber-500/10 dark:bg-amber-950/50 p-2.5 text-amber-600 dark:text-amber-400">
            <Award size={22} />
          </div>
        </div>

        {/* VIP Customers */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">អតិថិជន VIP (≥50pt)</p>
            <p className="mt-1 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {loading ? '—' : kpis.vipCount}
            </p>
            <p className="mt-0.5 text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
              អតិថិជនស្មោះត្រង់
            </p>
          </div>
          <div className="rounded-xl bg-purple-500/10 dark:bg-purple-950/50 p-2.5 text-purple-600 dark:text-purple-400">
            <Sparkles size={22} />
          </div>
        </div>

        {/* Active Ratio */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">អត្រាអតិថិជនសកម្ម</p>
            <p className="mt-1 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {kpis.total > 0 ? ((kpis.withPoints / kpis.total) * 100).toFixed(0) : 0}%
            </p>
            <p className="mt-0.5 text-[10px] text-sky-600 dark:text-sky-400 font-semibold">
              មានប្រតិបត្តិការសន្ំពិន្ទុ
            </p>
          </div>
          <div className="rounded-xl bg-sky-500/10 dark:bg-sky-950/50 p-2.5 text-sky-600 dark:text-sky-400">
            <UserCheck size={22} />
          </div>
        </div>
      </div>

      {/* Filter & Controls Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 sm:p-4 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ស្វែងរកឈ្មោះ, លេខទូរស័ព្ទ, អ៊ីមែល..."
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
            {/* Loyalty Tier Selector */}
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:border-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="ALL">ពិន្ទុទាំងអស់</option>
              <option value="WITH_POINTS">មានពិន្ទុ (&gt; 0)</option>
              <option value="VIP">កម្រិត VIP (≥ 50)</option>
              <option value="NO_POINTS">គ្មានពិន្ទុ (0)</option>
            </select>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:border-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="DEFAULT">តម្រៀប: លំនាំដើម</option>
              <option value="NAME_ASC">ឈ្មោះ: A - Z</option>
              <option value="POINTS_DESC">ពិន្ទុ: ច្រើន ទៅ តិច</option>
              <option value="POINTS_ASC">ពិន្ទុ: តិច ទៅ ច្រើន</option>
              <option value="DATE_DESC">ថ្ងៃចូលរួម: ថ្មីបំផុត</option>
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
              onClick={reload}
              disabled={loading}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition active:scale-95 disabled:opacity-50"
              title="ទាញយកឡើងវិញ"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin text-emerald-600' : ''} />
            </button>
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <p className="text-slate-500 dark:text-slate-400">
              បង្ហាញ <strong className="text-slate-800 dark:text-slate-200">{filtered.length}</strong> នៃ {customers.length} អតិថិជនដែលត្រូវនឹងលក្ខខណ្ឌ
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
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-44 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-3 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-4 w-3/4 rounded bg-slate-100 dark:bg-slate-800" />
                    <div className="h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-800" />
                  </div>
                </div>
                <div className="h-8 rounded-xl bg-slate-100 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 p-8 text-center animate-fade-in">
            <AlertCircle size={36} className="mx-auto mb-3 text-rose-600 dark:text-rose-400" />
            <p className="mb-4 text-sm font-semibold text-rose-700 dark:text-rose-300">{error}</p>
            <button
              onClick={reload}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-rose-500 active:scale-95"
            >
              <RefreshCw size={14} />
              ព្យាយាមម្តងទៀត
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center shadow-2xs animate-fade-in">
            <Users size={44} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">មិនមានអតិថិជនត្រូវនឹងលក្ខខណ្ឌនេះទេ</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {hasActiveFilters
                ? 'សូមព្យាយាមផ្លាស់ប្តូរពាក្យស្វែងរក ឬសម្អាតតម្រង'
                : 'បន្ថែមអតិថិជនដំបូងរបស់អ្នកទៅក្នុងប្រព័ន្ធ'}
            </p>
            <div className="mt-5 flex items-center justify-center gap-2.5">
              {hasActiveFilters ? (
                <button
                  onClick={resetFilters}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs transition hover:bg-slate-100"
                >
                  សម្អាតតម្រង
                </button>
              ) : (
                <button
                  onClick={openCreate}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/30 transition hover:bg-emerald-500"
                >
                  <Plus size={16} />
                  បន្ថែមអតិថិជនថ្មី
                </button>
              )}
            </div>
          </div>
        )}

        {/* Customer Cards Grid View */}
        {!loading && !error && filtered.length > 0 && viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4.5">
            {filtered.map((customer) => {
              const points = customer.loyaltyPoint ?? 0;
              const isVip = points >= 50;

              return (
                <div
                  key={customer.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs hover:shadow-xl hover:border-emerald-500/40 dark:hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div>
                    {/* Customer Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-base font-black text-white shadow-md shadow-emerald-600/20">
                          {customer.name?.charAt(0).toUpperCase() ?? '?'}
                          {isVip && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] text-slate-900 shadow-xs">
                              ★
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition" title={customer.name}>
                            {customer.name}
                          </h3>
                          <div className="flex items-center gap-1 text-[11px] text-slate-400">
                            <Calendar size={11} />
                            <span>{formatDate(customer.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Loyalty Points Pill */}
                      <span className="shrink-0 flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60 shadow-2xs">
                        <Star size={12} className="fill-amber-500 text-amber-500" />
                        <span>{points} pt</span>
                      </span>
                    </div>

                    {/* Contact Details */}
                    <div className="mt-3.5 space-y-1.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 p-2.5 border border-slate-100 dark:border-slate-800/80 text-xs">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Phone size={13} className="text-slate-400 shrink-0" />
                        <span className="truncate font-mono">{customer.phone || 'គ្មានលេខទូរស័ព្ទ'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Mail size={13} className="text-slate-400 shrink-0" />
                        <span className="truncate">{customer.email || 'គ្មានអ៊ីមែល'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEdit(customer)}
                      className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 px-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs transition hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 active:scale-95"
                    >
                      <Edit2 size={13} className="text-emerald-600 dark:text-emerald-400" />
                      <span>កែប្រែ</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(customer)}
                      disabled={deletingId === customer.id}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 text-slate-400 hover:border-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 shadow-2xs transition active:scale-95 disabled:opacity-50"
                      title="លុបអតិថិជន"
                    >
                      {deletingId === customer.id ? (
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

        {/* Customer Table View */}
        {!loading && !error && filtered.length > 0 && viewMode === 'table' && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400">
                    <th className="py-3.5 px-4 font-semibold">អតិថិជន</th>
                    <th className="py-3.5 px-3 font-semibold">លេខទូរស័ព្ទ</th>
                    <th className="py-3.5 px-3 font-semibold">អ៊ីមែល</th>
                    <th className="py-3.5 px-3 font-semibold text-center">ពិន្ទុសន្សំ</th>
                    <th className="py-3.5 px-3 font-semibold">កាលបរិច្ឆេទចូលរួម</th>
                    <th className="py-3.5 px-4 font-semibold text-right">សកម្មភាព</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.map((customer) => (
                    <tr
                      key={customer.id}
                      className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-xs font-black text-white shadow-xs">
                            {customer.name?.charAt(0).toUpperCase() ?? '?'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{customer.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">
                        {customer.phone || '—'}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                        {customer.email || '—'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60">
                          <Star size={12} className="fill-amber-500 text-amber-500" />
                          <span>{customer.loyaltyPoint ?? 0} pt</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                        {formatDate(customer.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(customer)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-slate-800 dark:hover:text-emerald-400 transition active:scale-95"
                            title="កែប្រែ"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(customer)}
                            disabled={deletingId === customer.id}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-slate-800 dark:hover:text-rose-400 transition active:scale-95 disabled:opacity-50"
                            title="លុប"
                          >
                            {deletingId === customer.id ? <Loader2 size={15} className="animate-spin text-rose-600" /> : <Trash2 size={15} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Customer Form Modal */}
      {modalOpen && (
        <CustomerFormModal
          customer={editingCustomer}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
