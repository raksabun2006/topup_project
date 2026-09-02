import { useMemo, useState, useRef, useEffect } from 'react';
import {
  Search, Loader2, AlertCircle, ChevronLeft, ChevronRight, PackageX, Plus,
  ScanBarcode, X, CheckCircle2,
} from 'lucide-react';
import ProductCard from '../ProductCard';
import ProductFormModal from '../admin/ProductFormModal';
import { useProducts } from '../../hooks/useProducts';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { getCategoryIcon, AllCategoriesIcon } from '../../utils/categoryIcons';
import { env } from '../../config/env';

/**
 * Barcode Quick Scanner Dialog:
 * Allows cashiers to quickly type or use a USB/Bluetooth barcode scanner.
 */
function BarcodeScanModal({ products, onAdd, onClose }) {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleScanSubmit = (e) => {
    e.preventDefault();
    const code = barcodeInput.trim().toLowerCase();
    if (!code) return;

    const matched = products.find(
      (p) =>
        p.barcode?.toLowerCase() === code ||
        p.sku?.toLowerCase() === code ||
        p.name?.toLowerCase() === code
    );

    if (matched) {
      onAdd(matched);
      setFeedback({ success: true, message: `បានបន្ថែម៖ ${matched.name}` });
      setBarcodeInput('');
    } else {
      setFeedback({ success: false, message: `រកមិនឃើញទំនិញដែលមានកូដ "${barcodeInput}" ទេ` });
    }

    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#009F6B] text-white">
              <ScanBarcode size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#172033] dark:text-white">ស្កេន Barcode ទំនិញ</h3>
              <p className="text-[11px] text-[#667085] dark:text-slate-400">ប្រើឧបករណ៍ស្កេន ឬ វាយបញ្ចូលលេខកូដ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleScanSubmit} className="mt-4 space-y-3">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="ស្កេន ឬ វាយលេខ Barcode / SKU នៅទីនេះ..."
              className="w-full rounded-xl border-2 border-[#009F6B] bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm font-bold text-[#172033] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
            />
          </div>

          {feedback && (
            <div
              className={`flex items-center gap-2 rounded-xl p-3 text-xs font-semibold animate-fade-in ${
                feedback.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {feedback.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{feedback.message}</span>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 text-xs font-bold text-[#172033] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              បិទ (Close)
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-[#009F6B] py-2.5 text-xs font-bold text-white shadow-md shadow-[#009F6B]/25 hover:bg-[#00845A] transition"
            >
              ស្វែងរក & បន្ថែម
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProductGrid({
  category = '',
  onSelectCategory,
  categories = [],
  onAdd,
  onSetQuantity,
  onRemove,
  reloadSignal,
  searchInputRef,
}) {
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const { isAdmin } = useAuth();
  const { items: cartItems } = useCart();
  const internalInputRef = useRef(null);
  const searchRef = searchInputRef || internalInputRef;

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

  const triggerToast = (productName) => {
    setToastMessage(`បានបន្ថែម៖ ${productName}`);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      const q = search.trim().toLowerCase();
      if (!q) return;

      const exact = products.find(
        (p) => p.barcode?.toLowerCase() === q || p.sku?.toLowerCase() === q
      );

      if (exact) {
        onAdd(exact);
        triggerToast(exact.name);
        setSearch('');
        return;
      }

      if (filtered.length === 1) {
        onAdd(filtered[0]);
        triggerToast(filtered[0].name);
        setSearch('');
      }
    }
  };

  const productJsonLd = useMemo(() => {
    if (!products || products.length === 0) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: products.slice(0, 20).map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: product.name,
          description: product.description || `${product.name} - Mart System`,
          ...(product.imageUrl ? { image: product.imageUrl } : {}),
          ...(product.sku ? { sku: product.sku } : {}),
          offers: {
            '@type': 'Offer',
            price: String(product.price ?? 0),
            priceCurrency: 'USD',
            availability: (product.stockQuantity ?? 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            url: `${env.siteUrl}/products`,
          },
        },
      })),
    };
  }, [products]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      )}

      {/* Top Search & Actions Bar (46–48px Prominent Input) */}
      <div className="shrink-0 space-y-2.5">
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Main Large Search Box */}
          <div className="relative flex flex-1 items-center rounded-2xl border-2 border-slate-200/90 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 pl-3.5 pr-2.5 shadow-xs transition-all focus-within:border-[#009F6B] focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-[#009F6B]/20">
            <Search size={18} className="text-[#667085] dark:text-slate-400 shrink-0" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="ស្វែងរកទំនិញ (ឈ្មោះ, Barcode, SKU)..."
              className="w-full bg-transparent py-2.5 sm:py-3 pl-2.5 pr-2 text-xs sm:text-sm font-semibold text-[#172033] dark:text-white placeholder:text-[#667085] dark:placeholder:text-slate-500 focus:outline-none"
            />

            {/* Clear Button */}
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  searchRef.current?.focus();
                }}
                className="mr-1.5 rounded-full p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X size={14} />
              </button>
            )}

            {/* Keyboard Shortcut Hint */}
            <div className="hidden sm:flex items-center gap-1 shrink-0 rounded-md bg-white dark:bg-slate-700 px-1.5 py-0.5 text-[10px] font-bold text-[#667085] dark:text-slate-300 border border-slate-200 dark:border-slate-600 shadow-2xs">
              <span>F2</span>
            </div>
          </div>

          {/* Barcode Scanner Action Button */}
          <button
            type="button"
            onClick={() => setShowScanner(true)}
            className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#172033] dark:text-slate-200 shadow-xs hover:border-[#009F6B] hover:text-[#009F6B] dark:hover:text-emerald-400 transition-all active:scale-95 cursor-pointer"
            title="ស្កេន Barcode"
            aria-label="Scan barcode"
          >
            <ScanBarcode size={20} />
          </button>

          {/* Admin: Quick Create Product */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="hidden xs:flex h-11 sm:h-12 shrink-0 items-center gap-1.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 px-3.5 text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition active:scale-95 border border-emerald-200/80 dark:border-emerald-500/30 cursor-pointer"
              title="បន្ថែមទំនិញថ្មី"
            >
              <Plus size={16} />
              <span>ទំនិញថ្មី</span>
            </button>
          )}
        </div>

        {/* Integrated Category Navigation (Directly below search) */}
        {categories && categories.length > 0 && onSelectCategory && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => onSelectCategory('')}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 cursor-pointer ${
                !category
                  ? 'bg-[#009F6B] text-white shadow-xs'
                  : 'border border-slate-200/80 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800 text-[#667085] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-[#172033] dark:hover:text-white'
              }`}
            >
              <AllCategoriesIcon size={14} />
              <span>ទាំងអស់</span>
            </button>

            {categories.map((cat) => {
              const Icon = getCategoryIcon(cat.name);
              const active = category === cat.name;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(cat.name)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 cursor-pointer ${
                    active
                      ? 'bg-[#009F6B] text-white shadow-xs'
                      : 'border border-slate-200/80 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800 text-[#667085] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-[#172033] dark:hover:text-white'
                  }`}
                >
                  <Icon size={14} />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Micro-toast Feedback for Quick Add */}
        {toastMessage && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-600 text-white px-3 py-1.5 text-xs font-bold shadow-md animate-slide-down">
            <CheckCircle2 size={14} />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>

      {/* Main Catalog Content */}
      <div className="mt-2.5 sm:mt-3 flex-1 min-h-0 overflow-y-auto pr-0.5 pb-2 touch-scroll">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <Loader2 size={32} className="animate-spin text-[#009F6B] mb-2.5" />
            <p className="text-sm font-medium text-[#667085] dark:text-slate-400">កំពុងទាញយកទំនិញ...</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/20 p-6 sm:p-8 text-center animate-fade-in">
            <AlertCircle size={28} className="text-rose-600 dark:text-rose-400" />
            <p className="text-sm font-medium text-rose-700 dark:text-rose-300">
              មិនអាចទាញយកទំនិញបានទេ។ សូមព្យាយាមម្តងទៀត។
            </p>
            <button
              onClick={reload}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs transition hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95"
            >
              ព្យាយាមម្តងទៀត
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2.5 py-16 sm:py-20 text-center animate-fade-in">
            <PackageX size={36} className="text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-medium text-[#667085] dark:text-slate-400">
              {search ? 'មិនមានទំនិញត្រូវនឹងលក្ខខណ្ឌស្វែងរកនេះទេ' : 'មិនទាន់មានទំនិញ'}
            </p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-2.5 sm:gap-3">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={onAdd}
                onSetQuantity={onSetQuantity}
                onRemove={onRemove}
                cartQuantity={cartQuantities.get(product.id) ?? 0}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {!loading && !error && totalPages > 1 && (
        <div className="mt-2 shrink-0 flex items-center justify-between border-t border-slate-200/80 dark:border-slate-800 pt-2 px-1">
          <span className="text-xs font-medium text-[#667085] dark:text-slate-400">
            ទំព័រ {page + 1} នៃ {totalPages} ({filtered.length} ទំនិញ)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page <= 0}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      {showScanner && (
        <BarcodeScanModal
          products={products}
          onAdd={onAdd}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Admin: Product Form Modal */}
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
