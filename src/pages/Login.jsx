import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Form ក្នុង app ដោយផ្ទាល់ (Direct Access Grant) ជំនួសការ redirect ទៅ
 * Keycloak hosted page ចាស់ - មើល authClient.js សម្រាប់តម្រូវការលើ
 * Keycloak client configuration។
 */
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // ProtectedRoute រក្សាទុកកន្លែងដើមក្នុង state.from
  const from = location.state?.from;
  const redirectTo = from ? `${from.pathname}${from.search ?? ''}` : '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await login(username.trim(), password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(
        err.code === 'invalid_grant'
          ? 'ឈ្មោះអ្នកប្រើ ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ'
          : err.message || 'ចូលគណនីមិនបានទេ។ សូមព្យាយាមម្តងទៀត។'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-slate-300 bg-ink-950 px-3.5 py-2.5 text-slate-900 shadow-sm ' +
    'transition placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500';

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <Store size={30} className="text-emerald-600" />
          <h1 className="text-xl font-bold text-slate-900">ចូលគណនី</h1>
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
              <label className="mb-1 block text-sm font-medium text-slate-600">ឈ្មោះអ្នកប្រើ</label>
              <input
                required autoFocus value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">ពាក្យសម្ងាត់</label>
              <input
                required type="password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-600 py-3 font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:from-emerald-500 hover:to-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            ចូល
          </button>

          <p className="mt-5 text-center text-sm text-slate-500">
            មិនទាន់មានគណនី?{' '}
            <Link to="/register" className="font-medium text-emerald-600 hover:text-emerald-700">
              ចុះឈ្មោះ
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
