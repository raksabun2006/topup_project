import { useState, useMemo, useEffect } from 'react';
import { User, ChevronDown, Search, Plus, Loader2, X, Check } from 'lucide-react';
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
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs sm:text-sm text-slate-900 shadow-2xs ' +
    'transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in"
      onClick={() => !saving && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">បន្ថែមអតិថិជនថ្មី</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-3.5 space-y-3">
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-50 p-2.5 text-xs text-rose-700">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">ឈ្មោះ *</label>
            <input required value={form.name} onChange={set('name')} placeholder="ឈ្មោះអតិថិជន" className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">លេខទូរស័ព្ទ</label>
            <input value={form.phone} onChange={set('phone')} placeholder="012 345 678" className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">អ៊ីមែល</label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="example@mail.com" className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">អាសយដ្ឋាន</label>
            <input value={form.address} onChange={set('address')} placeholder="រាជធានីភ្នំពេញ" className={inputClass} />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-500 disabled:opacity-60"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            រក្សាទុកអតិថិជន
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
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-2xs hover:border-emerald-500/50 hover:bg-slate-50/50 transition active:scale-[0.99]"
      >
        <span className="flex min-w-0 items-center gap-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <User size={13} />
          </div>
          <span className="truncate">
            {loading ? 'កំពុងទាញយក...' : selectedCustomer?.name || 'ជ្រើសរើសអតិថិជន'}
          </span>
        </span>
        <div className="flex items-center gap-1">
          {selectedCustomer?.phone && (
            <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">
              {selectedCustomer.phone}
            </span>
          )}
          <ChevronDown size={14} className="shrink-0 text-slate-400" />
        </div>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 z-20 mt-1.5 max-h-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 animate-scale-in">
            <div className="border-b border-slate-100 p-2 bg-slate-50/70">
              <div className="relative">
                <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ស្វែងរកតាមឈ្មោះ ឬលេខទូរស័ព្ទ..."
                  className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="max-h-52 overflow-y-auto divide-y divide-slate-100">
              {filtered.map((c) => {
                const isSelected = selectedCustomer?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelect(c);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-3.5 py-2.5 text-left transition ${
                      isSelected ? 'bg-emerald-50/80 text-emerald-800' : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate">{c.name}</p>
                      {c.phone && <p className="text-[10px] text-slate-400 mt-0.5">{c.phone}</p>}
                    </div>
                    {isSelected && <Check size={14} className="text-emerald-600 shrink-0 ml-2" />}
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <p className="px-3.5 py-4 text-center text-xs text-slate-400">រកមិនឃើញអតិថិជនទេ</p>
              )}
            </div>

            <button
              onClick={() => {
                setOpen(false);
                setShowNew(true);
              }}
              className="flex w-full items-center justify-center gap-1.5 border-t border-slate-100 bg-slate-50/50 px-3.5 py-2.5 text-xs font-bold text-emerald-600 hover:bg-emerald-50 transition"
            >
              <Plus size={14} />
              <span>បន្ថែមអតិថិជនថ្មី</span>
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

