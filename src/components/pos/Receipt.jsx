import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Package,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  QrCode,
  Calendar,
  FileText,
  Clock,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/format';
import { env } from '../../config/env';
import { customerApi } from '../../api/customerApi';
import { useLanguage } from '../../context/LanguageContext';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Modern E-Commerce Order Receipt
 * Customer-centric, responsive, clean typography and print-friendly.
 * Supports both customer online orders (default) and internal staff POS receipts.
 */
export default function Receipt({
  sale,
  showTaxDiscount = true,
  mode = 'ecommerce',
  showSuccessBadge = false,
}) {
  const { language } = useLanguage();
  const [customerData, setCustomerData] = useState(null);

  // Extract customer ID if provided as UUID string or object
  const customerId = typeof sale?.customer === 'string' && UUID_RE.test(sale.customer)
    ? sale.customer
    : sale?.customer?.id && UUID_RE.test(sale.customer.id)
    ? sale.customer.id
    : null;

  useEffect(() => {
    if (!customerId) return;
    let cancelled = false;
    customerApi.getById(customerId)
      .then((c) => {
        if (!cancelled && c) {
          setCustomerData(c);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [customerId]);

  if (!sale) return null;

  // Resolve Customer Data (prioritize order-level customer info, then fetched data, then fallback)
  const resolvedCustomerName =
    sale.customerName ||
    (typeof sale.customer === 'object' ? sale.customer?.name : null) ||
    customerData?.name ||
    (typeof sale.customer === 'string' && !UUID_RE.test(sale.customer) ? sale.customer : '') ||
    'Guest Customer';

  const resolvedCustomerPhone =
    sale.customerPhone ||
    (typeof sale.customer === 'object' ? sale.customer?.phone : null) ||
    customerData?.phone ||
    '';

  const resolvedCustomerEmail =
    sale.customerEmail ||
    (typeof sale.customer === 'object' ? sale.customer?.email : null) ||
    customerData?.email ||
    '';

  // Resolve Delivery Info
  const deliveryAddress =
    sale.deliveryAddress ||
    sale.shippingAddress ||
    sale.address ||
    (typeof sale.deliveryInfo === 'object' ? sale.deliveryInfo?.address : sale.deliveryInfo) ||
    '';

  const receiverName = sale.receiverName || sale.recipientName || '';
  const receiverPhone = sale.receiverPhone || sale.recipientPhone || '';

  // Order & Invoice Numbers
  const invoiceNumber = sale.invoiceNumber || sale.billNumber || sale.billNo || `INV-${String(sale.id || '').slice(-6)}`;
  const orderNumber =
    sale.orderNumber ||
    sale.orderId ||
    (sale.id ? `ORD-${String(sale.id).slice(0, 8).toUpperCase()}` : `ORD-${String(invoiceNumber).replace(/^INV-/, '')}`);

  const formattedDate = formatDate(sale.createdAt || sale.date || new Date().toISOString());

  // Payment details
  const paymentMethod = (sale.paymentMethod || sale.paymentType || 'KHQR').toUpperCase();
  const paymentStatus = (sale.paymentStatus || 'PAID').toUpperCase();
  const orderStatus = (sale.status || 'COMPLETED').toUpperCase();
  const gatewayName = sale.gateway || sale.gatewayName || (paymentMethod === 'KHQR' || paymentMethod === 'BAKONG' ? 'Bakong' : null);

  // Line items normalization
  const items = sale.items || sale.saleItems || sale.orderItems || [];

  // Financial values directly from backend
  const subtotal = sale.subtotal ?? sale.subTotal ?? sale.itemsTotal;
  const discount = Number(sale.discount ?? sale.discountAmount ?? 0);
  const deliveryFee = Number(sale.deliveryFee ?? sale.shippingFee ?? sale.shipping ?? 0);
  const tax = Number(sale.tax ?? sale.taxAmount ?? 0);
  const finalTotal = sale.finalTotal ?? sale.total ?? sale.totalAmount ?? sale.amount ?? 0;

  // Status badge colors
  const isPaid = paymentStatus === 'PAID' || paymentStatus === 'SUCCESS' || paymentStatus === 'COMPLETED';
  const isOrderCompleted = orderStatus === 'COMPLETED' || orderStatus === 'DELIVERED' || orderStatus === 'CONFIRMED';

  const isPosStaffMode = mode === 'pos';

  return (
    <div
      id="receipt-print-area"
      className="mx-auto w-full max-w-[680px] bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-8 md:p-9 text-slate-900 dark:text-slate-100 shadow-sm print:max-w-none print:w-full print:rounded-none print:border-none print:shadow-none print:bg-white print:text-black print:p-4"
    >
      {/* 1. Optional Success Header Banner */}
      {showSuccessBadge && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 p-4 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40 print:hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <h4 className="text-sm font-extrabold">ការបញ្ជាទិញបានជោគជ័យ</h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Order Confirmed &amp; Verified</p>
          </div>
        </div>
      )}

      {/* 2. Brand & Receipt Title Header */}
      <div className="text-center pb-6 border-b border-slate-100 dark:border-slate-800/80 print:border-slate-300 print:pb-4">
        <div className="inline-flex items-center gap-2 mb-1">
          <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white print:text-black uppercase">
            {env.appName || 'MART SYSTEM'}
          </span>
        </div>
        
        <div className="mt-1 space-y-0.5">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-slate-100 print:text-black">
            បង្កាន់ដៃបញ្ជាទិញ
          </h2>
          <p className="text-xs font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500 print:text-slate-600">
            Order Receipt
          </p>
        </div>

        {/* Order, Invoice & Date Key Identifiers */}
        <div className="mt-4 inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 py-2.5 px-4 text-xs border border-slate-100 dark:border-slate-800 print:bg-transparent print:border-none print:p-0">
          <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200 print:text-black">
            <span className="text-slate-400 font-medium">Order:</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 print:text-black">{orderNumber}</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700 print:text-slate-400">·</span>
          <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200 print:text-black">
            <span className="text-slate-400 font-medium">Invoice:</span>
            <span className="font-mono">{invoiceNumber}</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700 print:text-slate-400">·</span>
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 print:text-slate-600 font-medium">
            <Calendar size={13} className="text-slate-400" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* 3. Customer & Delivery Information Sections */}
      <div className="py-5 border-b border-slate-100 dark:border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4 print:border-slate-300 print:py-3">
        {/* Customer Information Card */}
        <div className="rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 p-4 border border-slate-100 dark:border-slate-800/60 print:bg-transparent print:border-slate-200 print:p-2.5">
          <div className="flex items-center gap-2 mb-2.5 text-xs font-extrabold text-slate-700 dark:text-slate-200 print:text-black uppercase tracking-wide">
            <User size={14} className="text-emerald-600 dark:text-emerald-400" />
            <span>ព័ត៌មានអតិថិជន (Customer Information)</span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="font-bold text-slate-900 dark:text-white print:text-black text-sm">
              {resolvedCustomerName}
            </div>
            {resolvedCustomerPhone && (
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 print:text-slate-700">
                <Phone size={12} className="text-slate-400 shrink-0" />
                <span className="font-mono">{resolvedCustomerPhone}</span>
              </div>
            )}
            {resolvedCustomerEmail && (
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 print:text-slate-700">
                <Mail size={12} className="text-slate-400 shrink-0" />
                <span className="truncate">{resolvedCustomerEmail}</span>
              </div>
            )}
            {/* Show Cashier ONLY if explicitly in staff POS internal mode */}
            {isPosStaffMode && sale.cashier && (
              <div className="pt-1 mt-1 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-400">
                <span>អ្នកគិតលុយ: {sale.cashierName || sale.cashier}</span>
              </div>
            )}
          </div>
        </div>

        {/* Delivery Information Card (if present) or Order Meta Card */}
        {deliveryAddress ? (
          <div className="rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 p-4 border border-slate-100 dark:border-slate-800/60 print:bg-transparent print:border-slate-200 print:p-2.5">
            <div className="flex items-center gap-2 mb-2.5 text-xs font-extrabold text-slate-700 dark:text-slate-200 print:text-black uppercase tracking-wide">
              <MapPin size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span>អាសយដ្ឋានដឹកជញ្ជូន (Delivery Address)</span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 print:text-slate-700">
              {receiverName && (
                <div className="font-bold text-slate-900 dark:text-white print:text-black">
                  {receiverName} {receiverPhone ? `· ${receiverPhone}` : ''}
                </div>
              )}
              <p className="leading-relaxed">{deliveryAddress}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 p-4 border border-slate-100 dark:border-slate-800/60 print:bg-transparent print:border-slate-200 print:p-2.5 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2 text-xs font-extrabold text-slate-700 dark:text-slate-200 print:text-black uppercase tracking-wide">
              <ShoppingBag size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span>ប្រភេទការបញ្ជាទិញ (Order Type)</span>
            </div>
            <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300 print:text-slate-700">
              <p className="font-semibold text-slate-900 dark:text-white print:text-black">Online Store Order · Store Pickup / Direct Service</p>
              <p className="text-[11px] text-slate-400">Phnom Penh, Cambodia</p>
            </div>
          </div>
        )}
      </div>

      {/* 4. Product Items Table */}
      <div className="py-5 border-b border-slate-100 dark:border-slate-800/80 print:border-slate-300 print:py-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
            <Package size={14} className="text-emerald-600 dark:text-emerald-400" />
            <span>មុខទំនិញ (Order Items)</span>
          </h3>
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Desktop & Tablet Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 print:border-slate-300 print:text-slate-700">
                <th className="pb-2 text-left font-bold w-1/2">Product (ទំនិញ)</th>
                <th className="pb-2 text-center font-bold">Qty (ចំនួន)</th>
                <th className="pb-2 text-right font-bold">Price (តម្លៃ)</th>
                <th className="pb-2 text-right font-bold">Total (សរុប)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 print:divide-slate-200">
              {items.map((item, index) => {
                const productName = item.productName || item.name || item.product?.name || `Item #${index + 1}`;
                const quantity = item.quantity ?? item.qty ?? 1;
                const unitPrice = item.unitPrice ?? item.price ?? item.product?.price ?? 0;
                const lineTotal = item.lineTotal ?? (unitPrice * quantity);

                return (
                  <tr key={item.id || item.productId || index} className="group">
                    <td className="py-3 pr-3 text-left">
                      <div className="font-semibold text-slate-900 dark:text-white print:text-black leading-snug break-words">
                        {productName}
                      </div>
                      {item.barcode && (
                        <div className="text-[10px] font-mono text-slate-400 print:text-slate-500">
                          {item.barcode}
                        </div>
                      )}
                    </td>
                    <td className="py-3 text-center font-bold text-slate-700 dark:text-slate-300 print:text-black">
                      {quantity}
                    </td>
                    <td className="py-3 text-right font-medium text-slate-600 dark:text-slate-400 print:text-slate-800 font-mono">
                      {formatCurrency(unitPrice)}
                    </td>
                    <td className="py-3 text-right font-bold text-slate-900 dark:text-white print:text-black font-mono">
                      {formatCurrency(lineTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Items List (<640px) */}
        <div className="block sm:hidden space-y-3">
          {items.map((item, index) => {
            const productName = item.productName || item.name || item.product?.name || `Item #${index + 1}`;
            const quantity = item.quantity ?? item.qty ?? 1;
            const unitPrice = item.unitPrice ?? item.price ?? item.product?.price ?? 0;
            const lineTotal = item.lineTotal ?? (unitPrice * quantity);

            return (
              <div
                key={item.id || item.productId || index}
                className="rounded-xl bg-slate-50/60 dark:bg-slate-800/30 p-3 border border-slate-100 dark:border-slate-800/50 space-y-1.5"
              >
                <div className="font-bold text-xs text-slate-900 dark:text-white leading-snug break-words">
                  {productName}
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    {formatCurrency(unitPrice)} × {quantity}
                  </span>
                  <span className="font-extrabold text-slate-900 dark:text-white font-mono">
                    {formatCurrency(lineTotal)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Financial Summary & Totals */}
      <div className="py-5 border-b border-slate-100 dark:border-slate-800/80 print:border-slate-300 print:py-3">
        <div className="max-w-xs ml-auto space-y-2 text-xs">
          {/* Subtotal */}
          {subtotal != null && (
            <div className="flex justify-between text-slate-600 dark:text-slate-400 print:text-slate-700">
              <span className="font-medium">សរុបរង (Subtotal)</span>
              <span className="font-bold font-mono text-slate-800 dark:text-slate-200 print:text-black">
                {formatCurrency(subtotal)}
              </span>
            </div>
          )}

          {/* Discount if applicable */}
          {discount > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
              <span>បញ្ចុះតម្លៃ (Discount)</span>
              <span className="font-mono">-{formatCurrency(discount)}</span>
            </div>
          )}

          {/* Delivery fee if applicable */}
          {deliveryFee > 0 && (
            <div className="flex justify-between text-slate-600 dark:text-slate-400 print:text-slate-700">
              <span>ថ្លៃដឹកជញ្ជូន (Delivery Fee)</span>
              <span className="font-bold font-mono text-slate-800 dark:text-slate-200 print:text-black">
                {formatCurrency(deliveryFee)}
              </span>
            </div>
          )}

          {/* Tax if applicable */}
          {tax > 0 && showTaxDiscount && (
            <div className="flex justify-between text-slate-600 dark:text-slate-400 print:text-slate-700">
              <span>ពន្ធ (Tax)</span>
              <span className="font-mono">{formatCurrency(tax)}</span>
            </div>
          )}

          {/* Highlighted Final Total */}
          <div className="pt-2.5 mt-1 border-t-2 border-slate-200 dark:border-slate-800 print:border-black flex items-baseline justify-between text-sm sm:text-base font-black text-slate-900 dark:text-white print:text-black">
            <span>សរុប (TOTAL)</span>
            <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 print:text-black font-mono">
              {formatCurrency(finalTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* 6. Payment Method & Status Badges */}
      <div className="py-5 border-b border-slate-100 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3.5 print:border-slate-300 print:py-3">
        {/* Payment Card */}
        <div className="rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 p-3.5 border border-slate-100 dark:border-slate-800/60 flex items-center justify-between print:bg-transparent print:border-slate-200">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold mb-0.5">
              <QrCode size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span>ការទូទាត់ (Payment)</span>
            </div>
            <div className="text-xs font-extrabold text-slate-900 dark:text-white print:text-black">
              {paymentMethod === 'KHQR' || paymentMethod === 'BAKONG' ? 'KHQR / Bakong' : paymentMethod}
            </div>
            {gatewayName && (
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                Gateway: {gatewayName}
              </div>
            )}
          </div>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-wider ${
              isPaid
                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
            }`}
          >
            {paymentStatus}
          </span>
        </div>

        {/* Order Status Card */}
        <div className="rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 p-3.5 border border-slate-100 dark:border-slate-800/60 flex items-center justify-between print:bg-transparent print:border-slate-200">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold mb-0.5">
              <Clock size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span>ស្ថានភាពបញ្ជាទិញ (Order Status)</span>
            </div>
            <div className="text-xs font-extrabold text-slate-900 dark:text-white print:text-black">
              {orderStatus}
            </div>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-wider ${
              isOrderCompleted
                ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
            }`}
          >
            {orderStatus}
          </span>
        </div>
      </div>

      {/* 7. Footer Thank You & Official Note */}
      <div className="pt-6 text-center space-y-1.5 print:pt-4">
        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 print:text-black">
          សូមអរគុណសម្រាប់ការបញ្ជាទិញរបស់អ្នក!
        </p>
        <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 print:text-slate-600">
          Thank you for your order! Official e-commerce receipt from {env.appName || 'Mart System'}.
        </p>
      </div>
    </div>
  );
}