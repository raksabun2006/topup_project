import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, Minus, Trash2, Heart, ShoppingCart, Check } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

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

export default function ProductCard({
  product,
  onAdd,
  onSetQuantity,
  onRemove,
  cartQuantity = 0,
  onOpenDetails,
}) {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [imageBroken, setImageBroken] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

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
    } else if (product?.id) {
      navigate(`/product/${product.id}`);
    }
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    if (product?.id) {
      const next = toggleWishlist(product.id);
      setWishlisted(next);
    }
  };

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    if (outOfStock) return;
    if (onAdd) onAdd(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    if (atMaxStock) return;
    if (onSetQuantity) {
      onSetQuantity(product.id, cartQuantity + 1);
    } else if (onAdd) {
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
      className={`group relative flex flex-col justify-between rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-2.5 sm:p-3 transition-all duration-200 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer ${
        outOfStock ? 'opacity-70' : ''
      }`}
    >
      {/* Top Header: Category / Stock Tag & Wishlist Button */}
      <div className="flex items-center justify-between gap-1.5 pb-1.5">
        {outOfStock ? (
          <span className="rounded bg-rose-500 text-white px-1.5 py-0.5 text-[8px] sm:text-[9px] font-bold">
            {t('outOfStock')}
          </span>
        ) : isLowStock ? (
          <span className="rounded bg-amber-500 text-white px-1.5 py-0.5 text-[8px] sm:text-[9px] font-bold">
            {t('lowStock')} ({stock})
          </span>
        ) : product.category ? (
          <span className="rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 text-[8px] sm:text-[9px] font-bold text-slate-600 dark:text-slate-300 truncate max-w-[110px]">
            {product.category}
          </span>
        ) : (
          <span className="rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 text-[8px] sm:text-[9px] font-bold">
            {t('inStock')}
          </span>
        )}

        <button
          type="button"
          onClick={handleWishlistToggle}
          className={`flex h-5 w-5 items-center justify-center rounded-full border transition active:scale-75 ${
            wishlisted
              ? 'border-rose-200 bg-rose-50 text-rose-500'
              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500'
          }`}
          title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-label="Wishlist"
        >
          <Heart size={10} className={wishlisted ? 'fill-rose-500 text-rose-500' : ''} />
        </button>
      </div>

      {/* Compact Product Image Canvas */}
      <div className="relative flex aspect-[4/3] w-full max-h-36 sm:max-h-40 items-center justify-center p-2 overflow-hidden bg-slate-50/70 dark:bg-slate-800/60 rounded-lg">
        {product.imageUrl && !imageBroken ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="max-h-28 sm:max-h-32 max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageBroken(true)}
          />
        ) : (
          <Package size={32} className="text-slate-300 dark:text-slate-600" />
        )}
      </div>

      {/* Product Information */}
      <div className="space-y-1 pt-2">
        {product.sku && (
          <span className="text-[9px] text-slate-400 font-mono block truncate">
            SKU: {product.sku}
          </span>
        )}

        {/* Product Name */}
        <h3
          className="line-clamp-2 text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug min-h-[28px]"
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Price & Action Row */}
        <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
            {formatCurrency(product.price)}
          </span>

          {/* Stepper or Quick Add Button */}
          {outOfStock ? (
            <span className="text-[9px] font-bold text-rose-500">{t('outOfStock')}</span>
          ) : isSelected ? (
            <div
              className="flex h-6 items-center rounded-md bg-emerald-50 dark:bg-slate-800 border border-emerald-500 p-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={handleDecrement}
                className="flex h-4.5 w-4.5 items-center justify-center rounded text-emerald-700 dark:text-emerald-300 hover:bg-rose-100 transition cursor-pointer"
              >
                {cartQuantity === 1 ? <Trash2 size={9} className="text-rose-500" /> : <Minus size={9} />}
              </button>
              <span className="px-1 text-[10px] font-black text-emerald-700 dark:text-emerald-300 select-none">
                {cartQuantity}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                disabled={atMaxStock}
                className="flex h-4.5 w-4.5 items-center justify-center rounded bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-40 cursor-pointer"
              >
                <Plus size={9} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleQuickAdd}
              className={`flex h-6 sm:h-6.5 items-center justify-center gap-1 rounded-md px-2 text-[9px] sm:text-[10px] font-bold text-white transition-all active:scale-95 shadow-xs cursor-pointer ${
                justAdded
                  ? 'bg-emerald-600'
                  : 'bg-slate-900 dark:bg-emerald-600 hover:bg-emerald-600 dark:hover:bg-emerald-700'
              }`}
            >
              {justAdded ? (
                <>
                  <Check size={10} /> {t('added')}
                </>
              ) : (
                <>
                  <ShoppingCart size={10} /> {t('add')}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
