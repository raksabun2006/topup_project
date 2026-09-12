import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, Trash2, Plus, Minus, ArrowRight, ArrowLeft, Truck,
  ShieldCheck, RotateCcw, CheckCircle2, Heart, Tag, X, AlertCircle, Check
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../hooks/useWishlist';
import { useAuth } from '../context/AuthContext';
import { useActiveDiscounts } from '../hooks/useDiscounts';
import { formatCurrency } from '../utils/format';
import SEO from '../components/SEO';

const COUPON_STORAGE_KEY = 'mart_applied_coupon';

export default function Cart() {
  const { items, setQuantity, removeItem, clear, subtotal, itemCount } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { discounts: activeDiscounts } = useActiveDiscounts();
  const navigate = useNavigate();

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const raw = sessionStorage.getItem(COUPON_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Sync applied coupon to sessionStorage
  useEffect(() => {
    try {
      if (appliedCoupon) {
        sessionStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
      } else {
        sessionStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, [appliedCoupon]);

  // Handle coupon application
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');

    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    // Match against active discounts from backend
    const match = activeDiscounts.find(
      (d) => d.code && d.code.toUpperCase() === code && d.status === 'ACTIVE'
    );

    if (!match) {
      // Allow demo WELCOME10 or SUMMER20 if not loaded from backend
      if (code === 'WELCOME10') {
        const discountObj = {
          code: 'WELCOME10',
          name: 'Welcome 10% Discount',
          type: 'PERCENTAGE',
          value: 10,
          minSpend: 5,
        };
        if (subtotal < (discountObj.minSpend || 0)) {
          setCouponError(`Minimum order amount of ${formatCurrency(discountObj.minSpend)} required.`);
          return;
        }
        setAppliedCoupon(discountObj);
        setCouponSuccess('Coupon applied: 10% off!');
        setCouponCode('');
        return;
      }
      setCouponError('Invalid or expired coupon code.');
      return;
    }

    // Check minimum spend requirement
    if (match.minSpend && subtotal < Number(match.minSpend)) {
      setCouponError(`Minimum order amount of ${formatCurrency(match.minSpend)} required.`);
      return;
    }

    // Check expiration date if present
    if (match.endDate) {
      const exp = new Date(match.endDate);
      if (exp.getTime() < Date.now()) {
        setCouponError('This coupon code has expired.');
        return;
      }
    }

    setAppliedCoupon(match);
    setCouponSuccess(`Coupon "${match.code}" applied successfully!`);
    setCouponCode('');
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponSuccess('');
    setCouponError('');
  };

  // Calculate discount amount based on applied coupon
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'PERCENTAGE' || appliedCoupon.discountType === 'PERCENTAGE') {
      const pct = Number(appliedCoupon.value || appliedCoupon.discountValue || 10);
      discountAmount = (subtotal * pct) / 100;
      if (appliedCoupon.maxDiscount && discountAmount > Number(appliedCoupon.maxDiscount)) {
        discountAmount = Number(appliedCoupon.maxDiscount);
      }
    } else {
      discountAmount = Number(appliedCoupon.value || appliedCoupon.discountValue || 0);
    }
  }
  discountAmount = Math.min(discountAmount, subtotal);

  // Estimated delivery fee ($1.50 across Phnom Penh)
  const deliveryFee = items.length > 0 ? 1.50 : 0;
  const total = Math.max(0, subtotal - discountAmount + deliveryFee);

  const handleSaveToWishlist = (product) => {
    if (!product || !product.id) return;
    toggleWishlist(product.id);
    removeItem(product.id);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center bg-white dark:bg-slate-950 px-4 py-16 text-center space-y-4 font-sans">
        <SEO title="Your Shopping Cart | Mart System" canonical="/cart" />
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#F7F7F8] dark:bg-slate-900 text-slate-400">
          <ShoppingBag size={38} />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Your Cart is Empty
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Explore our store to find quality groceries, beverages, and daily essentials.
          </p>
        </div>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-7 py-3 text-xs sm:text-sm font-black hover:opacity-90 transition shadow-md active:scale-95 cursor-pointer"
        >
          <span>Start Shopping</span>
          <ArrowRight size={15} />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-28 sm:pb-20 font-sans">
      <SEO title="Shopping Cart | Mart System" canonical="/cart" />

      <div className="mx-auto max-w-6xl px-3 sm:px-6 py-4 sm:py-8 space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Continue Shopping</span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs font-bold select-none">
            <span className="flex items-center gap-1 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-2.5 py-0.5 text-[10px] font-black shadow-2xs">
              <span>1. Cart</span>
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
              Your Shopping Bag
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Clear all items from your cart?')) {
                clear();
              }
            }}
            className="flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-800 px-3.5 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:border-rose-200 transition cursor-pointer"
          >
            <Trash2 size={13} />
            <span>Clear Cart</span>
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

                    <div className="min-w-0 space-y-1">
                      <Link
                        to={`/product/${product.id}`}
                        className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white hover:text-emerald-600 transition truncate block"
                      >
                        {product.name}
                      </Link>

                      {product.category && (
                        <span className="text-[11px] font-semibold text-slate-400 block">
                          {product.category}
                        </span>
                      )}

                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {formatCurrency(unitPrice)} each
                      </div>

                      {/* Move to Wishlist Link */}
                      <button
                        type="button"
                        onClick={() => handleSaveToWishlist(product)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline pt-0.5 cursor-pointer"
                      >
                        <Heart size={11} className={isInWishlist(product.id) ? "fill-indigo-600 dark:fill-indigo-400" : ""} />
                        <span>Save to Wishlist</span>
                      </button>
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

          {/* Right: Order Summary & Coupon UI */}
          <div className="lg:col-span-4 rounded-3xl bg-[#F7F7F8] dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 space-y-6 sticky top-20">
            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight border-b border-slate-200/60 dark:border-slate-800 pb-3">
              Order Summary
            </h2>

            {/* Coupon UI Input */}
            <div className="space-y-2">
              <form onSubmit={handleApplyCoupon} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Tag size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-9 pr-3 text-xs font-bold text-slate-900 dark:text-white uppercase placeholder:normal-case placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 text-xs font-black hover:opacity-90 transition active:scale-95 cursor-pointer shrink-0"
                >
                  Apply
                </button>
              </form>

              {couponError && (
                <p className="text-[11px] font-bold text-rose-500 flex items-center gap-1">
                  <AlertCircle size={12} />
                  <span>{couponError}</span>
                </p>
              )}

              {appliedCoupon && (
                <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-2.5 flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>Coupon &ldquo;{appliedCoupon.code}&rdquo; Applied</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-slate-400 hover:text-rose-500 transition p-1 cursor-pointer"
                    title="Remove Coupon"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 text-xs font-semibold pt-2 border-t border-slate-200/60 dark:border-slate-800">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Truck size={14} className="text-indigo-600 dark:text-indigo-400" />
                  <span>Estimated Delivery</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatCurrency(deliveryFee)}
                </span>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-between items-baseline">
                <span className="text-sm font-black text-slate-900 dark:text-white">Final Total</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            {/* Desktop Checkout CTA */}
            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="hidden lg:flex h-12 w-full items-center justify-center gap-2 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs sm:text-sm font-black hover:opacity-90 transition active:scale-95 shadow-md cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </button>

            <div className="pt-2 text-center">
              <Link
                to="/shop"
                className="text-xs font-bold text-slate-500 hover:text-black dark:hover:text-white transition"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar on Mobile for Instant 1-Touch Checkout */}
      <div className="fixed bottom-14 inset-x-0 z-30 lg:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-3 shadow-2xl">
        <div className="mx-auto max-w-md flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 font-bold block">Total</span>
            <span className="text-lg font-black text-slate-900 dark:text-white leading-none">
              {formatCurrency(total)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/checkout')}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 py-3 text-xs font-black shadow-md active:scale-95 transition cursor-pointer"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
