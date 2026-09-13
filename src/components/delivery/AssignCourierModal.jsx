import { useState, useEffect } from 'react';
import { X, Truck, Package, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { deliveryApi } from '../../api/deliveryApi';
import { deliveryProviderApi } from '../../api/deliveryProviderApi';
import { getErrorMessage } from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';

export default function AssignCourierModal({
  isOpen,
  onClose,
  delivery,
  onSuccess,
}) {
  const { isKhmer } = useLanguage();
  const [providers, setProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(false);

  const [providerCode, setProviderCode] = useState(delivery?.providerCode || 'JNT');
  const [weight, setWeight] = useState(delivery?.weight ?? 1.0);
  const [length, setLength] = useState(delivery?.length ?? 20);
  const [width, setWidth] = useState(delivery?.width ?? 15);
  const [height, setHeight] = useState(delivery?.height ?? 10);
  const [packageCount, setPackageCount] = useState(delivery?.packageCount ?? 1);
  const [declaredValue, setDeclaredValue] = useState(delivery?.declaredValue ?? 0);
  const [deliveryNote, setDeliveryNote] = useState(delivery?.deliveryNote || '');
  const [autoCreateShipment, setAutoCreateShipment] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    setLoadingProviders(true);
    deliveryProviderApi.getActiveProviders()
      .then((res) => {
        if (isMounted) {
          setProviders(res);
          if (!delivery?.providerCode && res.length > 0) {
            setProviderCode(res[0].code);
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoadingProviders(false);
      });

    return () => { isMounted = false; };
  }, [isOpen, delivery]);

  if (!isOpen || !delivery) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!providerCode || submitting) return;

    setSubmitting(true);
    setError('');

    const payload = {
      providerCode,
      weight: Number(weight) || 0,
      length: Number(length) || 0,
      width: Number(width) || 0,
      height: Number(height) || 0,
      packageCount: Number(packageCount) || 1,
      declaredValue: Number(declaredValue) || 0,
      deliveryNote: deliveryNote.trim() || undefined,
    };

    try {
      if (autoCreateShipment) {
        await deliveryApi.createShipment(delivery.id, payload);
      } else {
        await deliveryApi.assignProvider(delivery.id, payload);
      }

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
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Truck size={16} className="text-emerald-600" />
              <span>{isKhmer ? 'ចាត់ចែងក្រុមហ៊ុនដឹកជញ្ជូន' : 'Assign Courier & Package Specs'}</span>
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              {delivery.orderNumber ? `Order #${delivery.orderNumber}` : `Delivery DEL-${delivery.id.slice(0, 8)}`}
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Courier Selection */}
          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-200 mb-2">
              {isKhmer ? 'ជ្រើសរើសក្រុមហ៊ុនដឹកជញ្ជូន' : 'Select Courier Provider'} *
            </label>

            {loadingProviders ? (
              <div className="h-20 flex items-center justify-center text-xs text-slate-400">
                <Loader2 size={16} className="animate-spin mr-2" />
                <span>Loading providers...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                {(providers.length > 0 ? providers : [
                  { code: 'JNT', name: 'J&T Express', supportsTracking: true },
                  { code: 'VET', name: 'VET Logistics', supportsTracking: true },
                  { code: 'CAMBODIA_POST', name: 'Cambodia Post', supportsTracking: true },
                  { code: 'ZTO', name: 'ZTO Express', supportsTracking: true },
                  { code: 'CUSTOM', name: 'Custom / Own Fleet', supportsTracking: false },
                ]).map((prov) => {
                  const isSelected = providerCode === prov.code;
                  return (
                    <button
                      key={prov.code}
                      type="button"
                      onClick={() => setProviderCode(prov.code)}
                      className={`flex flex-col text-left p-3 rounded-xl border transition cursor-pointer ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {prov.name}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500">
                          {prov.code}
                        </span>
                        {prov.supportsTracking && (
                          <span className="text-[9px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 px-1 py-0.2 rounded border border-sky-200/50 dark:border-sky-800/40">
                            Tracking
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Package Weight & Count */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isKhmer ? 'ទម្ងន់ (គីឡូក្រាម - kg)' : 'Weight (kg)'} *
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isKhmer ? 'ចំនួនកញ្ចប់ (Package Count)' : 'Package Count'}
              </label>
              <input
                type="number"
                min="1"
                value={packageCount}
                onChange={(e) => setPackageCount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Dimensions */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {isKhmer ? 'វិមាត្រកញ្ចប់ (បណ្តោយ × ទទឹង × កម្ពស់ cm)' : 'Dimensions (L × W × H in cm)'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                step="0.5"
                min="1"
                placeholder="Length"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className="px-2.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-center"
              />
              <input
                type="number"
                step="0.5"
                min="1"
                placeholder="Width"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="px-2.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-center"
              />
              <input
                type="number"
                step="0.5"
                min="1"
                placeholder="Height"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="px-2.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-center"
              />
            </div>
          </div>

          {/* Declared Value & Note */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isKhmer ? 'តម្លៃទំនិញប្រកាស ($)' : 'Declared Value ($)'}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={declaredValue}
                onChange={(e) => setDeclaredValue(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isKhmer ? 'កំណត់ចំណាំដឹកជញ្ជូន' : 'Delivery Note'}
              </label>
              <input
                type="text"
                placeholder="Fragile / Call ahead"
                value={deliveryNote}
                onChange={(e) => setDeliveryNote(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Instant Shipment Creation Toggle */}
          <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 cursor-pointer">
            <input
              type="checkbox"
              checked={autoCreateShipment}
              onChange={(e) => setAutoCreateShipment(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <div className="min-w-0">
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 block">
                {isKhmer ? 'បង្កើតកញ្ចប់ដឹកជញ្ជូនភ្លាមៗ (Create Shipment)' : 'Generate Waybill & Create Shipment'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                {isKhmer
                  ? 'បញ្ជូនសំណើទៅកាន់ប្រព័ន្ធ API ក្រុមហ៊ុនដឹកដើម្បីទទួលបានលេខតាមដានភ្លាមៗ'
                  : 'Immediately registers tracking number with courier dispatch API.'}
              </span>
            </div>
          </label>

          {/* Action buttons */}
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
              disabled={submitting || !providerCode}
              className="px-4 py-2 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition shadow-xs flex items-center gap-2 cursor-pointer"
            >
              {submitting && <Loader2 size={13} className="animate-spin" />}
              <span>{isKhmer ? 'បញ្ជាក់ការចាត់ចែង' : 'Confirm Assignment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
