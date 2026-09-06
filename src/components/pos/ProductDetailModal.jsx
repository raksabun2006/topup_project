import { useState, useEffect } from 'react';
import { X, Plus, Minus, ShoppingBag, Package, Check, Tag, Info } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { useAuth } from '../../context/AuthContext';

export default function ProductDetailModal({ product, onClose, onAdd, cartQuantity = 0 }) {
  const { isAuthenticated } = useAuth();
  const [qty, setQty] = useState(1);
  const [imageBroken, setImageBroken] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  useEffect(() => {
    setImageBroken(false);
    setQty(1);
  }, [product]);

  if (!product) return null;

  const stock = product.stockQuantity ?? 0;
  const outOfStock = stock <= 0;
  const isLowStock = !outOfStock && stock <= 5;
  const availableStock = Math.max(0, stock - cartQuantity);

  const handleIncrement = () => {
    if (qty < availableStock) {
      setQty((q) => q + 1);
    }
  };

  const handleDecrement = () => {
    if (qty > 1) {
      setQty((q) => q - 1);
    }
  };

  const handleAddToCart = () => {
    if (outOfStock || availableStock <= 0) return;
    onAdd(product, qty);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
    }, 400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl animate-slide-up sm:animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#009F6B] dark:text-emerald-400">
              <Info size={16} />
            </span>
            <h3 className="text-sm font-bold text-[#172033] dark:text-white">ព័ត៌មានលម្អិតទំនិញ</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Image & Price Area */}
          <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
            <div className="relative flex aspect-square w-full sm:w-44 shrink-0 items-center justify-center rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-4 overflow-hidden">
              {product.imageUrl && !imageBroken ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-contain"
                  onError={() => setImageBroken(true)}
                />
              ) : (
                <Package size={48} className="text-slate-300 dark:text-slate-600" />
              )}

              {/* Status Pill on image */}
              <div className="absolute top-2 left-2">
                {outOfStock ? (
                  <span className="rounded-md bg-rose-500 text-white px-2 py-0.5 text-[10px] font-bold shadow-xs">
                    អស់ស្តុក (Out of Stock)
                  </span>
                ) : isLowStock ? (
                  <span className="rounded-md bg-amber-500 text-white px-2 py-0.5 text-[10px] font-bold shadow-xs">
                    ស្តុកមានកំណត់ (Low Stock)
                  </span>
                ) : (
                  <span className="rounded-md bg-[#009F6B] text-white px-2 py-0.5 text-[10px] font-bold shadow-xs">
                    មានក្នុងស្តុក (In Stock)
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0 space-y-2 text-left w-full">
              <h2 className="text-base sm:text-lg font-black text-[#0F172A] dark:text-white leading-snug">
                {product.name}
              </h2>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                {product.category && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 font-semibold text-slate-700 dark:text-slate-300">
                    <Tag size={12} className="text-slate-400" />
                    {product.category}
                  </span>
                )}
                {product.sku && (
                  <span className="rounded-lg border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    SKU: {product.sku}
                  </span>
                )}
                {isAuthenticated && (
                  <span className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    ស្តុកជាក់ស្តែង: {stock}
                  </span>
                )}
              </div>

              {/* Price Display */}
              <div className="pt-1">
                <span className="text-2xl font-black text-[#009F6B] dark:text-emerald-400">
                  {formatCurrency(product.price)}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {product.description ? (
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-3.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">ការពិពណ៌នាទំនិញ</p>
              <p>{product.description}</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-3 text-center text-xs text-slate-400">
              ទំនិញដែលមានគុណភាពខ្ពស់ ពី Mart System
            </div>
          )}

          {/* Quantity Selector Section */}
          {!outOfStock && (
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 p-3.5">
              <div>
                <span className="text-xs font-bold text-[#0F172A] dark:text-white">ជ្រើសរើសចំនួន</span>
                {cartQuantity > 0 && (
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    (មាន {cartQuantity} ក្នុងរទេះរួចហើយ)
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-700 shadow-2xs">
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={qty <= 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-90 disabled:opacity-40 cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center text-sm font-black text-[#0F172A] dark:text-white select-none">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={qty >= availableStock}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#009F6B] text-white hover:bg-[#00845A] transition active:scale-90 disabled:opacity-40 cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Add to Cart Action */}
        <div className="shrink-0 border-t border-slate-100 dark:border-slate-800 p-4 bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={outOfStock || availableStock <= 0}
            className={`flex h-12 sm:h-13 w-full items-center justify-center gap-2 rounded-2xl font-extrabold text-sm sm:text-base shadow-lg transition-all active:scale-[0.98] cursor-pointer ${
              addedAnimation
                ? 'bg-emerald-700 text-white'
                : 'bg-[#009F6B] text-white hover:bg-[#00845A] shadow-[#009F6B]/20'
            } disabled:cursor-not-allowed disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400`}
          >
            {addedAnimation ? (
              <>
                <Check size={18} />
                <span>បានបន្ថែមរួចរាល់!</span>
              </>
            ) : outOfStock ? (
              <span>អស់ពីស្តុកហើយ</span>
            ) : (
              <>
                <ShoppingBag size={18} />
                <span>បន្ថែមក្នុងរទេះ · {formatCurrency((product.price || 0) * qty)}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
