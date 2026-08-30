import { useMemo, useState } from 'react';
import { Search, Loader2, AlertCircle, ChevronLeft, ChevronRight, PackageX, Plus } from 'lucide-react';
import ProductCard from '../ProductCard';
import ProductFormModal from '../admin/ProductFormModal';
import { useProducts } from '../../hooks/useProducts';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function ProductGrid({ category, onAdd, reloadSignal }) {
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const { isAdmin } = useAuth();
  const { items: cartItems } = useCart();

  const { products, loading, error, page, setPage, totalPages, reload } = useProducts({
    category: category || undefined,
    reloadSignal,
  });

  const cartQuantities = useMemo(() => {
    const map = new Map();
    cartItems.forEach((item) => map.set(item.product.id, item.quantity));
    return map;
  }, [cartItems]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.barcode?.toLowerCase().includes(q)
    );
  }, [products, search]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* ស្វែងរក + បន្ថែមផលិតផលថ្មី */}
      <div className="flex shrink-0 items-center justify-between gap-2 sm:gap-3">
        {isAdmin && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex shrink-0 items-center gap-1 sm:gap-1.5 rounded-xl bg-emerald-50 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-bold text-emerald-700 hover:bg-emerald-100 transition active:scale-95 border border-emerald-200/60"
          >
            <Plus size={16} />
            <span className="hidden xs:inline">ផលិតផលថ្មី</span>
            <span className="xs:hidden">ថ្មី</span>
          </button>
        )}

        <div className="flex flex-1 max-w-md ml-auto items-center rounded-full border border-slate-200 bg-slate-50 pl-3 pr-1 shadow-2xs">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ស្វែងរកទំនិញនៅទីនេះ..."
            className="w-full bg-transparent py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none sm:text-sm"
          />
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
            <Search size={13} />
          </span>
        </div>
      </div>

      {/* មាតិកាទំនិញ */}
      <div className="mt-2.5 sm:mt-3 flex-1 min-h-0 overflow-y-auto pr-0.5 pb-1 touch-scroll">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <Loader2 size={32} className="animate-spin text-emerald-600 mb-2.5" />
            <p className="text-sm font-medium text-slate-500">កំពុងទាញយកទំនិញ...</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-6 sm:p-8 text-center animate-fade-in">
            <AlertCircle size={28} className="text-rose-600" />
            <p className="text-sm font-medium text-rose-700">មិនអាចទាញយកទំនិញបានទេ។ សូមព្យាយាមម្តងទៀត។</p>
            <button
              onClick={reload}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95"
            >
              ព្យាយាមម្តងទៀត
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2.5 py-16 sm:py-20 text-center animate-fade-in">
            <PackageX size={36} className="text-slate-300" />
            <p className="text-sm font-medium text-slate-500">
              {search ? 'មិនមានទំនិញត្រូវនឹងលក្ខខណ្ឌស្វែងរកនេះទេ' : 'មិនទាន់មានទំនិញ'}
            </p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={onAdd}
                cartQuantity={cartQuantities.get(product.id) ?? 0}
              />
            ))}
          </div>
        )}
      </div>

      {/* ទំព័រ Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="mt-2.5 shrink-0 flex items-center justify-center gap-2.5 border-t border-slate-200 pt-2.5">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page <= 0}
            className="rounded-lg border border-slate-300 bg-white p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="text-xs text-slate-500">
            ទំព័រ {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="rounded-lg border border-slate-300 bg-white p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      )}

      {showCreate && (
        <ProductFormModal
          onClose={() => setShowCreate(false)}
          onSaved={() => {
            setShowCreate(false);
            reload();
          }}
        />
      )}
    </div>
  );
}
