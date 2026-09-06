import { useState, useEffect } from 'react';
import { Package, Plus, Minus, Trash2, Heart } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import { useAuth } from '../context/AuthContext';

const WISHLIST_STORAGE_KEY = 'mart_customer_wishlist';

function isProductWishlisted(id) {
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    const set = raw ? JSON.parse(raw) : [];
    return Array.isArray(set) && set.includes(id);
  } catch {
    return false;
  }
}

function toggleWishlist(id) {
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    let set = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(set)) set = [];
    if (set.includes(id)) {
      set = set.filter((x) => x !== id);
    } else {
      set.push(id);
    }
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(set));
    return set.includes(id);
  } catch {
    return false;
  }
}

/**
 * Shared Customer & Staff POS Product Card
 * - Visually unified with POS design tokens (radius, borders, price typography)
 * - Safe stock indicators for customers (In Stock / Low Stock / Out of Stock)
 * - Wishlist heart toggle
 * - Instant stepper & Quick Add
 * - Click to inspect product detail
 */
export default function ProductCard({
  product,
  onAdd,
  onSetQuantity,
  onRemove,
  cartQuantity = 0,
  onOpenDetails,
}) {
  const { isAuthenticated } = useAuth();
  const [imageBroken, setImageBroken] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    setImageBroken(false);
    if (product?.id) {
      setWishlisted(isProductWishlisted(product.id));
    }
  }, [product?.id, product?.imageUrl]);

  if (!product) return null;
  const stock = product.stockQuantity ?? 0;
  const outOfStock = stock <= 0;
  const isLowStock = !outOfStock && stock <= 5;
  const available = Math.max(0, stock - cartQuantity);
  const atMaxStock = available <= 0 && cartQuantity > 0;
  const isSelected = cartQuantity > 0;

  const handleCardClick = () => {
    if (onOpenDetails) {
      onOpenDetails(product);
    } else if (!outOfStock && cartQuantity === 0) {
      onAdd(product);
    }
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    if (product?.id) {
      const next = toggleWishlist(product.id);
      setWishlisted(next);
    }
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    if (atMaxStock) return;
    if (onSetQuantity) {
      onSetQuantity(product.id, cartQuantity + 1);
    } else {
      onAdd(product);
    }
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    if (cartQuantity <= 1) {
      if (onRemove) onRemove(product.id);
      else if (onSetQuantity) onSetQuantity(product.id, 0);
    } else {
      if (onSetQuantity) onSetQuantity(product.id, cartQuantity - 1);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border transition-all duration-150 select-none ${
        outOfStock
          ? 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 opacity-60 cursor-not-allowed'
          : isSelected
          ? 'border-[#009F6B] bg-[#E8F8F2]/60 dark:bg-emerald-950/30 ring-1 ring-[#009F6B]/30 shadow-xs'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:border-[#009F6B]/60 hover:shadow-sm cursor-pointer'
      }`}
    >
      {/* Product Image Area */}
      <div className="relative flex aspect-[4/3] max-h-24 sm:max-h-28 w-full shrink-0 items-center justify-center bg-slate-50 dark:bg-slate-800/60 p-2 overflow-hidden border-b border-slate-100 dark:border-slate-800/80">
        {product.imageUrl && !imageBroken ? (
          <img
            src={product.imageUrl}
            alt={`${product.name} - Mart System`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain transition-transform duration-150 group-hover:scale-105"
            onError={() => setImageBroken(true)}
          />
        ) : (
          <Package size={28} className="text-slate-300 dark:text-slate-600" />
        )}

        {/* Customer Stock Badges */}
        <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
          {outOfStock ? (
            <span className="rounded-md bg-rose-500 text-white px-1.5 py-0.5 text-[9px] font-bold shadow-2xs">
              អស់ស្តុក
            </span>
          ) : isLowStock ? (
            <span className="rounded-md bg-amber-500 text-white px-1.5 py-0.5 text-[9px] font-bold shadow-2xs">
              ស្តុកមានកំណត់
            </span>
          ) : (
            <span className="rounded-md bg-emerald-600/90 text-white px-1.5 py-0.5 text-[9px] font-bold shadow-2xs">
              មានក្នុងស្តុក
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          className={`absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full transition-transform active:scale-75 ${
            wishlisted
              ? 'bg-rose-50 dark:bg-rose-950/70 text-rose-500 shadow-2xs'
              : 'bg-white/80 dark:bg-slate-800/80 text-slate-400 hover:text-rose-500'
          }`}
          title={wishlisted ? 'ដកចេញពីបញ្ជីពេញចិត្ត' : 'ចូលចិត្ត'}
          aria-label="Wishlist toggle"
        >
          <Heart size={13} className={wishlisted ? 'fill-rose-500 text-rose-500' : ''} />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col p-2.5 sm:p-3 justify-between">
        <div>
          <h3
            className={`line-clamp-2 text-xs sm:text-[13px] font-bold leading-snug transition-colors ${
              isSelected
                ? 'text-[#00845A] dark:text-emerald-300'
                : 'text-[#0F172A] dark:text-slate-100 group-hover:text-[#009F6B] dark:group-hover:text-emerald-400'
            }`}
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Secondary SKU metadata */}
          <p className="mt-0.5 truncate text-[10px] text-[#64748B] dark:text-slate-500">
            {product.sku ? `SKU: ${product.sku}` : product.barcode ? `BAR: ${product.barcode}` : '\u00A0'}
          </p>
        </div>

        {/* Price and Stock Status */}
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-sm sm:text-base font-black text-[#009F6B] dark:text-emerald-400">
            {formatCurrency(product.price)}
          </span>
          {isAuthenticated && product.stockQuantity !== undefined && (
            <span className="text-[10px] font-medium text-[#64748B] dark:text-slate-400">
              ស្តុក {available}
            </span>
          )}
        </div>

        {/* Dynamic Action Button / Quantity Stepper */}
        <div className="mt-2.5">
          {outOfStock ? (
            <div className="flex h-8 sm:h-9 w-full items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-400 select-none">
              អស់ពីស្តុក
            </div>
          ) : isSelected ? (
            /* Selected State: Inline Stepper for Fast POS Speed */
            <div
              className="flex h-8 sm:h-9 w-full items-center justify-between rounded-xl bg-white dark:bg-slate-800 border border-[#009F6B] p-0.5 shadow-2xs"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={handleDecrement}
                className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 dark:hover:text-rose-400 transition active:scale-90 cursor-pointer"
                title={cartQuantity === 1 ? 'ដកចេញពីរទេះ' : 'បន្ថយ'}
                aria-label="Decrease quantity"
              >
                {cartQuantity === 1 ? <Trash2 size={13} className="text-rose-500" /> : <Minus size={13} />}
              </button>

              <span className="font-black text-xs sm:text-sm text-[#00845A] dark:text-emerald-300 px-1 select-none">
                {cartQuantity} ក្នុងរទេះ
              </span>

              <button
                type="button"
                onClick={handleIncrement}
                disabled={atMaxStock}
                className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-[#009F6B] text-white hover:bg-[#00845A] transition active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title={atMaxStock ? 'ដល់ស្តុកអតិបរមាហើយ' : 'បន្ថែម'}
                aria-label="Increase quantity"
              >
                <Plus size={13} />
              </button>
            </div>
          ) : (
            /* Unselected State: Clean Add to Cart Button */
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAdd(product);
              }}
              className="flex h-8 sm:h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-[#009F6B] text-xs font-bold text-white shadow-2xs hover:bg-[#00845A] transition-all active:scale-95 cursor-pointer"
            >
              <Plus size={14} />
              <span>បន្ថែមក្នុងរទេះ</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
