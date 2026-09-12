import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Plus, Minus, Trash2, Heart, ShoppingBag, Check, Star, Flame } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import { getProductUrl } from '../utils/seoSlug';
import { useLanguage } from '../context/LanguageContext';
import { useWishlist } from '../hooks/useWishlist';

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
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [imageBroken, setImageBroken] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    setImageBroken(false);
  }, [product?.id, product?.imageUrl]);

  if (!product) return null;
  const wishlisted = isInWishlist(product.id);
  const stock = product.stockQuantity ?? 0;
  const outOfStock = stock <= 0;
  const isLowStock = !outOfStock && stock <= 5;
  const available = Math.max(0, stock - cartQuantity);
  const atMaxStock = available <= 0 && cartQuantity > 0;
  const isSelected = cartQuantity > 0;

  const hasDiscount =
    Boolean(product.originalPrice) &&
    Number(product.originalPrice) > Number(product.price);
  const savings = hasDiscount ? Number(product.originalPrice) - Number(product.price) : 0;

  // Resolve dynamic badge
  let badgeText = product.badge;
  if (!badgeText) {
    if (outOfStock) badgeText = t('outOfStock');
    else if (isLowStock) badgeText = `LOW STOCK (${stock})`;
  }

  const isDiscountBadge = Boolean(
    badgeText && (badgeText.startsWith('-') || badgeText.includes('%') || badgeText.toLowerCase().includes('sale'))
  );

  const productUrl = getProductUrl(product);

  const handleCardClick = () => {
    if (onOpenDetails) {
      onOpenDetails(product);
    } else if (product?.id) {
      navigate(productUrl);
    }
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    if (product?.id) {
      toggleWishlist(product.id);
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
      className={`group relative flex flex-col justify-between rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3 sm:p-3.5 transition-all duration-300 hover:shadow-xl hover:border-indigo-500/40 dark:hover:border-slate-700 hover:-translate-y-0.5 cursor-pointer shadow-2xs ${
        outOfStock ? 'opacity-75' : ''
      }`}
    >
      {/* Top Overlay: Badges & Wishlist Heart */}
      <div className="absolute top-3 inset-x-3 z-10 flex items-center justify-between pointer-events-none">
        {badgeText ? (
          <span
            className={`rounded-lg px-2 py-0.5 text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-white shadow-xs ${
              outOfStock
                ? 'bg-slate-700'
                : isDiscountBadge
                ? 'bg-gradient-to-r from-rose-600 to-red-600 ring-1 ring-white/20'
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

      {/* Product Image Stage (Clean Unified Soft Canvas) */}
      <Link
        to={productUrl}
        onClick={(e) => {
          if (onOpenDetails) {
            e.preventDefault();
            onOpenDetails(product);
          }
        }}
        aria-label={product.name}
        className="relative aspect-square w-full rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-850 p-2 sm:p-2.5 flex items-center justify-center overflow-hidden mb-2.5 block"
      >
        {product.imageUrl && !imageBroken ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            width="200"
            height="200"
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageBroken(true)}
          />
        ) : (
          <Package size={32} className="text-slate-300" />
        )}
      </Link>

      {/* Product Information */}
      <div className="space-y-1.5">
        {/* Product Name */}
        <h3 className="line-clamp-2 text-xs font-bold leading-snug min-h-[32px]">
          <Link
            to={productUrl}
            onClick={(e) => {
              if (onOpenDetails) {
                e.preventDefault();
                onOpenDetails(product);
              }
            }}
            className="text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
            title={product.name}
          >
            {product.name}
          </Link>
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

        {/* Flash Sale Progress Bar (if claimedPercent provided) */}
        {product.claimedPercent != null && (
          <div className="pt-0.5 space-y-1">
            <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-bold">
              <span className="text-rose-600 dark:text-rose-400 flex items-center gap-0.5">
                <Flame size={10} className="fill-rose-500 text-rose-500" />
                {product.claimedPercent >= 80 ? 'Almost Sold' : 'Selling Fast'}
              </span>
              <span className="text-slate-400 text-[9px]">{product.claimedPercent}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-rose-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, product.claimedPercent)}%` }}
              />
            </div>
          </div>
        )}

        {/* Price & Action Row */}
        <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-col min-w-0 pr-1">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span
                className={`text-xs sm:text-sm font-black ${
                  hasDiscount ? 'text-rose-600 dark:text-rose-400' : 'text-slate-950 dark:text-white'
                }`}
              >
                {formatCurrency(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 line-through font-semibold">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>
            {hasDiscount && savings > 0 && (
              <span className="text-[8px] sm:text-[9px] font-bold text-emerald-600 dark:text-emerald-400 truncate">
                Save {formatCurrency(savings)}
              </span>
            )}
          </div>

          {/* Stepper or 1-Click Cart Button */}
          {outOfStock ? (
            <span className="text-[9px] font-bold text-rose-500 shrink-0">{t('outOfStock')}</span>
          ) : isSelected ? (
            <div
              className="flex h-7 items-center rounded-full bg-indigo-50 dark:bg-slate-800 border border-indigo-500/60 p-0.5 shadow-2xs shrink-0"
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
              className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full transition-all active:scale-90 shadow-xs cursor-pointer shrink-0 ${
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
