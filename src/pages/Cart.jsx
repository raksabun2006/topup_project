import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, Trash2, Plus, Minus, ArrowRight, ArrowLeft, Truck,
  ShieldCheck, RotateCcw, CheckCircle2
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/format';
import SEO from '../components/SEO';

export default function Cart() {
  const { items, setQuantity, removeItem, clear, subtotal, itemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Estimated delivery fee for online orders ($1.50)
  const deliveryFee = items.length > 0 ? 1.50 : 0;
  const total = Math.max(0, subtotal + deliveryFee);

  if (items.length === 0) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center bg-white dark:bg-slate-950 px-4 py-16 text-center space-y-4">
        <SEO title="Your Shopping Cart | Mart System" canonical="/cart" />
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#F7F7F8] dark:bg-slate-900 text-slate-400">
          <ShoppingBag size={38} />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            កន្ត្រករបស់អ្នកទទេ
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Your cart is currently empty. Explore our store to find your favorite items.
          </p>
        </div>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 rounded-full bg-[#18181B] dark:bg-white text-white dark:text-slate-900 px-7 py-3 text-xs sm:text-sm font-black hover:opacity-90 transition shadow-md active:scale-95 cursor-pointer"
        >
          <span>ចាប់ផ្តើមទិញទំនិញ</span>
          <ArrowRight size={15} />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-28 sm:pb-20">
      <SEO title="Shopping Cart | Mart System" canonical="/cart" />

      <div className="mx-auto max-w-6xl px-3 sm:px-6 py-4 sm:py-8 space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>បន្តទិញទំនិញ</span>
            <span className="text-[11px] text-slate-400 hidden xs:inline">• Continue Shopping</span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs font-bold select-none">
            <span className="flex items-center gap-1 rounded-full bg-[#18181B] dark:bg-white text-white dark:text-slate-900 px-2.5 py-0.5 text-[10px] font-black shadow-2xs">
              <span>1. កន្ត្រកទំនិញ (Cart)</span>
            </span>
            <span className="text-slate-300 dark:text-slate-700">›</span>
            <span className="text-slate-400 dark:text-slate-600">2. Checkout</span>
            <span className="text-slate-300 dark:text-slate-700">›</span>
            <span className="text-slate-400 dark:text-slate-600">3. Payment</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              កន្ត្រកទំនិញរបស់អ្នក
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Your Shopping Bag • {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('សម្អាតទំនិញទាំងអស់ចេញពីកន្ត្រក? (Clear all items from cart?)')) {
                clear();
              }
            }}
            className="flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-800 px-3.5 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:border-rose-200 transition cursor-pointer"
          >
            <Trash2 size={13} />
            <span className="hidden sm:inline">សម្អាតកន្ត្រក</span>
            <span>Clear</span>
          </button>
        </div>

        {/* 2-Column Cart Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left: Items List */}
          <div className="lg:col-span-8 rounded-3xl bg-[#F7F7F8] dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-4 sm:p-6 divide-y divide-slate-200/60 dark:divide-slate-800">
            {items.map((item) => {
              const { product, quantity } = item;
              const unitPrice = Number(product.price) || 0;
              const lineTotal = unitPrice * quantity;
              const maxStock = product.stockQuantity ?? Infinity;
              const atMax = quantity >= maxStock;

              return (
                <div key={product.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Thumbnail Stage */}
                    <div className="relative flex h-18 w-18 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 p-2 overflow-hidden border border-slate-100 dark:border-slate-700 shadow-2xs">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-contain"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <ShoppingBag size={24} className="text-slate-300" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <Link
                        to={`/product/${product.id}`}
                        className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white hover:text-emerald-600 transition truncate block"
                      >
                        {product.name}
                      </Link>

                      {product.category && (
                        <span className="text-[11px] font-semibold text-slate-400 block mt-0.5">
                          {product.category}
                        </span>
                      )}

                      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {quantity > 1 ? (
                          <span>{formatCurrency(unitPrice)} <span className="text-[10px] text-slate-400">/ មួយ</span></span>
                        ) : (
                          <span>{formatCurrency(unitPrice)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quantity Stepper & Line Total */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="flex h-9 items-center rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => {
                          if (quantity <= 1) removeItem(product.id);
                          else setQuantity(product.id, quantity - 1);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer active:scale-90"
                        aria-label="Decrease quantity"
                      >
                        {quantity === 1 ? <Trash2 size={12} className="text-rose-500" /> : <Minus size={12} />}
                      </button>

                      <span className="w-10 text-center font-black text-xs text-slate-900 dark:text-white select-none">
                        {quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => setQuantity(product.id, quantity + 1)}
                        disabled={atMax}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition disabled:opacity-30 cursor-pointer active:scale-90"
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <div className="text-right min-w-[70px] sm:min-w-[85px]">
                      <span className="text-base font-black text-slate-900 dark:text-white">
                        {formatCurrency(lineTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-4 rounded-3xl bg-[#F7F7F8] dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 space-y-6 sticky top-20">
            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight border-b border-slate-200/60 dark:border-slate-800 pb-3">
              សង្ខេបការបញ្ជាទិញ (Summary)
            </h2>

            <div className="space-y-3 text-xs font-semibold">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>សរុបទំនិញ (Subtotal)</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Truck size={14} className="text-indigo-600 dark:text-indigo-400" />
                  <span>ថ្លៃដឹកជញ្ជូន (Delivery)</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {deliveryFee > 0 ? formatCurrency(deliveryFee) : 'Free ($0.00)'}
                </span>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-between items-baseline">
                <span className="text-sm font-black text-slate-900 dark:text-white">សរុប (Total)</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            {/* Desktop Checkout CTA (Hidden on mobile to avoid duplicate with sticky bar) */}
            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="hidden lg:flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#18181B] dark:bg-white text-white dark:text-slate-900 text-xs sm:text-sm font-black hover:opacity-90 transition active:scale-95 shadow-md cursor-pointer"
            >
              <span>ទៅ Checkout</span>
              <span className="text-xs opacity-80 hidden xs:inline">• Proceed</span>
              <ArrowRight size={16} />
            </button>

            <div className="pt-2 text-center">
              <Link
                to="/shop"
                className="text-xs font-bold text-slate-500 hover:text-black dark:hover:text-white transition"
              >
                ← បន្តទិញទំនិញ (Continue Shopping)
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar on Mobile for Instant 1-Touch Checkout */}
      <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-3 shadow-2xl">
        <div className="mx-auto max-w-md flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 font-bold block">សរុប (Total)</span>
            <span className="text-lg font-black text-slate-900 dark:text-white leading-none">
              {formatCurrency(total)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/checkout')}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-[#18181B] dark:bg-white text-white dark:text-slate-900 py-3 text-xs font-black shadow-md active:scale-95 transition cursor-pointer"
          >
            <span>ទៅ Checkout</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

