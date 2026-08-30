import { useState, useCallback, useEffect } from 'react';
import {
  Plus, Edit2, Trash2, Loader2, AlertCircle, RefreshCw,
  Package, ChevronLeft, ChevronRight, Tags,
} from 'lucide-react';
import { adminProductApi } from '../api/adminProductApi';
import { getErrorMessage } from '../api/client';
import { formatCurrency } from '../utils/format';
import ProductFormModal from '../components/admin/ProductFormModal';
import CategoryManagerModal from '../components/admin/CategoryManagerModal';
import SEO from '../components/SEO';

const STATUS_STYLES = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  DRAFT: 'bg-slate-100 text-slate-600 border-slate-200',
  INACTIVE: 'bg-amber-50 text-amber-700 border-amber-200',
  ARCHIVED: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function Products() {
  const [pageData, setPageData] = useState(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminProductApi.list({ page, size: 15 });
      setPageData(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const products = Array.isArray(pageData)
    ? pageData
    : pageData?.content ?? pageData?.data?.content ?? [];

  const totalPages = pageData?.totalPages ?? pageData?.data?.totalPages ?? 0;

  const openCreate = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleSaved = () => {
    setModalOpen(false);
    load();
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`តើអ្នកពិតជាចង់លុបផលិតផល "${product.name}" មែនទេ?`)) return;
    setDeletingId(product.id);
    try {
      await adminProductApi.delete(product.id);
      load();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6 animate-fade-in">
      <SEO
        title="គ្រប់គ្រងផលិតផល (Products Management) | Mart System"
        robots="noindex, nofollow"
      />
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-slate-900">គ្រប់គ្រងផលិតផល</h1>
        
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCategoryModalOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs transition hover:border-emerald-500 hover:text-slate-900"
          >
            <Tags size={15} />
            ប្រភេទ
          </button>
          <button
            onClick={openCreate}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-500 active:scale-95"
          >
            <Plus size={15} />
            ផលិតផលថ្មី
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        {loading && (
          <div className="space-y-3 p-4 sm:p-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="p-8 sm:p-10 text-center">
            <AlertCircle size={32} className="mx-auto mb-3 text-rose-600" />
            <p className="mb-5 text-sm text-rose-600">{error}</p>
            <button
              onClick={load}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm text-slate-600 shadow-xs transition hover:border-emerald-500 hover:text-slate-900"
            >
              <RefreshCw size={14} />
              ព្យាយាមម្តងទៀត
            </button>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="p-12 sm:p-14 text-center">
            <Package size={40} className="mx-auto mb-4 text-slate-300" />
            <p className="mb-6 text-sm text-slate-500">មិនទាន់មានផលិតផលនៅឡើយទេ</p>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-500"
            >
              <Plus size={16} />
              បន្ថែមផលិតផលដំបូង
            </button>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="divide-y divide-slate-100">
            {products.map((product) => (
              <div key={product.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:px-6 sm:py-4 transition hover:bg-slate-50">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <Package size={18} className="text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold text-slate-900 text-sm">{product.name}</p>
                      <span className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[9px] font-bold ${STATUS_STYLES[product.status] ?? STATUS_STYLES.DRAFT}`}>
                        {product.status}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      SKU: {product.sku || '—'} {product.category ? `· ${product.category}` : ''} · ស្តុក: {product.stockQuantity ?? 0}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t border-slate-50 sm:border-0">
                  <span className="font-bold text-slate-900 text-sm">{formatCurrency(product.price)}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(product)}
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-700 active:scale-95"
                      title="កែប្រែ"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      disabled={deletingId === product.id}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 active:scale-95"
                      title="លុប"
                    >
                      {deletingId === product.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 border-t border-slate-100 py-3.5">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page <= 0}
              className="rounded-lg border border-slate-300 bg-white p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-slate-500">
              ទំព័រ {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-lg border border-slate-300 bg-white p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {categoryModalOpen && (
        <CategoryManagerModal onClose={() => setCategoryModalOpen(false)} />
      )}

      {modalOpen && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}