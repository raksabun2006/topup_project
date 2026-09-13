import { useState, useEffect, useCallback } from 'react';
import {
  MapPin, Plus, Search, Edit2, Trash2, CheckCircle2,
  XCircle, Loader2, RefreshCw, AlertCircle, DollarSign,
  Clock, ShieldCheck
} from 'lucide-react';
import { deliveryZoneApi } from '../../api/deliveryZoneApi';
import { getErrorMessage } from '../../api/client';
import { formatCurrency } from '../../utils/format';
import { useLanguage } from '../../context/LanguageContext';
import SEO from '../../components/SEO';

export default function DeliveryZones() {
  const { isKhmer } = useLanguage();

  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Create / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    province: 'Phnom Penh',
    district: '',
    commune: '',
    baseFee: 1.50,
    additionalFee: 0.00,
    freeDeliveryThreshold: 50.00,
    estimatedDays: '1-2 days',
    enabled: true,
    active: true,
  });
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Delete modal state
  const [deletingZone, setDeletingZone] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const fetchZones = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await deliveryZoneApi.getAllZones({ page: 0, size: 100 });
      const list = Array.isArray(res) ? res : (res?.content || []);
      setZones(list);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  const handleOpenCreate = () => {
    setEditingZone(null);
    setFormData({
      name: '',
      province: 'Phnom Penh',
      district: '',
      commune: '',
      baseFee: 1.50,
      additionalFee: 0.00,
      freeDeliveryThreshold: 50.00,
      estimatedDays: '1-2 days',
      enabled: true,
      active: true,
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (zone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name || '',
      province: zone.province || 'Phnom Penh',
      district: zone.district || '',
      commune: zone.commune || '',
      baseFee: zone.baseFee ?? zone.fee ?? 1.50,
      additionalFee: zone.additionalFee ?? 0.00,
      freeDeliveryThreshold: zone.freeDeliveryThreshold ?? 50.00,
      estimatedDays: zone.estimatedDays || '1-2 days',
      enabled: zone.enabled ?? zone.active ?? true,
      active: zone.enabled ?? zone.active ?? true,
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!formData.province || formData.baseFee === undefined || modalSubmitting) return;

    setModalSubmitting(true);
    setModalError('');

    const payload = {
      name: formData.name.trim() || `${formData.province} Zone`,
      province: formData.province.trim(),
      district: formData.district.trim() || undefined,
      commune: formData.commune.trim() || undefined,
      baseFee: Number(formData.baseFee) || 0,
      additionalFee: Number(formData.additionalFee) || 0,
      freeDeliveryThreshold: formData.freeDeliveryThreshold ? Number(formData.freeDeliveryThreshold) : undefined,
      estimatedDays: formData.estimatedDays.trim() || '1-2 days',
      enabled: Boolean(formData.enabled),
      active: Boolean(formData.enabled),
      fee: Number(formData.baseFee) || 0,
    };

    try {
      if (editingZone) {
        await deliveryZoneApi.updateZone(editingZone.id, payload);
      } else {
        await deliveryZoneApi.createZone(payload);
      }
      setIsModalOpen(false);
      fetchZones();
    } catch (err) {
      setModalError(getErrorMessage(err));
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingZone || deleteSubmitting) return;
    setDeleteSubmitting(true);
    try {
      await deliveryZoneApi.deleteZone(deletingZone.id);
      setDeletingZone(null);
      fetchZones();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const filteredZones = zones.filter((z) => {
    const q = searchQuery.toLowerCase();
    return (
      (z.name && z.name.toLowerCase().includes(q)) ||
      (z.province && z.province.toLowerCase().includes(q)) ||
      (z.district && z.district.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <SEO title="Delivery Zones & Rates | Mart Admin" noindex={true} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <MapPin size={20} />
            </div>
            <span>{isKhmer ? 'តំបន់ និងតម្លៃដឹកជញ្ជូន (Delivery Zones)' : 'Delivery Zones & Pricing'}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {isKhmer
              ? 'កំណត់ថ្លៃដឹកជញ្ជូនតាមខេត្ត/ក្រុង និងរយៈពេលប៉ាន់ស្មាន'
              : 'Manage province/district rate cards, free shipping thresholds, and estimated days.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchZones}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-2xs"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>{isKhmer ? 'ផ្ទុកទិន្នន័យឡើងវិញ' : 'Refresh'}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 transition cursor-pointer shadow-xs"
          >
            <Plus size={14} />
            <span>{isKhmer ? 'បង្កើតតំបន់ថ្មី' : 'Add Delivery Zone'}</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isKhmer ? 'ស្វែងរកតាមឈ្មោះតំបន់ ខេត្ត ឬស្រុក...' : 'Search by zone name, province, or district...'}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Zones Table */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filteredZones.length === 0 ? (
          <div className="py-16 text-center">
            <MapPin size={36} className="mx-auto text-slate-400 mb-2 opacity-60" />
            <p className="text-xs font-bold text-slate-500">
              {isKhmer ? 'រកមិនឃើញតំបន់ដឹកជញ្ជូនទេ' : 'No delivery zones found.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3.5">Zone Name</th>
                  <th className="px-4 py-3.5">Province & District</th>
                  <th className="px-4 py-3.5">Base Rate</th>
                  <th className="px-4 py-3.5">Estimated Time</th>
                  <th className="px-4 py-3.5">Free Threshold</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredZones.map((zone) => (
                  <tr key={zone.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {zone.name || `${zone.province} Standard`}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                        <MapPin size={13} className="text-emerald-600 shrink-0" />
                        <span className="font-bold">{zone.province}</span>
                        {zone.district && (
                          <span className="text-slate-400">/ {zone.district}</span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="font-black text-slate-900 dark:text-white">
                        {formatCurrency(zone.baseFee ?? zone.fee ?? 0)}
                      </span>
                      {zone.additionalFee > 0 && (
                        <span className="text-[10px] text-slate-400 ml-1">
                          (+{formatCurrency(zone.additionalFee)})
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 font-semibold">
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-slate-400" />
                        <span>{zone.estimatedDays || '1-3 days'}</span>
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                      {zone.freeDeliveryThreshold ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          Over {formatCurrency(zone.freeDeliveryThreshold)}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          zone.enabled ?? zone.active ?? true
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {zone.enabled ?? zone.active ?? true ? 'Active' : 'Disabled'}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(zone)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                          title="Edit Zone"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingZone(zone)}
                          className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 text-rose-600 hover:bg-rose-100 transition"
                          title="Delete Zone"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                {editingZone ? 'Edit Delivery Zone' : 'Create Delivery Zone'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <XCircle size={18} />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="p-5 space-y-3.5">
              {modalError && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">
                  {modalError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Zone Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Phnom Penh Central Zone"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Province *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Phnom Penh"
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    District (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Daun Penh"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Base Delivery Fee ($) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    value={formData.baseFee}
                    onChange={(e) => setFormData({ ...formData, baseFee: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Estimated Time
                  </label>
                  <input
                    type="text"
                    placeholder="1-2 days"
                    value={formData.estimatedDays}
                    onChange={(e) => setFormData({ ...formData, estimatedDays: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Free Shipping Threshold ($)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  placeholder="e.g. 50"
                  value={formData.freeDeliveryThreshold}
                  onChange={(e) => setFormData({ ...formData, freeDeliveryThreshold: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Active Delivery Zone</span>
              </label>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition shadow-xs flex items-center gap-2"
                >
                  {modalSubmitting && <Loader2 size={13} className="animate-spin" />}
                  <span>{editingZone ? 'Save Changes' : 'Create Zone'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingZone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl animate-scale-up space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle size={24} />
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Delete Delivery Zone?</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to remove the zone for{' '}
              <strong className="text-slate-800 dark:text-slate-200">{deletingZone.province}</strong>?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingZone(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-black text-white bg-rose-600 hover:bg-rose-700 transition"
              >
                {deleteSubmitting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
