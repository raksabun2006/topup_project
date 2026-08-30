import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle, Store } from 'lucide-react';
import { authApi } from '../api/authApi';
import { getErrorMessage } from '../api/client';

const EMPTY_FORM = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  displayName: '',
  phoneNumber: '',
};

function validate(form) {
  const usernameTrimmed = form.username.trim();
  if (!usernameTrimmed) return 'សូមបញ្ចូលឈ្មោះអ្នកប្រើ';
  if (usernameTrimmed.length < 3) return 'ឈ្មោះអ្នកប្រើត្រូវមានយ៉ាងតិច ៣ តួអក្សរ';
  if (/\s/.test(usernameTrimmed)) return 'ឈ្មោះអ្នកប្រើប្រាស់មិនត្រូវមានដកឃ្លាឡើយ';
  if (!form.email.trim()) return 'សូមបញ្ចូលអ៊ីមែល';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return 'អ៊ីមែលមិនត្រឹមត្រូវទេ';
  if (!form.password || form.password.length < 6) return 'ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច ៦ តួអក្សរ';
  if (form.password !== form.confirmPassword) return 'ពាក្យសម្ងាត់មិនត្រូវគ្នាទេ';
  return '';
}

export default function Register() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const validationError = validate(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        username: form.username.trim(),
        displayName: form.displayName.trim() || undefined,
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim() || undefined,
        password: form.password,
      };

      await authApi.register(payload);
      setDone(true);
    } catch (err) {
      const status = err.status || err.response?.status;
      if (status === 409) {
        setError('ឈ្មោះអ្នកប្រើ ឬអ៊ីមែលនេះមានរួចហើយ (Username or email already exists.)');
      } else if (status === 500) {
        setError('មានបញ្ហាកើតឡើង។ សូមព្យាយាមម្តងទៀត។ (Something went wrong. Please try again later.)');
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-slate-300 bg-ink-950 px-3.5 py-2.5 text-slate-900 shadow-sm ' +
    'transition placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50';

  if (done) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink-950 px-4 text-center text-slate-600">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle size={32} className="text-emerald-700" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">ចុះឈ្មោះជោគជ័យ</h1>
        <p className="max-w-sm text-sm text-slate-600 font-medium">
          Registration successful. Please login.
        </p>
        <p className="max-w-sm text-xs text-slate-500">
          គណនីរបស់អ្នកបានបង្កើតរួចរាល់។ សូមចូលគណនីដើម្បីបន្ត។
        </p>
        <Link
          to="/login"
          className="mt-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-600 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:from-emerald-500 hover:to-emerald-500"
        >
          ចូលគណនី (Go to Login)
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <Store size={30} className="text-emerald-600" />
          <h1 className="text-xl font-bold text-slate-900">ចុះឈ្មោះគណនីថ្មី</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-ink-900 p-6 shadow-sm sm:p-8"
        >
          {error && (
            <div className="mb-5 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">ឈ្មោះអ្នកប្រើ *</label>
              <input
                required
                disabled={submitting}
                value={form.username}
                onChange={set('username')}
                className={inputClass}
                placeholder="testuser01"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">ឈ្មោះបង្ហាញ</label>
              <input
                disabled={submitting}
                value={form.displayName}
                onChange={set('displayName')}
                className={inputClass}
                placeholder="Test User One"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">អ៊ីមែល *</label>
              <input
                required
                type="email"
                disabled={submitting}
                value={form.email}
                onChange={set('email')}
                className={inputClass}
                placeholder="testuser01@test.com"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">លេខទូរស័ព្ទ</label>
              <input
                type="tel"
                disabled={submitting}
                value={form.phoneNumber}
                onChange={set('phoneNumber')}
                className={inputClass}
                placeholder="010111222"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">ពាក្យសម្ងាត់ *</label>
              <input
                type="password"
                required
                disabled={submitting}
                value={form.password}
                onChange={set('password')}
                className={inputClass}
                placeholder="••••••••"
              />
              <p className="mt-1.5 text-xs text-slate-500">យ៉ាងតិច ៦ តួអក្សរ</p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">បញ្ជាក់ពាក្យសម្ងាត់ *</label>
              <input
                type="password"
                required
                disabled={submitting}
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                className={inputClass}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-600 py-3 font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:from-emerald-500 hover:to-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>កំពុងចុះឈ្មោះ...</span>
              </>
            ) : (
              <span>ចុះឈ្មោះ</span>
            )}
          </button>

          <p className="mt-5 text-center text-sm text-slate-500">
            មានគណនីរួចហើយ?{' '}
            <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-700">
              ចូលគណនី
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}