import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, Minus, Trash2, Heart, ShoppingBag, Check, Star } from 'lucide-react';
import { formatCurrency } from '../utils/format';
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

  // Resolve dynamic badge
  let badgeText = product.badge;
  if (!badgeText) {
    if (outOfStock) badgeText = t('outOfStock');
    else if (isLowStock) badgeText = `LOW STOCK (${stock})`;
  }

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
    setTimeout(() => setJustAdded(false), 1200);
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
      className={`group relative flex flex-col justify-between rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-2.5 sm:p-3.5 transition-all duration-300 hover:shadow-xl hover:border-indigo-500/40 dark:hover:border-slate-700 hover:-translate-y-0.5 cursor-pointer shadow-2xs ${
        outOfStock ? 'opacity-75' : ''
      }`}
    >
      {/* Top Overlay: Badges & Wishlist Heart */}
      <div className="absolute top-2.5 inset-x-2.5 z-10 flex items-center justify-between pointer-events-none">
        {badgeText ? (
          <span
            className={`rounded-lg px-2 py-0.5 text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-white shadow-xs ${
              outOfStock
                ? 'bg-rose-500'
                : isLowStock
                ? 'bg-amber-500'
                : 'bg-[#635BFF]'
            }`}
          >
            {badgeText}
          </span>
        ) : product.category ? (
          <span className="rounded-lg bg-slate-900/85 text-white backdrop-blur-xs px-2 py-0.5 text-[8px] sm:text-[9px] font-bold truncate max-w-[105px] shadow-xs">
            {product.category}
          </span>
        ) : (
          <div />
        )}

        <button
          type="button"
          onClick={handleWishlistToggle}
          className={`pointer-events-auto flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-xs border border-slate-200/80 dark:border-slate-700 transition active:scale-75 shadow-xs ${
            wishlisted
              ? 'text-rose-500'
              : 'text-slate-400 hover:text-rose-500'
          }`}
          title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-label="Wishlist"
        >
          <Heart size={12} className={wishlisted ? 'fill-rose-500' : ''} />
        </button>
      </div>

      {/* Product Image Stage (Clean Unified Rounded White Canvas) */}
      <div className="relative aspect-square w-full rounded-xl sm:rounded-2xl bg-white p-2.5 sm:p-3 flex items-center justify-center overflow-hidden mb-2.5 sm:mb-3 shadow-2xs border border-slate-100 dark:border-slate-800/50">
        {product.imageUrl && !imageBroken ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageBroken(true)}
          />
        ) : (
          <Package size={32} className="text-slate-300" />
        )}
      </div>

      {/* Product Information */}
      <div className="space-y-1.5">
        {/* Product Name */}
        <h3
          className="line-clamp-2 text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug min-h-[32px]"
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Stars Rating */}
        <div className="flex items-center gap-1 text-amber-400 text-[10px]">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={10} className="fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-slate-400 text-[9px] font-semibold">
            ({product.reviewsCount || 48})
          </span>
        </div>

        {/* Price & Action Row */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs sm:text-sm font-black text-slate-950 dark:text-white">
            {formatCurrency(product.price)}
          </span>

          {/* Stepper or 1-Click Cart Button */}
          {outOfStock ? (
            <span className="text-[9px] font-bold text-rose-500">{t('outOfStock')}</span>
          ) : isSelected ? (
            <div
              className="flex h-7 items-center rounded-full bg-indigo-50 dark:bg-slate-800 border border-indigo-500/60 p-0.5 shadow-2xs"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={handleDecrement}
                className="flex h-5 w-5 items-center justify-center rounded-full text-indigo-700 dark:text-indigo-300 hover:bg-rose-100 transition cursor-pointer"
              >
                {cartQuantity === 1 ? <Trash2 size={9} className="text-rose-500" /> : <Minus size={9} />}
              </button>
              <span className="px-1.5 text-[10px] font-black text-indigo-700 dark:text-indigo-300 select-none">
                {cartQuantity}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                disabled={atMaxStock}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-[#635BFF] text-white hover:bg-indigo-700 transition disabled:opacity-40 cursor-pointer"
              >
                <Plus size={9} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleQuickAdd}
              aria-label={`Add ${product.name} to cart`}
              className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full transition-all active:scale-90 shadow-xs cursor-pointer ${
                justAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 hover:bg-[#635BFF] hover:text-white'
              }`}
            >
              {justAdded ? <Check size={13} /> : <ShoppingBag size={13} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
