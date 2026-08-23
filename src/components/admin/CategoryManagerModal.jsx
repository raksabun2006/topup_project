import { useState } from 'react';
import { X, Loader2, AlertCircle, Trash2, Plus, Tags } from 'lucide-react';
import { categoryApi } from '../../api/categoryApi';
import { getErrorMessage } from '../../api/client';
import { useCategories } from '../../hooks/useCategories';

export default function CategoryManagerModal({ onClose }) {
  const { categories, loading, error, reload } = useCategories();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
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

  const handleDelete = async (category) => {
    if (!window.confirm(`តើអ្នកពិតជាចង់លុបប្រភេទ "${category.name}" មែនទេ?`)) return;
    setDeletingId(category.id);
    try {
      await categoryApi.delete(category.id);
      reload();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-slate-300 bg-ink-950 px-3.5 py-2 text-sm text-slate-900 shadow-sm ' +
    'transition placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-300 bg-ink-900 shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Tags size={18} className="text-emerald-600" />
            គ្រប់គ្រងប្រភេទ
          </h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-emerald-50 hover:text-slate-900">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleCreate} className="flex items-center gap-2 border-b border-slate-200 px-6 py-4">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ឈ្មោះប្រភេទថ្មី"
            className={inputClass}
          />
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={18} />}
          </button>
        </form>
        {formError && (
          <p className="-mt-2 px-6 pb-2 text-xs text-rose-700">{formError}</p>
        )}

        <div className="max-h-80 overflow-y-auto px-3 py-2">
          {loading && (
            <div className="flex justify-center py-8 text-emerald-600">
              <Loader2 size={24} className="animate-spin" />
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <AlertCircle size={24} className="text-rose-700" />
              <p className="text-sm text-rose-700">{error}</p>
            </div>
          )}

          {!loading && !error && categories.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">មិនទាន់មានប្រភេទនៅឡើយទេ</p>
          )}

          {!loading && !error && categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 hover:bg-emerald-50/60"
            >
              <span className="truncate">{category.name}</span>
              <button
                onClick={() => handleDelete(category)}
                disabled={deletingId === category.id}
                title="លុប"
                className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-700 disabled:opacity-50"
              >
                {deletingId === category.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
