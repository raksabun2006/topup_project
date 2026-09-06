import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User, Phone, MapPin, Truck, QrCode, ShieldCheck, ArrowRight,
  AlertCircle, Loader2, CheckCircle, ShoppingBag, ArrowLeft
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { saleApi } from '../api/saleApi';
import { getErrorMessage } from '../api/client';
import { formatCurrency } from '../utils/format';
import BakongPaymentModal from '../components/pos/BakongPaymentModal';
import { saveCustomerOrder } from '../components/pos/CustomerOrdersModal';
import SEO from '../components/SEO';

export default function Checkout() {
  const { items, subtotal, clear, itemCount } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState(user?.displayName || user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phoneNumber || '');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [pendingSale, setPendingSale] = useState(null);
  const [completedOrder, setCompletedOrder] = useState(null);

  const deliveryFee = !isAuthenticated && items.length > 0 ? 1.5 : 0;
  const total = Math.max(0, subtotal + deliveryFee);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (items.length === 0 || submitting) return;

    if (!customerName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!customerPhone.trim()) {
      setError('Please enter your phone number.');
      return;
    }
    if (!deliveryAddress.trim()) {
      setError('Please enter your delivery address.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const isGuest = !isAuthenticated;
      const payload = {
        customer: null,
        discount: 0,
        tax: 0,
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          discount: 0,
        })),
      };

      const sale = await saleApi.create(payload, { isGuest });

      const authoritativeTotal = sale.finalTotal ?? sale.total ?? sale.amount ?? total;

      const orderData = {
        ...sale,
        items,
        total: authoritativeTotal,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryAddress: `${deliveryAddress.trim()}${note ? ` (Note: ${note.trim()})` : ''}`,
        paymentMethod: 'KHQR',
      };

      saveCustomerOrder(orderData);
      setPendingSale({ ...sale, isGuest });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = (sale) => {
    saveCustomerOrder(sale);
    setPendingSale(null);
    clear();
    setCompletedOrder(sale);
  };

  if (completedOrder) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center px-4 py-16">
        <SEO title="Order Confirmed | Mart System" canonical="/checkout" />
        <div className="w-full max-w-lg rounded-3xl bg-[#F7F7F8] dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-8 shadow-xl text-center space-y-5 animate-scale-in">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mx-auto shadow-xs">
            <CheckCircle size={36} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Order Confirmed!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Thank you for shopping with Mart System. Your invoice number is{' '}
            <span className="font-bold text-slate-900 dark:text-white font-mono">
              #{completedOrder.invoiceNumber || completedOrder.id}
            </span>
            . We will deliver your package shortly.
          </p>

          <div className="rounded-2xl bg-white dark:bg-slate-800 p-4 text-xs space-y-2 text-left border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-400">Customer:</span>
              <span className="font-bold text-slate-900 dark:text-white">{customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Phone:</span>
              <span className="font-bold text-slate-900 dark:text-white">{customerPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Payment:</span>
              <span className="font-bold text-emerald-600">Bakong KHQR (Paid)</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-700 font-bold">
              <span className="text-slate-900 dark:text-white">Total Amount:</span>
              <span className="text-base font-black text-slate-900 dark:text-white">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Link
              to="/orders"
              className="flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50"
            >
              My Orders
            </Link>
            <Link
              to="/shop"
              className="flex items-center justify-center rounded-full bg-[#18181B] py-3 text-xs font-bold text-white hover:bg-black transition shadow-sm"
            >
              Shop Again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white dark:bg-slate-950 px-4 py-16 text-center space-y-4">
        <SEO title="Checkout | Mart System" canonical="/checkout" />
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F7F7F8] dark:bg-slate-900 text-slate-400 mb-2">
          <ShoppingBag size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Cart is Empty</h2>
        <p className="text-xs text-slate-400">Please add products to your cart before proceeding to checkout.</p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 rounded-full bg-[#18181B] px-6 py-2.5 text-xs font-bold text-white hover:bg-black"
        >
          <span>Browse Products</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-20">
      <SEO title="Checkout | Mart System" canonical="/checkout" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Checkout
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Fill in your delivery address and pay with Bakong KHQR
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 dark:bg-rose-950/30 p-4 text-xs font-bold text-rose-700 dark:text-rose-400">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 2-Column Checkout Layout */}
        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Delivery & Payment Details */}
          <div className="lg:col-span-7 space-y-6">
            {/* Delivery Information Card */}
            <div className="rounded-3xl bg-[#F7F7F8] dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-3">
                <Truck size={16} className="text-emerald-600" />
                <span>1. Delivery Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      required
                      type="text"
                      placeholder="e.g. Bun Raksa"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-3 text-xs font-semibold text-slate-900 dark:text-white focus:border-black focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      required
                      type="tel"
                      placeholder="012 345 678"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-3 text-xs font-semibold text-slate-900 dark:text-white focus:border-black focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Delivery Address *
                </label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3.5 top-3 text-slate-400" />
                  <textarea
                    required
                    rows={2}
                    placeholder="House/Street, Sangkat, Khan, Phnom Penh..."
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-3 text-xs font-semibold text-slate-900 dark:text-white focus:border-black focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Note / Instructions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Leave at door, call before arrival"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-3.5 text-xs font-semibold text-slate-900 dark:text-white focus:border-black focus:outline-none"
                />
              </div>
            </div>

            {/* Payment Method Card */}
            <div className="rounded-3xl bg-[#F7F7F8] dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-3">
                <QrCode size={16} className="text-emerald-600" />
                <span>2. Payment Method</span>
              </h3>

              <div className="flex items-center gap-4 rounded-2xl border border-emerald-500/40 bg-white dark:bg-slate-800 p-4 shadow-xs">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 shadow-xs">
                  <QrCode size={26} />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <p className="font-extrabold text-sm text-slate-900 dark:text-white">Bakong KHQR</p>
                    <span className="rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[9px] font-bold">
                      Instant Scan
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pay securely with ABA, ACLEDA, Canadia, Wing, or any Bakong-enabled banking app.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Sticky Order Summary */}
          <div className="lg:col-span-5 rounded-3xl bg-[#F7F7F8] dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 space-y-5 sticky top-20">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white border-b border-slate-200/60 dark:border-slate-800 pb-3">
              Order Summary ({itemCount} {itemCount === 1 ? 'item' : 'items'})
            </h3>

            {/* Items preview */}
            <div className="max-h-56 overflow-y-auto space-y-3 divide-y divide-slate-200/60 dark:divide-slate-800 pr-1">
              {items.map((item) => (
                <div key={item.product.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-white dark:bg-slate-800 p-1 flex items-center justify-center overflow-hidden border border-slate-200/60">
                      {item.product.imageUrl ? (
                        <img src={item.product.imageUrl} alt={item.product.name} className="h-full w-full object-contain" />
                      ) : (
                        <ShoppingBag size={16} className="text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white truncate max-w-[170px]">
                        {item.product.name}
                      </p>
                      <p className="text-slate-400 text-[11px]">
                        {formatCurrency(item.product.price)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white shrink-0">
                    {formatCurrency((item.product.price || 0) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Breakdown */}
            <div className="border-t border-slate-200/60 dark:border-slate-800 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Truck size={13} className="text-emerald-600" />
                  <span>Delivery Fee</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(deliveryFee)}</span>
              </div>
              <div className="flex items-baseline justify-between border-t border-slate-200/60 dark:border-slate-800 pt-3 text-sm font-bold text-slate-900 dark:text-white">
                <span>Total</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || items.length === 0}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#18181B] font-bold text-xs sm:text-sm text-white hover:bg-black transition-all active:scale-98 disabled:opacity-50 cursor-pointer shadow-md"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Creating Order...</span>
                </>
              ) : (
                <>
                  <span>Place Order & Pay KHQR</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Bakong KHQR Payment Modal */}
      {pendingSale && (
        <BakongPaymentModal
          sale={pendingSale}
          onPaid={handlePaymentSuccess}
          onClose={() => setPendingSale(null)}
        />
      )}
    </div>
  );
}
