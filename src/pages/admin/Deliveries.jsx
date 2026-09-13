import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Truck, Search, Filter, RefreshCw, Eye, UserPlus,
  Edit3, RotateCw, XCircle, ChevronLeft, ChevronRight,
  Copy, Check, AlertCircle, Calendar, MapPin, ArrowUpDown,
  Car, ShieldAlert, FileText, CheckCircle2, Clock
} from 'lucide-react';
import { deliveryApi } from '../../api/deliveryApi';
import { deliveryReportApi } from '../../api/deliveryReportApi';
import { deliveryProviderApi } from '../../api/deliveryProviderApi';
import { getErrorMessage } from '../../api/client';
import { formatCurrency, formatDate } from '../../utils/format';
import { useLanguage } from '../../context/LanguageContext';
import DeliveryStatusBadge from '../../components/delivery/DeliveryStatusBadge';
import UpdateDeliveryStatusModal from '../../components/delivery/UpdateDeliveryStatusModal';
import AssignCourierModal from '../../components/delivery/AssignCourierModal';
import AssignDriverModal from '../../components/delivery/AssignDriverModal';
import CancelDeliveryModal from '../../components/delivery/CancelDeliveryModal';
import SEO from '../../components/SEO';

export default function Deliveries() {
  const { isKhmer, t } = useLanguage();
  const navigate = useNavigate();

  // Data states
  const [deliveries, setDeliveries] = useState([]);
  const [summaryReport, setSummaryReport] = useState(null);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Pagination states
  const [page, setPage] = useState(0);
  const [pageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Filters & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [providerFilter, setProviderFilter] = useState('ALL');
  const [provinceFilter, setProvinceFilter] = useState('ALL');

  // Copy feedback state
  const [copiedKey, setCopiedKey] = useState('');

  // Modal active states
  const [activeModal, setActiveModal] = useState(null); // 'STATUS' | 'COURIER' | 'DRIVER' | 'CANCEL'
  const [selectedDelivery, setSelectedDelivery] = useState(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(0);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load active courier providers for filter dropdown
  useEffect(() => {
    deliveryProviderApi.getActiveProviders()
      .then((res) => setProviders(res))
      .catch(() => {});
  }, []);

  // Fetch Authoritative Summary Reports (KPI cards)
  const fetchSummary = useCallback(async () => {
    try {
      const rep = await deliveryReportApi.getDeliverySummary();
      if (rep) setSummaryReport(rep);
    } catch {
      // Non-blocking fallback
    }
  }, []);

  // Fetch Deliveries list from backend API
  const fetchDeliveries = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    else setRefreshing(true);
    setError('');

    try {
      const data = await deliveryApi.getAllDeliveries({
        status: statusFilter,
        providerCode: providerFilter,
        query: debouncedQuery,
        page,
        size: pageSize,
      });

      const list = Array.isArray(data) ? data : (data?.content || []);
      
      // If province filter is active on frontend when backend returns data
      let filtered = list;
      if (provinceFilter !== 'ALL') {
        filtered = list.filter((item) =>
          item.province?.toLowerCase().includes(provinceFilter.toLowerCase())
        );
      }

      setDeliveries(filtered);
      setTotalPages(data?.totalPages ?? 1);
      setTotalElements(data?.totalElements ?? filtered.length);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, providerFilter, debouncedQuery, page, pageSize, provinceFilter]);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const handleSyncTracking = async (deliveryId) => {
    try {
      await deliveryApi.syncTracking(deliveryId);
      fetchDeliveries(true);
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <SEO title="Deliveries & Couriers | Mart Admin" noindex={true} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Truck size={20} />
            </div>
            <span>{isKhmer ? 'ការគ្រប់គ្រងការដឹកជញ្ជូន' : 'Deliveries & Fulfillment'}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {isKhmer
              ? 'តាមដាន ចាត់ចែងក្រុមហ៊ុនដឹក និងអ្នកដឹកជញ្ជូនសម្រាប់គ្រប់ការបញ្ជាទិញ'
              : 'Track, dispatch, and manage courier providers and in-house drivers.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { fetchDeliveries(true); fetchSummary(); }}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-2xs"
            title="Refresh Deliveries"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            <span>{isKhmer ? 'ផ្ទុកទិន្នន័យឡើងវិញ' : 'Refresh'}</span>
          </button>

          <Link
            to="/dashboard/delivery-providers"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-2xs"
          >
            <Truck size={13} className="text-sky-600" />
            <span>{isKhmer ? 'ក្រុមហ៊ុនដឹក' : 'Couriers'}</span>
          </Link>

          <Link
            to="/dashboard/delivery-zones"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-2xs"
          >
            <MapPin size={13} className="text-indigo-600" />
            <span>{isKhmer ? 'តំបន់ដឹក' : 'Zones'}</span>
          </Link>
        </div>
      </div>

      {/* Global Authoritative Statistics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 block">
            {isKhmer ? 'ការដឹកសរុប' : 'Total Deliveries'}
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">
            {summaryReport?.totalDeliveries ?? totalElements}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-bold text-blue-500 block">
            {isKhmer ? 'បានចាត់ចែង' : 'Assigned / Ready'}
          </span>
          <span className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1 block">
            {summaryReport?.assignedDeliveries ?? 0}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-bold text-sky-500 block">
            {isKhmer ? 'កំពុងដឹក' : 'In Transit'}
          </span>
          <span className="text-xl font-black text-sky-600 dark:text-sky-400 mt-1 block">
            {summaryReport?.inTransitDeliveries ?? 0}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-bold text-purple-500 block">
            {isKhmer ? 'ចេញដឹកជញ្ជូន' : 'Out for Delivery'}
          </span>
          <span className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1 block">
            {summaryReport?.outForDeliveryDeliveries ?? 0}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-500 block">
            {isKhmer ? 'ប្រគល់ជោគជ័យ' : 'Delivered'}
          </span>
          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
            {summaryReport?.deliveredCount ?? 0}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-bold text-rose-500 block">
            {isKhmer ? 'បរាជ័យ / ត្រឡប់' : 'Failed / Returned'}
          </span>
          <span className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1 block">
            {(summaryReport?.failedCount || 0) + (summaryReport?.returnedCount || 0)}
          </span>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Debounced Search Bar */}
          <div className="relative flex-1 min-w-0">
            <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isKhmer
                  ? 'ស្វែងរកតាមលេខ Order, លេខ Waybill, លេខ Tracking, ឈ្មោះ ឬលេខទូរស័ព្ទ...'
                  : 'Search by Order #, Tracking #, Waybill #, Customer name, Driver phone...'
              }
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Courier Filter */}
            <select
              value={providerFilter}
              onChange={(e) => { setProviderFilter(e.target.value); setPage(0); }}
              className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
            >
              <option value="ALL">{isKhmer ? 'ក្រុមហ៊ុនដឹក: ទាំងអស់' : 'All Providers'}</option>
              <option value="JNT">J&T Express</option>
              <option value="VET">VET Logistics</option>
              <option value="CAMBODIA_POST">Cambodia Post</option>
              <option value="ZTO">ZTO Express</option>
              <option value="CUSTOM">Custom / In-House</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
              className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
            >
              <option value="ALL">{isKhmer ? 'ស្ថានភាព: ទាំងអស់' : 'All Statuses'}</option>
              <option value="PENDING">Pending</option>
              <option value="ASSIGNED">Assigned / Ready for Pickup</option>
              <option value="PICKED_UP">Picked Up</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="ARRIVED_AT_DESTINATION">Arrived at Hub</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="FAILED">Failed Attempt</option>
              <option value="RETURNING">Returning</option>
              <option value="RETURNED">Returned</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            {/* Province Filter */}
            <select
              value={provinceFilter}
              onChange={(e) => { setProvinceFilter(e.target.value); setPage(0); }}
              className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
            >
              <option value="ALL">{isKhmer ? 'ខេត្ត/ក្រុង: ទាំងអស់' : 'All Provinces'}</option>
              <option value="Phnom Penh">Phnom Penh</option>
              <option value="Kandal">Kandal</option>
              <option value="Siem Reap">Siem Reap</option>
              <option value="Battambang">Battambang</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => fetchDeliveries()}
            className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Deliveries Responsive Table */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : deliveries.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <Truck size={40} className="mx-auto text-slate-400 mb-3 opacity-60" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              {isKhmer ? 'រកមិនឃើញការដឹកជញ្ជូនទេ' : 'No deliveries found'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {isKhmer
                ? 'សូមសាកល្បងផ្លាស់ប្តូរពាក្យគន្លឹះស្វែងរក ឬតម្រងស្ថានភាព'
                : 'Try changing your search keywords or resetting filters.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3.5">Order & Customer</th>
                  <th className="px-4 py-3.5">Provider & Waybill</th>
                  <th className="px-4 py-3.5">Tracking Number</th>
                  <th className="px-4 py-3.5">Delivery Status</th>
                  <th className="px-4 py-3.5">Driver / Carrier</th>
                  <th className="px-4 py-3.5">Shipping Fee</th>
                  <th className="px-4 py-3.5">Created</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {deliveries.map((del) => {
                  const trackingKey = `trk-${del.id}`;
                  const waybillKey = `wb-${del.id}`;
                  const isFinal = ['DELIVERED', 'RETURNED', 'CANCELLED'].includes(
                    String(del.deliveryStatus || del.status).toUpperCase()
                  );

                  return (
                    <tr
                      key={del.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Order & Customer */}
                      <td className="px-4 py-3">
                        <div>
                          <Link
                            to={`/dashboard/deliveries/${del.id}`}
                            className="font-extrabold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                          >
                            {del.orderNumber ? `#${del.orderNumber}` : `DEL-${del.id.slice(0, 8)}`}
                          </Link>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold truncate max-w-[160px]">
                            {del.recipientName || 'Walk-in Customer'}
                          </div>
                          {del.recipientPhone && (
                            <span className="text-[10px] text-slate-400">
                              {del.recipientPhone}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Provider & Waybill */}
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            {del.providerName || del.providerCode || 'Unassigned'}
                          </span>
                          {del.courierOrderNumber && (
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                              <span>WB: {del.courierOrderNumber}</span>
                              <button
                                type="button"
                                onClick={() => handleCopy(del.courierOrderNumber, waybillKey)}
                                title="Copy Waybill"
                                className="text-slate-400 hover:text-slate-600 transition"
                              >
                                {copiedKey === waybillKey ? (
                                  <Check size={11} className="text-emerald-500" />
                                ) : (
                                  <Copy size={11} />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Tracking Number */}
                      <td className="px-4 py-3">
                        {del.trackingNumber ? (
                          <div className="flex items-center gap-1.5 font-mono text-xs font-black text-slate-800 dark:text-slate-200">
                            <span>{del.trackingNumber}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(del.trackingNumber, trackingKey)}
                              title="Copy Tracking Number"
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
                            >
                              {copiedKey === trackingKey ? (
                                <Check size={12} className="text-emerald-500" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Not generated
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <DeliveryStatusBadge status={del.deliveryStatus || del.status} size="xs" />
                      </td>

                      {/* Driver / Carrier */}
                      <td className="px-4 py-3 max-w-[140px] truncate text-slate-700 dark:text-slate-300">
                        {del.carrier ? (
                          <span title={del.carrier} className="flex items-center gap-1 text-[11px] font-bold">
                            <Car size={12} className="text-slate-400 shrink-0" />
                            <span className="truncate">{del.carrier}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Shipping Cost */}
                      <td className="px-4 py-3 font-extrabold text-slate-900 dark:text-white">
                        {formatCurrency(del.deliveryFee || del.fee || 0)}
                      </td>

                      {/* Created */}
                      <td className="px-4 py-3 text-slate-400 text-[11px] whitespace-nowrap">
                        {formatDate(del.createdAt, 'short')}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Detail Link */}
                          <Link
                            to={`/dashboard/deliveries/${del.id}`}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                            title="View Full Delivery"
                          >
                            <Eye size={13} />
                          </Link>

                          {/* Quick Assign Courier Provider */}
                          {!isFinal && (
                            <button
                              type="button"
                              onClick={() => { setSelectedDelivery(del); setActiveModal('COURIER'); }}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                              title="Assign Courier & Package"
                            >
                              <Truck size={13} className="text-sky-600" />
                            </button>
                          )}

                          {/* Quick Assign Driver */}
                          {!isFinal && (
                            <button
                              type="button"
                              onClick={() => { setSelectedDelivery(del); setActiveModal('DRIVER'); }}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                              title="Assign Driver"
                            >
                              <Car size={13} className="text-indigo-600" />
                            </button>
                          )}

                          {/* Update Status Modal */}
                          {!isFinal && (
                            <button
                              type="button"
                              onClick={() => { setSelectedDelivery(del); setActiveModal('STATUS'); }}
                              className="p-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition"
                              title="Update Status"
                            >
                              <Edit3 size={13} />
                            </button>
                          )}

                          {/* Sync Courier Tracking */}
                          {del.trackingNumber && !isFinal && (
                            <button
                              type="button"
                              onClick={() => handleSyncTracking(del.id)}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                              title="Sync Courier Tracking"
                            >
                              <RotateCw size={13} className="text-emerald-600" />
                            </button>
                          )}

                          {/* Cancel Shipment */}
                          {!isFinal && (
                            <button
                              type="button"
                              onClick={() => { setSelectedDelivery(del); setActiveModal('CANCEL'); }}
                              className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 text-rose-600 hover:bg-rose-100 transition"
                              title="Cancel Shipment"
                            >
                              <XCircle size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            {isKhmer
              ? `បង្ហាញ ${deliveries.length} នៃ ${totalElements} ការដឹកជញ្ជូន`
              : `Showing ${deliveries.length} of ${totalElements} deliveries`}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-2 font-bold text-slate-700 dark:text-slate-200">
              {page + 1} / {Math.max(1, totalPages)}
            </span>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Modals Container */}
      <UpdateDeliveryStatusModal
        isOpen={activeModal === 'STATUS'}
        onClose={() => setActiveModal(null)}
        delivery={selectedDelivery}
        onSuccess={() => { fetchDeliveries(true); fetchSummary(); }}
      />

      <AssignCourierModal
        isOpen={activeModal === 'COURIER'}
        onClose={() => setActiveModal(null)}
        delivery={selectedDelivery}
        onSuccess={() => { fetchDeliveries(true); fetchSummary(); }}
      />

      <AssignDriverModal
        isOpen={activeModal === 'DRIVER'}
        onClose={() => setActiveModal(null)}
        delivery={selectedDelivery}
        onSuccess={() => { fetchDeliveries(true); fetchSummary(); }}
      />

      <CancelDeliveryModal
        isOpen={activeModal === 'CANCEL'}
        onClose={() => setActiveModal(null)}
        delivery={selectedDelivery}
        onSuccess={() => { fetchDeliveries(true); fetchSummary(); }}
      />
    </div>
  );
}
