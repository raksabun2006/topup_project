import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, Minus, Trash2, Heart, ShoppingCart, Check } from 'lucide-react';
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

export default function ProductCard({
  product,
  onAdd,
  onSetQuantity,
  onRemove,
  cartQuantity = 0,
  onOpenDetails,
}) {
  const { isAuthenticated } = useAuth();
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
      className={`group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-4 transition-all duration-200 hover:shadow-lg hover:border-blue-500/50 cursor-pointer ${
        outOfStock ? 'opacity-70' : ''
      }`}
    >
      {/* Top Header: Real Category / Stock Tag & Wishlist Button */}
      <div className="flex items-center justify-between gap-2 pb-2">
        {outOfStock ? (
          <span className="rounded-md bg-rose-500 text-white px-2 py-0.5 text-[9px] font-bold">
            អស់ស្តុក (Out of Stock)
          </span>
        ) : isLowStock ? (
          <span className="rounded-md bg-amber-500 text-white px-2 py-0.5 text-[9px] font-bold">
            ស្តុកមានកំណត់ ({stock})
          </span>
        ) : product.category ? (
          <span className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 text-[9px] font-bold text-slate-600 dark:text-slate-300 truncate max-w-[130px]">
            {product.category}
          </span>
        ) : (
          <span className="rounded-md bg-blue-50 text-blue-600 px-2 py-0.5 text-[9px] font-bold">
            In Stock
          </span>
        )}

        <button
          type="button"
          onClick={handleWishlistToggle}
          className={`flex h-6 w-6 items-center justify-center rounded-full border transition active:scale-75 ${
            wishlisted
              ? 'border-rose-200 bg-rose-50 text-rose-500'
              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500'
          }`}
          title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-label="Wishlist"
        >
          <Heart size={12} className={wishlisted ? 'fill-rose-500 text-rose-500' : ''} />
        </button>
      </div>

      {/* Real Product Image Canvas */}
      <div className="relative flex aspect-square w-full items-center justify-center p-2 overflow-hidden bg-slate-50/50 dark:bg-slate-800/50 rounded-xl">
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
          <Package size={44} className="text-slate-300 dark:text-slate-600" />
        )}
      </div>

      {/* Product Information */}
      <div className="space-y-1.5 pt-2.5">
        {product.sku && (
          <span className="text-[10px] text-slate-400 font-mono block truncate">
            SKU: {product.sku}
          </span>
        )}

        {/* Real Product Name */}
        <h3
          className="line-clamp-2 text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors leading-snug"
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Real Price & Action */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
            {formatCurrency(product.price)}
          </span>

          {/* Stepper or Quick Add Button */}
          {outOfStock ? (
            <span className="text-[10px] font-bold text-rose-500">អស់ស្តុក</span>
          ) : isSelected ? (
            <div
              className="flex h-7 items-center rounded-lg bg-blue-50 dark:bg-slate-800 border border-blue-500 p-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={handleDecrement}
                className="flex h-5 w-5 items-center justify-center rounded text-blue-700 dark:text-blue-300 hover:bg-rose-100 transition cursor-pointer"
              >
                {cartQuantity === 1 ? <Trash2 size={10} className="text-rose-500" /> : <Minus size={10} />}
              </button>
              <span className="px-1 text-[11px] font-black text-blue-700 dark:text-blue-300 select-none">
                {cartQuantity}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                disabled={atMaxStock}
                className="flex h-5 w-5 items-center justify-center rounded bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-40 cursor-pointer"
              >
                <Plus size={10} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleQuickAdd}
              className={`flex h-7 items-center justify-center gap-1 rounded-lg px-2.5 text-[10px] font-bold text-white transition-all active:scale-95 shadow-xs cursor-pointer ${
                justAdded
                  ? 'bg-emerald-600'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {justAdded ? (
                <>
                  <Check size={11} /> បានបន្ថែម
                </>
              ) : (
                <>
                  <ShoppingCart size={11} /> Add
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
