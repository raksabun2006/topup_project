import { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle, ImageOff, Package, Plus, Check } from 'lucide-react';
import { adminProductApi } from '../../api/adminProductApi';
import { categoryApi } from '../../api/categoryApi';
import { getErrorMessage } from '../../api/client';
import { useCategories } from '../../hooks/useCategories';

const STATUS_OPTIONS = ['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED'];

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

  const handleCreateCategory = async (e) => {
    e.preventDefault();
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

  const inputClass =
    'w-full rounded-xl border border-slate-300 bg-ink-950 px-3.5 py-2 text-sm text-slate-900 shadow-sm ' +
    'transition placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500';
  const labelClass = 'mb-1 block text-xs font-medium text-slate-600';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in"
      onClick={() => !saving && onClose()}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-300 bg-ink-900 shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-900">{isEdit ? 'កែប្រែផលិតផល' : 'ផលិតផលថ្មី'}</h3>
          <button onClick={onClose} disabled={saving} className="rounded-lg p-1.5 text-slate-500 hover:bg-emerald-50 hover:text-slate-900">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto px-6 py-5">
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className={labelClass}>ឈ្មោះផលិតផល *</label>
              <input required value={form.name} onChange={set('name')} className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>SKU *</label>
                <input required value={form.sku} onChange={set('sku')} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Barcode</label>
                <input value={form.barcode} onChange={set('barcode')} className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>ការពិពណ៌នា</label>
              <textarea rows={2} value={form.description} onChange={set('description')} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>តំណភ្ជាប់រូបភាព (Image URL)</label>
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-300 bg-ink-950">
                  {form.imageUrl && !imageBroken ? (
                    <img
                      src={form.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={() => setImageBroken(true)}
                    />
                  ) : imageBroken ? (
                    <ImageOff size={20} className="text-slate-500" />
                  ) : (
                    <Package size={20} className="text-slate-500" />
                  )}
                </div>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={set('imageUrl')}
                  placeholder="https://example.com/product.png"
                  className={inputClass}
                />
              </div>
              {imageBroken && (
                <p className="mt-1.5 text-xs text-amber-700">មិនអាចផ្ទុករូបភាពពីតំណភ្ជាប់នេះទេ</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>តម្លៃលក់ *</label>
                <input required type="number" min="0" step="0.01" value={form.price} onChange={set('price')} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>តម្លៃដើម</label>
                <input type="number" min="0" step="0.01" value={form.costPrice} onChange={set('costPrice')} className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>ស្តុក *</label>
                <input required type="number" min="0" step="1" value={form.stockQuantity} onChange={set('stockQuantity')} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>ស្ថានភាព *</label>
                <select required value={form.status} onChange={set('status')} className={inputClass}>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>ប្រភេទ</label>
              <div className="flex items-center gap-2">
                <select value={form.category} onChange={set('category')} className={inputClass}>
                  <option value="">ជ្រើសរើសប្រភេទ</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                  {form.category && !categories.some((c) => c.name === form.category) && (
                    <option value={form.category}>{form.category}</option>
                  )}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewCategory((v) => !v)}
                  title="បន្ថែមប្រភេទថ្មី"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-ink-950 text-slate-500 transition hover:border-emerald-500/40 hover:text-emerald-700"
                >
                  <Plus size={18} />
                </button>
              </div>

              {showNewCategory && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    autoFocus
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="ឈ្មោះប្រភេទថ្មី"
                    className={inputClass}
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
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingCategory ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowNewCategory(false); setNewCategoryName(''); setCategoryError(''); }}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-300 text-slate-500 hover:text-slate-900"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              {categoryError && <p className="mt-1.5 text-xs text-rose-700">{categoryError}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:from-emerald-500 hover:to-emerald-500 disabled:opacity-60"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            រក្សាទុក
          </button>
        </form>
      </div>
    </div>
  );
}
