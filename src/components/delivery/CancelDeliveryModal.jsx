import { useState } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { deliveryApi } from '../../api/deliveryApi';
import { getErrorMessage } from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';

export default function CancelDeliveryModal({
  isOpen,
  onClose,
  delivery,
  onSuccess,
}) {
  const { isKhmer } = useLanguage();
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !delivery) return null;

  const handleCancel = async (e) => {
    e.preventDefault();
    if (!reason.trim() || submitting) return;

    setSubmitting(true);
    setError('');

    try {
      await deliveryApi.cancelShipment(delivery.id, reason.trim());
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle size={18} />
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              {isKhmer ? 'បោះបង់ការដឹកជញ្ជូន?' : 'Cancel Delivery Shipment?'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleCancel} className="p-5 space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {isKhmer
              ? 'តើអ្នកប្រាកដជាចង់បោះបង់ការដឹកជញ្ជូននេះមែនទេ? សកម្មភាពនេះនឹងជូនដំណឹងដល់អតិថិជន និងក្រុមហ៊ុនដឹកជញ្ជូន។'
              : 'Are you sure you want to cancel this delivery shipment? This will record the cancellation reason and notify the customer and courier fleet.'}
          </p>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-200 mb-1.5">
              {isKhmer ? 'មូលហេតុនៃការបោះបង់' : 'Cancellation Reason'} *
            </label>
            <textarea
              required
              rows={3}
              placeholder={isKhmer ? 'បញ្ចូលមូលហេតុនៃការបោះបង់...' : 'Enter the reason for cancelling this shipment...'}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              {isKhmer ? 'រក្សាទុកការដឹក' : 'Keep Delivery'}
            </button>
            <button
              type="submit"
              disabled={submitting || !reason.trim()}
              className="px-4 py-2 rounded-xl text-xs font-black text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 transition shadow-xs flex items-center gap-2 cursor-pointer"
            >
              {submitting && <Loader2 size={13} className="animate-spin" />}
              <span>{isKhmer ? 'បោះបង់ការដឹកជញ្ជូន' : 'Confirm Cancellation'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
