import { useState, useEffect } from 'react';
import { User, Loader2, Check, AlertCircle, ImageOff, Camera, Mail, Phone, ShieldCheck, CheckCircle2, X } from 'lucide-react';
import { usersApi } from '../api/userApi';
import { getErrorMessage } from '../api/client';
import { formatDate } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import UserAvatar from '../components/ui/UserAvatar';
import SEO from '../components/SEO';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=250&q=80',
];

export default function Profile() {
  const { refreshProfile, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    email: '',
    displayName: '',
    phoneNumber: '',
    avatarUrl: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [imageBroken, setImageBroken] = useState(false);

  useEffect(() => {
    usersApi.me()
      .then((data) => {
        setProfile(data);
        setForm({
          email: data.email ?? '',
          displayName: data.displayName ?? '',
          phoneNumber: data.phoneNumber ?? '',
          avatarUrl: data.avatarUrl ?? '',
        });
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const set = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setSaved(false);
    if (key === 'avatarUrl') setImageBroken(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const updated = await usersApi.updateMe(form);
      setProfile(updated);
      await refreshProfile?.();
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-emerald-600" />
      </div>
    );
  }

  const inputClass =
    'w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white shadow-2xs ' +
    'transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-900 dark:focus:border-white focus:outline-none';

  return (
    <div className="mx-auto max-w-2xl px-3 sm:px-6 py-6 sm:py-10 space-y-6 font-sans">
      <SEO
        title="ព័ត៌មានផ្ទាល់ខ្លួន (Profile) | Mart System"
        robots="noindex, nofollow"
      />
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          ព័ត៌មានផ្ទាល់ខ្លួន (My Profile)
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
          គ្រប់គ្រងរូបភាព ព័ត៌មានទំនាក់ទំនង និងសុវត្ថិភាពគណនីរបស់អ្នក
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-xs space-y-6">

        {error && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 dark:bg-rose-950/30 p-3.5 text-xs font-bold text-rose-700 dark:text-rose-400 animate-fade-in">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <div className="flex-1">{error}</div>
            <button type="button" onClick={() => setError('')} className="cursor-pointer">
              <X size={14} />
            </button>
          </div>
        )}

        {saved && (
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 p-3.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 animate-fade-in">
            <CheckCircle2 size={16} />
            <span>បានរក្សាទុកដោយជោគជ័យ! (Profile updated successfully)</span>
          </div>
        )}

        {/* 1. Avatar Photo Stage */}
        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/80 p-4 sm:p-5 bg-slate-50/50 dark:bg-slate-850/40 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative shrink-0 flex items-center justify-center">
              <UserAvatar
                user={{ ...user, avatarUrl: form.avatarUrl || user?.avatarUrl }}
                className="h-16 w-16 sm:h-20 sm:w-20 text-2xl ring-4 ring-white dark:ring-slate-800 shadow-md"
              />
            </div>

            <div className="min-w-0 w-full flex-1 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block text-left">
                តំណភ្ជាប់រូបភាព (Profile Image URL)
              </label>
              <div className="relative flex items-center">
                <input
                  type="url"
                  value={form.avatarUrl}
                  onChange={set('avatarUrl')}
                  placeholder="https://example.com/avatar.png"
                  className={inputClass}
                />
                {form.avatarUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, avatarUrl: '' }));
                      setImageBroken(false);
                    }}
                    className="absolute right-3 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                បញ្ចូលតំណភ្ជាប់រូបភាពពី Unsplash, Imgur, ឬវេបសាយផ្សេងៗ
              </p>
            </div>
          </div>

          {/* Quick Preset Avatars */}
          <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              ជ្រើសរើសរូបតំណាងគំរូ (Quick Presets)
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {AVATAR_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setForm((prev) => ({ ...prev, avatarUrl: preset }));
                    setImageBroken(false);
                  }}
                  className={`h-9 w-9 rounded-full overflow-hidden border-2 transition active:scale-95 cursor-pointer ${
                    form.avatarUrl === preset ? 'border-emerald-500 ring-2 ring-emerald-500/30 scale-105' : 'border-transparent hover:border-slate-300'
                  }`}
                >
                  <img src={preset} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Editable Fields */}
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
              ឈ្មោះបង្ហាញ (Display Name)
            </label>
            <input
              type="text"
              value={form.displayName}
              onChange={set('displayName')}
              placeholder="Bun Raksa"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                អ៊ីមែល (Email Address)
              </label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="name@example.com"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                លេខទូរស័ព្ទ (Phone Number)
              </label>
              <input
                type="tel"
                value={form.phoneNumber}
                onChange={set('phoneNumber')}
                placeholder="096 XXX XXXX"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* 3. Readonly Info Card */}
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">ឈ្មោះគណនី (Username):</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">@{profile?.username}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">តួនាទី (Role):</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase">{profile?.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">កាលបរិច្ឆេទចូលរួម (Joined):</span>
            <span className="font-medium text-slate-600 dark:text-slate-300">{formatDate(profile?.createdAt)}</span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-full bg-[#18181B] dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 text-xs font-black shadow-md hover:opacity-90 transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>កំពុងរក្សាទុក...</span>
              </>
            ) : (
              <>
                <Check size={15} />
                <span>រក្សាទុកព័ត៌មាន (Save Changes)</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
