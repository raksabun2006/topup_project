import { useState, useEffect, useMemo } from 'react';
import { X, Loader2, AlertCircle, Banknote, Clock, QrCode, CreditCard, User, Phone, MapPin, Truck, Coins } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatCurrencyPrecise, formatKhr, toKhr, KHR_RATE } from '../../utils/format';
import { saleApi } from '../../api/saleApi';
import { getErrorMessage } from '../../api/client';
import BakongPaymentModal from './BakongPaymentModal';
import { saveCustomerOrder } from './CustomerOrdersModal';
import { broadcastPosState } from './CustomerFacingDisplay';

const QUICK_USD = [1, 5, 10, 20, 50, 100];
const QUICK_KHR = [5000, 10000, 20000, 50000, 100000];

export default function CheckoutModal({
  items,
  customer,
  subtotal,
  discountAmount = 0,
  taxAmount = 0,
  total,
  onClose,
  onSuccess,
}) {
  const { isAuthenticated } = useAuth();
  const [method, setMethod] = useState('BAKONG'); // 'BAKONG', 'CASH', 'CARD', 'UNPAID'
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [tenderCurrency, setTenderCurrency] = useState('USD'); // 'USD' or 'KHR'
  const [cashTenderedUsd, setCashTenderedUsd] = useState(total.toFixed(2));
  const [cashTenderedKhr, setCashTenderedKhr] = useState(toKhr(total).toString());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [pendingSale, setPendingSale] = useState(null);

  const tenderedUsd = useMemo(() => {
    if (tenderCurrency === 'KHR') {
      const khrVal = parseFloat(cashTenderedKhr) || 0;
      return Math.round((khrVal / KHR_RATE) * 100) / 100;
    }
    return parseFloat(cashTenderedUsd) || 0;
  }, [tenderCurrency, cashTenderedUsd, cashTenderedKhr]);

  const changeDueUsd = Math.max(0, tenderedUsd - total);
  const changeDueKhr = Math.round(changeDueUsd * KHR_RATE);

  // Broadcast checkout status to Customer-Facing Display
  useEffect(() => {
    broadcastPosState({
      items,
      customer,
      subtotal,
      discountAmount,
      taxAmount,
      total,
      status: 'CHECKOUT',
      qrData: pendingSale?.qr || pendingSale?.qrString || null,
      cashTendered: tenderedUsd,
      changeDue: changeDueUsd,
    });
  }, [items, customer, subtotal, discountAmount, taxAmount, total, pendingSale, tenderedUsd, changeDueUsd]);

  const handleConfirm = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const isGuest = !isAuthenticated;
      const payload = isAuthenticated
        ? {
            customer: customer?.id || null,
            discount: discountAmount || 0,
            tax: taxAmount || 0,
            items: items.map((item) => ({
              productId: item.product.id,
              quantity: item.quantity,
              discount: item.discount || 0,
            })),
          }
        : {
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

      const saleWithCash = {
        ...sale,
        cashTendered: tenderedUsd,
        changeDue: changeDueUsd,
      };

      // Save customer details and order to history
      saveCustomerOrder({
        ...saleWithCash,
        items,
        total,
        customerName: customerName || customer?.name,
        customerPhone,
        deliveryAddress,
        paymentMethod: method,
      });

      // Customer checkout or Bakong KHQR proceeds to polling QR modal
      if (!isAuthenticated || method === 'BAKONG') {
        setPendingSale({ ...sale, isGuest });
      } else {
        // CASH or CARD payments are marked as PAID immediately
        if (method === 'CASH' || method === 'CARD' || method === 'PAID') {
          await saleApi.markPaid(sale.id);
        }
        onSuccess(saleWithCash);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (pendingSale) {
    return (
      <BakongPaymentModal
        sale={pendingSale}
        onPaid={(completed) => {
          saveCustomerOrder(completed);
          setPendingSale(null);
          onSuccess(completed);
        }}
        onClose={() => {
          setPendingSale(null);
          onClose();
        }}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-xs animate-fade-in"
      onClick={() => !submitting && onClose()}
    >
      <div
        className="w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl animate-slide-up sm:animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-[#172033] dark:text-white">
              {isAuthenticated ? 'ទូទាត់ប្រាក់ (Payment & Checkout)' : 'ការទូទាត់ប្រាក់ (Checkout)'}
            </h3>
            <p className="text-xs text-[#667085] dark:text-slate-400">
              {customer?.name ? `អតិថិជន៖ ${customer.name}` : 'សង្ខេបការបញ្ជាទិញ'} · {items.length} មុខទំនិញ
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-50 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-50 dark:bg-rose-950/30 p-3 text-xs text-rose-700 dark:text-rose-400">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Customer / Delivery Information (For Customer POS) */}
          {!isAuthenticated && (
            <div className="space-y-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 p-3.5">
              <span className="text-xs font-bold text-[#172033] dark:text-white flex items-center gap-1.5">
                <Truck size={14} className="text-[#009F6B]" />
                <span>ព័ត៌មានដឹកជញ្ជូន / ទំនាក់ទំនង (Delivery Information)</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ឈ្មោះរបស់អ្នក (Name)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-8 pr-3 text-xs font-semibold text-slate-900 dark:text-white focus:border-[#009F6B] focus:outline-none"
                  />
                </div>

                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="លេខទូរស័ព្ទ (Phone number)"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-8 pr-3 text-xs font-semibold text-slate-900 dark:text-white focus:border-[#009F6B] focus:outline-none"
                  />
                </div>
              </div>

              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="អាសយដ្ឋានដឹកជញ្ជូន / ចំណាំ (Address / Note)"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-8 pr-3 text-xs font-semibold text-slate-900 dark:text-white focus:border-[#009F6B] focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Payment Method Selector */}
          <div>
            <label className="mb-2 block text-xs font-bold text-[#172033] dark:text-slate-300">
              ជ្រើសរើសវិធីទូទាត់ (Payment Method)
            </label>

            {isAuthenticated ? (
              /* Staff Payment Methods */
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('CASH')}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 p-3 text-xs font-bold transition-all cursor-pointer ${
                    method === 'CASH'
                      ? 'border-[#009F6B] bg-[#E8F8F2] dark:bg-emerald-950/40 text-[#00845A] dark:text-emerald-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50 text-[#667085] dark:text-slate-300 hover:border-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <Banknote size={22} className={method === 'CASH' ? 'text-[#009F6B]' : ''} />
                  <span>សាច់ប្រាក់ (Cash)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('BAKONG')}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 p-3 text-xs font-bold transition-all cursor-pointer ${
                    method === 'BAKONG'
                      ? 'border-[#009F6B] bg-[#E8F8F2] dark:bg-emerald-950/40 text-[#00845A] dark:text-emerald-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50 text-[#667085] dark:text-slate-300 hover:border-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <img
                    src="/bakong.png"
                    alt="Bakong"
                    className="h-5 w-5 object-contain"
                    onError={(e) => { e.currentTarget.src = '/images/bakong.png'; }}
                  />
                  <span>Bakong KHQR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('CARD')}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 p-3 text-xs font-bold transition-all cursor-pointer ${
                    method === 'CARD'
                      ? 'border-[#009F6B] bg-[#E8F8F2] dark:bg-emerald-950/40 text-[#00845A] dark:text-emerald-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50 text-[#667085] dark:text-slate-300 hover:border-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <CreditCard size={22} className={method === 'CARD' ? 'text-[#009F6B]' : ''} />
                  <span>កាត (Card)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('UNPAID')}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 p-3 text-xs font-bold transition-all cursor-pointer ${
                    method === 'UNPAID'
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50 text-[#667085] dark:text-slate-300 hover:border-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <Clock size={22} className={method === 'UNPAID' ? 'text-amber-600' : ''} />
                  <span>បង់ក្រោយ (Later)</span>
                </button>
              </div>
            ) : (
              /* Online Customer: Strictly Bakong KHQR */
              <div className="flex items-center gap-3.5 rounded-2xl border-2 border-[#009F6B] bg-[#E8F8F2]/70 dark:bg-emerald-950/40 p-3.5 shadow-xs">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-slate-800 text-[#009F6B] shadow-xs border border-[#009F6B]/20 p-1 overflow-hidden">
                  <img
                    src="/bakong.png"
                    alt="Bakong KHQR"
                    className="h-full w-full object-contain"
                    onError={(e) => { e.currentTarget.src = '/images/bakong.png'; }}
                  />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <div className="flex items-center gap-1.5">
                    <p className="font-extrabold text-sm text-slate-900 dark:text-white">Bakong KHQR</p>
                    <span className="rounded-md bg-[#009F6B] text-white px-1.5 py-0.2 text-[9px] font-bold">
                      ស្វ័យប្រវត្តិ
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                    ស្កេនទូទាត់ភ្លាមៗជាមួយគ្រប់កម្មវិធីធនាគារក្នុងប្រទេសកម្ពុជា
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Cash Tender Calculation (Staff Cash) */}
          {isAuthenticated && method === 'CASH' && (
            <div className="space-y-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#172033] dark:text-slate-200 flex items-center gap-1.5">
                  <Coins size={14} className="text-[#009F6B]" />
                  <span>ប្រាក់បានទទួល (Tendered)</span>
                </span>

                {/* Currency Switcher Tabs */}
                <div className="flex items-center rounded-xl bg-slate-200/80 dark:bg-slate-700/80 p-0.5 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setTenderCurrency('USD')}
                    className={`rounded-lg px-2 py-0.5 transition cursor-pointer ${
                      tenderCurrency === 'USD'
                        ? 'bg-[#009F6B] text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    $ USD
                  </button>
                  <button
                    type="button"
                    onClick={() => setTenderCurrency('KHR')}
                    className={`rounded-lg px-2 py-0.5 transition cursor-pointer ${
                      tenderCurrency === 'KHR'
                        ? 'bg-[#009F6B] text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    ៛ KHR
                  </button>
                </div>
              </div>

              {/* Exact Amount Button */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">ជម្រើសលឿន៖</span>
                <button
                  type="button"
                  onClick={() => {
                    if (tenderCurrency === 'USD') {
                      setCashTenderedUsd(total.toFixed(2));
                    } else {
                      setCashTenderedKhr(toKhr(total).toString());
                    }
                  }}
                  className="text-[11px] font-bold text-[#009F6B] hover:underline cursor-pointer"
                >
                  លុយគ្រប់ ({formatCurrency(total)} / {formatKhr(total)})
                </button>
              </div>

              {/* Quick Cash Denomination Buttons */}
              <div className="flex flex-wrap gap-1.5">
                {tenderCurrency === 'USD' ? (
                  QUICK_USD.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCashTenderedUsd(amt.toString())}
                      className={`rounded-xl px-3 py-1.5 text-xs font-black transition cursor-pointer ${
                        tenderedUsd === amt
                          ? 'bg-[#009F6B] text-white shadow-xs'
                          : amt >= total
                          ? 'border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
                          : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#172033] dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      ${amt}
                    </button>
                  ))
                ) : (
                  QUICK_KHR.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCashTenderedKhr(amt.toString())}
                      className={`rounded-xl px-2.5 py-1.5 text-xs font-black transition cursor-pointer ${
                        parseFloat(cashTenderedKhr) === amt
                          ? 'bg-[#009F6B] text-white shadow-xs'
                          : amt >= toKhr(total)
                          ? 'border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
                          : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#172033] dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {amt.toLocaleString()} ៛
                    </button>
                  ))
                )}
              </div>

              {/* Direct Input & Change Display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    {tenderCurrency === 'USD' ? '$' : '៛'}
                  </span>
                  <input
                    type="number"
                    step={tenderCurrency === 'USD' ? '0.01' : '100'}
                    min="0"
                    value={tenderCurrency === 'USD' ? cashTenderedUsd : cashTenderedKhr}
                    onChange={(e) => {
                      if (tenderCurrency === 'USD') {
                        setCashTenderedUsd(e.target.value);
                      } else {
                        setCashTenderedKhr(e.target.value);
                      }
                    }}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 py-2.5 pl-8 pr-3 text-sm font-bold text-[#172033] dark:text-white focus:border-[#009F6B] focus:outline-none"
                    placeholder="0.00"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                    {tenderCurrency === 'USD'
                      ? `~ ${formatKhr(tenderedUsd)}`
                      : `~ ${formatCurrency(tenderedUsd)}`}
                  </span>
                </div>

                <div className="flex flex-col justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#667085] dark:text-slate-400 uppercase">
                      ប្រាក់អាប់ (Change Due)
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                      {formatKhr(changeDueUsd)}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mt-0.5">
                    <span className="text-base font-black text-[#009F6B] dark:text-emerald-400">
                      {formatCurrency(changeDueUsd)}
                    </span>
                    {/* Cambodian change breakdown if fractional dollars exist */}
                    {changeDueUsd > 1 && Math.round((changeDueUsd % 1) * 100) > 0 && (
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        ${Math.floor(changeDueUsd)} + {formatKhr(changeDueUsd % 1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Receipt Price Breakdown */}
          <div className="space-y-1.5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/80 p-4 text-xs border border-slate-200/90 dark:border-slate-800">
            <div className="flex justify-between text-[#667085] dark:text-slate-400">
              <span>សរុបរង (Subtotal)</span>
              <span className="text-[#172033] dark:text-slate-200 font-semibold">{formatCurrency(subtotal)}</span>
            </div>
            {!isAuthenticated && (
              <div className="flex justify-between text-[#667085] dark:text-slate-400">
                <span>ដឹកជញ្ជូន (Delivery)</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold">{formatCurrency(1.5)}</span>
              </div>
            )}
            {discountAmount > 0 && (
              <div className="flex justify-between text-[#009F6B] dark:text-emerald-400 font-medium">
                <span>បញ្ចុះតម្លៃ (Discount)</span>
                <span>-{formatCurrencyPrecise(discountAmount)}</span>
              </div>
            )}
            {taxAmount > 0 && (
              <div className="flex justify-between text-[#667085] dark:text-slate-400">
                <span>ពន្ធ (Tax)</span>
                <span className="text-[#172033] dark:text-slate-200 font-semibold">{formatCurrencyPrecise(taxAmount)}</span>
              </div>
            )}
            <div className="flex items-baseline justify-between border-t border-slate-200 dark:border-slate-700 pt-2 text-sm font-bold text-[#172033] dark:text-white">
              <span className="text-base font-extrabold">សរុបត្រូវបង់ (TOTAL)</span>
              <div className="text-right">
                <span className="text-2xl font-black text-[#009F6B] dark:text-emerald-400 block leading-tight">
                  {formatCurrency(total)}
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
                  {formatKhr(total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Checkout Action */}
        <div className="shrink-0 border-t border-slate-100 dark:border-slate-800 px-5 py-4 bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting || items.length === 0}
            className="flex h-13 sm:h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#009F6B] px-5 text-sm sm:text-base font-extrabold text-white shadow-lg shadow-[#009F6B]/25 hover:bg-[#00845A] active:scale-[0.98] transition-all disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>កំពុងដំណើរការ...</span>
              </>
            ) : isAuthenticated ? (
              <span>
                {method === 'BAKONG'
                  ? 'បន្តទៅការទូទាត់ Bakong KHQR →'
                  : method === 'CASH'
                  ? `ទទួលប្រាក់ & បញ្ជាក់ (${formatCurrency(total)})`
                  : method === 'CARD'
                  ? `ទូទាត់កាតធនាគារ (${formatCurrency(total)})`
                  : 'កត់ត្រាការលក់ (បង់ក្រោយ)'}
              </span>
            ) : (
              <span>
                {method === 'BAKONG' ? `បង់ប្រាក់តាម Bakong KHQR (${formatCurrency(total)})` : `បញ្ជាទិញ (${formatCurrency(total)})`}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
