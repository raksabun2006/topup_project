import { useState, useEffect } from 'react';
import { User, Loader2, Check, AlertCircle, ImageOff } from 'lucide-react';
import { usersApi } from '../api/userApi';
import { getErrorMessage } from '../api/client';
import { formatDate } from '../utils/format';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    email: '', displayName: '', phoneNumber: '', avatarUrl: '',
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
      setProfile(await usersApi.updateMe(form));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
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
    'w-full rounded-xl border border-slate-300 bg-ink-950 px-3.5 py-2.5 text-slate-900 shadow-sm ' +
    'transition placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500';

  return (
    <div className="mx-auto max-w-2xl px-3 sm:px-6 py-6 sm:py-10">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-slate-900">ព័ត៌មានផ្ទាល់ខ្លួន</h1>
        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-500">គ្រប់គ្រងព័ត៌មានគណនីរបស់អ្នក</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-ink-900 p-5 sm:p-8 shadow-sm">

        {error && (
          <div className="mb-5 sm:mb-6 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-xs sm:text-sm text-rose-700">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {saved && (
          <div className="mb-5 sm:mb-6 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs sm:text-sm text-emerald-700">
            <Check size={16} />
            រក្សាទុករួចរាល់
          </div>
        )}

        {/* ---------- រូបភាព ---------- */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 border-b border-slate-200 pb-6 sm:pb-8 text-center sm:text-left">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink-950 border border-slate-200 shadow-2xs">
            {form.avatarUrl && !imageBroken ? (
              <img
                src={form.avatarUrl}
                alt=""
                className="h-full w-full object-cover"
                onError={() => setImageBroken(true)}
              />
            ) : imageBroken ? (
              <ImageOff size={28} className="text-slate-500" />
            ) : (
              <User size={28} className="text-slate-500" />
            )}
          </div>

          <div className="min-w-0 w-full flex-1">
            <label className="mb-1 block text-xs sm:text-sm font-medium text-slate-600 text-left">
              តំណភ្ជាប់រូបភាព
            </label>
            <input
              type="url"
              value={form.avatarUrl}
              onChange={set('avatarUrl')}
              placeholder="https://example.com/avatar.png"
              className={inputClass}
            />
            <p className="mt-1.5 text-[11px] sm:text-xs text-slate-500 text-left">
              ត្រូវជា https។ រូបភាពរក្សាទុកនៅ server ដើម - បើវាដួល
              រូបភាពនឹងបាត់។
            </p>
            {imageBroken && (
              <p className="mt-1 text-xs text-amber-700 text-left">
                មិនអាចផ្ទុករូបភាពពីតំណភ្ជាប់នេះទេ
              </p>
            )}
          </div>
        </div>

        {/* ---------- មិនអាចកែ ---------- */}
        <div className="mb-6 rounded-xl bg-ink-950 p-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">ឈ្មោះអ្នកប្រើ</span>
            <span className="font-medium text-slate-900">{profile?.username}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-slate-500">តួនាទី</span>
            <span className="font-medium text-slate-900">{profile?.role}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-slate-500">ចូលរួមនៅ</span>
            <span className="font-medium text-slate-900">{formatDate(profile?.createdAt)}</span>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            ឈ្មោះអ្នកប្រើនិងតួនាទីគ្រប់គ្រងដោយប្រព័ន្ធអត្តសញ្ញាណ
          </p>
        </div>

        {/* ---------- វាលដែលកែបាន ---------- */}
        <div className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              ឈ្មោះបង្ហាញ
            </label>
            <input
              type="text"
              value={form.displayName}
              onChange={set('displayName')}
              placeholder="Bun Raksa"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">អ៊ីមែល</label>
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              className={inputClass}
            />
            <p className="mt-1.5 text-xs text-slate-500">
              ការប្តូរនៅទីនេះមិនប៉ះពាល់ដល់ការ login ទេ
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              លេខទូរស័ព្ទ
            </label>
            <input
              type="tel"
              value={form.phoneNumber}
              onChange={set('phoneNumber')}
              placeholder="85512345678"
              className={inputClass}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-8 flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:from-emerald-500 hover:to-emerald-500 disabled:opacity-60"
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          {saving ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក'}
        </button>
      </form>
    </div>
  );
}
