import { useState } from 'react';
import { X, Loader2, AlertCircle, Banknote, Clock, QrCode } from 'lucide-react';
import { formatCurrency, formatCurrencyPrecise } from '../../utils/format';
import { saleApi } from '../../api/saleApi';
import { getErrorMessage } from '../../api/client';
import BakongPaymentModal from './BakongPaymentModal';

/**
 * ដំណើរការ Checkout សម្រាប់ទាំង Guest Customer និង Logged-in Staff
 */
export default function CheckoutModal({ items, customer, subtotal, discountAmount, taxAmount, total, onClose, onSuccess }) {
  const [method, setMethod] = useState('BAKONG'); // Default to Bakong QR for quick customer payments
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [pendingSale, setPendingSale] = useState(null);

  const handleConfirm = async () => {
    setSubmitting(true);
    setError('');
    try {
      const sale = await saleApi.create({
        customer: customer?.id || null,
        discount: discountAmount,
        tax: taxAmount,
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          discount: item.discount || 0,
        })),
      });

      if (method === 'BAKONG') {
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in"
      onClick={() => !submitting && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-300 bg-white shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-900">សង្ខេបការគិតលុយ (Checkout)</h3>
          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-50 p-3 text-sm text-rose-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">អតិថិជន</span>
            <span className="font-medium text-slate-900">{customer?.name ?? 'អតិថិជនទូទៅ (Walk-in Customer)'}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-sm">
            <span className="text-slate-500">ចំនួនទំនិញ</span>
            <span className="font-medium text-slate-900">{items.length} មុខ</span>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-xs font-medium text-slate-600">វិធីបង់ប្រាក់ (Payment Method)</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMethod('BAKONG')}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border py-3 text-xs font-semibold transition ${
                  method === 'BAKONG'
                    ? 'border-emerald-500/50 bg-emerald-50 text-emerald-700 shadow-xs'
                    : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:text-slate-900'
                }`}
              >
                <QrCode size={16} />
                Bakong QR
              </button>
              <button
                type="button"
                onClick={() => setMethod('PAID')}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border py-3 text-xs font-semibold transition ${
                  method === 'PAID'
                    ? 'border-emerald-500/50 bg-emerald-50 text-emerald-700 shadow-xs'
                    : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:text-slate-900'
                }`}
              >
                <Banknote size={16} />
                សាច់ប្រាក់
              </button>
              <button
                type="button"
                onClick={() => setMethod('UNPAID')}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border py-3 text-xs font-semibold transition ${
                  method === 'UNPAID'
                    ? 'border-amber-500/50 bg-amber-50 text-amber-700 shadow-xs'
                    : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock size={16} />
                បង់ក្រោយ
              </button>
            </div>
          </div>

          <div className="mt-5 space-y-1.5 rounded-xl bg-slate-50 p-4 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>សរុបរង</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>បញ្ចុះតម្លៃ</span>
                <span>-{formatCurrencyPrecise(discountAmount)}</span>
              </div>
            )}
            {taxAmount > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>ពន្ធ</span>
                <span>{formatCurrencyPrecise(taxAmount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-200 pt-1.5 text-base font-bold text-slate-900">
              <span>សរុប</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 px-6 py-4">
          <button
            onClick={handleConfirm}
            disabled={submitting || items.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {method === 'BAKONG' ? 'បន្តទៅការទូទាត់ Bakong KHQR' : 'បញ្ជាក់ការលក់'}
          </button>
        </div>
      </div>
    </div>
  );
}
