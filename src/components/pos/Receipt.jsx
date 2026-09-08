import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  Building2,
  Phone,
  MapPin,
  Calendar,
  User,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/format';
import { env } from '../../config/env';
import { customerApi } from '../../api/customerApi';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isNumericPhone = (str) => typeof str === 'string' && /\d{3,}/.test(str);

/**
 * Supermarket Thermal Barcode Component
 */
function ThermalBarcode({ value = 'INV-12345678', height = 40 }) {
  const cleanStr = String(value).toUpperCase();
  const bars = [];
  const pattern = [2, 1, 1, 2];

  for (let i = 0; i < cleanStr.length; i++) {
    const charCode = cleanStr.charCodeAt(i);
    pattern.push(
      (charCode % 3) + 1,
      ((charCode >> 1) % 2) + 1,
      ((charCode >> 2) % 3) + 1,
      ((charCode >> 3) % 2) + 1
    );
  }
  pattern.push(2, 1, 1, 2, 3);

  let currentX = 0;
  let isBar = true;
  pattern.forEach((width, idx) => {
    if (isBar) {
      bars.push(
        <rect
          key={idx}
          x={currentX}
          y={0}
          width={width}
          height={height}
          fill="currentColor"
        />
      );
    }
    currentX += width;
    isBar = !isBar;
  });

  return (
    <div className="flex flex-col items-center justify-center my-1.5">
      <svg
        viewBox={`0 0 ${currentX} ${height}`}
        className="h-10 w-44 max-w-full text-slate-900 dark:text-slate-100 print:text-black"
        preserveAspectRatio="none"
      >
        {bars}
      </svg>
      <span className="font-mono text-[9px] tracking-widest text-slate-600 dark:text-slate-400 print:text-black mt-0.5 font-bold">
        {cleanStr}
      </span>
    </div>
  );
}

/**
 * Supermarket Thermal Receipt
 * Designed based on classic supermarket receipt layout with:
 * - Supermarket Title & Address
 * - Dotted thermal separators
 * - Cashier / Manager / Invoice / Date metadata
 * - Name / Qty / Price table
 * - Bold Subtotal & Grand Total
 * - Code 128 thermal barcode
 * - Thank You footer
 */
export default function Receipt({
  sale,
  showTaxDiscount = true,
  mode = 'ecommerce',
  showSuccessBadge = false,
}) {
  const [customerData, setCustomerData] = useState(null);

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
        if (!cancelled && c) setCustomerData(c);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [customerId]);

  if (!sale) return null;

  // 1. Resolve Customer Name & Contact from real API data
  let rawName =
    sale.customerName ||
    (typeof sale.customer === 'object' ? sale.customer?.name || sale.customer?.displayName : null) ||
    customerData?.name ||
    customerData?.displayName ||
    (typeof sale.customer === 'string' && !UUID_RE.test(sale.customer) ? sale.customer : '') ||
    '';

  if (typeof rawName === 'object' && rawName !== null) {
    rawName = rawName.name || rawName.displayName || rawName.receiverName || '';
  }

  let rawPhone =
    sale.customerPhone ||
    (typeof sale.customer === 'object' ? sale.customer?.phone || sale.customer?.phoneNumber : null) ||
    customerData?.phone ||
    customerData?.phoneNumber ||
    '';

  if (rawPhone && !isNumericPhone(rawPhone)) {
    if (!rawName.toLowerCase().includes(rawPhone.toLowerCase())) {
      rawName = `${rawName} ${rawPhone}`.trim();
    }
    rawPhone = '';
  }

  const customerName = rawName || 'Valued Customer';
  const customerPhone = rawPhone;

  // 2. Real Invoice & Order Numbers & Date
  const invoiceNumber = sale.invoiceNumber || sale.billNumber || sale.billNo || `INV-${String(sale.id || '').slice(-6).toUpperCase()}`;
  const orderNumber = sale.orderNumber || sale.orderId || (sale.id ? `ORD-${String(sale.id).slice(0, 8).toUpperCase()}` : null);
  const formattedDate = formatDate(sale.createdAt || sale.date || new Date().toISOString());

  // 3. Real Cashier & Staff resolution
  const cashierName =
    sale.cashierName ||
    (typeof sale.cashier === 'object' ? sale.cashier?.name || sale.cashier?.displayName : sale.cashier) ||
    (typeof sale.user === 'object' ? sale.user?.displayName || sale.user?.name || sale.user?.username : sale.userName) ||
    sale.createdBy ||
    (mode === 'pos' ? 'POS Counter #1' : 'Online Store');

  // 4. Real Payment info
  const paymentMethod = (sale.paymentMethod || sale.paymentType || 'BAKONG KHQR').toUpperCase();
  const paymentStatus = (sale.paymentStatus || 'PAID').toUpperCase();

  // 5. Real Line items from API
  const items = sale.items || sale.saleItems || sale.orderItems || [];

  // 6. Real Financial values
  const finalTotal = Number(sale.finalTotal ?? sale.total ?? sale.totalAmount ?? sale.amount ?? 0);
  const discount = Number(sale.discount ?? sale.discountAmount ?? 0);
  const tax = Number(sale.tax ?? sale.taxAmount ?? 0);

  // Real Delivery Fee
  const rawDeliveryMethod = sale.deliveryMethod || sale.order?.deliveryMethod || (sale.deliveryAddress ? 'DELIVERY' : null);
  const isDelivery = String(rawDeliveryMethod || '').toUpperCase() === 'DELIVERY';
  let deliveryFee = 0;
  if (sale.deliveryFee != null || sale.shippingFee != null) {
    deliveryFee = Number(sale.deliveryFee ?? sale.shippingFee ?? 0);
  } else if (isDelivery) {
    const rawSub = Number(sale.subtotal ?? sale.subTotal ?? 0);
    if (rawSub > 0 && Math.abs((rawSub + 1.50 - discount + tax) - finalTotal) < 0.01) {
      deliveryFee = 1.50;
    }
  }

  const subtotal = Number(sale.subtotal ?? sale.subTotal ?? (finalTotal - deliveryFee + discount - tax));

  const deliveryAddress =
    typeof sale.deliveryAddress === 'string'
      ? sale.deliveryAddress
      : sale.deliveryAddress?.address || sale.shippingAddress?.address || '';

  return (
    <div className="mx-auto w-full max-w-[340px] font-mono select-text print:w-full print:max-w-[360px] print:p-0">
      {/* Optional Screen Verification Banner */}
      {showSuccessBadge && (
        <div className="mb-3 flex items-center gap-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-3 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-900/40 print:hidden font-sans">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs">
            <CheckCircle2 size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-100 leading-tight">
              ការបញ្ជាទិញបានជោគជ័យ
            </h4>
            <p className="text-[10px] text-emerald-700 dark:text-emerald-300">
              Order Verified &amp; Payment Completed
            </p>
          </div>
        </div>
      )}

      {/* The Authentic Borderless Thermal Receipt */}
      <div
        id="receipt-print-area"
        className="bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 p-3 sm:p-4 print:p-0 print:bg-white print:text-black border-none shadow-none rounded-none w-full"
      >
        {/* 1. Header: Store Name & Address */}
        <div className="text-center space-y-0.5">
          <h1 className="text-lg sm:text-xl font-black tracking-widest text-slate-950 dark:text-white print:text-black uppercase leading-tight">
            {env.appName ? env.appName.toUpperCase() : 'MART SYSTEM'}
          </h1>
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400 print:text-black">
            {sale.storeName || sale.branchName || 'Online Mart & POS System'}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 print:text-black">
            {sale.storeAddress || 'Phnom Penh, Cambodia'}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 print:text-black">
            Tel: {sale.storePhone || '0968782196'}
          </p>
        </div>

        {/* Dotted Separator */}
        <div className="border-b border-dashed border-slate-300 dark:border-slate-700 print:border-black my-2.5" />

        {/* 2. Metadata Section: Cashier / Invoice / Date from real API data */}
        <div className="text-xs space-y-0.5 text-slate-700 dark:text-slate-300 print:text-black leading-tight">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Cashier:</span>
            <span className="font-bold">{cashierName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold">Invoice:</span>
            <span className="font-bold">{invoiceNumber}</span>
          </div>
          {orderNumber && orderNumber !== invoiceNumber && (
            <div className="flex justify-between items-center">
              <span className="font-semibold">Order No:</span>
              <span className="font-bold truncate max-w-[170px]">{orderNumber}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="font-semibold">Date:</span>
            <span className="font-medium text-[11px]">{formattedDate}</span>
          </div>
          {customerName && customerName !== 'Valued Customer' && (
            <div className="flex justify-between items-center pt-0.5">
              <span className="font-semibold">Customer:</span>
              <span className="font-bold truncate max-w-[180px]">{customerName} {customerPhone ? `(${customerPhone})` : ''}</span>
            </div>
          )}
          {deliveryAddress && (
            <div className="flex justify-between items-start pt-0.5 text-[11px]">
              <span className="font-semibold shrink-0 mr-1.5">Address:</span>
              <span className="font-medium text-right truncate max-w-[190px]">{deliveryAddress}</span>
            </div>
          )}
        </div>

        {/* Dotted Separator */}
        <div className="border-b border-dashed border-slate-300 dark:border-slate-700 print:border-black my-2.5" />

        {/* 3. Items Table Header */}
        <div className="flex justify-between text-xs font-black text-slate-950 dark:text-white print:text-black mb-1.5 uppercase">
          <span className="w-1/2 text-left truncate">NAME</span>
          <span className="w-1/4 text-center">QTY</span>
          <span className="w-1/4 text-right">PRICE</span>
        </div>

        {/* Item Rows */}
        <div className="space-y-1 text-xs text-slate-800 dark:text-slate-200 print:text-black leading-tight">
          {items.map((item, index) => {
            const productName = item.productName || item.name || item.product?.name || `Item #${index + 1}`;
            const quantity = item.quantity ?? item.qty ?? 1;
            const unitPrice = item.unitPrice ?? item.price ?? item.product?.price ?? 0;
            const lineTotal = item.lineTotal ?? (unitPrice * quantity);

            return (
              <div key={item.id || item.productId || index} className="flex items-start justify-between">
                <span className="w-1/2 text-left font-medium pr-1 truncate" title={productName}>
                  {productName}
                </span>
                <span className="w-1/4 text-center font-bold">
                  {quantity}
                </span>
                <span className="w-1/4 text-right font-bold">
                  {formatCurrency(lineTotal)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Dotted Separator */}
        <div className="border-b border-dashed border-slate-300 dark:border-slate-700 print:border-black my-2.5" />

        {/* 4. Totals & Payment Section */}
        <div className="space-y-0.5 text-xs leading-tight">
          {/* Sub Total (Bold, prominent) */}
          <div className="flex justify-between items-baseline text-sm font-black text-slate-950 dark:text-white print:text-black">
            <span>Sub Total</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          {/* Delivery Fee if any */}
          {deliveryFee > 0 && (
            <div className="flex justify-between text-slate-600 dark:text-slate-400 print:text-black font-semibold">
              <span>DELIVERY</span>
              <span>{formatCurrency(deliveryFee)}</span>
            </div>
          )}

          {/* Discount if any */}
          {discount > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 print:text-black font-bold">
              <span>DISCOUNT</span>
              <span>-{formatCurrency(discount)}</span>
            </div>
          )}

          {/* Tax if any */}
          {tax > 0 && showTaxDiscount && (
            <div className="flex justify-between text-slate-600 dark:text-slate-400 print:text-black">
              <span>TAX</span>
              <span>{formatCurrency(tax)}</span>
            </div>
          )}

          {/* Payment Method / Cash / Bakong */}
          <div className="flex justify-between text-slate-700 dark:text-slate-300 print:text-black font-semibold pt-0.5">
            <span>{paymentMethod === 'KHQR' || paymentMethod === 'BAKONG' ? 'BAKONG KHQR' : paymentMethod}</span>
            <span>{formatCurrency(finalTotal)}</span>
          </div>

          {paymentStatus && (
            <div className="flex justify-between text-slate-500 dark:text-slate-400 print:text-black text-[10px]">
              <span>STATUS</span>
              <span className="font-bold uppercase text-emerald-600 dark:text-emerald-400 print:text-black">
                {paymentStatus}
              </span>
            </div>
          )}
        </div>

        {/* Dotted Separator */}
        <div className="border-b border-dashed border-slate-300 dark:border-slate-700 print:border-black my-2.5" />

        {/* 5. Thermal Barcode */}
        <ThermalBarcode value={invoiceNumber || orderNumber} />

        {/* 6. Thank You Footer */}
        <div className="text-center pt-1.5 space-y-0.5">
          <p className="text-xs font-black tracking-wider text-slate-950 dark:text-white print:text-black uppercase">
            THANK YOU!
          </p>
          <p className="text-[10px] text-slate-600 dark:text-slate-400 print:text-black font-medium">
            Glad to see you again!
          </p>
          <p className="text-[9px] text-slate-400 dark:text-slate-500 print:text-black font-sans">
            សូមអរគុណ! សូមអញ្ជើញមកម្តងទៀត!
          </p>
        </div>
      </div>
    </div>
  );
}