import { useMemo, useState } from 'react';
import { Plus, Edit2, Trash2, Loader2, AlertCircle, RefreshCw, Users, Search, Star } from 'lucide-react';
import { customerApi } from '../api/customerApi';
import { getErrorMessage } from '../api/client';
import { useCustomers } from '../hooks/useCustomers';
import { formatDate } from '../utils/format';
import CustomerFormModal from '../components/admin/CustomerFormModal';
import SEO from '../components/SEO';

export default function Customers() {
  const { customers, loading, error, reload } = useCustomers();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
    );
  }, [customers, search]);

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

  return (
    <div className="mx-auto max-w-6xl px-3 sm:px-6 py-6 sm:py-10">
      <SEO
        title="គ្រប់គ្រងអតិថិជន (Customers) | Mart System"
        robots="noindex, nofollow"
      />
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-slate-900 dark:text-white">អតិថិជនទាំងអស់</h1>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-500 active:scale-95"
        >
          <Plus size={16} />
          អតិថិជនថ្មី
        </button>
      </div>

      <div className="relative mb-5 max-w-sm">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ស្វែងរកឈ្មោះ/លេខទូរស័ព្ទ/អ៊ីមែល..."
          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 dark:text-white shadow-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        {loading && (
          <div className="space-y-3 p-4 sm:p-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="p-8 sm:p-10 text-center">
            <AlertCircle size={32} className="mx-auto mb-3 text-rose-600 dark:text-rose-400" />
            <p className="mb-5 text-sm text-rose-600 dark:text-rose-400">{error}</p>
            <button
              onClick={reload}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 shadow-xs transition hover:border-emerald-500 hover:text-slate-900 dark:hover:text-white"
            >
              <RefreshCw size={14} />
              ព្យាយាមម្តងទៀត
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="p-12 sm:p-14 text-center">
            <Users size={40} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
              {search ? 'រកមិនឃើញអតិថិជនត្រូវនឹងលក្ខខណ្ឌនេះទេ' : 'មិនទាន់មានអតិថិជននៅឡើយទេ'}
            </p>
            {!search && (
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-500"
              >
                <Plus size={16} />
                បន្ថែមអតិថិជនដំបូង
              </button>
            )}
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((customer) => (
              <div key={customer.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:px-6 sm:py-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/60">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                    {customer.name?.charAt(0).toUpperCase() ?? '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900 dark:text-white text-sm">{customer.name}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                      {[customer.phone, customer.email].filter(Boolean).join(' · ') || '—'}
                      {' · ចូលរួម '}{formatDate(customer.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t border-slate-50 dark:border-slate-800 sm:border-0">
                  <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200/60 dark:border-amber-800/60">
                    <Star size={13} className="fill-amber-500 text-amber-500" />
                    {customer.loyaltyPoint ?? 0} ពិន្ទុ
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(customer)}
                      className="rounded-lg p-2 text-slate-500 dark:text-slate-400 transition hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white active:scale-95"
                      title="កែប្រែ"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(customer)}
                      disabled={deletingId === customer.id}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-50 active:scale-95"
                      title="លុប"
                    >
                      {deletingId === customer.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
