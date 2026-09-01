import { useState, useEffect } from 'react';
import {
  X, Loader2, AlertCircle, ImageOff, Package, Plus, Check,
  Sparkles, CheckCircle2
} from 'lucide-react';
import { adminProductApi } from '../../api/adminProductApi';
import { categoryApi } from '../../api/categoryApi';
import { getErrorMessage } from '../../api/client';
import { useCategories } from '../../hooks/useCategories';

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'សកម្ម (Active)' },
  { value: 'DRAFT', label: 'ព្រាង (Draft)' },
  { value: 'INACTIVE', label: 'អសកម្ម (Inactive)' },
  { value: 'ARCHIVED', label: 'ទុកក្នុងប័ណ្ណសារ (Archived)' },
];

const EMPTY = {
  sku: '', barcode: '', name: '', description: '', imageUrl: '',
  price: '', costPrice: '', stockQuantity: '', category: '', status: 'ACTIVE',
};

function toFormState(product) {
  if (!product) return EMPTY;
  return {
    sku: product.sku ?? '',
    barcode: product.barcode ?? '',
    name: product.name ?? '',
    description: product.description ?? '',
    imageUrl: product.imageUrl ?? '',
    price: product.price ?? '',
    costPrice: product.costPrice ?? '',
    stockQuantity: product.stockQuantity ?? '',
    category: product.category ?? '',
    status: product.status ?? 'ACTIVE',
  };
}

export default function ProductFormModal({ product, onClose, onSaved }) {
  const isEdit = !!product;
  const [form, setForm] = useState(() => toFormState(product));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [imageBroken, setImageBroken] = useState(false);
  const { categories, reload: reloadCategories } = useCategories();

  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [savingCategory, setSavingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState('');

  useEffect(() => {
    setForm(toFormState(product));
    setError('');
    setImageBroken(false);
  }, [product]);

  const handleGenerateSku = () => {
    const prefix = (form.name ? form.name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '') : 'PRD') || 'PRD';
    const rand = Math.floor(100000 + Math.random() * 900000);
    setForm((prev) => ({ ...prev, sku: `${prefix}-${rand}` }));
  };

  const handleCreateCategory = async (e) => {
    e?.preventDefault();
    const name = newCategoryName.trim();
    if (!name) return;
    setSavingCategory(true);
    setCategoryError('');
    try {
      const created = await categoryApi.create({ name });
      await reloadCategories();
      setForm((prev) => ({ ...prev, category: created.name }));
      setNewCategoryName('');
      setShowNewCategory(false);
    } catch (err) {
      setCategoryError(getErrorMessage(err));
    } finally {
      setSavingCategory(false);
    }
  };

  const set = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    if (key === 'imageUrl') setImageBroken(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      sku: form.sku.trim(),
      barcode: form.barcode.trim() || undefined,
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      imageUrl: form.imageUrl.trim() || undefined,
      price: Number(form.price),
      costPrice: form.costPrice === '' ? undefined : Number(form.costPrice),
      stockQuantity: Number(form.stockQuantity),
      category: form.category.trim() || undefined,
      status: form.status,
    };

    try {
      const saved = isEdit
        ? await adminProductApi.update(product.id, payload)
        : await adminProductApi.create(payload);
      onSaved(saved);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={() => !saving && onClose()}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-3.5 bg-slate-50/60 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Package size={20} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {isEdit ? 'កែប្រែផលិតផល' : 'បន្ថែមផលិតផលថ្មី'}
              </h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                {isEdit ? `ID: #${product.id}` : 'បំពេញព័ត៌មានខាងក្រោមដើម្បីបង្កើតផលិតផល'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-50 dark:bg-rose-950/30 p-3 text-xs text-rose-700 dark:text-rose-400 animate-fade-in">
              <AlertCircle size={15} className="mt-0.5 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Product Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              ឈ្មោះផលិតផល <span className="text-rose-500">*</span>
            </label>
            <input
              required
              value={form.name}
              onChange={set('name')}
              placeholder="ឧ. Coca Cola 330ml, កាហ្វេទឹកដោះគោ..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
            />
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  ប្រភេទ (Category)
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewCategory((v) => !v)}
                  className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-0.5"
                >
                  <Plus size={10} />
                  <span>ប្រភេទថ្មី</span>
                </button>
              </div>

              {!showNewCategory ? (
                <select
                  value={form.category}
                  onChange={set('category')}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition cursor-pointer"
                >
                  <option value="">ជ្រើសរើសប្រភេទ (None)</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                  {form.category && !categories.some((c) => c.name === form.category) && (
                    <option value={form.category}>{form.category}</option>
                  )}
                </select>
              ) : (
                <div className="flex items-center gap-1">
                  <input
                    autoFocus
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="ឈ្មោះប្រភេទថ្មី..."
                    className="flex-1 rounded-xl border border-emerald-500 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCreateCategory(e);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    disabled={savingCategory || !newCategoryName.trim()}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition disabled:opacity-50"
                  >
                    {savingCategory ? <Loader2 size={12} className="animate-spin" /> : <Check size={13} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowNewCategory(false); setNewCategoryName(''); setCategoryError(''); }}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-300 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X size={13} />
                  </button>
                </div>
              )}
              {categoryError && <p className="mt-1 text-[10px] text-rose-600 dark:text-rose-400">{categoryError}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                ស្ថានភាព (Status) <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={form.status}
                onChange={set('status')}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition cursor-pointer font-medium"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                តម្លៃលក់ ($) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">$</span>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={set('price')}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-6 pr-2.5 py-2 text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                តម្លៃដើម ($)
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.costPrice}
                  onChange={set('costPrice')}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-6 pr-2.5 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                ស្តុក (Units) <span className="text-rose-500">*</span>
              </label>
              <input
                required
                type="number"
                min="0"
                step="1"
                value={form.stockQuantity}
                onChange={set('stockQuantity')}
                placeholder="0"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
              />
            </div>
          </div>

          {/* SKU & Barcode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  SKU <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleGenerateSku}
                  className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-0.5"
                >
                  <Sparkles size={10} />
                  <span>បង្កើត SKU</span>
                </button>
              </div>
              <input
                required
                value={form.sku}
                onChange={set('sku')}
                placeholder="PRD-00123"
                className="w-full font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white uppercase focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Barcode (បាកូដ)
              </label>
              <input
                value={form.barcode}
                onChange={set('barcode')}
                placeholder="8851234567890"
                className="w-full font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
              />
            </div>
          </div>

          {/* Image URL with compact thumbnail */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              តំណភ្ជាប់រូបភាព (Image URL)
            </label>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                {form.imageUrl && !imageBroken ? (
                  <img
                    src={form.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={() => setImageBroken(true)}
                  />
                ) : imageBroken ? (
                  <ImageOff size={16} className="text-amber-500" />
                ) : (
                  <Package size={16} className="text-slate-400" />
                )}
              </div>
              <input
                type="url"
                value={form.imageUrl}
                onChange={set('imageUrl')}
                placeholder="https://example.com/product.png"
                className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              ការពិពណ៌នា (Description)
            </label>
            <textarea
              rows={2}
              value={form.description}
              onChange={set('description')}
              placeholder="ព័ត៌មានបន្ថែមពីផលិតផល..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition resize-none"
            />
          </div>
        </form>

        {/* Modal Action Footer */}
        <div className="shrink-0 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 px-5 py-3 bg-slate-50/60 dark:bg-slate-800/40">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            បោះបង់ (Cancel)
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || !form.name.trim() || !form.sku.trim() || !form.price || form.stockQuantity === ''}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/25 transition hover:bg-emerald-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            <span>{isEdit ? 'រក្សាទុកការកែប្រែ' : 'រក្សាទុកផលិតផល'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
