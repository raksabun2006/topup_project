import { useState } from 'react';
import { X, Loader2, AlertCircle, Banknote, Clock, QrCode, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatCurrencyPrecise } from '../../utils/format';
import { saleApi } from '../../api/saleApi';
import { getErrorMessage } from '../../api/client';
import BakongPaymentModal from './BakongPaymentModal';


const QUICK_AMOUNTS = [5, 10, 20, 50, 100];

/**
 * Modern Retail POS Payment & Checkout Dialog:
 * - Large, tactile payment method cards (Cash, Bakong KHQR, Card, Pay Later)
 * - Quick cash tender buttons & automatic change calculation
 * - Fully preserves backend API payload & Bakong polling flow
 */
export default function CheckoutModal({
  items,
  customer,
  subtotal,
  discountAmount,
  taxAmount,
  total,
  onClose,
  onSuccess,
}) {
  const { isAuthenticated } = useAuth();
  const [method, setMethod] = useState(isAuthenticated ? 'CASH' : 'BAKONG');
  const [cashTendered, setCashTendered] = useState(total.toString());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [pendingSale, setPendingSale] = useState(null);

  const tenderedNum = parseFloat(cashTendered) || 0;
  const changeDue = Math.max(0, tenderedNum - total);

  const handleConfirm = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError('');
    try {
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

      const sale = await saleApi.create(payload);

      // Customer checkout or Bakong KHQR proceeds to polling QR modal
      if (!isAuthenticated || method === 'BAKONG') {
        setPendingSale(sale);
      } else {
        // CASH or CARD payments are marked as PAID immediately
        if (method === 'CASH' || method === 'CARD' || method === 'PAID') {
          await saleApi.markPaid(sale.id);
        }
        onSuccess(sale);
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
        onPaid={onSuccess}
        onClose={() => setPendingSale(null)}
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
              {isAuthenticated ? 'ទូទាត់ប្រាក់ (Payment & Checkout)' : 'សង្ខេបការបញ្ជាទិញ'}
            </h3>
            <p className="text-xs text-[#667085] dark:text-slate-400">
              {customer?.name ? `អតិថិជន៖ ${customer.name}` : 'អតិថិជនទូទៅ'} · {items.length} មុខទំនិញ
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

          {isAuthenticated && (
            <div>
              <label className="mb-2 block text-xs font-bold text-[#172033] dark:text-slate-300">
                ជ្រើសរើសវិធីទូទាត់ (Payment Method)
              </label>

              {/* 4 Large Payment Method Cards */}
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
                  <QrCode size={22} className={method === 'BAKONG' ? 'text-[#009F6B]' : ''} />
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
            </div>
          )}

          {/* Cash Tender Calculation (When Cash is selected) */}
          {isAuthenticated && method === 'CASH' && (
            <div className="space-y-2.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 p-3.5">
              <div className="flex items-center justify-between text-xs font-bold text-[#172033] dark:text-slate-200">
                <span>ប្រាក់បានទទួល (Amount Tendered)</span>
                <button
                  type="button"
                  onClick={() => setCashTendered(total.toString())}
                  className="text-[11px] font-bold text-[#009F6B] hover:underline cursor-pointer"
                >
                  លុយគ្រប់ ({formatCurrency(total)})
                </button>
              </div>

              {/* Quick Cash Buttons */}
              <div className="flex flex-wrap gap-1.5">
                {QUICK_AMOUNTS.filter((amt) => amt >= total || amt === 100).slice(0, 4).map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCashTendered(amt.toString())}
                    className={`rounded-xl px-3 py-1.5 text-xs font-black transition cursor-pointer ${
                      tenderedNum === amt
                        ? 'bg-[#009F6B] text-white'
                        : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#172033] dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              {/* Direct Input & Change Display */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 py-2 pl-7 pr-3 text-sm font-bold text-[#172033] dark:text-white focus:border-[#009F6B] focus:outline-none"
                    placeholder="0.00"
                  />
                </div>

                <div className="flex flex-col justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5">
                  <span className="text-[10px] font-semibold text-[#667085] dark:text-slate-400">ប្រាក់អាប់ (Change)</span>
                  <span className="text-sm font-black text-[#009F6B] dark:text-emerald-400">
                    {formatCurrency(changeDue)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Receipt Price Breakdown */}
          <div className="space-y-1.5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/80 p-4 text-xs border border-slate-200/90 dark:border-slate-800">
            <div className="flex justify-between text-[#667085] dark:text-slate-400">
              <span>សរុបរង</span>
              <span className="text-[#172033] dark:text-slate-200 font-semibold">{formatCurrency(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-[#009F6B] dark:text-emerald-400 font-medium">
                <span>បញ្ចុះតម្លៃ</span>
                <span>-{formatCurrencyPrecise(discountAmount)}</span>
              </div>
            )}
            {taxAmount > 0 && (
              <div className="flex justify-between text-[#667085] dark:text-slate-400">
                <span>ពន្ធ</span>
                <span className="text-[#172033] dark:text-slate-200 font-semibold">{formatCurrencyPrecise(taxAmount)}</span>
              </div>
            )}
            <div className="flex items-baseline justify-between border-t border-slate-200 dark:border-slate-700 pt-2 text-sm font-bold text-[#172033] dark:text-white">
              <span className="text-base font-extrabold">សរុបត្រូវបង់</span>
              <span className="text-2xl font-black text-[#009F6B] dark:text-emerald-400">{formatCurrency(total)}</span>
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
              <span>បង់ប្រាក់ ({formatCurrency(total)})</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
