import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, Gamepad2, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/client';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ProtectedRoute រក្សាទុកកន្លែងដើមក្នុង state.from - ត្រូវរួម search
  // ជាមួយ pathname ព្រោះ TopUp ប្រើ ?productId= ដើម្បីចាំកញ្ចប់ដែលបានជ្រើសរើស
  const from = location.state?.from;
  const redirectTo = from ? `${from.pathname}${from.search ?? ''}` : '/dashboard';
  const justRegistered = location.state?.registered;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(form);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      // Backend ត្រឡប់សារមិនច្បាស់ដោយចេតនា - ការប្រាប់ថា
      // "គ្មាន username នេះ" អនុញ្ញាតឱ្យគេស្កេនរកឈ្មោះពិត។
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-950 px-4 py-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-fuchsia-600/15 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="mb-4 inline-flex items-center gap-2">
            <Gamepad2 size={28} className="text-purple-400" />
          </Link>
          <h1 className="text-3xl font-bold text-white">ចូលគណនី</h1>
          <p className="mt-2 text-slate-400">បញ្ចូលព័ត៌មានដើម្បីបន្ត</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-purple-900/40 bg-ink-900 p-8 shadow-2xl shadow-purple-950/50"
        >
          {justRegistered && !error && (
            <div className="mb-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
              ចុះឈ្មោះជោគជ័យ! សូមចូលគណនី។
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
              {error}
            </div>
          )}

          <label className="mb-2 block text-sm font-medium text-slate-300">
            ឈ្មោះអ្នកប្រើ
          </label>
          <input
            type="text"
            required
            autoComplete="username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="mb-5 w-full rounded-lg border border-purple-900/40 bg-ink-950 px-4 py-3 text-white placeholder-slate-500 transition focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            placeholder="gamer03"
          />

          <label className="mb-2 block text-sm font-medium text-slate-300">
            ពាក្យសម្ងាត់
          </label>
          <div className="relative mb-6">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-lg border border-purple-900/40 bg-ink-950 px-4 py-3 pr-12 text-white placeholder-slate-500 transition focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-300"
              aria-label={showPassword ? 'លាក់ពាក្យសម្ងាត់' : 'បង្ហាញពាក្យសម្ងាត់'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-600 px-4 py-3 font-semibold text-white shadow-lg shadow-purple-600/30 transition hover:from-purple-500 hover:to-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? 'កំពុងចូល...' : 'ចូល'}
          </button>

          <p className="mt-6 text-center text-sm text-slate-400">
            មិនទាន់មានគណនី?{' '}
            <Link to="/register" className="font-semibold text-purple-400 hover:text-purple-300">
              ចុះឈ្មោះ
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}