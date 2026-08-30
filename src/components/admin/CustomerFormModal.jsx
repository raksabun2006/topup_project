import { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { customerApi } from '../../api/customerApi';
import { getErrorMessage } from '../../api/client';

const EMPTY = { name: '', phone: '', email: '', address: '', loyaltyPoint: '0' };

function toFormState(customer) {
  if (!customer) return EMPTY;
  return {
    name: customer.name ?? '',
    phone: customer.phone ?? '',
    email: customer.email ?? '',
    address: customer.address ?? '',
    loyaltyPoint: String(customer.loyaltyPoint ?? 0),
  };
}

export default function CustomerFormModal({ customer, onClose, onSaved }) {
  const isEdit = !!customer;
  const [form, setForm] = useState(() => toFormState(customer));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(toFormState(customer));
    setError('');
  }, [customer]);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim() || undefined,
      email: form.email.trim() || undefined,
      address: form.address.trim() || undefined,
      loyaltyPoint: Number(form.loyaltyPoint) || 0,
    };

    try {
      const saved = isEdit
        ? await customerApi.update(customer.id, payload)
        : await customerApi.create(payload);
      onSaved(saved);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white shadow-sm ' +
    'transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500';
  const labelClass = 'mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-sm animate-fade-in"
      onClick={() => !saving && onClose()}
    >
      <div
        className="w-full max-w-md max-h-[92dvh] flex flex-col overflow-hidden rounded-t-3xl sm:rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl animate-slide-up sm:animate-scale-in pb-safe sm:pb-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4 py-3.5 sm:px-6 sm:py-4">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{isEdit ? 'កែប្រែអតិថិជន' : 'អតិថិជនថ្មី'}</h3>
          <button onClick={onClose} disabled={saving} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-50 dark:bg-rose-950/30 p-3 text-xs sm:text-sm text-rose-700 dark:text-rose-400">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className={labelClass}>ឈ្មោះ *</label>
              <input required value={form.name} onChange={set('name')} className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>លេខទូរស័ព្ទ</label>
                <input value={form.phone} onChange={set('phone')} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>អ៊ីមែល</label>
                <input type="email" value={form.email} onChange={set('email')} className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>អាសយដ្ឋាន</label>
              <input value={form.address} onChange={set('address')} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>ពិន្ទុភក្ដីភាព</label>
              <input type="number" min="0" step="1" value={form.loyaltyPoint} onChange={set('loyaltyPoint')} className={inputClass} />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-500 disabled:opacity-60"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            រក្សាទុក
          </button>
        </form>
      </div>
    </div>
  );
}
