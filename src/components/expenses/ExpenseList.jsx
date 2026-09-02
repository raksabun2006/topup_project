import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Edit2, Trash2, Calendar, Tag, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { expenseApi } from '../../api/expenseApi';
import { getErrorMessage } from '../../api/client';
import { formatCurrency, formatDate } from '../../utils/format';
import { EXPENSE_CATEGORIES, getCategoryMeta, formatToDateString } from '../../utils/dateFilter';
import ExpenseModal from './ExpenseModal';

export default function ExpenseList({
  onExpenseChanged,
  className = '',
}) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await expenseApi.getExpenses({
        category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
        page,
        size: 15,
      });

      if (Array.isArray(data)) {
        setExpenses(data);
        setTotalPages(1);
      } else if (data && Array.isArray(data.content)) {
        setExpenses(data.content);
        setTotalPages(data.totalPages || 1);
      } else {
        setExpenses([]);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, page]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const handleDelete = async (id) => {
    if (!window.confirm('តើអ្នកពិតជាចង់លុបការចំណាយនេះមែនទេ?')) return;
    setDeletingId(id);
    try {
      await expenseApi.deleteExpense(id);
      showToast('បានលុបការចំណាយដោយជោគជ័យ');
      loadExpenses();
      if (onExpenseChanged) onExpenseChanged();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const handleModalSuccess = () => {
    showToast(selectedExpense ? 'បានកែប្រែការចំណាយដោយជោគជ័យ' : 'បានបន្ថែមការចំណាយថ្មីដោយជោគជ័យ');
    loadExpenses();
    if (onExpenseChanged) onExpenseChanged();
  };

  return (
    <div className={`rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs flex flex-col ${className}`}>
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="mb-3 rounded-xl bg-emerald-600 text-white px-3.5 py-2 text-xs font-bold shadow-md animate-slide-down">
          {toastMessage}
        </div>
      )}

      {/* Top Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-[#172033] dark:text-white">
            ការគ្រប់គ្រងចំណាយ (Expense Management)
          </h3>
          <p className="text-[11px] text-[#667085] dark:text-slate-500 mt-0.5">
            បញ្ជីចំណាយ និងការកត់ត្រាចំណាយក្នុងហាង
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(0);
            }}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-[#172033] dark:text-white focus:border-[#009F6B] focus:outline-none cursor-pointer"
          >
            <option value="ALL">ប្រភេទទាំងអស់</option>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Add Expense Button */}
          <button
            type="button"
            onClick={() => {
              setSelectedExpense(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-[#009F6B] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#00845A] transition active:scale-95 cursor-pointer"
          >
            <Plus size={15} />
            <span>+ បន្ថែមចំណាយ</span>
          </button>
        </div>
      </div>

      {/* Table Body */}
      <div className="mt-3 flex-1 flex flex-col justify-center">
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 size={26} className="animate-spin text-[#009F6B] mb-2" />
            <p className="text-xs text-[#667085] dark:text-slate-400">កំពុងទាញយកបញ្ជីចំណាយ...</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-8 text-center text-rose-500">
            <AlertCircle size={26} className="mb-1.5" />
            <p className="text-xs font-semibold">{error}</p>
            <button
              onClick={loadExpenses}
              className="mt-2 text-xs font-bold text-[#009F6B] underline"
            >
              ព្យាយាមម្តងទៀត
            </button>
          </div>
        )}

        {!loading && !error && expenses.length === 0 && (
          <div className="py-12 text-center text-xs text-[#667085] dark:text-slate-500">
            មិនទាន់មានទិន្នន័យចំណាយនៅឡើយទេ។ ចុច "+ បន្ថែមចំណាយ" ដើម្បីកត់ត្រាចំណាយដំបូង។
          </div>
        )}

        {!loading && !error && expenses.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-[#667085] dark:text-slate-400">
                  <th className="py-2.5 px-3">កាលបរិច្ឆេទ</th>
                  <th className="py-2.5 px-3">ប្រភេទចំណាយ</th>
                  <th className="py-2.5 px-3">បរិយាយ / កំណត់ចំណាំ</th>
                  <th className="py-2.5 px-3 text-right">ចំនួនទឹកប្រាក់</th>
                  <th className="py-2.5 px-3">កត់ត្រាដោយ</th>
                  <th className="py-2.5 px-3 text-center">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {expenses.map((exp) => {
                  const meta = getCategoryMeta(exp.category);
                  const isDeleting = deletingId === exp.id;
                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-[#172033] dark:text-white whitespace-nowrap">
                        {formatToDateString(exp.expenseDate || exp.createdAt)}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                          style={{
                            backgroundColor: `${meta.color}18`,
                            color: meta.color,
                          }}
                        >
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
                          <span>{meta.label}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-[#667085] dark:text-slate-300 max-w-xs truncate" title={exp.description}>
                        {exp.description || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-rose-600 dark:text-rose-400 whitespace-nowrap">
                        {formatCurrency(exp.amount)}
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-[#667085] dark:text-slate-400 whitespace-nowrap">
                        {exp.createdBy || exp.creatorName || 'Staff'}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedExpense(exp);
                              setModalOpen(true);
                            }}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition"
                            title="កែប្រែ"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => handleDelete(exp.id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 transition disabled:opacity-50"
                            title="លុប"
                          >
                            {isDeleting ? <Loader2 size={13} className="animate-spin text-rose-500" /> : <Trash2 size={13} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 text-xs">
            <span className="text-[#667085] dark:text-slate-400">
              ទំព័រ {page + 1} នៃ {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1 font-semibold text-slate-700 dark:text-slate-200 disabled:opacity-40"
              >
                ថយក្រោយ
              </button>
              <button
                type="button"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1 font-semibold text-slate-700 dark:text-slate-200 disabled:opacity-40"
              >
                បន្ទាប់
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <ExpenseModal
          isOpen={modalOpen}
          expense={selectedExpense}
          onClose={() => {
            setModalOpen(false);
            setSelectedExpense(null);
          }}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
