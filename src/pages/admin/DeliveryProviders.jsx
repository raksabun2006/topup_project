import { useState, useEffect, useCallback } from 'react';
import {
  Truck, Search, Plus, CheckCircle2, XCircle, Globe,
  Phone, Scale, Box, DollarSign, Edit2, Loader2,
  RefreshCw, AlertCircle, ShieldCheck
} from 'lucide-react';
import { deliveryProviderApi } from '../../api/deliveryProviderApi';
import { getErrorMessage } from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';
import SEO from '../../components/SEO';

export default function DeliveryProviders() {
  const { isKhmer } = useLanguage();

  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'ENABLED' | 'DISABLED' | 'TRACKING'
  const [togglingId, setTogglingId] = useState(null);

  // Edit / Create Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    logoUrl: '',
    phone: '',
    website: '',
    enabled: true,
    supportsTracking: true,
  });
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const list = await deliveryProviderApi.getAllProviders();
      setProviders(list);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const handleToggleStatus = async (provider) => {
    setTogglingId(provider.id);
    try {
      const updated = await deliveryProviderApi.toggleProviderStatus(provider.id, !provider.enabled);
      setProviders((prev) =>
        prev.map((p) => (p.id === provider.id ? { ...p, enabled: updated?.enabled ?? !provider.enabled } : p))
      );
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setTogglingId(null);
    }
  };

  const handleOpenEdit = (provider) => {
    setEditingProvider(provider);
    setFormData({
      code: provider.code || '',
      name: provider.name || '',
      description: provider.description || '',
      logoUrl: provider.logoUrl || '',
      phone: provider.phone || '',
      website: provider.website || '',
      enabled: provider.enabled ?? true,
      supportsTracking: provider.supportsTracking ?? true,
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingProvider(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      logoUrl: '',
      phone: '',
      website: '',
      enabled: true,
      supportsTracking: true,
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.name || modalSubmitting) return;

    setModalSubmitting(true);
    setModalError('');

    try {
      if (editingProvider) {
        await deliveryProviderApi.updateProvider(editingProvider.id, formData);
      } else {
        await deliveryProviderApi.createProvider(formData);
      }
      setIsModalOpen(false);
      fetchProviders();
    } catch (err) {
      setModalError(getErrorMessage(err));
    } finally {
      setModalSubmitting(false);
    }
  };

  // Filtered providers
  const filteredProviders = providers.filter((p) => {
    const matchesSearch =
      (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.code && p.code.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterType === 'ENABLED') return p.enabled === true;
    if (filterType === 'DISABLED') return p.enabled === false;
    if (filterType === 'TRACKING') return p.supportsTracking === true;

    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <SEO title="Courier Delivery Providers | Mart Admin" noindex={true} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
              <Truck size={20} />
            </div>
            <span>{isKhmer ? 'ក្រុមហ៊ុនដឹកជញ្ជូន (Courier Providers)' : 'Delivery Providers'}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {isKhmer
              ? 'គ្រប់គ្រងក្រុមហ៊ុនដឹកជញ្ជូន J&T, VET, Cambodia Post, ZTO និងសេវាដឹកផ្ទាល់ខ្លួន'
              : 'Configure integrated couriers: J&T Express, VET Logistics, Cambodia Post, ZTO & In-House delivery.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchProviders}
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
            <span>{isKhmer ? 'បន្ថែមក្រុមហ៊ុនដឹក' : 'Add Courier'}</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-0">
          <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isKhmer ? 'ស្វែងរកតាមឈ្មោះ ឬកូដ...' : 'Search provider by name or code...'}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'ENABLED', 'DISABLED', 'TRACKING'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilterType(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                filterType === f
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800/60'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {f === 'ALL' && (isKhmer ? 'ទាំងអស់' : 'All')}
              {f === 'ENABLED' && (isKhmer ? 'សកម្ម' : 'Enabled')}
              {f === 'DISABLED' && (isKhmer ? 'អសកម្ម' : 'Disabled')}
              {f === 'TRACKING' && (isKhmer ? 'គាំទ្រ Tracking' : 'Tracking Supported')}
            </button>
          ))}
        </div>
      </div>

      {/* Providers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
          ))}
        </div>
      ) : filteredProviders.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <Truck size={36} className="mx-auto text-slate-400 mb-2 opacity-60" />
          <p className="text-xs font-bold text-slate-500">
            {isKhmer ? 'រកមិនឃើញក្រុមហ៊ុនដឹកជញ្ជូនទេ' : 'No delivery providers found.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProviders.map((provider) => {
            const isToggling = togglingId === provider.id;

            return (
              <div
                key={provider.id || provider.code}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Code & Active Toggle */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                      {provider.code}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(provider)}
                      disabled={isToggling}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black border transition cursor-pointer ${
                        provider.enabled
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {isToggling ? (
                        <Loader2 size={11} className="animate-spin" />
                      ) : provider.enabled ? (
                        <CheckCircle2 size={11} />
                      ) : (
                        <XCircle size={11} />
                      )}
                      <span>{provider.enabled ? 'Active' : 'Disabled'}</span>
                    </button>
                  </div>

                  {/* Provider Name & Logo */}
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center font-black text-slate-700 dark:text-slate-200 shrink-0">
                      {provider.logoUrl ? (
                        <img
                          src={provider.logoUrl}
                          alt={provider.name}
                          className="h-10 w-10 object-contain rounded-lg"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <Truck size={22} className="text-slate-500" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
                        {provider.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                        {provider.description || 'Integrated logistics courier service.'}
                      </p>
                    </div>
                  </div>

                  {/* Capabilities Badges */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5">
                    {/* Tracking Supported */}
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        provider.supportsTracking
                          ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border-sky-200/60 dark:border-sky-800/40'
                          : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <ShieldCheck size={10} />
                      <span>{provider.supportsTracking ? 'Tracking Supported' : 'Manual Tracking'}</span>
                    </span>

                    {/* Weight Pricing */}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40">
                      <Scale size={10} />
                      <span>Weight Pricing</span>
                    </span>

                    {/* Dimension Pricing */}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40">
                      <Box size={10} />
                      <span>Dimension Pricing</span>
                    </span>

                    {/* COD Supported */}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                      <DollarSign size={10} />
                      <span>COD Ready</span>
                    </span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    {provider.phone && (
                      <span className="flex items-center gap-1 text-[11px]">
                        <Phone size={11} />
                        {provider.phone}
                      </span>
                    )}
                    {provider.website && (
                      <a
                        href={provider.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-emerald-600 transition"
                      >
                        <Globe size={12} />
                      </a>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(provider)}
                    className="flex items-center gap-1 font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer"
                  >
                    <Edit2 size={12} />
                    <span>Configure</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit / Create Provider Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                {editingProvider ? 'Configure Provider' : 'Add Courier Provider'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition"
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Provider Code *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingProvider}
                    placeholder="e.g. JNT"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono uppercase border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. J&T Express"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Provider description and capabilities"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    placeholder="023 999 888"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://jtexpress.com.kh"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.supportsTracking}
                    onChange={(e) => setFormData({ ...formData, supportsTracking: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Supports Real-Time Courier Tracking</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Enabled for Customer Checkout & Fulfillment</span>
                </label>
              </div>

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
                  <span>{editingProvider ? 'Save Configuration' : 'Create Provider'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
