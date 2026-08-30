import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle, Store, Eye, EyeOff, Lock, User, Mail, Phone, ArrowLeft, ShieldCheck } from 'lucide-react';
import { authApi } from '../api/authApi';
import { getErrorMessage } from '../api/client';
import { env } from '../config/env';
import SEO from '../components/SEO';
import ThemeToggle from '../components/ui/ThemeToggle';

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
  if (!usernameTrimmed) return 'សូមបញ្ចូលឈ្មោះអ្នកប្រើ (Please enter a username)';
  if (usernameTrimmed.length < 3) return 'ឈ្មោះអ្នកប្រើត្រូវមានយ៉ាងតិច ៣ តួអក្សរ (Username must be at least 3 characters)';
  if (/\s/.test(usernameTrimmed)) return 'ឈ្មោះអ្នកប្រើប្រាស់មិនត្រូវមានដកឃ្លាឡើយ (Username cannot contain spaces)';
  if (!form.email.trim()) return 'សូមបញ្ចូលអ៊ីមែល (Please enter your email)';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return 'អ៊ីមែលមិនត្រឹមត្រូវទេ (Invalid email address)';
  if (!form.password || form.password.length < 6) return 'ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច ៦ តួអក្សរ (Password must be at least 6 characters)';
  if (form.password !== form.confirmPassword) return 'ពាក្យសម្ងាត់ទាំងពីរមិនត្រូវគ្នាទេ (Passwords do not match)';
  return '';
}

export default function Register() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  if (done) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-50/80 dark:bg-slate-950 px-4 py-10 text-center animate-fade-in">
        <SEO
          title="ចុះឈ្មោះជោគជ័យ (Registration Successful) | Mart System"
          robots="noindex, nofollow"
        />
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <ThemeToggle variant="navbar" />
        </div>
        <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <CheckCircle size={36} />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">ចុះឈ្មោះជោគជ័យ!</h1>
          <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
            Registration Successful
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            គណនីរបស់អ្នកត្រូវបានបង្កើតដោយជោគជ័យ។ សូមចូលគណនីដើម្បីបន្ត។
          </p>
          <Link
            to="/login"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-500"
          >
            ចូលគណនី (Go to Login)
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50/80 dark:bg-slate-950 px-4 py-10">
      <SEO
        title="ចុះឈ្មោះ (Register) | Mart System"
        robots="noindex, nofollow"
      />
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle variant="navbar" />
      </div>
      <div className="w-full max-w-md animate-fade-in">
        {/* Back to store navigation */}
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 transition hover:text-emerald-700 dark:hover:text-emerald-400"
        >
          <ArrowLeft size={15} />
          ត្រឡប់ទៅកាន់ហាងទំនិញ (Back to Store)
        </Link>

        {/* Brand Header */}
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 shadow-md shadow-emerald-600/20">
            <Store size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">ចុះឈ្មោះគណនីថ្មី</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">{env.appName} · បង្កើតគណនីសម្រាប់បុគ្គលិក និងអ្នកគ្រប់គ្រង</p>
        </div>

        {/* Registration Form Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl shadow-slate-200/50 dark:shadow-none sm:p-8"
        >
          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 p-3.5 text-xs font-medium text-rose-700 dark:text-rose-400">
              <AlertCircle size={17} className="mt-0.5 shrink-0" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          <div className="space-y-4">
            {/* Username */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                ឈ្មោះអ្នកប្រើ (Username) *
              </label>
              <div className="relative">
                <User size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  disabled={submitting}
                  value={form.username}
                  onChange={set('username')}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 dark:text-white shadow-xs transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
                  placeholder="testuser01"
                />
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                ឈ្មោះពេញ (Display Name)
              </label>
              <div className="relative">
                <ShieldCheck size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  disabled={submitting}
                  value={form.displayName}
                  onChange={set('displayName')}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 dark:text-white shadow-xs transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
                  placeholder="Bun Raksa"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                អ៊ីមែល (Email) *
              </label>
              <div className="relative">
                <Mail size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  type="email"
                  disabled={submitting}
                  value={form.email}
                  onChange={set('email')}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 dark:text-white shadow-xs transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
                  placeholder="user@example.com"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                លេខទូរស័ព្ទ (Phone Number)
              </label>
              <div className="relative">
                <Phone size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  disabled={submitting}
                  value={form.phoneNumber}
                  onChange={set('phoneNumber')}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 dark:text-white shadow-xs transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
                  placeholder="012 345 678"
                />
              </div>
            </div>

            {/* Password with Show/Hide toggle */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                ពាក្យសម្ងាត់ (Password) *
              </label>
              <div className="relative">
                <Lock size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={submitting}
                  value={form.password}
                  onChange={set('password')}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-11 text-sm text-slate-900 dark:text-white shadow-xs transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">យ៉ាងតិច ៦ តួអក្សរ</p>
            </div>

            {/* Confirm Password with Show/Hide toggle */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                បញ្ជាក់ពាក្យសម្ងាត់ (Confirm Password) *
              </label>
              <div className="relative">
                <Lock size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  disabled={submitting}
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-11 text-sm text-slate-900 dark:text-white shadow-xs transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition focus:outline-none"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>កំពុងចុះឈ្មោះ...</span>
              </>
            ) : (
              <span>ចុះឈ្មោះ (Register)</span>
            )}
          </button>

          <p className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
            មានគណនីរួចហើយ?{' '}
            <Link to="/login" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300">
              ចូលគណនី (Sign In)
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}