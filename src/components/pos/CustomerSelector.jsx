import { useState, useMemo, useEffect } from 'react';
import { User, ChevronDown, Search, Plus, Loader2, X } from 'lucide-react';
import { useCustomers } from '../../hooks/useCustomers';
import { customerApi } from '../../api/customerApi';
import { getErrorMessage } from '../../api/client';

function NewCustomerModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const created = await customerApi.create(form);
      onCreated(created);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-slate-300 bg-ink-950 px-3.5 py-2 text-sm text-slate-900 shadow-sm ' +
    'transition placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in"
      onClick={() => !saving && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-slate-300 bg-ink-900 p-6 shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h3 className="text-lg font-bold text-slate-900">អតិថិជនថ្មី</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-emerald-50 hover:text-slate-900">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">ឈ្មោះ *</label>
            <input required value={form.name} onChange={set('name')} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">លេខទូរស័ព្ទ</label>
            <input value={form.phone} onChange={set('phone')} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">អ៊ីមែល</label>
            <input type="email" value={form.email} onChange={set('email')} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">អាសយដ្ឋាន</label>
            <input value={form.address} onChange={set('address')} className={inputClass} />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:from-emerald-500 hover:to-emerald-500 disabled:opacity-60"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            រក្សាទុក
          </button>
        </form>
      </div>
    </div>
  );
}

export default function CustomerSelector({ selectedCustomer, onSelect }) {
  const { customers, loading, reload } = useCustomers();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [walkInFailed, setWalkInFailed] = useState(false);

  // អតិថិជនលំនាំដើម = walk-in ពី GET /api/v1/customers/walk-in ដោយផ្ទាល់
  // (endpoint ជាក់លាក់សម្រាប់ករណីនេះ - ជឿជាក់ជាងការស្វែងរកឈ្មោះ "walk-in"
  // ក្នុងបញ្ជីទូទៅ ដែលបរាជ័យស្ងាត់ៗបើបញ្ជីទទេ ឬឈ្មោះមិនផ្គូផ្គង)។
  useEffect(() => {
    if (selectedCustomer) return;
    let cancelled = false;
    customerApi.getWalkIn()
      .then((walkIn) => {
        if (!cancelled && walkIn) onSelect(walkIn);
      })
      .catch(() => {
        if (!cancelled) setWalkInFailed(true);
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fallback ទៅ customer ដំបូងក្នុងបញ្ជីទូទៅ បើ walk-in endpoint បរាជ័យ
  useEffect(() => {
    if (selectedCustomer || !walkInFailed || customers.length === 0) return;
    onSelect(customers[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walkInFailed, customers, selectedCustomer]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) => c.name?.toLowerCase().includes(q) || c.phone?.toLowerCase().includes(q)
    );
  }, [customers, search]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-300 bg-ink-950 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm hover:border-emerald-500/40"
      >
        <span className="flex min-w-0 items-center gap-2">
          <User size={16} className="shrink-0 text-slate-500" />
          <span className="truncate">
            {loading ? 'កំពុងទាញយក...' : selectedCustomer?.name || 'ជ្រើសរើសអតិថិជន'}
          </span>
        </span>
        <ChevronDown size={16} className="shrink-0 text-slate-500" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 z-20 mt-2 max-h-80 overflow-hidden rounded-xl border border-slate-300 bg-ink-900 shadow-lg shadow-black/40">
            <div className="border-b border-slate-200 p-2">
              <div className="relative">
                <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ស្វែងរកអតិថិជន..."
                  className="w-full rounded-lg border border-slate-200 bg-ink-950 py-1.5 pl-8 pr-2 text-xs text-slate-900 placeholder:text-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="max-h-52 overflow-y-auto">
              {filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onSelect(c);
                    setOpen(false);
                  }}
                  className="flex w-full flex-col items-start px-3.5 py-2.5 text-left transition hover:bg-emerald-50"
                >
                  <span className="text-sm text-slate-700">{c.name}</span>
                  {c.phone && <span className="text-xs text-slate-500">{c.phone}</span>}
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="px-3.5 py-4 text-center text-xs text-slate-500">រកមិនឃើញអតិថិជនទេ</p>
              )}
            </div>

            <button
              onClick={() => {
                setOpen(false);
                setShowNew(true);
              }}
              className="flex w-full items-center gap-2 border-t border-slate-200 px-3.5 py-2.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50"
            >
              <Plus size={15} />
              អតិថិជនថ្មី
            </button>
          </div>
        </>
      )}

      {showNew && (
        <NewCustomerModal
          onClose={() => setShowNew(false)}
          onCreated={(created) => {
            reload();
            onSelect(created);
            setShowNew(false);
          }}
        />
      )}
    </div>
  );
}
