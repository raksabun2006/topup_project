import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  CreditCard,
  ScanBarcode,
  Package,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useGlobalScanner } from '../../context/GlobalScannerContext';
import { formatCurrency } from '../../utils/format';

/**
 * ActiveOrderDrawer Component
 * Slide-over right drawer displaying current order items, quantity controls,
 * total price, and one-click checkout actions from any page in the POS.
 */
export default function ActiveOrderDrawer() {
  const { isDrawerOpen, closeDrawer, openScanner } = useGlobalScanner();
  const { items, setQuantity, removeItem, clear, subtotal, itemCount } = useCart();
  const navigate = useNavigate();

  // Close drawer on ESC key
  useEffect(() => {
    if (!isDrawerOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  if (!isDrawerOpen) return null;

  const handleCheckout = () => {
    closeDrawer();
    navigate('/pos');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Current Active Order"
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={closeDrawer}
    >
      <div
        className="relative flex h-full w-full max-w-md flex-col bg-white dark:bg-slate-900 shadow-2xl animate-slide-left border-l border-slate-200 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4 bg-slate-50/70 dark:bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
              <ShoppingCart size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  រទេះបច្ចុប្បន្ន (Current Order)
                </h3>
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300">
                  {itemCount}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                ទំនិញទាំងអស់ក្នុងការលក់សកម្មនេះ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {items.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('តើអ្នកចង់សម្អាតទំនិញទាំងអស់ក្នុងរទេះនេះមែនទេ?')) {
                    clear();
                  }
                }}
                className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition cursor-pointer"
                title="សម្អាតរទេះ (Clear Cart)"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              type="button"
              onClick={closeDrawer}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
              aria-label="Close drawer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Drawer Content: Items List or Empty State */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 touch-scroll">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mb-3.5">
                <ShoppingCart size={32} />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                រទេះទទេ (No Active Items)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1 leading-relaxed">
                មិនទាន់មានទំនិញនៅក្នុងរទេះទេ។ ស្កេនបាកូដពីទំព័រណាមួយដើម្បីបន្ថែមទំនិញដោយស្វ័យប្រវត្តិ។
              </p>
              <button
                type="button"
                onClick={() => {
                  closeDrawer();
                  openScanner();
                }}
                className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/25 hover:bg-emerald-500 transition active:scale-95 cursor-pointer"
              >
                <ScanBarcode size={16} />
                <span>បើកកាមេរ៉ាស្កេន (Open Scanner)</span>
              </button>
            </div>
          ) : (
            items.map(({ product, quantity }) => {
              if (!product) return null;
              const lineTotal = (Number(product.price) || 0) * quantity;
              return (
                <div
                  key={product.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-850 p-3 shadow-2xs transition hover:border-slate-300 dark:hover:border-slate-700"
                >
                  {/* Thumbnail & Product Details */}
                  <div className="flex items-center gap-3 min-w-0">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-11 w-11 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 bg-white"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0 border border-slate-200 dark:border-slate-700">
                        <Package size={20} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {product.name}
                      </h4>
                      <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(product.price)}
                        {quantity > 1 && (
                          <span className="ml-1 text-slate-400 dark:text-slate-500 font-medium">
                            (សរុប៖ {formatCurrency(lineTotal)})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Quantity Adjustment Controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (quantity <= 1) {
                            removeItem(product.id);
                          } else {
                            setQuantity(product.id, quantity - 1);
                          }
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 transition active:scale-95"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-7 text-center text-xs font-black text-slate-900 dark:text-white">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(product.id, quantity + 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 transition active:scale-95"
                        aria-label="Increase quantity"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeItem(product.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      title="លុបមុខទំនិញនេះ"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer: Total & Actions */}
        {items.length > 0 && (
          <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/95 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-semibold text-slate-500 dark:text-slate-400">
                សរុបរួម ({itemCount} ចំនួន)
              </span>
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {formatCurrency(subtotal)}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  closeDrawer();
                  openScanner();
                }}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-3 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition active:scale-95 cursor-pointer"
                title="ស្កេនបន្ថែម"
              >
                <ScanBarcode size={16} />
                <span>ស្កេនបន្ថែម</span>
              </button>

              <button
                type="button"
                onClick={handleCheckout}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition active:scale-[0.98] cursor-pointer"
              >
                <CreditCard size={16} />
                <span>ទៅកាន់ការទូទាត់ប្រាក់ (Checkout)</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
