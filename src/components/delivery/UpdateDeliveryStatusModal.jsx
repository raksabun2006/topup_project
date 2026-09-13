import { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, Loader2, MapPin, FileText, ArrowRight } from 'lucide-react';
import { deliveryApi } from '../../api/deliveryApi';
import { getErrorMessage } from '../../api/client';
import DeliveryStatusBadge, { STATUS_CONFIG } from './DeliveryStatusBadge';
import { getAvailableTransitions } from '../../utils/deliveryStateMachine';
import { useLanguage } from '../../context/LanguageContext';

export default function UpdateDeliveryStatusModal({
  isOpen,
  onClose,
  delivery,
  onSuccess,
}) {
  const { isKhmer } = useLanguage();
  const currentStatus = String(delivery?.deliveryStatus || delivery?.status || 'PENDING').toUpperCase();
  const availableStatuses = getAvailableTransitions(currentStatus);

  const [selectedStatus, setSelectedStatus] = useState(availableStatuses[0] || '');
  const [note, setNote] = useState('');
  const [location, setLocation] = useState(delivery?.city || delivery?.province || '');
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !delivery) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStatus || submitting) return;

    setSubmitting(true);
    setError('');

    try {
      await deliveryApi.updateStatus(delivery.id, {
        status: selectedStatus,
        note: note.trim() || undefined,
        location: location.trim() || undefined,
        estimatedDeliveryDate: estimatedDeliveryDate || undefined,
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      if (err?.response?.status === 409) {
        setError(
          isKhmer
            ? 'ស្ថានភាពការដឹកជញ្ជូននេះមិនអាចផ្លាស់ប្តូរពីស្ថានភាពបច្ចុប្បន្នបានទេ។ សូមផ្ទុកទំព័រឡើងវិញ។'
            : 'This delivery status cannot be changed from its current state. Please refresh and try again.'
        );
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-scale-up">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              {isKhmer ? 'កែប្រែស្ថានភាពដឹកជញ្ជូន' : 'Update Delivery Status'}
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              {delivery.orderNumber ? `#${delivery.orderNumber}` : `DEL-${delivery.id.slice(0, 8)}`}
            </p>
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

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Current Status Display */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {isKhmer ? 'ស្ថានភាពបច្ចុប្បន្ន' : 'Current Status'}:
            </span>
            <DeliveryStatusBadge status={currentStatus} size="sm" />
          </div>

          {/* Target Status Selection */}
          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-200 mb-1.5">
              {isKhmer ? 'ជ្រើសរើសស្ថានភាពថ្មី' : 'Select Target Status'} *
            </label>

            {availableStatuses.length === 0 ? (
              <p className="text-xs font-bold text-slate-400 italic py-2">
                {isKhmer
                  ? 'ការដឹកជញ្ជូននេះស្ថិតក្នុងស្ថានភាពចុងក្រោយ មិនអាចផ្លាស់ប្តូរបានទេ'
                  : 'This delivery is in a final state and cannot be modified.'}
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {availableStatuses.map((st) => {
                  const cfg = STATUS_CONFIG[st] || STATUS_CONFIG.PENDING;
                  const isSelected = selectedStatus === st;
                  return (
                    <label
                      key={st}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border cursor-pointer transition ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="targetStatus"
                          value={st}
                          checked={isSelected}
                          onChange={() => setSelectedStatus(st)}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <DeliveryStatusBadge status={st} size="xs" showDot={false} />
                      </div>
                      <span className="text-[11px] font-bold text-slate-400">
                        {isKhmer ? cfg.labelKm : cfg.labelEn}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Location Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              <span className="flex items-center gap-1">
                <MapPin size={13} className="text-slate-400" />
                <span>{isKhmer ? 'ទីតាំងបច្ចុប្បន្ន (ស្រេចចិត្ត)' : 'Current Location (Optional)'}</span>
              </span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Phnom Penh Fulfillment Hub"
              className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Note / Remarks Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              <span className="flex items-center gap-1">
                <FileText size={13} className="text-slate-400" />
                <span>{isKhmer ? 'កំណត់សម្គាល់ / មូលហេតុ (ស្រេចចិត្ត)' : 'Remarks / Reason (Optional)'}</span>
              </span>
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Package loaded onto delivery vehicle"
              className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              {isKhmer ? 'បោះបង់' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedStatus || availableStatuses.length === 0}
              className="px-4 py-2 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition shadow-xs flex items-center gap-2 cursor-pointer"
            >
              {submitting && <Loader2 size={13} className="animate-spin" />}
              <span>{isKhmer ? 'រក្សាទុកស្ថានភាព' : 'Update Status'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
