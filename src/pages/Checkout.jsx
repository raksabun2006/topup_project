import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Phone, MapPin, Truck, QrCode, ArrowRight, ArrowLeft,
  AlertCircle, Loader2, ShoppingBag, Printer, FileText,
  Store, ShieldCheck, CheckCircle2, Lock, X, ChevronRight
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../api/orderApi';
import { getErrorMessage } from '../api/client';
import { formatCurrency } from '../utils/format';
import BakongPaymentModal from '../components/pos/BakongPaymentModal';
import { saveCustomerOrder } from '../components/pos/CustomerOrdersModal';
import Receipt from '../components/pos/Receipt';
import SEO from '../components/SEO';

const CHECKOUT_DRAFT_KEY = 'mart_checkout_draft';

function loadDraft() {
  try {
    const raw = sessionStorage.getItem(CHECKOUT_DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function Checkout() {
  const { items, subtotal, clear, itemCount } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const savedDraft = loadDraft();

  const [deliveryMethod, setDeliveryMethod] = useState(savedDraft?.deliveryMethod || 'DELIVERY'); // 'DELIVERY' ($1.50) or 'PICKUP' ($0.00)
  const [customerName, setCustomerName] = useState(user?.displayName || user?.name || savedDraft?.customerName || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phoneNumber || savedDraft?.customerPhone || '');
  const [deliveryAddress, setDeliveryAddress] = useState(savedDraft?.deliveryAddress || '');
  const [note, setNote] = useState(savedDraft?.note || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingSale, setPendingSale] = useState(null);
  const [completedOrder, setCompletedOrder] = useState(null);

  // Sync draft state to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(
        CHECKOUT_DRAFT_KEY,
        JSON.stringify({ customerName, customerPhone, deliveryAddress, note, deliveryMethod })
      );
    } catch {
      // ignore
    }
  }, [customerName, customerPhone, deliveryAddress, note, deliveryMethod]);

  // Update user name and phone if authentication state changes
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.displayName || user.name || '');
      if (!customerPhone && user.phoneNumber) setCustomerPhone(user.phoneNumber);
    }
  }, [user]);

  // Authoritative estimated display pricing (final amount is returned by backend on checkout)
  const deliveryFee = deliveryMethod === 'DELIVERY' ? 1.50 : 0.00;
  const estimatedTotal = Math.max(0, subtotal + deliveryFee);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (items.length === 0 || submitting) return;

    if (!customerName.trim()) {
      setError('សូមបញ្ចូលឈ្មោះរបស់អ្នក (Please enter your full name)');
      return;
    }
    if (!customerPhone.trim()) {
      setError('សូមបញ្ចូលលេខទូរស័ព្ទ (Please enter your phone number)');
      return;
    }
    if (deliveryMethod === 'DELIVERY' && !deliveryAddress.trim()) {
      setError('សូមបញ្ចូលអាសយដ្ឋានដឹកជញ្ជូន (Please enter your delivery address)');
      return;
    }

    // If user is not authenticated, prompt sign-in/register modal gracefully
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // 1. Synchronize frontend cart items with backend customer cart
      await orderApi.syncCart(items);

      // 2. Optionally create delivery address record if logged in and delivery is selected
      let deliveryAddressId = null;
      if (deliveryMethod === 'DELIVERY' && deliveryAddress.trim()) {
        try {
          const addr = await orderApi.createAddress({
            receiverName: customerName.trim(),
            phoneNumber: customerPhone.trim(),
            address: deliveryAddress.trim(),
            note: note.trim(),
          });
          deliveryAddressId = addr?.id || null;
        } catch {
          // address creation is optional, continue with checkout
        }
      }

      // 3. Perform Customer E-Commerce Order Checkout: POST /api/v1/orders/checkout
      const destinationText = deliveryMethod === 'DELIVERY'
        ? `${deliveryAddress.trim()}${note ? ` (Note: ${note.trim()})` : ''}`
        : `Store Pickup at Mart System${note ? ` (Note: ${note.trim()})` : ''}`;

      const checkoutRes = await orderApi.checkout({
        deliveryMethod,
        deliveryAddressId,
        note: destinationText,
      });

      const orderId = checkoutRes.orderId || checkoutRes.id || checkoutRes.order?.id;
      const orderNumber = checkoutRes.orderNumber || checkoutRes.order?.orderNumber || (orderId ? `ORD-${orderId.slice(0, 8).toUpperCase()}` : 'ORD');
      const invoiceNumber = checkoutRes.payment?.billNumber || checkoutRes.order?.orderNumber || orderNumber;
      
      // Authoritative backend total
      const authoritativeTotal = checkoutRes.amount ?? checkoutRes.order?.amount ?? checkoutRes.finalTotal ?? estimatedTotal;
      const authoritativeDeliveryFee = checkoutRes.order?.deliveryFee ?? (deliveryMethod === 'DELIVERY' ? 1.50 : 0.00);
      const authoritativeDiscount = checkoutRes.order?.discount ?? 0;
      const authoritativeSubtotal = checkoutRes.order?.subtotal ?? subtotal;

      const orderData = {
        ...checkoutRes,
        id: orderId,
        orderId,
        orderNumber,
        invoiceNumber,
        isOrder: true,
        entityType: 'orders',
        items,
        total: authoritativeTotal,
        subtotal: authoritativeSubtotal,
        discount: authoritativeDiscount,
        deliveryFee: authoritativeDeliveryFee,
        deliveryMethod,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryAddress: destinationText,
        paymentMethod: 'KHQR',
        paymentStatus: 'PENDING',
        status: 'PENDING_PAYMENT',
      };

      saveCustomerOrder(orderData);
      setPendingSale(orderData);
    } catch (err) {
      const status = err.status || err.response?.status;
      if (status === 401) {
        setShowAuthModal(true);
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = (sale) => {
    const fullOrder = {
      ...sale,
      items: (sale.items && sale.items.length > 0) ? sale.items : items,
      customerName: customerName.trim() || sale.customerName,
      customerPhone: customerPhone.trim() || sale.customerPhone,
      deliveryAddress: (deliveryMethod === 'DELIVERY' ? `${deliveryAddress.trim()}${note ? ` (Note: ${note.trim()})` : ''}` : 'Store Pickup at Mart System') || sale.deliveryAddress,
      deliveryMethod: deliveryMethod || sale.deliveryMethod || 'DELIVERY',
      deliveryFee: sale.deliveryFee ?? (deliveryMethod === 'DELIVERY' ? 1.50 : 0.00),
      total: sale.finalTotal ?? sale.total ?? sale.amount ?? estimatedTotal,
      subtotal: sale.subtotal ?? subtotal,
      paymentMethod: 'KHQR',
      paymentStatus: 'PAID',
      status: 'PAID',
    };
    saveCustomerOrder(fullOrder);
    setPendingSale(null);
    clear();
    setCompletedOrder(fullOrder);
  };

  if (completedOrder) {
    const formattedItems = (completedOrder.items || items || []).map((i) => ({
      productName: i.product?.name || i.productName || i.name,
      quantity: i.quantity || i.qty || 1,
      unitPrice: i.unitPrice || i.product?.price || i.price || 0,
      lineTotal: (i.unitPrice || i.product?.price || i.price || 0) * (i.quantity || 1),
    }));

    const enrichedSale = {
      ...completedOrder,
      items: formattedItems,
      total: completedOrder.total || estimatedTotal,
      subtotal: completedOrder.subtotal || subtotal,
      deliveryFee: completedOrder.deliveryFee ?? (deliveryMethod === 'DELIVERY' ? 1.50 : 0.00),
      paymentMethod: 'KHQR',
      customerName: completedOrder.customerName || customerName.trim(),
      customerPhone: completedOrder.customerPhone || customerPhone.trim(),
      deliveryAddress: completedOrder.deliveryAddress,
    };

    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 py-8 px-4 sm:px-6 font-sans">
        <SEO title="Order Confirmed | Mart System" canonical="/checkout" />
        <div className="max-w-2xl mx-auto space-y-6 animate-scale-in">
          {/* Success Banner */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/50 p-6 sm:p-8 text-center space-y-4 shadow-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shadow-xs">
              <CheckCircle2 size={36} />
            </div>
            
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Order Placed Successfully!
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                Thank you, <strong className="text-slate-800 dark:text-slate-200">{completedOrder.customerName}</strong>. Your payment was verified via Bakong KHQR.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-3.5 py-1.5 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
              <span>Order ID:</span>
              <span className="text-emerald-600 dark:text-emerald-400">{completedOrder.orderNumber || completedOrder.id || 'ORD-COMPLETED'}</span>
            </div>

            {/* Receipt Component Display */}
            <div className="pt-2 text-left">
              <Receipt sale={enrichedSale} onPrint={() => window.print()} />
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/orders"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800 transition text-center cursor-pointer"
              >
                <FileText size={16} />
                <span>មើលការបញ្ជាទិញ</span>
                <span className="text-xs text-slate-400 font-semibold hidden xs:inline">• View Orders</span>
              </Link>
              <Link
                to="/shop"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-5 py-3 text-xs sm:text-sm font-black text-white shadow-md shadow-emerald-600/25 transition active:scale-[0.98] text-center cursor-pointer"
              >
                <ShoppingBag size={16} />
                <span>បន្តទិញទំនិញ</span>
                <span className="text-xs opacity-90 font-semibold hidden xs:inline">• Shop More</span>
              </Link>
            </div>
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

      <div className="mx-auto max-w-6xl px-3 sm:px-6 py-4 sm:py-8 space-y-5">
        {/* Navigation Breadcrumb & Step Progress Indicator */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <button
            type="button"
            onClick={() => navigate('/cart')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer active:scale-95"
          >
            <ArrowLeft size={14} className="text-slate-500 shrink-0" />
            <span>Back to Cart</span>
          </button>

          {/* 3-Step Checkout Flow */}
          <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs font-bold select-none">
            <Link to="/cart" className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline">
              <CheckCircle2 size={13} />
              <span className="hidden xs:inline">1. Cart</span>
            </Link>
            <span className="text-slate-300 dark:text-slate-700">›</span>
            <span className="flex items-center gap-1 rounded-full bg-[#18181B] dark:bg-white text-white dark:text-slate-900 px-2.5 py-0.5 text-[10px] font-black shadow-2xs">
              <span>2. Checkout</span>
            </span>
            <span className="text-slate-300 dark:text-slate-700">›</span>
            <span className="text-slate-400 dark:text-slate-600 flex items-center gap-1">
              <span className="hidden xs:inline">3. Payment</span>
              <span className="xs:hidden">3. Pay</span>
            </span>
          </div>
        </div>

        <div>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Checkout
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Select your delivery method, provide contact details, and pay with Bakong KHQR
          </p>
        </div>

        {/* Clean Slim Guest Notice */}
        {!isAuthenticated && (
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 p-3 sm:p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 shrink-0">
                <ShieldCheck size={16} />
              </div>
              <p className="text-slate-600 dark:text-slate-300 font-medium">
                Have an account? <span className="font-bold text-slate-900 dark:text-white">Sign in</span> for 1-tap Bakong KHQR checkout and order tracking.
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
              <Link
                to="/login"
                state={{ from: { pathname: '/checkout' } }}
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 transition shadow-2xs text-xs"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                state={{ from: { pathname: '/checkout' } }}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 font-bold text-white hover:bg-emerald-500 transition shadow-2xs text-xs"
              >
                Register
              </Link>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 dark:bg-rose-950/30 p-3.5 text-xs font-bold text-rose-700 dark:text-rose-400 animate-fade-in">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <div className="flex-1">
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError('')}
              className="text-rose-400 hover:text-rose-600 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* 2-Column Checkout Layout */}
        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Delivery, Recipient, Payment */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* 1. Delivery Method Card */}
            <div className="rounded-3xl bg-[#F7F7F8] dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 sm:p-6 space-y-3.5">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-3">
                <Truck size={16} className="text-emerald-600" />
                <span>1. វិធីទទួលទំនិញ (Delivery Method)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option 1: Delivery ($1.50) */}
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('DELIVERY')}
                  className={`flex flex-col justify-between p-4 rounded-2xl border text-left transition-all cursor-pointer relative ${
                    deliveryMethod === 'DELIVERY'
                      ? 'border-emerald-600 bg-white dark:bg-slate-850 ring-2 ring-emerald-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-800/50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <div className="flex items-center gap-2">
                      <Truck size={17} className={deliveryMethod === 'DELIVERY' ? 'text-emerald-600' : 'text-slate-400'} />
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">សេវាដឹកជញ្ជូន (Delivery)</span>
                    </div>
                    <span className="font-mono font-black text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      $1.50 USD
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    ដឹកជញ្ជូនដល់ផ្ទះ (Express Doorstep Delivery)
                  </p>
                </button>

                {/* Option 2: Pickup ($0.00 / Free) */}
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('PICKUP')}
                  className={`flex flex-col justify-between p-4 rounded-2xl border text-left transition-all cursor-pointer relative ${
                    deliveryMethod === 'PICKUP'
                      ? 'border-emerald-600 bg-white dark:bg-slate-850 ring-2 ring-emerald-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-800/50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <div className="flex items-center gap-2">
                      <Store size={17} className={deliveryMethod === 'PICKUP' ? 'text-emerald-600' : 'text-slate-400'} />
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">មកយកផ្ទាល់ (Pickup)</span>
                    </div>
                    <span className="font-mono font-black text-[11px] px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      Free ($0.00)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    មកយកនៅហាង (Store Pickup at Mart)
                  </p>
                </button>
              </div>
            </div>

            {/* 2. Customer & Address Information Card */}
            <div className="rounded-3xl bg-[#F7F7F8] dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 sm:p-6 space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-3">
                <User size={16} className="text-emerald-600" />
                <span>2. {deliveryMethod === 'DELIVERY' ? 'ព័ត៌មានអតិថិជន និងអាសយដ្ឋានដឹកជញ្ជូន' : 'ព័ត៌មានទំនាក់ទំនងអតិថិជន'}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    ឈ្មោះអ្នកទទួល (Full Name) *
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      required
                      type="text"
                      placeholder="e.g. Bun Raksa"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-3 text-sm font-semibold text-slate-900 dark:text-white focus:border-slate-900 dark:focus:border-white focus:outline-none transition shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    លេខទូរស័ព្ទ (Phone Number) *
                  </label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      required
                      type="tel"
                      placeholder="096 XXX XXXX"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-3 text-sm font-semibold text-slate-900 dark:text-white focus:border-slate-900 dark:focus:border-white focus:outline-none transition shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {deliveryMethod === 'DELIVERY' ? (
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    អាសយដ្ឋានដឹកជញ្ជូន (Delivery Address) *
                  </label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3.5 top-3 text-slate-400" />
                    <textarea
                      required
                      rows={2}
                      placeholder="ផ្ទះលេខ/ផ្លូវ, សង្កាត់, ខណ្ឌ, រាជធានីភ្នំពេញ..."
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-3 text-sm font-semibold text-slate-900 dark:text-white focus:border-slate-900 dark:focus:border-white focus:outline-none transition shadow-2xs resize-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 p-3.5 border border-emerald-200/60 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300">
                  <span className="font-bold block mb-0.5">ទីតាំងទទួលទំនិញ (Pickup Location):</span>
                  <p>Mart System Store — Phnom Penh, Cambodia (ម៉ោងបើក៖ 7:00 AM - 10:00 PM)</p>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  ចំណាំបន្ថែម (Optional Note)
                </label>
                <input
                  type="text"
                  placeholder="ឧ. ដាក់នៅមុខផ្ទះ ឬទូរស័ព្ទមុនមកដល់..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-3.5 text-sm font-semibold text-slate-900 dark:text-white focus:border-slate-900 dark:focus:border-white focus:outline-none transition shadow-2xs"
                />
              </div>
            </div>

            {/* 3. Payment Method Card */}
            <div className="rounded-3xl bg-[#F7F7F8] dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 sm:p-6 space-y-3.5">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-3">
                <QrCode size={16} className="text-emerald-600" />
                <span>3. វិធីទូទាត់ប្រាក់ (Payment Method)</span>
              </h3>

              <div className="flex items-center gap-3.5 rounded-2xl border border-emerald-500/40 bg-white dark:bg-slate-800 p-4 shadow-2xs">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 shadow-2xs">
                  <QrCode size={24} />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <p className="font-extrabold text-sm text-slate-900 dark:text-white">Bakong KHQR</p>
                    <span className="rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[9px] font-bold">
                      Instant Scan
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ស្កេនទូទាត់ដោយសុវត្ថិភាពជាមួយ ABA, ACLEDA, Canadia, Wing ឬធនាគារក្នុងប្រព័ន្ធបាគង។
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Order Summary */}
          <div className="lg:col-span-5 rounded-3xl bg-[#F7F7F8] dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 sm:p-6 space-y-4 sticky top-20 shadow-xs">
            <h3 className="text-base font-black text-slate-900 dark:text-white border-b border-slate-200/60 dark:border-slate-800 pb-3">
              សង្ខេបការបញ្ជាទិញ (Order Summary)
            </h3>

            {/* Items Preview */}
            <div className="max-h-56 overflow-y-auto space-y-3 divide-y divide-slate-200/60 dark:divide-slate-800 pr-1">
              {items.map((item) => (
                <div key={item.product.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-white dark:bg-slate-800 p-1 flex items-center justify-center overflow-hidden border border-slate-200/60 shadow-2xs">
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
                  <span className="font-black text-slate-900 dark:text-white shrink-0">
                    {formatCurrency((item.product.price || 0) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Breakdown */}
            <div className="border-t border-slate-200/60 dark:border-slate-800 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400 font-medium">
                <span>សរុបទំនិញ (Subtotal)</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <Truck size={13} className="text-emerald-600" />
                  <span>ថ្លៃដឹកជញ្ជូន (Delivery)</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {deliveryFee > 0 ? formatCurrency(deliveryFee) : 'Free ($0.00)'}
                </span>
              </div>
              <div className="flex items-baseline justify-between border-t border-slate-200/60 dark:border-slate-800 pt-3 text-sm font-bold text-slate-900 dark:text-white">
                <span>ចំនួនត្រូវបង់ (Total)</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {formatCurrency(estimatedTotal)}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || items.length === 0}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#18181B] dark:bg-white font-black text-xs sm:text-sm text-white dark:text-slate-900 hover:opacity-90 transition-all active:scale-98 disabled:opacity-50 cursor-pointer shadow-md"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>កំពុងបង្កើតការបញ្ជាទិញ...</span>
                </>
              ) : (
                <>
                  <span>បញ្ជាទិញ និងបង់ប្រាក់ ({formatCurrency(estimatedTotal)})</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>

            {/* Quick Navigation Links */}
            <div className="flex items-center justify-between text-xs pt-1 px-1 border-t border-slate-200/60 dark:border-slate-800">
              <Link
                to="/cart"
                className="flex items-center gap-1 font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
              >
                <ArrowLeft size={13} />
                <span>Return to Cart</span>
              </Link>
              <Link
                to="/shop"
                className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>+ Add more items</span>
              </Link>
            </div>
          </div>
        </form>
      </div>

      {/* Account Required for Checkout Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl space-y-5 animate-scale-in text-center">
            <button
              type="button"
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shadow-xs">
              <Lock size={28} />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Sign In to Complete Order
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                An account is required to generate your instant Bakong KHQR code and dispatch your order of <strong className="text-slate-900 dark:text-white">{formatCurrency(estimatedTotal)}</strong>.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 p-3 text-xs flex items-center justify-between font-bold">
              <span className="text-slate-500">Cart Total ({itemCount} {itemCount === 1 ? 'item' : 'items'}):</span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(estimatedTotal)}</span>
            </div>

            <div className="space-y-2.5 pt-1">
              <Link
                to="/login"
                state={{ from: { pathname: '/checkout' } }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#18181B] hover:bg-black py-3 text-xs sm:text-sm font-bold text-white shadow-md transition active:scale-95"
              >
                <span>Sign In with Existing Account</span>
                <ArrowRight size={14} />
              </Link>

              <Link
                to="/register"
                state={{ from: { pathname: '/checkout' } }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition active:scale-95"
              >
                <span>Create Free Customer Account (10s)</span>
              </Link>

              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 py-1 transition"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        </div>
      )}

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
