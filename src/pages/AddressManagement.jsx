import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Plus, ArrowLeft, Trash2, CheckCircle2, User, Phone,
  Building, AlertCircle, Loader2, Home, Sparkles
} from 'lucide-react';
import { orderApi } from '../api/orderApi';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/client';
import SEO from '../components/SEO';

export default function AddressManagement() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [receiverName, setReceiverName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('');
  const [province, setProvince] = useState('Phnom Penh');
  const [note, setNote] = useState('');

  const loadAddresses = async () => {
    setLoading(true);
    setError('');
    try {
      if (isAuthenticated) {
        const list = await orderApi.getAddresses();
        if (Array.isArray(list)) {
          setAddresses(list);
        }
      } else {
        // Load demo/local addresses for guest preview
        const local = JSON.parse(localStorage.getItem('mart_saved_addresses') || '[]');
        setAddresses(local);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, [isAuthenticated]);

  const handleOpenAdd = () => {
    setReceiverName(user?.displayName || user?.name || '');
    setPhoneNumber(user?.phoneNumber || '');
    setAddress('');
    setDistrict('');
    setProvince('Phnom Penh');
    setNote('');
    setError('');
    setShowModal(true);
  };

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    if (!receiverName.trim() || !phoneNumber.trim() || !address.trim()) {
      setError('សូមបំពេញព័ត៌មានចាំបាច់ទាំងអស់ (Please fill required fields).');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      if (isAuthenticated) {
        const created = await orderApi.createAddress({
          receiverName: receiverName.trim(),
          phoneNumber: phoneNumber.trim(),
          address: address.trim(),
          district: district.trim(),
          province: province.trim(),
          note: note.trim(),
        });
        setAddresses((prev) => [created, ...prev]);
      } else {
        const newAddr = {
          id: 'addr_' + Date.now(),
          receiverName: receiverName.trim(),
          phoneNumber: phoneNumber.trim(),
          address: address.trim(),
          district: district.trim(),
          province: province.trim(),
          note: note.trim(),
          defaultAddress: addresses.length === 0,
        };
        const updated = [newAddr, ...addresses];
        setAddresses(updated);
        localStorage.setItem('mart_saved_addresses', JSON.stringify(updated));
      }

      setSuccessMsg('បានរក្សាទុកអាសយដ្ឋានដោយជោគជ័យ! (Address saved successfully)');
      setTimeout(() => setSuccessMsg(''), 3000);
      setShowModal(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAddress = (id) => {
    // TODO (Backend API Required): Backend currently only exposes POST /api/v1/customer/addresses and GET /api/v1/customer/addresses.
    // Deleting is handled on client-side state / localStorage until DELETE /api/v1/customer/addresses/{id} is provided by Spring Boot.
    const filtered = addresses.filter((a) => a.id !== id);
    setAddresses(filtered);
    localStorage.setItem('mart_saved_addresses', JSON.stringify(filtered));
  };

  const handleSetDefault = (id) => {
    // Client-side default toggler
    const updated = addresses.map((a) => ({
      ...a,
      defaultAddress: a.id === id,
    }));
    setAddresses(updated);
    localStorage.setItem('mart_saved_addresses', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-20 font-sans">
      <SEO
        title="Delivery Addresses | Mart System"
        description="Manage your saved shipping and delivery addresses."
        canonical="/account/addresses"
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        {/* Navigation & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/account')}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                អាសយដ្ឋានដឹកជញ្ជូន (Delivery Addresses)
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage your saved home, work, and pickup locations
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-xs font-black text-white shadow-xs shadow-emerald-600/20 transition active:scale-95 cursor-pointer"
          >
            <Plus size={15} />
            <span>+ បន្ថែមអាសយដ្ឋានថ្មី (Add Address)</span>
          </button>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 p-3.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Address Cards List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          </div>
        ) : addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl bg-[#F7F7F8] dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
            <MapPin size={40} className="text-slate-300" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              មិនទាន់មានអាសយដ្ឋាននៅឡើយទេ
            </h3>
            <p className="text-xs text-slate-400 max-w-xs">
              បន្ថែមអាសយដ្ឋានដឹកជញ្ជូនរបស់អ្នកដើម្បីងាយស្រួលក្នុងការបញ្ជាទិញទំនិញរហ័ស។
            </p>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#18181B] dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 text-xs font-black hover:opacity-90 shadow-xs cursor-pointer"
            >
              <Plus size={14} />
              <span>បន្ថែមអាសយដ្ឋានដំបូង</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => {
              const isDefault = Boolean(addr.defaultAddress);
              return (
                <div
                  key={addr.id}
                  className={`rounded-3xl p-5 border transition-all space-y-3 ${
                    isDefault
                      ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 ring-1 ring-emerald-600'
                      : 'border-slate-200/60 dark:border-slate-800 bg-[#F7F7F8] dark:bg-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {addr.receiverName}
                      </span>
                      {isDefault && (
                        <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-0.5 text-[10px] font-black text-emerald-700 dark:text-emerald-300">
                          Default
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-slate-400 hover:text-rose-600 transition p-1 cursor-pointer"
                      title="Delete address"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                    <p className="flex items-center gap-1.5 font-medium">
                      <Phone size={13} className="text-slate-400 shrink-0" />
                      <span>{addr.phoneNumber}</span>
                    </p>
                    <p className="flex items-start gap-1.5 leading-relaxed pt-0.5">
                      <MapPin size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        {addr.address}
                        {addr.district ? `, ${addr.district}` : ''}
                        {addr.province ? `, ${addr.province}` : ''}
                      </span>
                    </p>
                    {addr.note && (
                      <p className="text-[11px] text-slate-400 italic pl-5">
                        ចំណាំ៖ {addr.note}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                    {!isDefault ? (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(addr.id)}
                        className="text-xs font-bold text-slate-500 hover:text-emerald-600 transition cursor-pointer"
                      >
                        កំណត់ជាលំនាំដើម (Set as Default)
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 size={13} />
                        <span>អាសយដ្ឋានលំនាំដើម</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Address Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                បន្ថែមអាសយដ្ឋានដឹកជញ្ជូនថ្មី (New Address)
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                បិទ
              </button>
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateAddress} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-bold text-slate-700 dark:text-slate-300">
                    ឈ្មោះអ្នកទទួល (Full Name) *
                  </label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      required
                      type="text"
                      placeholder="e.g. Bun Raksa"
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2.5 pl-9 pr-3 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block font-bold text-slate-700 dark:text-slate-300">
                    លេខទូរស័ព្ទ (Phone Number) *
                  </label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      required
                      type="tel"
                      placeholder="096 XXX XXXX"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2.5 pl-9 pr-3 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1 block font-bold text-slate-700 dark:text-slate-300">
                  អាសយដ្ឋានលម្អិត (Street / House / Sangkat) *
                </label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-3 text-slate-400" />
                  <textarea
                    required
                    rows={2}
                    placeholder="ផ្ទះលេខ ផ្លូវ សង្កាត់..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 pl-9 pr-3 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-bold text-slate-700 dark:text-slate-300">
                    ខណ្ឌ / ស្រុក (District / Khan)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chamkarmon / Tuol Kouk"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2.5 px-3 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-bold text-slate-700 dark:text-slate-300">
                    រាជធានី / ខេត្ត (City / Province)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Phnom Penh"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2.5 px-3 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-bold text-slate-700 dark:text-slate-300">
                  ចំណាំបន្ថែម (Optional Delivery Note)
                </label>
                <input
                  type="text"
                  placeholder="ឧ. ផ្ទះរបងពណ៌ស ឬទូរស័ព្ទមុនមកដល់..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2.5 px-3 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-full px-5 py-2.5 font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-500 px-6 py-2.5 font-black text-white shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {submitting && <Loader2 size={13} className="animate-spin" />}
                  <span>រក្សាទុកអាសយដ្ឋាន</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
