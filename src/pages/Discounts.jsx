import { useState, useMemo } from 'react';
import {
  Tag, Plus, Search, Filter, RefreshCw, Edit3, Trash2, CheckCircle2,
  XCircle, AlertCircle, Percent, DollarSign, Calendar, Clock,
  ArrowRight, ShieldCheck, Copy, Check, Sparkles, X, ChevronRight
} from 'lucide-react';
import { useAdminDiscounts } from '../hooks/useDiscounts';
import { formatCurrency, formatDate } from '../utils/format';
import SEO from '../components/SEO';

export default function Discounts() {
  const {
    discounts,
    loading,
    error,
    reload,
    createDiscount,
    updateDiscount,
    deleteDiscount,
    updateDiscountStatus,
  } = useAdminDiscounts();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [copiedCode, setCopiedCode] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'PERCENTAGE', // 'PERCENTAGE' or 'FIXED_AMOUNT'
    value: '',
    minSpend: '',
    maxDiscount: '',
    usageLimit: '',
    startDate: '',
    endDate: '',
    status: 'ACTIVE',
  });

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleOpenCreateModal = () => {
    setEditingDiscount(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      type: 'PERCENTAGE',
      value: '',
      minSpend: '',
      maxDiscount: '',
      usageLimit: '',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: '',
      status: 'ACTIVE',
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingDiscount(item);
    setFormData({
      code: item.code || '',
      name: item.name || '',
      description: item.description || '',
      type: item.type || item.discountType || 'PERCENTAGE',
      value: item.value || item.amount || item.percentage || '',
      minSpend: item.minSpend || item.minOrderAmount || '',
      maxDiscount: item.maxDiscount || item.maxDiscountAmount || '',
      usageLimit: item.usageLimit || item.maxUses || '',
      startDate: item.startDate ? item.startDate.slice(0, 10) : '',
      endDate: item.endDate ? item.endDate.slice(0, 10) : '',
      status: item.status || 'ACTIVE',
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setModalError('Please enter a promotion name.');
      return;
    }
    if (!formData.value || Number(formData.value) <= 0) {
      setModalError('Please enter a valid discount value.');
      return;
    }

    setSaving(true);
    setModalError('');

    try {
      const payload = {
        code: formData.code.trim().toUpperCase() || undefined,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        type: formData.type,
        value: Number(formData.value),
        minSpend: formData.minSpend ? Number(formData.minSpend) : 0,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
        startDate: formData.startDate ? `${formData.startDate}T00:00:00Z` : undefined,
        endDate: formData.endDate ? `${formData.endDate}T23:59:59Z` : undefined,
        status: formData.status,
      };

      if (editingDiscount) {
        await updateDiscount(editingDiscount.id, payload);
      } else {
        await createDiscount(payload);
      }
      setIsModalOpen(false);
    } catch (err) {
      setModalError(err?.message || 'Failed to save promotion.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await deleteDiscount(deletingId);
      setDeletingId(null);
    } catch (err) {
      alert(err?.message || 'Failed to delete promotion');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (item) => {
    const nextStatus = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await updateDiscountStatus(item.id, nextStatus);
    } catch (err) {
      alert(err?.message || 'Failed to update status');
    }
  };

  // Filtered List
  const filteredDiscounts = useMemo(() => {
    return discounts.filter((item) => {
      const matchSearch =
        !search.trim() ||
        item.name?.toLowerCase().includes(search.toLowerCase().trim()) ||
        item.code?.toLowerCase().includes(search.toLowerCase().trim()) ||
        item.description?.toLowerCase().includes(search.toLowerCase().trim());

      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && item.status === 'ACTIVE') ||
        (statusFilter === 'INACTIVE' && item.status !== 'ACTIVE');

      const matchType =
        typeFilter === 'ALL' ||
        item.type === typeFilter ||
        item.discountType === typeFilter;

      return matchSearch && matchStatus && matchType;
    });
  }, [discounts, search, statusFilter, typeFilter]);

  const activeCount = useMemo(
    () => discounts.filter((d) => d.status === 'ACTIVE').length,
    [discounts]
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <SEO title="Promotions & Discounts Management | Admin" canonical="/dashboard/discounts" />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40 shadow-xs">
            <Tag size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Promotions &amp; Discounts
              </h1>
              <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-xs font-black text-emerald-700 dark:text-emerald-300">
                {activeCount} Active
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Manage authoritative store promotions, coupon codes, and automatic cart discounts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={reload}
            disabled={loading}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition cursor-pointer"
            title="Refresh promotions"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-xs font-black shadow-md shadow-emerald-500/20 transition active:scale-95 cursor-pointer"
          >
            <Plus size={15} />
            <span>Create Promotion</span>
          </button>
        </div>
      </div>

      {/* Error alert if any */}
      {error && (
        <div className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 p-4 flex items-center justify-between gap-3 text-rose-700 dark:text-rose-300 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={reload}
            className="underline font-bold hover:text-rose-900 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by code, promotion name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 py-2 pl-9 pr-4 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 px-3 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 px-3 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Types</option>
            <option value="PERCENTAGE">Percentage (%)</option>
            <option value="FIXED_AMOUNT">Fixed Amount ($)</option>
          </select>
        </div>
      </div>

      {/* Promotions List Grid */}
      {loading && discounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-3">
          <RefreshCw size={28} className="animate-spin text-emerald-600" />
          <p className="text-xs font-bold text-slate-500">Loading authoritative discounts...</p>
        </div>
      ) : filteredDiscounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center space-y-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
            <Tag size={28} />
          </div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">No Promotions Found</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            {search || statusFilter !== 'ALL' || typeFilter !== 'ALL'
              ? 'No promotions match your current filter criteria.'
              : 'Create your first store promotion or coupon code to attract customers.'}
          </p>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 text-white px-4 py-2 text-xs font-bold shadow-xs hover:bg-emerald-700 transition"
          >
            <Plus size={14} />
            <span>Add Promotion</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDiscounts.map((item) => {
            const isActive = item.status === 'ACTIVE';
            const isPercentage = item.type === 'PERCENTAGE' || item.discountType === 'PERCENTAGE';
            const valueDisplay = isPercentage ? `${item.value || item.percentage || 0}%` : formatCurrency(item.value || item.amount || 0);

            return (
              <div
                key={item.id}
                className={`relative flex flex-col justify-between rounded-3xl border transition-all duration-300 p-5 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-md ${
                  isActive
                    ? 'border-slate-200/80 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800'
                    : 'border-slate-200/60 dark:border-slate-800/60 opacity-75'
                }`}
              >
                {/* Card Top: Code & Status */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    {item.code ? (
                      <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl px-2.5 py-1">
                        <span className="font-mono text-xs font-black tracking-wider text-slate-900 dark:text-white uppercase">
                          {item.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(item.code)}
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                          title="Copy promotion code"
                        >
                          {copiedCode === item.code ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        </button>
                      </div>
                    ) : (
                      <span className="inline-block bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40 rounded-xl px-2.5 py-1 text-[10px] font-black uppercase">
                        Automatic Discount
                      </span>
                    )}

                    {/* Status Pill Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black cursor-pointer transition ${
                        isActive
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                      }`}
                      title="Click to toggle status"
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      <span>{isActive ? 'ACTIVE' : 'INACTIVE'}</span>
                    </button>
                  </div>

                  {/* Title & Value Highlight */}
                  <div>
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                        {item.name}
                      </h3>
                      <span className="text-lg font-black text-rose-600 dark:text-rose-400 shrink-0">
                        {valueDisplay} OFF
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-2 mt-1">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Middle: Terms & Rules */}
                <div className="py-3 my-3 border-y border-slate-100 dark:border-slate-800/80 space-y-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {item.minSpend != null && Number(item.minSpend) > 0 && (
                    <div className="flex items-center justify-between">
                      <span>Min Spend:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{formatCurrency(item.minSpend)}</span>
                    </div>
                  )}
                  {item.maxDiscount != null && Number(item.maxDiscount) > 0 && (
                    <div className="flex items-center justify-between">
                      <span>Max Discount:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{formatCurrency(item.maxDiscount)}</span>
                    </div>
                  )}
                  {(item.startDate || item.endDate) && (
                    <div className="flex items-center justify-between">
                      <span>Validity:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {item.startDate ? formatDate(item.startDate) : 'Now'} - {item.endDate ? formatDate(item.endDate) : 'Forever'}
                      </span>
                    </div>
                  )}
                  {item.usageLimit != null && (
                    <div className="flex items-center justify-between">
                      <span>Usage:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {item.usedCount || 0} / {item.usageLimit} uses
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Bottom: Actions */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400 font-medium">
                    ID: #{item.id}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(item)}
                      className="inline-flex items-center gap-1 rounded-xl p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                      title="Edit promotion"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingId(item.id)}
                      className="inline-flex items-center gap-1 rounded-xl p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 transition cursor-pointer"
                      title="Delete promotion"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border border-emerald-100 dark:border-emerald-900/40">
                  <Tag size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                    {editingDiscount ? 'Edit Promotion' : 'Create Promotion'}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {editingDiscount ? `Updating #${editingDiscount.id}` : 'Create a new backend discount'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 p-3 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Promotion Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Summer Flash Sale"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 px-3 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Coupon Code (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SUMMER20"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 px-3 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 px-3 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Amount ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Discount Value * {formData.type === 'PERCENTAGE' ? '(%)' : '($)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder={formData.type === 'PERCENTAGE' ? '20' : '5.00'}
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 px-3 text-xs font-black text-rose-600 dark:text-rose-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Promotion terms or short description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 px-3 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Min Order Spend ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.minSpend}
                    onChange={(e) => setFormData({ ...formData, minSpend: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 px-3 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Max Discount Cap ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Optional max cap"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 px-3 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 px-3 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 px-3 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Usage Limit (Max Uses)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 100"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 px-3 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 px-3 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 text-xs font-black shadow-md shadow-emerald-500/25 transition active:scale-95 disabled:opacity-50"
                >
                  {saving && <RefreshCw size={13} className="animate-spin" />}
                  <span>{editingDiscount ? 'Update Promotion' : 'Create Promotion'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mx-auto">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">Delete Promotion</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete this promotion? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 text-xs font-bold shadow-md shadow-rose-500/20 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
