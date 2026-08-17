import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { adminProductsApi } from '../../api/adminProductsApi';
import { getErrorMessage } from '../../api/client';

export function ProductModal({ isOpen, onClose, editingProduct, gameId, onSuccess }) {
  const [formData, setFormData] = useState({
    gameId: '',
    code: '',
    name: '',
    amount: '',
    price: '',
    currency: 'USD',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        gameId: editingProduct.gameId || gameId || '',
        code: editingProduct.code || '',
        name: editingProduct.name || '',
        amount: editingProduct.amount || '',
        price: editingProduct.price || '',
        currency: editingProduct.currency || 'USD',
      });
    } else {
      setFormData({
        gameId: gameId || '',
        code: '',
        name: '',
        amount: '',
        price: '',
        currency: 'USD',
      });
    }
    setError('');
  }, [editingProduct, gameId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      ...formData,
      amount: Number(formData.amount),
      price: Number(formData.price),
    };

    try {
      if (editingProduct) {
        await adminProductsApi.update(editingProduct.id, payload);
      } else {
        await adminProductsApi.create(payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-purple-900/40 bg-ink-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-purple-900/30 pb-4">
          <h3 className="text-lg font-bold text-white">
            {editingProduct ? 'កែប្រែញ្ចប់ថវិកា' : 'បន្ថែមកញ្ចប់ថវិកាថ្មី'}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-purple-950/40 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">កូដកញ្ចប់ (Code)</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                placeholder="MLBB_86"
                className="w-full rounded-xl border border-purple-900/40 bg-ink-950 px-3.5 py-2 text-white shadow-sm transition placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">ឈ្មោះកញ្ចប់ (Name)</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="86 Diamonds"
                className="w-full rounded-xl border border-purple-900/40 bg-ink-950 px-3.5 py-2 text-white shadow-sm transition placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">ចំនួន (Amount)</label>
              <input
                type="number"
                required
                value={formData.amount}
                onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                placeholder="86"
                className="w-full rounded-xl border border-purple-900/40 bg-ink-950 px-3.5 py-2 text-white shadow-sm transition placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">តម្លៃ (Price)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                placeholder="1.50"
                className="w-full rounded-xl border border-purple-900/40 bg-ink-950 px-3.5 py-2 text-white shadow-sm transition placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">រូបីយប័ណ្ណ (Currency)</label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData((prev) => ({ ...prev, currency: e.target.value }))}
              className="w-full rounded-xl border border-purple-900/40 bg-ink-950 px-3.5 py-2 text-white shadow-sm transition focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="USD">USD ($)</option>
              <option value="KHR">KHR (៛)</option>
            </select>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-purple-900/30 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-purple-900/40 bg-ink-950 px-4 py-2 text-sm font-medium text-slate-300 shadow-sm transition hover:border-purple-500/40 hover:text-white"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-600/30 transition hover:from-purple-500 hover:to-fuchsia-500 disabled:opacity-60"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {editingProduct ? 'រក្សាទុក' : 'បង្កើត'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
