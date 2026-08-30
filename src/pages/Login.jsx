import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, Store, Eye, EyeOff, Lock, User, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/client';
import { env } from '../config/env';
import SEO from '../components/SEO';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from;
  const redirectTo = from ? `${from.pathname}${from.search ?? ''}` : '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!username.trim() || !password) {
      setError('សូមបញ្ចូលឈ្មោះអ្នកប្រើ និងពាក្យសម្ងាត់');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await login(username.trim(), password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const status = err.status || err.response?.status;
      if (status === 401 || err.code === 'invalid_grant') {
        setError('ឈ្មោះអ្នកប្រើ ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ (Username or password is incorrect.)');
      } else if (status === 500) {
        setError('មានបញ្ហាកើតឡើង។ សូមព្យាយាមម្តងទៀត។ (Something went wrong. Please try again later.)');
      } else {
        setError(getErrorMessage(err) || 'ចូលគណនីមិនបានទេ។ សូមព្យាយាមម្តងទៀត។');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50/80 px-4 py-10">
      <SEO
        title="ចូលប្រើប្រាស់ (Login) | Mart System"
        robots="noindex, nofollow"
      />
      <div className="w-full max-w-md animate-fade-in">
        {/* Back to store navigation */}
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-emerald-700"
        >
          <ArrowLeft size={15} />
          ត្រឡប់ទៅកាន់ហាងទំនិញ (Back to Store)
        </Link>

        {/* Brand Header */}
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 shadow-md shadow-emerald-600/20">
            <Store size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">ចូលគណនី (Sign In)</h1>
          <p className="text-xs text-slate-500">{env.appName} · ផ្ទាំងគ្រប់គ្រងបុគ្គលិក និងអ្នកគ្រប់គ្រង</p>
        </div>

        {/* Login Form Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8"
        >
          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-700">
              <AlertCircle size={17} className="mt-0.5 shrink-0" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          <div className="space-y-4">
            {/* Username field */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                ឈ្មោះអ្នកប្រើ (Username) *
              </label>
              <div className="relative">
                <User size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  autoFocus
                  disabled={submitting}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 shadow-xs transition placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
                  placeholder="បញ្ចូល username របស់អ្នក"
                />
              </div>
            </div>

            {/* Password field with Show/Hide toggle */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                ពាក្យសម្ងាត់ (Password) *
              </label>
              <div className="relative">
                <Lock size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  disabled={submitting}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-11 text-sm text-slate-900 shadow-xs transition placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:text-slate-700 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                <span>កំពុងចូល...</span>
              </>
            ) : (
              <span>ចូលគណនី (Sign In)</span>
            )}
          </button>

          {/* Admin Managed Registration Notice */}
          <div className="mt-6 flex items-center justify-center gap-1.5 rounded-xl bg-slate-50 py-2.5 px-3 border border-slate-100 text-center text-[11px] text-slate-500">
            <ShieldAlert size={14} className="shrink-0 text-slate-400" />
            <span>គណនីត្រូវបានគ្រប់គ្រង និងបង្កើតដោយ Admin ប៉ុណ្ណោះ</span>
          </div>
        </form>
      </div>
    </div>
  );
}
