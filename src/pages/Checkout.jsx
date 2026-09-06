import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Phone, MapPin, Truck, QrCode, ArrowRight,
  AlertCircle, Loader2, ShoppingBag, Printer, FileText,
  Store
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

export default function Checkout() {
  const { items, subtotal, clear, itemCount } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [deliveryMethod, setDeliveryMethod] = useState('DELIVERY'); // 'DELIVERY' ($1.50) or 'PICKUP' ($0.00)
  const [customerName, setCustomerName] = useState(user?.displayName || user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phoneNumber || '');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [pendingSale, setPendingSale] = useState(null);
  const [completedOrder, setCompletedOrder] = useState(null);

  // Authoritative estimated display pricing (final amount is returned by backend on checkout)
  const deliveryFee = deliveryMethod === 'DELIVERY' ? 1.50 : 0.00;
  const estimatedTotal = Math.max(0, subtotal + deliveryFee);

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
    if (deliveryMethod === 'DELIVERY' && !deliveryAddress.trim()) {
      setError('Please enter your delivery address.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const isGuest = !isAuthenticated;

      // 1. Synchronize frontend cart items with backend customer cart
      await orderApi.syncCart(items);

      // 2. Optionally create delivery address record if logged in and delivery is selected
      let deliveryAddressId = null;
      if (isAuthenticated && deliveryMethod === 'DELIVERY' && deliveryAddress.trim()) {
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
      setPendingSale({ ...orderData, isGuest });
    } catch (err) {
      setError(getErrorMessage(err));
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
      items: formattedItems.length > 0 ? formattedItems : completedOrder.items,
      customerName: customerName.trim() || completedOrder.customerName,
      customerPhone: customerPhone.trim() || completedOrder.customerPhone,
      deliveryAddress: completedOrder.deliveryAddress,
      deliveryMethod: completedOrder.deliveryMethod || deliveryMethod,
      deliveryFee: completedOrder.deliveryFee ?? deliveryFee,
      total: completedOrder.finalTotal ?? completedOrder.total ?? completedOrder.amount ?? estimatedTotal,
      subtotal: completedOrder.subtotal ?? subtotal,
      paymentMethod: completedOrder.paymentMethod || 'KHQR',
      paymentStatus: completedOrder.paymentStatus || 'PAID',
      status: completedOrder.status || 'PAID',
    };

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-8 sm:py-14 animate-fade-in">
        <SEO title="Order Confirmed | Mart System" canonical="/checkout" />
        
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Top Receipt Container */}
          <Receipt
            sale={enrichedSale}
            showTaxDiscount={true}
            mode="ecommerce"
            showSuccessBadge={true}
          />

          {/* Action Buttons Below Receipt */}
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-3 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 shadow-2xs transition hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Printer size={16} />
              <span>បោះពុម្ព (Print Receipt)</span>
            </button>

            <div className="flex flex-1 items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
              <Link
                to="/orders"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800 transition text-center"
              >
                <FileText size={16} />
                <span>ការបញ្ជាទិញ (My Orders)</span>
              </Link>
              <Link
                to="/shop"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-600/25 transition active:scale-[0.98] text-center"
              >
                <ShoppingBag size={16} />
                <span>ទិញបន្ត (Shop Again)</span>
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

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Checkout
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Select your delivery method, provide contact details, and pay with Bakong KHQR
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
            
            {/* 1. Delivery Method Selection */}
            <div className="rounded-3xl bg-[#F7F7F8] dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-3">
                <Truck size={16} className="text-emerald-600" />
                <span>1. Delivery Method</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option 1: Delivery ($1.50) */}
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('DELIVERY')}
                  className={`flex flex-col p-4 rounded-2xl border text-left transition cursor-pointer relative ${
                    deliveryMethod === 'DELIVERY'
                      ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-600'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <div className="flex items-center gap-2">
                      <Truck size={18} className={deliveryMethod === 'DELIVERY' ? 'text-emerald-600' : 'text-slate-400'} />
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">Delivery</span>
                    </div>
                    <span className="font-mono font-black text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                      $1.50 USD
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Express doorstep delivery in Phnom Penh
                  </p>
                  {deliveryMethod === 'DELIVERY' && (
                    <div className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-emerald-600" />
                  )}
                </button>

                {/* Option 2: Pickup ($0.00 / Free) */}
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('PICKUP')}
                  className={`flex flex-col p-4 rounded-2xl border text-left transition cursor-pointer relative ${
                    deliveryMethod === 'PICKUP'
                      ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-600'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <div className="flex items-center gap-2">
                      <Store size={18} className={deliveryMethod === 'PICKUP' ? 'text-emerald-600' : 'text-slate-400'} />
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">Pickup</span>
                    </div>
                    <span className="font-mono font-black text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                      Free ($0.00)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Store pickup at Mart System (Phnom Penh)
                  </p>
                  {deliveryMethod === 'PICKUP' && (
                    <div className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-emerald-600" />
                  )}
                </button>
              </div>
            </div>

            {/* 2. Customer & Address Information Card */}
            <div className="rounded-3xl bg-[#F7F7F8] dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-3">
                <User size={16} className="text-emerald-600" />
                <span>2. {deliveryMethod === 'DELIVERY' ? 'Recipient & Delivery Address' : 'Customer Contact Details'}</span>
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
                      className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-3 text-base sm:text-xs font-semibold text-slate-900 dark:text-white focus:border-black focus:outline-none"
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
                      className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-3 text-base sm:text-xs font-semibold text-slate-900 dark:text-white focus:border-black focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {deliveryMethod === 'DELIVERY' ? (
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
                      className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-3 text-base sm:text-xs font-semibold text-slate-900 dark:text-white focus:border-black focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 p-3.5 border border-emerald-200/60 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300">
                  <span className="font-bold block mb-0.5">Store Pickup Location:</span>
                  <p>Mart System Official Store — Phnom Penh, Cambodia (Opening hours: 7:00 AM - 10:00 PM)</p>
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Note / Instructions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Leave at door, call before arrival, or pickup time"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-3.5 text-base sm:text-xs font-semibold text-slate-900 dark:text-white focus:border-black focus:outline-none"
                />
              </div>
            </div>

            {/* 3. Payment Method Card */}
            <div className="rounded-3xl bg-[#F7F7F8] dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-3">
                <QrCode size={16} className="text-emerald-600" />
                <span>3. Payment Method</span>
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
                  <span>Delivery ({deliveryMethod})</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {deliveryFee > 0 ? formatCurrency(deliveryFee) : 'Free ($0.00)'}
                </span>
              </div>
              <div className="flex items-baseline justify-between border-t border-slate-200/60 dark:border-slate-800 pt-3 text-sm font-bold text-slate-900 dark:text-white">
                <span>Total Amount</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {formatCurrency(estimatedTotal)}
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
                  <span>Place Order &amp; Pay KHQR ({formatCurrency(estimatedTotal)})</span>
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
