import { useMemo, useState, useRef, useCallback } from 'react';
import {
  Search, AlertCircle, ChevronLeft, ChevronRight, PackageX, Plus,
  ScanBarcode, X, CheckCircle2,
} from 'lucide-react';
import ProductCard from '../ProductCard';
import ProductFormModal from '../admin/ProductFormModal';
import BarcodeScannerModal from './BarcodeScannerModal';
import { useProducts } from '../../hooks/useProducts';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useBarcodeScanner } from '../../hooks/useBarcodeScanner';
import { lookupProductByBarcode } from '../../utils/barcodeLookup';
import { initAudioContext, playBeepSound, playErrorSound } from '../../utils/sound';
import { formatCurrency } from '../../utils/format';
import { getCategoryIcon, AllCategoriesIcon } from '../../utils/categoryIcons';
import { env } from '../../config/env';

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
  const [toastData, setToastData] = useState(null);
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
    (cartItems || []).forEach((item) => {
      if (item?.product?.id) {
        map.set(item.product.id, item.quantity);
      }
    });
    return map;
  }, [cartItems]);

  const productList = useMemo(
    () => (Array.isArray(products) ? products.filter(Boolean) : []),
    [products]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return productList;
    return productList.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.barcode?.toLowerCase().includes(q)
    );
  }, [productList, search]);

  const triggerToast = useCallback((product) => {
    const existing = (cartItems || []).find((i) => i?.product?.id === product.id);
    const nextQty = (existing?.quantity || 0) + 1;
    setToastData({
      name: product.name,
      price: product.price,
      quantity: nextQty,
    });
    setTimeout(() => setToastData(null), 2500);
  }, [cartItems]);

  // Hardware USB/Bluetooth Barcode Scanner support
  useBarcodeScanner(async (scannedCode) => {
    if (!scannedCode) return;
    initAudioContext();
    try {
      const result = await lookupProductByBarcode(scannedCode, productList);
      if (result.status === 'found' && result.product) {
        playBeepSound();
        onAdd(result.product);
        triggerToast(result.product);
      } else {
        playErrorSound();
        setToastData({
          isError: true,
          message: `រកមិនឃើញទំនិញដែលមានបាកូដ "${scannedCode}" ទេ`,
        });
        setTimeout(() => setToastData(null), 3000);
      }
    } catch (err) {
      console.error('Hardware scan error:', err);
    }
  });

  const handleSearchKeyDown = async (e) => {
    if (e.key === 'Enter') {
      const q = search.trim();
      if (!q) return;

      const exact = productList.find(
        (p) =>
          p.barcode?.toLowerCase() === q.toLowerCase() ||
          p.sku?.toLowerCase() === q.toLowerCase()
      );

      if (exact) {
        onAdd(exact);
        playBeepSound();
        triggerToast(exact);
        setSearch('');
        return;
      }

      if (filtered.length === 1) {
        onAdd(filtered[0]);
        playBeepSound();
        triggerToast(filtered[0]);
        setSearch('');
        return;
      }

      const lookup = await lookupProductByBarcode(q, productList);
      if (lookup.status === 'found' && lookup.product) {
        onAdd(lookup.product);
        playBeepSound();
        triggerToast(lookup.product);
        setSearch('');
      }
    }
  };

  const productJsonLd = useMemo(() => {
    if (!productList || productList.length === 0) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: productList.slice(0, 20).map((product, index) => ({
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
  }, [productList]);

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

          {/* Prominent Barcode Scanner Action Button */}
          <button
            type="button"
            onClick={() => {
              initAudioContext();
              setShowScanner(true);
            }}
            className="flex h-11 sm:h-12 shrink-0 items-center gap-1.5 sm:gap-2 rounded-2xl border-2 border-emerald-600/80 bg-emerald-50 dark:bg-emerald-950/50 px-3 sm:px-3.5 text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-300 shadow-xs hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all active:scale-95 cursor-pointer"
            title="ស្កេន Barcode (Scan Barcode)"
            aria-label="Scan barcode"
          >
            <ScanBarcode size={19} className="text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span className="hidden xs:inline">ស្កេន Barcode</span>
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

        {/* Integrated Category Navigation (Sleek horizontal pills) */}
        {Array.isArray(categories) && categories.length > 0 && onSelectCategory && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none touch-scroll">
            <button
              type="button"
              onClick={() => onSelectCategory('')}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 cursor-pointer ${
                !category
                  ? 'bg-[#009F6B] text-white shadow-xs'
                  : 'border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/80 text-[#64748B] dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700 hover:text-[#0F172A] dark:hover:text-white'
              }`}
            >
              <AllCategoriesIcon size={14} />
              <span>ទាំងអស់</span>
            </button>

            {categories.map((cat) => {
              const catName = typeof cat === 'string' ? cat : cat?.name;
              const catId = typeof cat === 'string' ? cat : cat?.id || catName;
              if (!catName) return null;
              const Icon = getCategoryIcon(catName);
              const active = category === catName;
              return (
                <button
                  key={catId}
                  type="button"
                  onClick={() => onSelectCategory(catName)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 cursor-pointer ${
                    active
                      ? 'bg-[#009F6B] text-white shadow-xs'
                      : 'border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/80 text-[#64748B] dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700 hover:text-[#0F172A] dark:hover:text-white'
                  }`}
                >
                  <Icon size={14} />
                  <span>{catName}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Micro-toast Feedback for Quick Add / Barcode Scan */}
        {toastData && (
          <div
            className={`flex items-center justify-between gap-3 rounded-2xl px-3.5 py-2 text-xs font-semibold shadow-lg animate-slide-down ${
              toastData.isError
                ? 'bg-rose-600 text-white border border-rose-400/40'
                : 'bg-emerald-700 text-white border border-emerald-400/40'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/20 text-white shrink-0">
                {toastData.isError ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-white/80 uppercase tracking-wide">
                  {toastData.isError ? 'រកមិនឃើញទំនិញ' : '✓ Added to order'}
                </span>
                <p className="font-bold text-white text-xs truncate max-w-[200px] sm:max-w-[280px]">
                  {toastData.isError ? toastData.message : toastData.name}
                </p>
              </div>
            </div>
            {!toastData.isError && (
              <div className="text-right shrink-0">
                <span className="font-extrabold text-white">{formatCurrency(toastData.price)}</span>
                <span className="text-[11px] text-emerald-200 ml-1 font-bold">× {toastData.quantity}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Catalog Content */}
      <div className="mt-2 sm:mt-2.5 flex-1 min-h-0 overflow-y-auto pr-0.5 pb-2 touch-scroll">
        {/* Modern Skeleton Loading State */}
        {loading && (
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2.5 sm:gap-3">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 space-y-2 animate-pulse"
              >
                <div className="aspect-[4/3] w-full rounded-xl bg-slate-100 dark:bg-slate-800" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-3/4 rounded bg-slate-100 dark:bg-slate-800" />
                  <div className="h-2.5 w-1/2 rounded bg-slate-100 dark:bg-slate-800" />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="h-4 w-12 rounded bg-slate-100 dark:bg-slate-800" />
                  <div className="h-3 w-10 rounded bg-slate-100 dark:bg-slate-800" />
                </div>
                <div className="h-8 w-full rounded-xl bg-slate-100 dark:bg-slate-800" />
              </div>
            ))}
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

        {/* Polished Empty State */}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 sm:py-20 text-center animate-fade-in">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
              <PackageX size={32} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">រកមិនឃើញទំនិញឡើយ</h3>
              <p className="mt-1 text-xs text-slate-400 max-w-xs">
                {search ? `រកមិនឃើញទំនិញណាត្រូវនឹង "${search}" ឡើយ។` : 'មិនទាន់មានទំនិញក្នុងប្រភេទទំនិញនេះទេ។'}
              </p>
            </div>
            {(search || category) && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  if (onSelectCategory) onSelectCategory('');
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-[#009F6B] dark:text-emerald-400 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                <span>សម្អាតការស្វែងរក / តម្រង</span>
              </button>
            )}
          </div>
        )}

        {!loading && !error && filtered && filtered.length > 0 && (
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2.5 sm:gap-3">
            {filtered.filter(Boolean).map((product) => (
              <ProductCard
                key={product?.id || product?.sku || Math.random()}
                product={product}
                onAdd={onAdd}
                onSetQuantity={onSetQuantity}
                onRemove={onRemove}
                cartQuantity={cartQuantities.get(product?.id) ?? 0}
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
      <BarcodeScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        products={products}
        onAddProduct={(product) => {
          onAdd(product);
          triggerToast(product);
        }}
        cartItems={cartItems}
      />

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
