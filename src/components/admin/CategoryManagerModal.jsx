import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, AlertCircle, Trash2, Plus, Tags, Sparkles, Check } from 'lucide-react';
import { categoryApi } from '../../api/categoryApi';
import { getErrorMessage } from '../../api/client';
import { useCategories } from '../../hooks/useCategories';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { DEFAULT_CATEGORIES } from '../../constants/categories';

export default function CategoryManagerModal({ onClose }) {
  const { categories, loading, error, reload } = useCategories();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const handleCreate = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    setFormError('');
    try {
      await categoryApi.create({ name: trimmed });
      setName('');
      reload();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleSeedDefaults = async () => {
    setSeeding(true);
    setFormError('');
    try {
      const existingNames = new Set(categories.map((c) => (c.name || '').toLowerCase()));
      for (const cat of DEFAULT_CATEGORIES) {
        if (!existingNames.has(cat.name.toLowerCase())) {
          try {
            await categoryApi.create({ name: cat.name });
          } catch {
            // continue next
          }
        }
      }
      setSeedSuccess(true);
      setTimeout(() => setSeedSuccess(false), 3000);
      reload();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSeeding(false);
    }
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Are you sure you want to delete "${category.name}"?`)) return;
    setDeletingId(category.id);
    try {
      if (category.id) {
        await categoryApi.delete(category.id);
      }
      reload();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white shadow-sm ' +
    'transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500';

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex flex-col justify-end sm:justify-center sm:items-center bg-black/75 p-0 sm:p-4 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[85dvh] sm:max-h-[85vh] flex flex-col overflow-hidden rounded-t-3xl sm:rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl animate-slide-up sm:animate-scale-in pb-safe sm:pb-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle bar */}
        <div className="w-10 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4 py-3 sm:px-6 sm:py-3.5">
          <h3 className="flex items-center gap-2 text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            <Tags size={18} className="text-emerald-600 dark:text-emerald-400" />
            Manage Categories
          </h3>
          <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleCreate} className="shrink-0 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3.5">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New category name..."
            className={inputClass}
          />
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={18} />}
          </button>
        </form>
        {formError && (
          <p className="shrink-0 px-4 sm:px-6 py-2 text-xs text-rose-700 dark:text-rose-400">{formError}</p>
        )}

        <div className="flex items-center justify-between px-4 sm:px-6 py-2 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200/60 dark:border-slate-800 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            {categories.length} Categories
          </span>
          <button
            type="button"
            onClick={handleSeedDefaults}
            disabled={seeding}
            className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer disabled:opacity-50"
          >
            {seeding ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Importing...</span>
              </>
            ) : seedSuccess ? (
              <>
                <Check size={13} />
                <span>Imported!</span>
              </>
            ) : (
              <>
                <Sparkles size={13} />
                <span>Import 19 Categories</span>
              </>
            )}
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2 touch-scroll">
          {loading && (
            <div className="flex justify-center py-8 text-emerald-600">
              <Loader2 size={24} className="animate-spin" />
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <AlertCircle size={24} className="text-rose-700 dark:text-rose-400" />
              <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
            </div>
          )}

          {!loading && !error && categories.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">No categories found.</p>
          )}

          {!loading && !error && categories.map((category) => {
            const catName = category.name || category;
            const Icon = getCategoryIcon(catName);

            return (
              <div
                key={category.id || catName}
                className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <Icon size={14} />
                  </div>
                  <span className="truncate font-semibold text-xs sm:text-sm">{catName}</span>
                </div>
                {category.id && (
                  <button
                    onClick={() => handleDelete(category)}
                    disabled={deletingId === category.id}
                    title="Delete"
                    className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-700 dark:hover:text-rose-400 disabled:opacity-50 cursor-pointer"
                  >
                    {deletingId === category.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
}

