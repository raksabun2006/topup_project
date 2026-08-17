import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Gamepad2, Loader2 } from 'lucide-react';
import { authApi } from '../api/authApi';
import { getErrorMessage } from '../api/client';

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authApi.register(form);
      // Login មិនស្វ័យប្រវត្តិទេ - ចុះឈ្មោះជោគជ័យមិនមែនន័យថាមាន token ទេ។
      navigate('/login', { state: { registered: true } });
    } catch (err) {
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
          <h1 className="text-3xl font-bold text-white">ចុះឈ្មោះគណនី</h1>
          <p className="mt-2 text-slate-400">បង្កើតគណនីថ្មីដើម្បីចាប់ផ្តើម</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-purple-900/40 bg-ink-900 p-8 shadow-2xl shadow-purple-950/50"
        >
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
            អ៊ីមែល
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mb-5 w-full rounded-lg border border-purple-900/40 bg-ink-950 px-4 py-3 text-white placeholder-slate-500 transition focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            placeholder="gamer03@example.com"
          />

          <label className="mb-2 block text-sm font-medium text-slate-300">
            ពាក្យសម្ងាត់
          </label>
          <div className="relative mb-6">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              autoComplete="new-password"
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
            {loading ? 'កំពុងចុះឈ្មោះ...' : 'ចុះឈ្មោះ'}
          </button>

          <p className="mt-6 text-center text-sm text-slate-400">
            មានគណនីរួចហើយ?{' '}
            <Link to="/login" className="font-semibold text-purple-400 hover:text-purple-300">
              ចូលគណនី
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}