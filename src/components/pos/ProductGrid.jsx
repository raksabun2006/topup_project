import { useMemo, useState } from 'react';
import { Search, Loader2, AlertCircle, ChevronLeft, ChevronRight, PackageX, Plus } from 'lucide-react';
import ProductCard from '../ProductCard';
import ProductFormModal from '../admin/ProductFormModal';
import { useProducts } from '../../hooks/useProducts';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

/**
 * Backend /api/v1/products មិនមាន query param ស្វែងរកទេ (មានតែ category+pageable) -
 * ដូច្នេះការស្វែងរកតាមឈ្មោះ/SKU ធ្វើតែលើទំព័រដែលបានទាញយកស្រាប់ប៉ុណ្ណោះ។
 *
 * category ជា controlled prop ព្រោះ tab ជ្រើសរើសប្រភេទផ្លាស់ទីទៅជា
 * action bar ខាងក្រោមទំព័រ (រួមជាមួយ Cancel/Hold Order) - មើល Pos.jsx។
 *
 * reloadSignal ធ្វើឲ្យទាញយកទំនិញឡើងវិញស្ងាត់ៗពេលលក់ជោគជ័យ ដើម្បីស្តុក
 * ត្រូវបានធ្វើបច្ចុប្បន្នភាពភ្លាមៗ (មិនចាំបាច់ប្តូរទំព័រ/refresh ដោយដៃ)។
 * cart items ដកចេញពីស្តុកបង្ហាញផងដែរ ដើម្បីកុំឲ្យលក់លើសស្តុកមុននឹងគិតលុយ។
 */
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
    <div className="flex h-full flex-col">
      {/* ស្វែងរក + បន្ថែមផលិតផលថ្មី */}
      <div className="flex items-center gap-3">
        {isAdmin && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex shrink-0 items-center gap-2 text-base font-bold tracking-wide text-emerald-600 transition hover:text-emerald-700"
          >
            <Plus size={20} />
            ផលិតផលថ្មី
          </button>
        )}

        <div className="ml-auto flex w-full max-w-md items-center rounded-full border border-slate-200 bg-slate-50 pl-4 pr-1 shadow-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ស្វែងរកទំនិញនៅទីនេះ..."
            className="w-full bg-transparent py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
            <Search size={15} />
          </span>
        </div>
      </div>

      {/* មាតិកា */}
      <div className="mt-4 flex-1 overflow-y-auto">
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-emerald-600">
            <Loader2 size={30} className="animate-spin" />
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-8 text-center">
            <AlertCircle size={28} className="text-rose-700" />
            <p className="text-sm text-rose-700">{error}</p>
            <button
              onClick={reload}
              className="rounded-lg border border-slate-300 bg-white px-4 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              ព្យាយាមម្តងទៀត
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <PackageX size={32} className="text-slate-400" />
            <p className="text-sm text-slate-500">មិនមានទំនិញត្រូវនឹងលក្ខខណ្ឌនេះទេ</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
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

      {/* ទំព័រ */}
      {!loading && !error && totalPages > 1 && (
        <div className="mt-3 flex items-center justify-center gap-3 border-t border-slate-200 pt-3">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page <= 0}
            className="rounded-lg border border-slate-300 bg-white p-1.5 text-slate-600 disabled:opacity-40"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs text-slate-500">
            ទំព័រ {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="rounded-lg border border-slate-300 bg-white p-1.5 text-slate-600 disabled:opacity-40"
          >
            <ChevronRight size={16} />
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
