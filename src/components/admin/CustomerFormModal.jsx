import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, AlertCircle, User, CheckCircle2 } from 'lucide-react';
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
    'w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white shadow-xs ' +
    'transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500';
  const labelClass = 'mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300';

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex flex-col justify-end sm:justify-center sm:items-center bg-black/75 p-0 sm:p-4 backdrop-blur-xs animate-fade-in"
      onClick={() => !saving && onClose()}
    >
      <div
        className="w-full max-w-md max-h-[85dvh] sm:max-h-[85vh] flex flex-col overflow-hidden rounded-t-3xl sm:rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl animate-slide-up sm:animate-scale-in pb-safe sm:pb-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle bar */}
        <div className="w-10 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4 py-3 sm:px-6 sm:py-3.5">
          <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
            <User size={18} className="text-emerald-600 dark:text-emerald-400" />
            <span>{isEdit ? 'កែប្រែព័ត៌មានអតិថិជន' : 'បន្ថែមអតិថិជនថ្មី'}</span>
          </h3>
          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form
          id="customer-form"
          onSubmit={handleSubmit}
          className="flex-1 min-h-0 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 space-y-3.5 touch-scroll"
        >
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-50 dark:bg-rose-950/30 p-3 text-xs sm:text-sm text-rose-700 dark:text-rose-400">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className={labelClass}>
              ឈ្មោះអតិថិជន <span className="text-rose-500">*</span>
            </label>
            <input required value={form.name} onChange={set('name')} placeholder="ឧ. សុខ សាន" className={inputClass} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>លេខទូរស័ព្ទ</label>
              <input value={form.phone} onChange={set('phone')} placeholder="012 345 678" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>អ៊ីមែល</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="example@mail.com" className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>អាសយដ្ឋាន</label>
            <input value={form.address} onChange={set('address')} placeholder="ភ្នំពេញ, កម្ពុជា" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>ពិន្ទុភក្ដីភាព (Loyalty Points)</label>
            <input type="number" min="0" step="1" value={form.loyaltyPoint} onChange={set('loyaltyPoint')} className={inputClass} />
          </div>
        </form>

        {/* Modal Action Footer - Always visible and pinned above screen edge */}
        <div className="shrink-0 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800 px-4 py-3 sm:px-5 sm:py-3.5 bg-slate-50/95 dark:bg-slate-800/95 backdrop-blur-xs pb-safe sm:pb-3.5">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 sm:flex-initial rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            បោះបង់ (Cancel)
          </button>

          <button
            type="submit"
            form="customer-form"
            disabled={saving || !form.name.trim()}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-600/30 transition hover:from-emerald-500 hover:to-teal-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={15} />}
            <span>{isEdit ? 'រក្សាទុកការកែប្រែ' : 'ចុះឈ្មោះអតិថិជន'}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

