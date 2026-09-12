import { useLocation, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, FileText, ArrowRight, Truck, MapPin, QrCode } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/format';
import Receipt from '../components/pos/Receipt';
import SEO from '../components/SEO';

export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve order data from location.state or sessionStorage
  const order = location.state?.order || (() => {
    try {
      const raw = sessionStorage.getItem('mart_last_completed_order');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  if (!order) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center bg-white dark:bg-slate-950 px-4 py-16 text-center space-y-4 font-sans">
        <SEO title="Order Confirmation | Mart System" canonical="/order-success" />
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
          <ShoppingBag size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">No Recent Order Found</h2>
        <p className="text-xs text-slate-500">You haven&apos;t placed any order in this session.</p>
        <Link
          to="/shop"
          className="rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-6 py-2.5 text-xs font-bold"
        >
          Explore Shop
        </Link>
      </div>
    );
  }

  const orderNumber = order.orderNumber || order.id || 'ORD-COMPLETED';
  const invoiceNumber = order.invoiceNumber || orderNumber;
  const items = order.items || [];
  const total = Number(order.finalTotal ?? order.total ?? order.amount ?? 0);
  const subtotal = Number(order.subtotal ?? total);
  const deliveryFee = Number(order.deliveryFee ?? (order.deliveryMethod === 'PICKUP' ? 0 : 1.5));
  const discount = Number(order.discount ?? 0);

  const formattedItems = items.map((i) => ({
    productName: i.product?.name || i.productName || i.name,
    quantity: i.quantity || i.qty || 1,
    unitPrice: Number(i.unitPrice || i.product?.price || i.price || 0),
    lineTotal: (Number(i.unitPrice || i.product?.price || i.price || 0)) * (i.quantity || i.qty || 1),
  }));

  const resolvedDeliveryAddress = (() => {
    const raw = order.deliveryAddress || order.shippingAddress || order.address;
    if (!raw) return '';
    if (typeof raw === 'string') return raw.trim();
    if (typeof raw === 'object' && raw !== null) {
      const parts = [
        raw.address || raw.street || raw.detail,
        raw.district,
        raw.province || raw.city,
        raw.note ? `(Note: ${raw.note})` : null,
      ].filter(Boolean);
      return parts.join(', ') || raw.receiverName || raw.phoneNumber || '';
    }
    return String(raw);
  })();

  const resolvedCustomerPhone =
    (typeof order.customerPhone === 'string' && order.customerPhone.trim()) ||
    (typeof order.phoneNumber === 'string' && order.phoneNumber.trim()) ||
    (typeof order.deliveryAddress === 'object' && typeof order.deliveryAddress?.phoneNumber === 'string' && order.deliveryAddress.phoneNumber.trim()) ||
    '';

  const enrichedSale = {
    ...order,
    items: formattedItems,
    total,
    subtotal,
    deliveryFee,
    paymentMethod: 'KHQR',
    customerName: order.customerName || 'Customer',
    customerPhone: resolvedCustomerPhone,
    deliveryAddress: resolvedDeliveryAddress,
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 py-8 px-4 sm:px-6 font-sans">
      <SEO title={`Order ${orderNumber} Confirmed | Mart System`} canonical="/order-success" />

      <div className="max-w-2xl mx-auto space-y-6 animate-scale-in">
        {/* Success Card */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-900/50 p-6 sm:p-8 text-center space-y-4 shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shadow-xs">
            <CheckCircle2 size={36} />
          </div>

          <div className="space-y-1">
            <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-3 py-1 text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Payment Successful
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight pt-1">
              Thank You For Your Order!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto">
              Your payment was verified via Bakong KHQR. We are preparing your order for prompt fulfillment.
            </p>
          </div>

          {/* Quick Order Reference Meta */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
            <div className="rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-1.5 flex items-center gap-1.5">
              <span className="text-slate-400 font-sans">Order:</span>
              <span className="text-emerald-600 dark:text-emerald-400">{orderNumber}</span>
            </div>
            <div className="rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-1.5 flex items-center gap-1.5">
              <span className="text-slate-400 font-sans">Invoice:</span>
              <span>{invoiceNumber}</span>
            </div>
            <div className="rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-1.5 flex items-center gap-1.5">
              <span className="text-slate-400 font-sans">Total:</span>
              <span className="font-sans font-black">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Delivery Details Callout */}
          {resolvedDeliveryAddress && (
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3.5 text-left flex items-start gap-3 text-xs border border-slate-100 dark:border-slate-800">
              <Truck size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5 min-w-0">
                <p className="font-black text-slate-900 dark:text-white">Delivery Information</p>
                <p className="text-slate-600 dark:text-slate-400">{resolvedDeliveryAddress}</p>
                {resolvedCustomerPhone && (
                  <p className="text-slate-400 font-mono text-[11px]">Phone: {resolvedCustomerPhone}</p>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to={order.id ? `/orders/${order.id}` : '/orders'}
              className="flex w-full sm:flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-3 text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <FileText size={16} />
              <span>View Order Timeline</span>
            </Link>

            <Link
              to="/shop"
              className="flex w-full sm:flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-6 py-3 text-xs sm:text-sm font-black text-white shadow-md shadow-emerald-600/20 transition active:scale-98 cursor-pointer"
            >
              <ShoppingBag size={16} />
              <span>Continue Shopping</span>
            </Link>
          </div>

          {/* Printable Official Receipt View */}
          <div className="pt-6 text-left border-t border-slate-100 dark:border-slate-800">
            <Receipt sale={enrichedSale} onPrint={() => window.print()} />
          </div>
        </div>
      </div>
    </div>
  );
}
