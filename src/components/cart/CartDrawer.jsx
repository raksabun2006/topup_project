import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/format';

export default function CartDrawer({ isOpen, onClose }) {
  const { items, setQuantity, removeItem, clear, subtotal, itemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const deliveryFee = !isAuthenticated && items.length > 0 ? 1.5 : 0;
  const total = Math.max(0, subtotal + deliveryFee);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-out Drawer Panel */}
      <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-white dark:bg-slate-900 shadow-2xl animate-slide-left border-l border-slate-200 dark:border-slate-800">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#009F6B] text-white shadow-xs">
              <ShoppingBag size={18} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                រទេះទំនិញ (Your Cart)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('តើអ្នកចង់សម្អាតទំនិញទាំងអស់ចេញពីរទេះមែនទេ?')) {
                    clear();
                  }
                }}
                className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                title="សម្អាតរទេះ"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
              aria-label="Close drawer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Drawer Body: Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-100 dark:divide-slate-800">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mb-3">
                <ShoppingBag size={32} />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">រទេះទំនិញរបស់អ្នកនៅទំនេរ</h4>
              <p className="mt-1 text-xs text-slate-400 max-w-xs">
                ជ្រើសរើសទំនិញដែលអ្នកពេញចិត្ត និងបន្ថែមក្នុងរទេះដើម្បីទិញឥឡូវនេះ
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/shop');
                }}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#009F6B] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#009F6B]/20 hover:bg-[#00845A] transition"
              >
                <span>មើលទំនិញទាំងអស់</span>
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
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1.5 overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-contain"
                        onError={(e) => { e.target.style.display = 'none'; }}
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
                    <p className="text-xs font-black text-[#009F6B] dark:text-emerald-400 mt-0.5">
                      {formatCurrency(unitPrice)}
                    </p>

                    {/* Stepper */}
                    <div className="mt-2 flex items-center gap-1.5">
                      <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (quantity === 1) removeItem(product.id);
                            else setQuantity(product.id, quantity - 1);
                          }}
                          className="flex h-6 w-6 items-center justify-center rounded-md bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 hover:bg-rose-50 hover:text-rose-600 transition active:scale-90"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-slate-900 dark:text-white select-none">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(product.id, quantity + 1)}
                          disabled={atMax}
                          className="flex h-6 w-6 items-center justify-center rounded-md bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 hover:bg-emerald-50 hover:text-[#009F6B] transition active:scale-90 disabled:opacity-40"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(product.id)}
                        className="rounded-lg p-1 text-slate-400 hover:text-rose-600 transition"
                        title="លុបចេញ"
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
          <div className="shrink-0 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900 p-4 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>សរុបរង (Subtotal)</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Truck size={12} className="text-[#009F6B]" />
                  <span>ដឹកជញ្ជូន (Delivery)</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(deliveryFee)}</span>
              </div>
              <div className="flex items-baseline justify-between border-t border-slate-200 dark:border-slate-800 pt-2 text-sm font-bold text-slate-900 dark:text-white">
                <span>សរុប (Total)</span>
                <span className="text-xl font-black text-[#009F6B] dark:text-emerald-400">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/cart');
                }}
                className="flex items-center justify-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 transition cursor-pointer"
              >
                មើលកន្រ្តក (View Cart)
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/checkout');
                }}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-[#009F6B] py-3 text-xs font-bold text-white shadow-md shadow-[#009F6B]/25 hover:bg-[#00845A] transition active:scale-[0.98] cursor-pointer"
              >
                <span>ទូទាត់ប្រាក់</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
