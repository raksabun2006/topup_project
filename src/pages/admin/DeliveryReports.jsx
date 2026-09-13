import { useState, useEffect, useCallback } from 'react';
import {
  BarChart2, Truck, CheckCircle2, AlertTriangle, RotateCcw,
  XCircle, TrendingUp, DollarSign, Clock, RefreshCw, ShieldCheck,
  Percent, ArrowUpRight
} from 'lucide-react';
import { deliveryReportApi } from '../../api/deliveryReportApi';
import { getErrorMessage } from '../../api/client';
import { formatCurrency } from '../../utils/format';
import { useLanguage } from '../../context/LanguageContext';
import SEO from '../../components/SEO';

export default function DeliveryReports() {
  const { isKhmer } = useLanguage();

  const [summary, setSummary] = useState(null);
  const [providersPerformance, setProvidersPerformance] = useState([]);
  const [statusBreakdown, setStatusBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [sumData, provData, statusData] = await Promise.all([
        deliveryReportApi.getDeliverySummary(),
        deliveryReportApi.getProviderPerformance(),
        deliveryReportApi.getDeliveryStatusBreakdown(),
      ]);

      setSummary(sumData);
      setProvidersPerformance(provData);
      setStatusBreakdown(statusData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const totalDeliveries = summary?.totalDeliveries || 0;
  const successRate = summary?.successRatePercentage !== undefined
    ? summary.successRatePercentage.toFixed(1)
    : (totalDeliveries > 0 ? (((summary?.deliveredCount || 0) / totalDeliveries) * 100).toFixed(1) : '100.0');

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <SEO title="Delivery Reports & Courier Performance | Mart Admin" noindex={true} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <BarChart2 size={20} />
            </div>
            <span>{isKhmer ? 'របាយការណ៍ដឹកជញ្ជូន (Delivery Analytics)' : 'Delivery Analytics & Reports'}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {isKhmer
              ? 'វិភាគប្រសិទ្ធភាពការដឹកជញ្ជូន តាមដានអត្រាជោគជ័យ និងការប្រៀបធៀបក្រុមហ៊ុនដឹក'
              : 'Delivery performance metrics, courier comparison, and fulfillment success rates.'}
          </p>
        </div>

        <button
          type="button"
          onClick={fetchReports}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-2xs"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>{isKhmer ? 'ផ្ទុកទិន្នន័យឡើងវិញ' : 'Refresh Data'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 text-rose-700 text-xs">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Total Deliveries</span>
            <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600">
              <Truck size={16} />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-2 block">
            {totalDeliveries}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">Recorded shipments</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-500">Delivered Successfully</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2 block">
            {summary?.deliveredCount || 0}
          </span>
          <span className="text-[10px] text-emerald-600/80 font-bold">{successRate}% Success Rate</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-500">Failed / Returned</span>
            <div className="h-8 w-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-600">
              <AlertTriangle size={16} />
            </div>
          </div>
          <span className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2 block">
            {(summary?.failedCount || 0) + (summary?.returnedCount || 0)}
          </span>
          <span className="text-[10px] text-rose-500 font-medium">Failed or Returned parcels</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-500">Total Delivery Revenue</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600">
              <DollarSign size={16} />
            </div>
          </div>
          <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-2 block">
            {formatCurrency(summary?.totalDeliveryFees || 0)}
          </span>
          <span className="text-[10px] text-indigo-500 font-medium">Delivery fee collected</span>
        </div>
      </div>

      {/* Courier Performance Comparison */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white">
            {isKhmer ? 'ប្រសិទ្ធភាពតាមក្រុមហ៊ុនដឹកជញ្ជូន' : 'Courier Provider Performance Breakdown'}
          </h3>
          <p className="text-xs text-slate-400">
            {isKhmer
              ? 'ការប្រៀបធៀបបរិមាណកញ្ចប់ទំនិញ អត្រាជោគជ័យ និងថ្លៃដឹកសរុប'
              : 'Shipment volume, fulfillment success rates, and revenue by carrier.'}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Courier Provider</th>
                <th className="px-4 py-3 text-center">Total Shipments</th>
                <th className="px-4 py-3 text-center">Delivered</th>
                <th className="px-4 py-3 text-center">Failed</th>
                <th className="px-4 py-3 text-center">In Transit</th>
                <th className="px-4 py-3 text-center">Success Rate</th>
                <th className="px-4 py-3 text-right">Fees Collected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {providersPerformance.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No courier performance logs recorded yet.
                  </td>
                </tr>
              ) : (
                providersPerformance.map((prov) => {
                  const rate = prov.successRatePercentage ?? (
                    prov.totalShipments > 0
                      ? ((prov.deliveredCount / prov.totalShipments) * 100).toFixed(1)
                      : 100
                  );

                  return (
                    <tr key={prov.providerCode} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          <span>{prov.providerName || prov.providerCode}</span>
                          <span className="text-[10px] font-mono text-slate-400">({prov.providerCode})</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-center font-bold text-slate-800 dark:text-slate-200">
                        {prov.totalShipments || 0}
                      </td>

                      <td className="px-4 py-3.5 text-center font-bold text-emerald-600 dark:text-emerald-400">
                        {prov.deliveredCount || 0}
                      </td>

                      <td className="px-4 py-3.5 text-center font-bold text-rose-600 dark:text-rose-400">
                        {prov.failedCount || 0}
                      </td>

                      <td className="px-4 py-3.5 text-center font-bold text-sky-600 dark:text-sky-400">
                        {prov.inTransitCount || 0}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                          {rate}%
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right font-black text-slate-900 dark:text-white">
                        {formatCurrency(prov.totalFeesCollected || 0)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Breakdown Progress Bars */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white">
            {isKhmer ? 'ការបែងចែកស្ថានភាពដឹកជញ្ជូន' : 'Delivery Status Distribution'}
          </h3>
          <p className="text-xs text-slate-400">
            {isKhmer
              ? 'សមាមាត្រកញ្ចប់ទំនិញតាមដំណាក់កាលនីមួយៗ'
              : 'Proportion of deliveries currently at each state machine step.'}
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {(statusBreakdown.length > 0
            ? statusBreakdown
            : [
                { status: 'DELIVERED', count: summary?.deliveredCount || 0 },
                { status: 'IN_TRANSIT', count: summary?.inTransitDeliveries || 0 },
                { status: 'OUT_FOR_DELIVERY', count: summary?.outForDeliveryDeliveries || 0 },
                { status: 'ASSIGNED', count: summary?.assignedDeliveries || 0 },
                { status: 'FAILED', count: summary?.failedCount || 0 },
                { status: 'CANCELLED', count: summary?.cancelledCount || 0 },
              ]
          ).map((item) => {
            const count = item.count || 0;
            const pct = totalDeliveries > 0 ? Math.round((count / totalDeliveries) * 100) : 0;

            return (
              <div key={item.status} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-200">{item.status}</span>
                  <span className="text-slate-400">
                    {count} ({pct}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.status === 'DELIVERED'
                        ? 'bg-emerald-500'
                        : item.status.includes('FAIL')
                        ? 'bg-rose-500'
                        : item.status.includes('CANCEL')
                        ? 'bg-zinc-400'
                        : 'bg-sky-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(2, pct))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
