import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, Clock, Truck, Store, MapPin, Phone,
  User, Printer, ShoppingBag, AlertCircle, FileText, ChevronRight,
  ShieldCheck, RefreshCw, HelpCircle
} from 'lucide-react';
import { orderApi } from '../api/orderApi';
import { getCustomerOrders } from '../components/pos/CustomerOrdersModal';
import { formatCurrency, formatDate } from '../utils/format';
import { useCart } from '../context/CartContext';
import Receipt from '../components/pos/Receipt';
import SEO from '../components/SEO';

const STATUS_STEPS = [
  { key: 'PENDING_PAYMENT', labelEn: 'Order Placed', labelKm: 'បានបញ្ជាទិញ' },
  { key: 'PAID', labelEn: 'Payment Verified', labelKm: 'បានទូទាត់ប្រាក់' },
  { key: 'PREPARING', labelEn: 'Preparing Order', labelKm: 'កំពុងរៀបចំទំនិញ' },
  { key: 'SHIPPED', labelEn: 'Out for Delivery', labelKm: 'កំពុងដឹកជញ្ជូន' },
  { key: 'DELIVERED', labelEn: 'Delivered', labelKm: 'បានប្រគល់ទំនិញ' },
];

function getStepIndex(status) {
  const s = String(status || '').toUpperCase();
  if (s === 'DELIVERED' || s === 'COMPLETED') return 4;
  if (s === 'SHIPPED' || s === 'OUT_FOR_DELIVERY' || s === 'READY') return 3;
  if (s === 'PREPARING' || s === 'CONFIRMED' || s === 'PROCESSING') return 2;
  if (s === 'PAID') return 1;
  return 0; // PENDING_PAYMENT or default
}

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [reorderAdded, setReorderAdded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchOrder = async () => {
      setLoading(true);
      setError('');

      // Check local storage / session storage first for immediate rendering
      const localOrders = getCustomerOrders();
      const matchLocal = localOrders.find(
        (o) => o.id === id || o.orderId === id || o.orderNumber === id || o.invoiceNumber === id
      );

      if (matchLocal) {
        setOrder(matchLocal);
      }

      // Try fetching latest status from backend API
      try {
        const backendOrder = await orderApi.getById(id);
        if (isMounted && backendOrder) {
          setOrder((prev) => ({
            ...prev,
            ...backendOrder,
            items: backendOrder.items || backendOrder.orderItems || prev?.items || [],
          }));
        }
      } catch (err) {
        // If not found remotely and not found locally, display not found
        if (isMounted && !matchLocal) {
          setError('មិនអាចស្វែងរកព័ត៌មានការបញ្ជាទិញនេះបានទេ (Order not found).');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
    return () => { isMounted = false; };
  }, [id]);

  const handleBuyAgain = () => {
    if (!order?.items) return;
    order.items.forEach((item) => {
      const product = item.product || {
        id: item.productId || item.id,
        name: item.productName || item.name,
        price: item.unitPrice || item.price,
        imageUrl: item.imageUrl,
      };
      if (product.id) {
        addItem(product, item.quantity || 1);
      }
    });
    setReorderAdded(true);
    setTimeout(() => {
      navigate('/cart');
    }, 800);
  };

  if (loading && !order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white dark:bg-slate-950 px-4">
        <SEO title="Loading Order... | Mart System" />
        <RefreshCw size={32} className="animate-spin text-emerald-600 mb-3" />
        <p className="text-xs font-bold text-slate-500">កំពុងទាញយកព័ត៌មានការបញ្ជាទិញ... (Loading Order Details)</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white dark:bg-slate-950 px-4 text-center space-y-4 font-sans">
        <SEO title="Order Not Found | Mart System" />
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Order Not Found</h2>
        <p className="text-xs text-slate-500 max-w-sm">{error || 'We could not locate the details for this order.'}</p>
        <Link
          to="/orders"
          className="rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 text-xs font-bold shadow-xs hover:opacity-90"
        >
          Back to My Orders
        </Link>
      </div>
    );
  }

  const orderNumber = order.orderNumber || order.id || 'ORD-UNKNOWN';
  const currentStep = getStepIndex(order.status || order.paymentStatus);
  const isCancelled = String(order.status || '').toUpperCase() === 'CANCELLED';

  const items = (order.items || order.orderItems || []).map((i) => ({
    id: i.id || i.productId,
    productName: i.product?.name || i.productName || i.name || 'Product',
    quantity: i.quantity || i.qty || 1,
    unitPrice: Number(i.unitPrice || i.product?.price || i.price || 0),
    lineTotal: (Number(i.unitPrice || i.product?.price || i.price || 0)) * (i.quantity || i.qty || 1),
    imageUrl: i.product?.imageUrl || i.imageUrl,
  }));

  const total = Number(order.finalTotal ?? order.total ?? order.amount ?? 0);
  const subtotal = Number(order.subtotal ?? total);
  const deliveryFee = Number(order.deliveryFee ?? (order.deliveryMethod === 'PICKUP' ? 0 : 1.5));
  const discount = Number(order.discount ?? 0);

  const receiptSaleData = {
    ...order,
    items,
    total,
    subtotal,
    deliveryFee,
    discount,
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-20 font-sans">
      <SEO
        title={`Order ${orderNumber} | Mart System`}
        description={`Track order status and view receipt for ${orderNumber}.`}
        canonical={`/orders/${id}`}
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {orderNumber}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider ${
                  isCancelled
                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
                    : order.paymentStatus === 'PAID'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                    : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                }`}>
                  {isCancelled ? 'CANCELLED' : order.paymentStatus === 'PAID' ? 'PAID' : 'PENDING'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Placed on {formatDate(order.createdAt || order.orderDate || new Date().toISOString())}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowReceiptModal(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <Printer size={14} />
              <span>មើលវិក្កយបត្រ (Receipt)</span>
            </button>
            <button
              type="button"
              onClick={handleBuyAgain}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-xs shadow-emerald-600/20 transition active:scale-95 cursor-pointer"
            >
              <ShoppingBag size={14} />
              <span>{reorderAdded ? 'បានបន្ថែមទៅកន្ត្រក...' : 'ទិញម្តងទៀត (Buy Again)'}</span>
            </button>
          </div>
        </div>

        {/* Order Tracking Stepper */}
        <div className="rounded-3xl bg-[#F7F7F8] dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 sm:p-7 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Truck size={17} className="text-emerald-600" />
              <span>ដំណាក់កាលបញ្ជាទិញ (Order Status Timeline)</span>
            </h2>
            <span className="text-xs font-bold text-slate-500">
              {order.deliveryMethod === 'PICKUP' ? 'Store Pickup' : 'Home Delivery'}
            </span>
          </div>

          {isCancelled ? (
            <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 p-4 text-xs font-medium text-rose-700 dark:text-rose-400">
              <strong className="block font-bold mb-1">ការបញ្ជាទិញត្រូវបានបោះបង់ (Order Cancelled)</strong>
              ការបញ្ជាទិញនេះត្រូវបានលុបចោល។ ប្រសិនបើអ្នកបានបង់ប្រាក់រួចហើយ សូមទាក់ទងមកកាន់ផ្នែកបម្រើអតិថិជន។
            </div>
          ) : (
            <div className="relative pt-2 pb-1">
              {/* Progress Line */}
              <div className="hidden sm:block absolute top-[22px] left-[5%] right-[5%] h-1 bg-slate-200 dark:bg-slate-800 rounded-full z-0">
                <div
                  className="h-full bg-emerald-600 transition-all duration-500 rounded-full"
                  style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
                />
              </div>

              {/* Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 sm:gap-1 relative z-10">
                {STATUS_STEPS.map((step, idx) => {
                  const isDone = idx <= currentStep;
                  const isCurrent = idx === currentStep;

                  return (
                    <div key={step.key} className="flex sm:flex-col items-center gap-3 sm:gap-2 text-left sm:text-center">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black transition-all ${
                          isDone
                            ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/30 ring-4 ring-white dark:ring-slate-900'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-400 ring-4 ring-white dark:ring-slate-900'
                        }`}
                      >
                        {isDone ? <CheckCircle2 size={16} /> : idx + 1}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-black ${isCurrent ? 'text-emerald-600 dark:text-emerald-400' : isDone ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                          {step.labelKm}
                        </p>
                        <p className="text-[10px] text-slate-400 leading-tight">
                          {step.labelEn}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 2-Column Details: Recipient & Items */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Items */}
          <div className="md:col-span-7 rounded-3xl bg-[#F7F7F8] dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 sm:p-6 space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-3">
              <span>ទំនិញដែលបានបញ្ជាទិញ ({items.length})</span>
              <span className="text-xs font-normal text-slate-400">Order Items</span>
            </h3>

            <div className="space-y-3 divide-y divide-slate-200/60 dark:divide-slate-800">
              {items.map((item, idx) => (
                <div key={idx} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-12 w-12 shrink-0 rounded-2xl bg-white dark:bg-slate-800 p-1 flex items-center justify-center border border-slate-200/60 shadow-2xs overflow-hidden">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-contain" />
                      ) : (
                        <ShoppingBag size={18} className="text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white truncate">
                        {item.productName}
                      </p>
                      <p className="text-slate-400 text-[11px]">
                        {formatCurrency(item.unitPrice)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-black text-slate-900 dark:text-white shrink-0 text-sm">
                    {formatCurrency(item.lineTotal)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Delivery Info & Price Breakdown */}
          <div className="md:col-span-5 space-y-5">
            
            {/* Delivery / Recipient Card */}
            <div className="rounded-3xl bg-[#F7F7F8] dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 space-y-3 text-xs">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200/60 dark:border-slate-800 pb-2">
                <MapPin size={14} className="text-emerald-600" />
                <span>ព័ត៌មានដឹកជញ្ជូន (Delivery Info)</span>
              </h3>

              <div className="space-y-2 text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <User size={13} className="text-slate-400 shrink-0" />
                  <span className="font-bold text-slate-900 dark:text-white">
                    {order.customerName || 'Customer'}
                  </span>
                </div>
                {order.customerPhone && (
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="text-slate-400 shrink-0" />
                    <span>{order.customerPhone}</span>
                  </div>
                )}
                <div className="flex items-start gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                  <MapPin size={13} className="text-slate-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    {order.deliveryAddress || (order.deliveryMethod === 'PICKUP' ? 'Store Pickup at Mart System' : 'Phnom Penh, Cambodia')}
                  </span>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="rounded-3xl bg-[#F7F7F8] dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 space-y-3 text-xs">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200/60 dark:border-slate-800 pb-2">
                ការទូទាត់ប្រាក់ (Payment Summary)
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>សរុបទំនិញ (Subtotal)</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>បញ្ចុះតម្លៃ (Discount)</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>ថ្លៃដឹកជញ្ជូន (Delivery Fee)</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {deliveryFee > 0 ? formatCurrency(deliveryFee) : 'Free ($0.00)'}
                  </span>
                </div>
                <div className="flex items-baseline justify-between border-t border-slate-200/60 dark:border-slate-800 pt-3 text-sm font-bold text-slate-900 dark:text-white">
                  <span>សរុបចុងក្រោយ (Total)</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Method: Bakong KHQR</span>
                <span className="font-mono text-emerald-600 font-bold">Instant Verified</span>
              </div>
            </div>

            {/* Customer Help Link */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <HelpCircle size={15} className="text-slate-400" />
                <span className="font-medium text-slate-600 dark:text-slate-400">មានបញ្ហាជាមួយការបញ្ជាទិញនេះ?</span>
              </div>
              <Link to="/help" className="font-bold text-emerald-600 hover:underline">
                ទាក់ទងជំនួយ
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Thermal Receipt Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-sm text-slate-900 dark:text-white">
                Receipt #{orderNumber}
              </h3>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Close
              </button>
            </div>
            <Receipt sale={receiptSaleData} onPrint={() => window.print()} />
          </div>
        </div>
      )}
    </div>
  );
}
