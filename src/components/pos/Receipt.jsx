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
  ShieldCheck,
  Building2,
  Receipt as ReceiptIcon,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/format';
import { env } from '../../config/env';
import { customerApi } from '../../api/customerApi';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Helper to test if a string is a real phone number with digits
const isNumericPhone = (str) => typeof str === 'string' && /\d{3,}/.test(str);

/**
 * Modern Ultra-Clean E-Commerce Order Receipt
 * Redesigned for customer experience with elegant typography,
 * high-contrast visual hierarchy, responsive layout, and print-ready styles.
 */
export default function Receipt({
  sale,
  showTaxDiscount = true,
  mode = 'ecommerce',
  showSuccessBadge = false,
}) {
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

  // 1. Resolve Raw Customer Fields
  let rawName =
    sale.customerName ||
    (typeof sale.customer === 'object' ? sale.customer?.name : null) ||
    customerData?.name ||
    (typeof sale.customer === 'string' && !UUID_RE.test(sale.customer) ? sale.customer : '') ||
    '';

  let rawPhone =
    sale.customerPhone ||
    (typeof sale.customer === 'object' ? sale.customer?.phone : null) ||
    customerData?.phone ||
    '';

  const rawEmail =
    sale.customerEmail ||
    (typeof sale.customer === 'object' ? sale.customer?.email : null) ||
    customerData?.email ||
    '';

  // Smart sanitization: if phone is non-numeric text (e.g. "Hour"), combine with name
  if (rawPhone && !isNumericPhone(rawPhone)) {
    if (!rawName.toLowerCase().includes(rawPhone.toLowerCase())) {
      rawName = `${rawName} ${rawPhone}`.trim();
    }
    rawPhone = '';
  }

  const customerName = rawName || 'Valued Customer';
  const customerPhone = rawPhone;
  const customerEmail = rawEmail;

  // 2. Resolve Delivery Info
  const deliveryAddress =
    sale.deliveryAddress ||
    sale.shippingAddress ||
    sale.address ||
    (typeof sale.deliveryInfo === 'object' ? sale.deliveryInfo?.address : sale.deliveryInfo) ||
    '';

  const receiverName = sale.receiverName || sale.recipientName || '';
  const receiverPhone = sale.receiverPhone || sale.recipientPhone || '';

  // 3. Order & Invoice Numbers
  const invoiceNumber = sale.invoiceNumber || sale.billNumber || sale.billNo || `INV-${String(sale.id || '').slice(-6)}`;
  const orderNumber =
    sale.orderNumber ||
    sale.orderId ||
    (sale.id ? `ORD-${String(sale.id).slice(0, 8).toUpperCase()}` : `ORD-${String(invoiceNumber).replace(/^INV-/, '')}`);

  const formattedDate = formatDate(sale.createdAt || sale.date || new Date().toISOString());

  // 4. Payment & Order Status
  const paymentMethod = (sale.paymentMethod || sale.paymentType || 'KHQR').toUpperCase();
  const paymentStatus = (sale.paymentStatus || 'PAID').toUpperCase();
  const orderStatus = (sale.status || 'COMPLETED').toUpperCase();
  const gatewayName = sale.gateway || sale.gatewayName || (paymentMethod === 'KHQR' || paymentMethod === 'BAKONG' ? 'Bakong' : null);

  // 5. Line items normalization
  const items = sale.items || sale.saleItems || sale.orderItems || [];

  // 6. Financial values directly from backend
  const subtotal = sale.subtotal ?? sale.subTotal ?? sale.itemsTotal;
  const discount = Number(sale.discount ?? sale.discountAmount ?? 0);
  const deliveryFee = Number(sale.deliveryFee ?? sale.shippingFee ?? sale.shipping ?? 0);
  const tax = Number(sale.tax ?? sale.taxAmount ?? 0);
  const finalTotal = sale.finalTotal ?? sale.total ?? sale.totalAmount ?? sale.amount ?? 0;

  const isPaid = paymentStatus === 'PAID' || paymentStatus === 'SUCCESS' || paymentStatus === 'COMPLETED';
  const isOrderCompleted = orderStatus === 'COMPLETED' || orderStatus === 'DELIVERED' || orderStatus === 'CONFIRMED';
  const isPosStaffMode = mode === 'pos';

  return (
    <div
      id="receipt-print-area"
      className="mx-auto w-full max-w-[620px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 text-slate-900 dark:text-slate-100 shadow-xl shadow-slate-200/40 dark:shadow-slate-950/60 print:max-w-none print:w-full print:rounded-none print:border-none print:shadow-none print:bg-white print:text-black print:p-2"
    >
      {/* 1. Optional Success Header Banner */}
      {showSuccessBadge && (
        <div className="mb-6 flex items-center gap-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 p-4 text-emerald-800 dark:text-emerald-200 border border-emerald-200/70 dark:border-emerald-900/40 print:hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs">
            <CheckCircle2 size={22} />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-extrabold text-emerald-900 dark:text-emerald-100">
              ការបញ្ជាទិញបានជោគជ័យ
            </h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
              Order Confirmed &amp; Payment Verified
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 px-3 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
            <ShieldCheck size={13} />
            <span>Verified</span>
          </span>
        </div>
      )}

      {/* 2. Store Header & Title */}
      <div className="text-center pb-6 border-b border-slate-100 dark:border-slate-800 print:border-slate-300 print:pb-4">
        <div className="inline-flex items-center justify-center gap-2 mb-1.5">
          <div className="h-7 w-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-xs shadow-xs print:hidden">
            M
          </div>
          <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white print:text-black uppercase">
            {env.appName || 'MART SYSTEM'}
          </span>
        </div>

        <div className="mt-1 space-y-0.5">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-slate-100 print:text-black">
            បង្កាន់ដៃបញ្ជាទិញ
          </h2>
          <p className="text-[11px] font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500 print:text-slate-600">
            Official Order Receipt
          </p>
        </div>

        {/* Key Identifiers: Order Number, Invoice Number, Date */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 p-2.5 sm:p-3 border border-slate-100 dark:border-slate-800/80 text-xs print:bg-transparent print:border-slate-200">
          <div className="flex flex-col items-center justify-center px-2 py-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              លេខបញ្ជាទិញ (Order)
            </span>
            <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 print:text-black text-xs sm:text-[13px] mt-0.5">
              {orderNumber}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center px-2 py-1 border-t sm:border-t-0 sm:border-x border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              វិក្កយបត្រ (Invoice)
            </span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200 print:text-black text-xs sm:text-[13px] mt-0.5">
              {invoiceNumber}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center px-2 py-1 border-t sm:border-t-0 border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              កាលបរិច្ឆេទ (Date)
            </span>
            <span className="font-medium text-slate-600 dark:text-slate-300 print:text-slate-700 text-xs mt-0.5">
              {formattedDate}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Customer & Delivery Cards */}
      <div className="py-5 border-b border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3.5 print:border-slate-300 print:py-3">
        {/* Customer Information Card */}
        <div className="rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 p-4 border border-slate-100 dark:border-slate-800/60 flex flex-col justify-between print:bg-transparent print:border-slate-200">
          <div>
            <div className="flex items-center gap-1.5 mb-2 text-xs font-extrabold text-slate-700 dark:text-slate-300 print:text-black">
              <User size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span>ព័ត៌មានអតិថិជន</span>
              <span className="text-[10px] text-slate-400 font-medium">· Customer</span>
            </div>
            <div className="text-sm font-extrabold text-slate-900 dark:text-white print:text-black">
              {customerName}
            </div>
          </div>

          <div className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-400 print:text-slate-700">
            {customerPhone && (
              <div className="flex items-center gap-1.5">
                <Phone size={12} className="text-slate-400 shrink-0" />
                <span className="font-mono">{customerPhone}</span>
              </div>
            )}
            {customerEmail && (
              <div className="flex items-center gap-1.5">
                <Mail size={12} className="text-slate-400 shrink-0" />
                <span className="truncate">{customerEmail}</span>
              </div>
            )}
            {isPosStaffMode && sale.cashier && (
              <div className="pt-1 text-[11px] text-slate-400">
                <span>អ្នកគិតលុយ: {sale.cashierName || sale.cashier}</span>
              </div>
            )}
          </div>
        </div>

        {/* Delivery / Order Destination Card */}
        <div className="rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 p-4 border border-slate-100 dark:border-slate-800/60 flex flex-col justify-between print:bg-transparent print:border-slate-200">
          <div>
            <div className="flex items-center gap-1.5 mb-2 text-xs font-extrabold text-slate-700 dark:text-slate-300 print:text-black">
              <MapPin size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span>អាសយដ្ឋានដឹកជញ្ជូន</span>
              <span className="text-[10px] text-slate-400 font-medium">· Delivery</span>
            </div>
            {deliveryAddress ? (
              <div className="text-xs text-slate-800 dark:text-slate-200 print:text-black leading-relaxed font-semibold">
                {receiverName && <span className="font-bold block mb-0.5">{receiverName} {receiverPhone ? `(${receiverPhone})` : ''}</span>}
                {deliveryAddress}
              </div>
            ) : (
              <div className="text-xs text-slate-600 dark:text-slate-400 print:text-slate-700">
                <p className="font-semibold text-slate-800 dark:text-slate-200">Direct Online Order / Store Pickup</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Phnom Penh, Cambodia</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Product Items Section */}
      <div className="py-5 border-b border-slate-100 dark:border-slate-800 print:border-slate-300 print:py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700 dark:text-slate-300 print:text-black">
            <Package size={13} className="text-emerald-600 dark:text-emerald-400" />
            <span>មុខទំនិញបញ្ជាទិញ</span>
            <span className="text-[10px] text-slate-400 font-medium">· Items</span>
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Clean Items Table */}
        <div className="space-y-2.5">
          {items.map((item, index) => {
            const productName = item.productName || item.name || item.product?.name || `Item #${index + 1}`;
            const quantity = item.quantity ?? item.qty ?? 1;
            const unitPrice = item.unitPrice ?? item.price ?? item.product?.price ?? 0;
            const lineTotal = item.lineTotal ?? (unitPrice * quantity);

            return (
              <div
                key={item.id || item.productId || index}
                className="flex items-center justify-between rounded-2xl bg-slate-50/70 dark:bg-slate-800/30 p-3.5 border border-slate-100 dark:border-slate-800/50 print:bg-transparent print:border-slate-200 print:p-2"
              >
                <div className="pr-3 flex-1 min-w-0">
                  <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white print:text-black leading-snug break-words">
                    {productName}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 print:text-slate-600 font-medium mt-0.5">
                    {formatCurrency(unitPrice)} × {quantity}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-black text-xs sm:text-sm text-slate-900 dark:text-white print:text-black font-mono">
                    {formatCurrency(lineTotal)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Financial Summary & Total Card */}
      <div className="py-5 border-b border-slate-100 dark:border-slate-800 print:border-slate-300 print:py-3">
        <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 p-4 border border-slate-100 dark:border-slate-800/60 max-w-sm ml-auto space-y-2.5 text-xs print:bg-transparent print:border-none print:p-0 print:max-w-none">
          {/* Subtotal */}
          {subtotal != null && (
            <div className="flex justify-between text-slate-600 dark:text-slate-400 print:text-slate-700">
              <span className="font-medium">សរុបរង (Subtotal)</span>
              <span className="font-bold font-mono text-slate-800 dark:text-slate-200 print:text-black">
                {formatCurrency(subtotal)}
              </span>
            </div>
          )}

          {/* Discount if present */}
          {discount > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
              <span>បញ្ចុះតម្លៃ (Discount)</span>
              <span className="font-mono">-{formatCurrency(discount)}</span>
            </div>
          )}

          {/* Delivery Fee if present */}
          {deliveryFee > 0 && (
            <div className="flex justify-between text-slate-600 dark:text-slate-400 print:text-slate-700">
              <span className="font-medium">ថ្លៃដឹកជញ្ជូន (Delivery)</span>
              <span className="font-bold font-mono text-slate-800 dark:text-slate-200 print:text-black">
                {formatCurrency(deliveryFee)}
              </span>
            </div>
          )}

          {/* Tax if present */}
          {tax > 0 && showTaxDiscount && (
            <div className="flex justify-between text-slate-600 dark:text-slate-400 print:text-slate-700">
              <span className="font-medium">ពន្ធ (Tax)</span>
              <span className="font-mono">{formatCurrency(tax)}</span>
            </div>
          )}

          {/* Highlighted Grand Total */}
          <div className="pt-2.5 border-t border-slate-200 dark:border-slate-700 print:border-black flex items-baseline justify-between text-sm sm:text-base font-black text-slate-900 dark:text-white print:text-black">
            <span>សរុបរួម (TOTAL)</span>
            <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 print:text-black font-mono">
              {formatCurrency(finalTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* 6. Payment Method & Order Status Badges */}
      <div className="py-5 border-b border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 print:border-slate-300 print:py-3">
        {/* Payment Badge Card */}
        <div className="rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 p-3.5 border border-slate-100 dark:border-slate-800/60 flex items-center justify-between print:bg-transparent print:border-slate-200">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">
              ការទូទាត់ (Payment)
            </div>
            <div className="text-xs font-extrabold text-slate-900 dark:text-white print:text-black">
              {paymentMethod === 'KHQR' || paymentMethod === 'BAKONG' ? 'Bakong KHQR' : paymentMethod}
            </div>
            {gatewayName && (
              <div className="text-[10px] text-slate-400 font-medium">
                Gateway: {gatewayName}
              </div>
            )}
          </div>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider ${
              isPaid
                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
            }`}
          >
            {paymentStatus}
          </span>
        </div>

        {/* Order Status Badge Card */}
        <div className="rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 p-3.5 border border-slate-100 dark:border-slate-800/60 flex items-center justify-between print:bg-transparent print:border-slate-200">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">
              ស្ថានភាពបញ្ជាទិញ (Order Status)
            </div>
            <div className="text-xs font-extrabold text-slate-900 dark:text-white print:text-black">
              {orderStatus}
            </div>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider ${
              isOrderCompleted
                ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
            }`}
          >
            {orderStatus}
          </span>
        </div>
      </div>

      {/* 7. Footer Thank You & Official Seal */}
      <div className="pt-6 text-center space-y-1 print:pt-4">
        <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white print:text-black">
          សូមអរគុណសម្រាប់ការបញ្ជាទិញរបស់អ្នក!
        </p>
        <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 print:text-slate-600">
          Thank you for shopping with {env.appName || 'Mart System'}. Official verified order confirmation.
        </p>
      </div>
    </div>
  );
}