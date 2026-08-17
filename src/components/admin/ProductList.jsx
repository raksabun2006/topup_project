import React from 'react';
import { Plus, Edit2, Trash2, RotateCcw, Package } from 'lucide-react';
import { adminProductsApi } from '../../api/adminProductsApi';
import { getErrorMessage } from '../../api/client';
import { formatCurrency } from '../../utils/format';

export function ProductList({ products = [], onOpenCreate, onOpenEdit, onRefresh, loading }) {

  // Soft-delete action handler
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('តើអ្នកពិតជាចង់បិទកញ្ចប់នេះមែនទេ?')) return;
    try {
      await adminProductsApi.delete(productId);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const handleReactivateProduct = async (productId) => {
    try {
      await adminProductsApi.reactivate(productId);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  return (
    <div className="rounded-2xl border border-purple-900/40 bg-ink-900 shadow-2xl shadow-purple-950/50">
      <div className="flex items-center justify-between border-b border-purple-900/30 px-6 py-5">
        <h2 className="font-semibold text-white">កាតាឡុកកញ្ចប់ (Products)</h2>
        <button
          onClick={onOpenCreate}
          className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:from-purple-500 hover:to-fuchsia-500"
        >
          <Plus size={14} /> បញ្ចូលថ្មី
        </button>
      </div>

      {loading && (
        <div className="space-y-3 p-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-ink-800" />
          ))}
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="p-10 text-center">
          <Package size={36} className="mx-auto mb-3 text-slate-600" />
          <p className="text-sm text-slate-400">មិនទាន់មានកញ្ចប់ថវិកានៅឡើយ</p>
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="divide-y divide-purple-900/20">
          {products.map((product) => {
            // ត្រូវផ្ទៀងផ្ទាត់ឈ្មោះ field នេះជាមួយ ProductResponse ពិត
            const isActive = product.active !== false;
            return (
              <div
                key={product.id}
                className={`flex items-center justify-between px-6 py-4 transition hover:bg-purple-950/20 ${!isActive ? 'opacity-60' : ''}`}
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-200">{product.name}</span>
                    {!isActive && (
                      <span className="rounded-md border border-purple-900/40 bg-ink-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                        បិទ
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500">Code: {product.code} · {product.amount} Units</span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-white">
                    {formatCurrency(product.price, product.currency)}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenEdit(product)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-purple-950/40 hover:text-white transition"
                      title="កែប្រែ"
                    >
                      <Edit2 size={16} />
                    </button>
                    {isActive ? (
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition"
                        title="បិទ"
                      >
                        <Trash2 size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReactivateProduct(product.id)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-emerald-500/10 hover:text-emerald-400 transition"
                        title="បើកឡើងវិញ"
                      >
                        <RotateCcw size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
