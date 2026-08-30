import { useState } from 'react';
import { X, Loader2, AlertCircle, Banknote, Clock, QrCode } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatCurrencyPrecise } from '../../utils/format';
import { saleApi } from '../../api/saleApi';
import { getErrorMessage } from '../../api/client';
import BakongPaymentModal from './BakongPaymentModal';

/**
 * ដំណើរការ Checkout សម្រាប់ទាំង Guest Customer និង Logged-in Staff
 */
export default function CheckoutModal({ items, customer, subtotal, discountAmount, taxAmount, total, onClose, onSuccess }) {
  const { isAuthenticated } = useAuth();
  const [method, setMethod] = useState('BAKONG'); // Default to Bakong QR for customer payments
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [pendingSale, setPendingSale] = useState(null);

  const handleConfirm = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError('');
    try {
      // For customer checkout: strictly send 0 discount and 0 tax.
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

      // Customer checkout always proceeds to Bakong KHQR
      if (!isAuthenticated || method === 'BAKONG') {
        setPendingSale(sale);
      } else {
        if (method === 'PAID') {
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-sm animate-fade-in"
      onClick={() => !submitting && onClose()}
    >
      <div
        className="w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden rounded-t-3xl sm:rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl animate-slide-up sm:animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4 py-3.5 sm:px-6 sm:py-4">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {isAuthenticated ? 'សង្ខេបការគិតលុយ (Checkout)' : 'សង្ខេបការបញ្ជាទិញ'}
          </h3>
          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-50 transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-50 dark:bg-rose-950/30 p-3 text-xs sm:text-sm text-rose-700 dark:text-rose-400">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {isAuthenticated ? (
            /* Staff / Admin Details */
            <>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-500 dark:text-slate-400">អតិថិជន</span>
                <span className="font-medium text-slate-900 dark:text-slate-200">{customer?.name ?? 'អតិថិជនទូទៅ (Walk-in Customer)'}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-500 dark:text-slate-400">ចំនួនទំនិញ</span>
                <span className="font-medium text-slate-900 dark:text-slate-200">{items.length} មុខ</span>
              </div>

              <div className="mt-4 sm:mt-5">
                <label className="mb-2 block text-xs font-medium text-slate-600 dark:text-slate-300">វិធីបង់ប្រាក់ (Payment Method)</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMethod('BAKONG')}
                    className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border py-2.5 sm:py-3 text-xs font-semibold transition ${
                      method === 'BAKONG'
                        ? 'border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white dark:hover:bg-slate-800'
                    }`}
                  >
                    <QrCode size={16} />
                    Bakong QR
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod('PAID')}
                    className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border py-2.5 sm:py-3 text-xs font-semibold transition ${
                      method === 'PAID'
                        ? 'border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white dark:hover:bg-slate-800'
                    }`}
                  >
                    <Banknote size={16} />
                    សាច់ប្រាក់
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod('UNPAID')}
                    className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border py-2.5 sm:py-3 text-xs font-semibold transition ${
                      method === 'UNPAID'
                        ? 'border-amber-500/50 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white dark:hover:bg-slate-800'
                    }`}
                  >
                    <Clock size={16} />
                    បង់ក្រោយ
                  </button>
                </div>
              </div>

              <div className="mt-4 sm:mt-5 space-y-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3.5 sm:p-4 text-xs sm:text-sm border border-slate-100 dark:border-slate-750">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>សរុបរង</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium">{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>បញ្ចុះតម្លៃ</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">-{formatCurrencyPrecise(discountAmount)}</span>
                  </div>
                )}
                {taxAmount > 0 && (
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>ពន្ធ</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{formatCurrencyPrecise(taxAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-1.5 text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  <span>សរុប</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(total)}</span>
                </div>
              </div>
            </>
          ) : (
            /* Customer View: Simple Itemized Summary without Tax & Discount */
            <div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-3 sm:p-3.5">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between py-2 sm:py-2.5 first:pt-0 last:pb-0">
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="truncate text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">{item.product.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {formatCurrency(item.product.price)} × {item.quantity}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {formatCurrency(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3.5 sm:mt-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3.5 sm:p-4 border border-slate-100 dark:border-slate-750">
                <div className="flex items-center justify-between text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  <span>សរុបត្រូវបង់:</span>
                  <span className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-slate-200 dark:border-slate-800 px-4 py-3.5 sm:px-6 sm:py-4 bg-white dark:bg-slate-900">
          <button
            onClick={handleConfirm}
            disabled={submitting || items.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>កំពុងដំណើរការ...</span>
              </>
            ) : isAuthenticated ? (
              <span>{method === 'BAKONG' ? 'បន្តទៅការទូទាត់ Bakong KHQR' : 'បញ្ជាក់ការលក់'}</span>
            ) : (
              <span>បង់ប្រាក់ ({formatCurrency(total)})</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
