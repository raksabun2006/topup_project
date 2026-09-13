import { useState } from 'react';
import { X, User, Phone, ShieldCheck, Loader2, AlertCircle, Car } from 'lucide-react';
import { deliveryApi } from '../../api/deliveryApi';
import { getErrorMessage } from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';

export default function AssignDriverModal({
  isOpen,
  onClose,
  delivery,
  onSuccess,
}) {
  const { isKhmer } = useLanguage();

  // Extract initial driver info if formatted as "Driver: Name (Phone | Plate: PlateNumber)"
  const rawCarrier = delivery?.carrier || '';
  const [driverName, setDriverName] = useState(() => {
    if (rawCarrier.startsWith('Driver:')) {
      const match = rawCarrier.match(/Driver:\s*([^(]+)/);
      return match ? match[1].trim() : rawCarrier;
    }
    return delivery?.carrier || '';
  });

  const [driverPhone, setDriverPhone] = useState(() => {
    const match = rawCarrier.match(/\(([^|]+)/);
    return match ? match[1].trim() : '';
  });

  const [driverPlate, setDriverPlate] = useState(() => {
    const match = rawCarrier.match(/Plate:\s*([^)]+)/);
    return match ? match[1].trim() : '';
  });

  const [trackingNumber, setTrackingNumber] = useState(
    delivery?.trackingNumber || `DRV${Date.now().toString().slice(-8)}`
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !delivery) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!driverName.trim() || submitting) return;

    setSubmitting(true);
    setError('');

    // Format driver string
    let formattedCarrier = `Driver: ${driverName.trim()}`;
    const extraDetails = [];
    if (driverPhone.trim()) extraDetails.push(driverPhone.trim());
    if (driverPlate.trim()) extraDetails.push(`Plate: ${driverPlate.trim()}`);
    if (extraDetails.length > 0) {
      formattedCarrier += ` (${extraDetails.join(' | ')})`;
    }

    try {
      await deliveryApi.updateTracking(delivery.id, {
        carrier: formattedCarrier,
        trackingNumber: trackingNumber.trim() || delivery.trackingNumber,
        courierOrderNumber: delivery.courierOrderNumber,
        estimatedDeliveryDate: delivery.estimatedDeliveryDate,
      });

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
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Car size={16} className="text-emerald-600" />
              <span>{isKhmer ? 'ចាត់ចែងអ្នកដឹកជញ្ជូន (Driver Assignment)' : 'Assign In-House Driver'}</span>
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              {delivery.orderNumber ? `Order #${delivery.orderNumber}` : `DEL-${delivery.id.slice(0, 8)}`}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Current Driver if already assigned */}
          {delivery.carrier && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                {isKhmer ? 'អ្នកដឹកបច្ចុប្បន្ន' : 'Currently Assigned'}:
              </span>
              <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                {delivery.carrier}
              </p>
            </div>
          )}

          {/* Driver Name */}
          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-200 mb-1">
              {isKhmer ? 'ឈ្មោះអ្នកដឹក (Driver Name)' : 'Driver Name'} *
            </label>
            <div className="relative">
              <User size={14} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                required
                placeholder="e.g. Sok Dara"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Driver Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {isKhmer ? 'លេខទូរស័ព្ទអ្នកដឹក (Driver Phone)' : 'Driver Phone Number'}
            </label>
            <div className="relative">
              <Phone size={14} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="tel"
                placeholder="012 345 678"
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Vehicle License Plate */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {isKhmer ? 'ស្លាកលេខយានយន្ត (Plate Number)' : 'Vehicle Plate Number'}
            </label>
            <div className="relative">
              <Car size={14} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. 1A-1234 (Phnom Penh)"
                value={driverPlate}
                onChange={(e) => setDriverPlate(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Tracking Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {isKhmer ? 'លេខកូដតាមដានផ្ទៃក្នុង (Tracking Code)' : 'Internal Tracking / Dispatch Code'}
            </label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-xs font-mono border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Actions */}
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
              disabled={submitting || !driverName.trim()}
              className="px-4 py-2 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition shadow-xs flex items-center gap-2 cursor-pointer"
            >
              {submitting && <Loader2 size={13} className="animate-spin" />}
              <span>{isKhmer ? 'រក្សាទុកអ្នកដឹក' : 'Save Driver'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
