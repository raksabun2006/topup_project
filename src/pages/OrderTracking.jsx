import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Truck, Package, MapPin, Copy, Check,
  Clock, ShieldCheck, RefreshCw, AlertCircle, ShoppingBag,
  Car, Calendar, ChevronRight
} from 'lucide-react';
import { deliveryApi } from '../api/deliveryApi';
import { orderApi } from '../api/orderApi';
import { getErrorMessage } from '../api/client';
import { formatDate } from '../utils/format';
import { useLanguage } from '../context/LanguageContext';
import DeliveryStatusBadge from '../components/delivery/DeliveryStatusBadge';
import TrackingTimeline from '../components/delivery/TrackingTimeline';
import SEO from '../components/SEO';

export default function OrderTracking() {
  const { id, orderId } = useParams();
  const effectiveOrderId = id || orderId;
  const navigate = useNavigate();
  const { isKhmer } = useLanguage();

  const [trackingData, setTrackingData] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [copiedKey, setCopiedKey] = useState('');

  const pollIntervalRef = useRef(null);

  const fetchTracking = useCallback(async (isBackground = false) => {
    if (!effectiveOrderId) return;
    if (!isBackground) setLoading(true);
    else setRefreshing(true);
    setError('');

    try {
      // 1. Fetch delivery tracking data from backend
      // Backend supports /api/v1/deliveries/order/{orderId}/tracking or /api/v1/deliveries/{id}
      let tracking = null;
      try {
        tracking = await deliveryApi.getCustomerTracking(effectiveOrderId);
      } catch {
        // Fallback: try by direct delivery ID or order delivery endpoint
        try {
          const direct = await deliveryApi.getDeliveryByOrderId(effectiveOrderId);
          if (direct) {
            tracking = {
              deliveryId: direct.id,
              orderId: direct.orderId,
              orderNumber: direct.orderNumber,
              courier: direct.providerName || direct.carrier || 'Standard Courier',
              courierCode: direct.providerCode,
              courierLogoUrl: direct.providerLogoUrl,
              trackingNumber: direct.trackingNumber,
              courierOrderNumber: direct.courierOrderNumber,
              deliveryStatus: direct.deliveryStatus || direct.status,
              estimatedDeliveryDate: direct.estimatedDeliveryDate,
              currentLocation: direct.city || direct.province,
              recipientName: direct.recipientName,
              deliveryAddressSnapshot: direct.deliveryAddressSnapshot,
              trackingHistory: [],
            };
            const events = await deliveryApi.getTrackingEvents(direct.id);
            tracking.trackingHistory = events;
          }
        } catch {
          // If still fails, try getting order
        }
      }

      // 2. Fetch basic order info for fallback
      try {
        const orderData = await orderApi.getById(effectiveOrderId);
        setOrder(orderData);
      } catch {
        // ignore
      }

      if (tracking) {
        setTrackingData(tracking);
      } else if (!isBackground) {
        setError(
          isKhmer
            ? 'មិនទាន់មានព័ត៌មានតាមដានការដឹកជញ្ជូនសម្រាប់កញ្ចប់នេះនៅឡើយទេ'
            : 'Delivery tracking information is not available yet for this order.'
        );
      }
    } catch (err) {
      if (!isBackground) setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [effectiveOrderId, isKhmer]);

  useEffect(() => {
    fetchTracking();
  }, [fetchTracking]);

  // Non-aggressive polling (20s interval) that halts when reaching a terminal status
  useEffect(() => {
    if (!trackingData) return;
    const st = String(trackingData.deliveryStatus || '').toUpperCase();
    const isTerminal = ['DELIVERED', 'RETURNED', 'CANCELLED'].includes(st);

    if (isTerminal) {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      return;
    }

    // Set 20 second polling while shipment is actively moving
    pollIntervalRef.current = setInterval(() => {
      fetchTracking(true);
    }, 20000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [trackingData, fetchTracking]);

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const status = trackingData?.deliveryStatus || order?.status || 'PENDING';
  const orderNumber = trackingData?.orderNumber || order?.orderNumber || effectiveOrderId;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-6 sm:py-10 px-3 sm:px-6">
      <SEO title={`Track Order #${orderNumber} | Mart System`} noindex={true} />

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back navigation & Refresh */}
        <div className="flex items-center justify-between">
          <Link
            to={order?.id ? `/orders/${order.id}` : '/orders'}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>{isKhmer ? 'ត្រឡប់ទៅការបញ្ជាទិញ' : 'Back to Order Details'}</span>
          </Link>

          <button
            type="button"
            onClick={() => fetchTracking(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-2xs cursor-pointer"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            <span>{isKhmer ? 'ធ្វើបច្ចុប្បន្នភាព' : 'Refresh'}</span>
          </button>
        </div>

        {/* Loading Skeleton */}
        {loading && !trackingData && (
          <div className="space-y-4 animate-pulse">
            <div className="h-40 rounded-3xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-60 rounded-3xl bg-slate-200 dark:bg-slate-800" />
          </div>
        )}

        {/* Error / Empty state */}
        {!loading && (error || !trackingData) && (
          <div className="p-8 text-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto">
              <Truck size={28} />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                {isKhmer ? 'មិនទាន់មានព័ត៌មានតាមដាននៅឡើយទេ' : 'Tracking Not Available Yet'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                {error ||
                  (isKhmer
                    ? 'កញ្ចប់ទំនិញរបស់អ្នកកំពុងត្រូវបានរៀបចំ។ លេខតាមដានកញ្ចប់នឹងបង្ហាញនៅទីនេះពេលទំនិញចេញដំណើរ។'
                    : 'Your package is currently being prepared. Real-time tracking will activate once dispatched by our fulfillment team.')}
              </p>
            </div>
            {order?.id && (
              <Link
                to={`/orders/${order.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 transition"
              >
                <span>{isKhmer ? 'មើលព័ត៌មានការបញ្ជាទិញ' : 'View Order Details'}</span>
              </Link>
            )}
          </div>
        )}

        {/* Live Tracking Card */}
        {trackingData && (
          <>
            {/* Courier & Status Banner */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black shrink-0">
                    <Truck size={24} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      {isKhmer ? 'ក្រុមហ៊ុនដឹកជញ្ជូន' : 'Courier Fleet'}
                    </span>
                    <h2 className="text-base font-black text-slate-900 dark:text-white">
                      {trackingData.courier || trackingData.courierCode || 'Express Courier'}
                    </h2>
                  </div>
                </div>

                <DeliveryStatusBadge status={trackingData.deliveryStatus} size="md" />
              </div>

              {/* Waybill and Tracking Numbers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                {/* Tracking Number */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      {isKhmer ? 'លេខតាមដានកញ្ចប់' : 'Tracking Number'}
                    </span>
                    <span className="text-xs font-mono font-black text-slate-900 dark:text-white">
                      {trackingData.trackingNumber || 'Awaiting assignment'}
                    </span>
                  </div>
                  {trackingData.trackingNumber && (
                    <button
                      type="button"
                      onClick={() => handleCopy(trackingData.trackingNumber, 'trk')}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 transition cursor-pointer"
                      title="Copy Tracking Number"
                    >
                      {copiedKey === 'trk' ? (
                        <Check size={14} className="text-emerald-500" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  )}
                </div>

                {/* Waybill Number */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      {isKhmer ? 'លេខវិក្កយបត្រដឹក (Waybill)' : 'Waybill Number'}
                    </span>
                    <span className="text-xs font-mono font-black text-slate-900 dark:text-white">
                      {trackingData.courierOrderNumber || '—'}
                    </span>
                  </div>
                  {trackingData.courierOrderNumber && (
                    <button
                      type="button"
                      onClick={() => handleCopy(trackingData.courierOrderNumber, 'wb')}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 transition cursor-pointer"
                      title="Copy Waybill"
                    >
                      {copiedKey === 'wb' ? (
                        <Check size={14} className="text-emerald-500" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Estimated Delivery Date */}
              {trackingData.estimatedDeliveryDate && (
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 pt-1">
                  <Calendar size={14} className="text-emerald-600" />
                  <span>
                    {isKhmer ? 'ការប៉ាន់ស្មានពេលដឹកដល់' : 'Estimated Delivery'}:{' '}
                    <strong className="text-slate-900 dark:text-white">
                      {formatDate(trackingData.estimatedDeliveryDate, 'full')}
                    </strong>
                  </span>
                </div>
              )}
            </div>

            {/* Recipient Address Card */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                {isKhmer ? 'អាសយដ្ឋានដឹកជញ្ជូន' : 'Destination Address'}
              </span>

              <div className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-200 font-medium">
                <MapPin size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {trackingData.deliveryAddressSnapshot ||
                    order?.deliveryAddressSnapshot ||
                    'Standard In-Store Pickup'}
                </span>
              </div>
            </div>

            {/* Vertical Tracking Timeline Card */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  {isKhmer ? 'ដំណាក់កាលធ្វើដំណើរនៃកញ្ចប់ទំនិញ' : 'Tracking History'}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isKhmer
                    ? 'ព័ត៌មានផ្លូវការតាមពេលវេលាជាក់ស្តែងពីក្រុមហ៊ុនដឹកជញ្ជូន'
                    : 'Real-time verified events recorded from courier status webhooks.'}
                </p>
              </div>

              <TrackingTimeline
                events={trackingData.trackingHistory || []}
                currentStatus={trackingData.deliveryStatus}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
