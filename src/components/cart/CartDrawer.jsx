import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck, Sparkles, Check, Tag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useActiveDiscounts } from '../../hooks/useDiscounts';
import { formatCurrency } from '../../utils/format';

export default function CartDrawer({ isOpen, onClose }) {
  const { items, setQuantity, removeItem, clear, subtotal, itemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const { discounts: activeDiscounts, reload: reloadDiscounts } = useActiveDiscounts();
  const navigate = useNavigate();

  const freeDeliveryThreshold = 25.0;
  const isFreeDelivery = subtotal >= freeDeliveryThreshold;
  const amountToFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const deliveryProgress = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  const deliveryFee = items.length === 0 ? 0 : isFreeDelivery ? 0 : 1.5;
  const total = Math.max(0, subtotal + deliveryFee);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      reloadDiscounts();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, reloadDiscounts]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fade-in font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-out Drawer Panel */}
      <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-white dark:bg-slate-900 shadow-2xl animate-slide-left border-l border-slate-200/80 dark:border-slate-800">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#18181B] dark:bg-slate-800 text-white shadow-xs">
              <ShoppingBag size={18} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                Your Cart
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                {itemCount} {itemCount === 1 ? 'item' : 'items'} in your bag
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {items.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Clear all items from your cart?')) {
                    clear();
                  }
                }}
                className="rounded-full p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                title="Clear Cart"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              aria-label="Close drawer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Free Delivery Progress Bar */}
        {items.length > 0 && (
          <div className="px-5 py-3 bg-slate-50/80 dark:bg-slate-850/50 border-b border-slate-100 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                <Truck size={14} className={isFreeDelivery ? 'text-emerald-500' : 'text-slate-400'} />
                {isFreeDelivery ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                    <Check size={13} /> You unlocked Free Express Delivery!
                  </span>
                ) : (
                  <span>
                    Add <strong className="text-slate-900 dark:text-white">{formatCurrency(amountToFreeDelivery)}</strong> for Free Delivery
                  </span>
                )}
              </span>
              <span className="text-[11px] font-bold text-slate-400">{deliveryProgress}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isFreeDelivery ? 'bg-emerald-500' : 'bg-slate-900 dark:bg-emerald-400'
                }`}
                style={{ width: `${deliveryProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Active Backend Promotions Notice */}
        {activeDiscounts.length > 0 && (
          <div className="px-4 py-2 bg-rose-50/80 dark:bg-rose-950/30 border-b border-rose-100 dark:border-rose-900/30 flex items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-1.5 font-bold text-rose-700 dark:text-rose-300">
              <Tag size={13} className="shrink-0" />
              <span>
                {activeDiscounts[0].code
                  ? `Active Promo: Use code ${activeDiscounts[0].code}`
                  : activeDiscounts[0].name}
              </span>
            </span>
            {activeDiscounts[0].value && (
              <span className="font-black text-rose-700 dark:text-rose-300">
                {activeDiscounts[0].type === 'PERCENTAGE' || activeDiscounts[0].discountType === 'PERCENTAGE'
                  ? `${activeDiscounts[0].value}% OFF`
                  : `${formatCurrency(activeDiscounts[0].value)} OFF`}
              </span>
            )}
          </div>
        )}

        {/* Drawer Body: Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-100 dark:divide-slate-800 scrollbar-thin">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#F7F7F8] dark:bg-slate-800 text-slate-300 dark:text-slate-600 mb-4">
                <ShoppingBag size={38} />
              </div>
              <h4 className="text-base font-black text-slate-900 dark:text-white">Your Cart is Empty</h4>
              <p className="mt-1 text-xs text-slate-400 max-w-xs font-medium">
                Looks like you haven't added anything yet. Discover our fresh groceries and trending goods!
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/shop');
                }}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#18181B] dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 text-xs font-bold shadow-md hover:scale-105 transition-transform cursor-pointer"
              >
                <span>Start Shopping</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            items.map((item) => {
              const { product, quantity } = item;
              const unitPrice = Number(product.price) || 0;
              const lineTotal = unitPrice * quantity;
              const maxStock = product.stockQuantity ?? Infinity;
              const atMax = quantity >= maxStock;

              return (
                <div key={product.id} className="pt-3 first:pt-0 flex items-center gap-3">
                  {/* Thumbnail */}
                  <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-slate-100 dark:border-slate-800 bg-[#F7F7F8] dark:bg-slate-800 p-2 overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-contain"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <ShoppingBag size={20} className="text-slate-400" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h5 className="truncate text-xs font-bold text-slate-900 dark:text-white" title={product.name}>
                      {product.name}
                    </h5>
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white mt-0.5">
                      {formatCurrency(unitPrice)}
                    </p>

                    {/* Stepper */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => {
                            if (quantity === 1) removeItem(product.id);
                            else setQuantity(product.id, quantity - 1);
                          }}
                          className="flex h-5 w-5 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-rose-600 transition active:scale-90 cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="w-6 text-center text-xs font-black text-slate-900 dark:text-white select-none">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(product.id, quantity + 1)}
                          disabled={atMax}
                          className="flex h-5 w-5 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-emerald-600 transition active:scale-90 disabled:opacity-30 cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus size={11} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(product.id)}
                        className="rounded-lg p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Line Total */}
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {formatCurrency(lineTotal)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer / Summary */}
        {items.length > 0 && (
          <div className="shrink-0 border-t border-slate-200/80 dark:border-slate-800 bg-[#F7F7F8] dark:bg-slate-900/90 p-4 sm:p-5 space-y-3">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-500 dark:text-slate-400 font-medium">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <Truck size={13} className="text-slate-400" />
                  <span>Express Delivery</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {isFreeDelivery ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-black uppercase text-[11px]">FREE</span>
                  ) : (
                    formatCurrency(deliveryFee)
                  )}
                </span>
              </div>
              <div className="flex items-baseline justify-between border-t border-slate-200 dark:border-slate-800 pt-2.5 text-sm font-bold text-slate-900 dark:text-white">
                <span className="text-sm font-black">Estimated Total</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/cart');
                }}
                className="flex items-center justify-center rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 text-xs font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 shadow-2xs transition cursor-pointer"
              >
                View Cart
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/checkout');
                }}
                className="flex items-center justify-center gap-2 rounded-full bg-[#18181B] dark:bg-emerald-600 py-3 text-xs font-black text-white shadow-md hover:opacity-95 transition active:scale-95 cursor-pointer"
              >
                <span>Checkout</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

