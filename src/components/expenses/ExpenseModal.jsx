import { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, Tag, FileText, Loader2 } from 'lucide-react';
import { expenseApi } from '../../api/expenseApi';
import { getErrorMessage } from '../../api/client';
import { EXPENSE_CATEGORIES, formatToDateString } from '../../utils/dateFilter';

export default function ExpenseModal({
  isOpen,
  expense = null, // if editing
  onClose,
  onSuccess,
}) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0].value);
  const [description, setDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState(formatToDateString(new Date()));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (expense) {
      setAmount(String(expense.amount || ''));
      setCategory(expense.category || EXPENSE_CATEGORIES[0].value);
      setDescription(expense.description || '');
      setExpenseDate(
        expense.expenseDate ? formatToDateString(expense.expenseDate) : formatToDateString(new Date())
      );
    } else {
      setAmount('');
      setCategory(EXPENSE_CATEGORIES[0].value);
      setDescription('');
      setExpenseDate(formatToDateString(new Date()));
    }
    setError('');
  }, [expense, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError('សូមបញ្ចូលចំនួនទឹកប្រាក់ដែលត្រឹមត្រូវ');
      return;
    }
    if (!expenseDate) {
      setError('សូមជ្រើសរើសកាលបរិច្ឆេទចំណាយ');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      amount: numAmount,
      category,
      description: description.trim(),
      expenseDate,
    };

    try {
      if (expense?.id) {
        await expenseApi.updateExpense(expense.id, payload);
      } else {
        await expenseApi.createExpense(payload);
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-[#172033] dark:text-white">
            {expense ? 'កែប្រែការចំណាយ (Edit Expense)' : 'បន្ថែមការចំណាយថ្មី (New Expense)'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 p-3 text-xs font-semibold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-[#172033] dark:text-slate-300 mb-1">
              ចំនួនទឹកប្រាក់ ($) <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 px-3 focus-within:border-[#009F6B] focus-within:ring-1 focus-within:ring-[#009F6B]">
              <DollarSign size={16} className="text-[#667085] dark:text-slate-400 shrink-0" />
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-transparent py-2.5 pl-2 text-sm font-bold text-[#172033] dark:text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-bold text-[#172033] dark:text-slate-300 mb-1">
              ប្រភេទចំណាយ (Category) <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 px-3 focus-within:border-[#009F6B] focus-within:ring-1 focus-within:ring-[#009F6B]">
              <Tag size={16} className="text-[#667085] dark:text-slate-400 shrink-0" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-transparent py-2.5 pl-2 text-xs font-bold text-[#172033] dark:text-white focus:outline-none cursor-pointer"
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Expense Date */}
          <div>
            <label className="block text-xs font-bold text-[#172033] dark:text-slate-300 mb-1">
              កាលបរិច្ឆេទចំណាយ (Date) <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 px-3 focus-within:border-[#009F6B] focus-within:ring-1 focus-within:ring-[#009F6B]">
              <Calendar size={16} className="text-[#667085] dark:text-slate-400 shrink-0" />
              <input
                type="date"
                required
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full bg-transparent py-2.5 pl-2 text-xs font-bold text-[#172033] dark:text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#172033] dark:text-slate-300 mb-1">
              បរិយាយ / កំណត់ចំណាំ (Description)
            </label>
            <div className="relative flex items-start rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 p-2.5 focus-within:border-[#009F6B] focus-within:ring-1 focus-within:ring-[#009F6B]">
              <FileText size={16} className="text-[#667085] dark:text-slate-400 shrink-0 mt-0.5" />
              <textarea
                rows={2}
                placeholder="ព័ត៌មានលម្អិតបន្ថែមពីការចំណាយនេះ..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-transparent pl-2 text-xs font-medium text-[#172033] dark:text-white focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-bold text-[#667085] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 cursor-pointer"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl bg-[#009F6B] px-5 py-2 text-xs font-bold text-white shadow-md shadow-[#009F6B]/25 hover:bg-[#00845A] transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              <span>{expense ? 'រក្សាទុក' : 'បង្កើតចំណាយ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
