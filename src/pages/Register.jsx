import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Loader2, AlertCircle, CheckCircle, Eye, EyeOff, Lock,
  User, Mail, Phone, ShoppingBag, CheckCircle2, ArrowLeft,
  ShieldCheck, Check, X
} from 'lucide-react';
import { useAuth, getRoleDashboardPath } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import { getErrorMessage } from '../api/client';
import { env } from '../config/env';
import { getSafeRedirectUrl } from '../utils/security';
import SEO from '../components/SEO';
import ThemeToggle from '../components/ui/ThemeToggle';
import GoogleLoginButton from '../components/auth/GoogleLoginButton';

function StorefrontIllustration() {
  return (
    <div className="relative w-full max-w-[320px] mx-auto my-2 select-none flex items-center justify-center">
      <svg
        viewBox="0 0 400 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-xs"
      >
        <path d="M60 90c0-12 10-22 22-22 4 0 8 1 11 3 5-10 16-17 28-17 16 0 30 12 32 28 4-2 9-3 14-3 14 0 26 12 26 26H60z" fill="#E2E8F0" opacity="0.6" />
        <path d="M260 70c0-10 8-18 18-18 3 0 6 1 9 2 4-8 13-14 23-14 13 0 24 10 26 23 3-2 7-2 11-2 11 0 21 10 21 21H260z" fill="#E2E8F0" opacity="0.6" />

        <line x1="20" y1="250" x2="380" y2="250" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="30" y1="255" x2="370" y2="255" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />

        <path d="M55 250V140" stroke="#334155" strokeWidth="2" />
        <polygon points="45,140 65,140 60,125 50,125" fill="#FCD34D" stroke="#334155" strokeWidth="2" />
        <polygon points="42,125 68,125 55,115" fill="#334155" />

        <path d="M335 250V140" stroke="#334155" strokeWidth="2" />
        <polygon points="325,140 345,140 340,125 330,125" fill="#FCD34D" stroke="#334155" strokeWidth="2" />
        <polygon points="322,125 348,125 335,115" fill="#334155" />

        <rect x="90" y="110" width="180" height="140" rx="4" fill="#FFFFFF" stroke="#334155" strokeWidth="2.5" />
        <rect x="80" y="100" width="200" height="15" rx="3" fill="#F8FAFC" stroke="#334155" strokeWidth="2" />

        <path d="M75 115 L85 150 Q97.5 160 110 150 L105 115 Z" fill="#0284C7" stroke="#334155" strokeWidth="1.5" />
        <path d="M105 115 L110 150 Q122.5 160 135 150 L130 115 Z" fill="#FFFFFF" stroke="#334155" strokeWidth="1.5" />
        <path d="M130 115 L135 150 Q147.5 160 160 150 L155 115 Z" fill="#0284C7" stroke="#334155" strokeWidth="1.5" />
        <path d="M155 115 L160 150 Q172.5 160 185 150 L180 115 Z" fill="#FFFFFF" stroke="#334155" strokeWidth="1.5" />
        <path d="M180 115 L185 150 Q197.5 160 210 150 L205 115 Z" fill="#0284C7" stroke="#334155" strokeWidth="1.5" />
        <path d="M205 115 L210 150 Q222.5 160 235 150 L230 115 Z" fill="#FFFFFF" stroke="#334155" strokeWidth="1.5" />
        <path d="M230 115 L235 150 Q247.5 160 260 150 L255 115 Z" fill="#0284C7" stroke="#334155" strokeWidth="1.5" />
        <path d="M255 115 L260 150 Q272.5 160 285 150 L275 115 Z" fill="#FFFFFF" stroke="#334155" strokeWidth="1.5" />

        <rect x="110" y="65" width="140" height="35" rx="4" fill="#FFFFFF" stroke="#334155" strokeWidth="2" />
        <text x="180" y="88" textAnchor="middle" fill="#0284C7" fontWeight="900" fontSize="13" letterSpacing="1">
          MART SYSTEM
        </text>

        <rect x="105" y="170" width="40" height="80" rx="3" fill="#F0F9FF" stroke="#334155" strokeWidth="2" />
        <rect x="112" y="180" width="26" height="35" rx="2" fill="#BAE6FD" stroke="#334155" strokeWidth="1.5" />
        <circle cx="140" cy="215" r="2.5" fill="#334155" />

        <rect x="160" y="170" width="95" height="65" rx="3" fill="#F0F9FF" stroke="#334155" strokeWidth="2" />
        <line x1="160" y1="202" x2="255" y2="202" stroke="#334155" strokeWidth="1.5" />
        <line x1="207" y1="170" x2="207" y2="235" stroke="#334155" strokeWidth="1.5" />

        <rect x="68" y="150" width="22" height="26" rx="2" fill="#38BDF8" stroke="#334155" strokeWidth="1.5" />
        <text x="79" y="168" textAnchor="middle" fill="#FFFFFF" fontWeight="900" fontSize="12">M</text>

        <circle cx="45" cy="242" r="14" fill="#334155" />
        <circle cx="95" cy="242" r="14" fill="#334155" />
        <circle cx="340" cy="245" r="14" fill="#22C55E" stroke="#334155" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

const EMPTY_FORM = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  phoneNumber: '',
};

function calculatePasswordStrength(password) {
  if (!password) return { score: 0, label: 'Empty', color: 'bg-slate-200 dark:bg-slate-700' };

  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-rose-500', textColor: 'text-rose-500' };
  if (score <= 3) return { score: 2, label: 'Fair', color: 'bg-amber-500', textColor: 'text-amber-500' };
  return { score: 3, label: 'Strong', color: 'bg-emerald-500', textColor: 'text-emerald-500' };
}

export default function Register() {
  const { loginWithGoogle, isAuthenticated, user, loading } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from;

  // Auto-redirect if user is already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const fallback = getRoleDashboardPath(user.role);
      const destination = from ? getSafeRedirectUrl(from, fallback) : fallback;
      navigate(destination, { replace: true });
    }
  }, [loading, isAuthenticated, user, from, navigate]);

  const strength = useMemo(() => calculatePasswordStrength(form.password), [form.password]);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();

    if (!trimmedName) {
      setError('Please enter your name.');
      return;
    }

    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!form.password) {
      setError('Please enter a password.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!form.confirmPassword) {
      setError('Please confirm your password.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        name: trimmedName,
        displayName: trimmedName,
        username: trimmedEmail,
        email: trimmedEmail,
        password: form.password,
        phoneNumber: form.phoneNumber.trim() || undefined,
      };

      await authApi.register(payload);

      // Registration successful -> show success message
      setDone(true);
    } catch (err) {
      setError(getErrorMessage(err) || 'Failed to create account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credential) => {
    setSubmitting(true);
    setError('');

    try {
      const loggedUser = await loginWithGoogle(credential);
      const fallback = getRoleDashboardPath(loggedUser?.role);
      const destination = from ? getSafeRedirectUrl(from, fallback) : fallback;
      navigate(destination, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err) || 'Unable to register with Google.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleError = (err) => {
    if (typeof err === 'string') {
      setError(err);
    } else {
      setError(getErrorMessage(err) || 'Google sign-in was cancelled or failed.');
    }
  };

  if (done) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-[#F1F5F9] dark:bg-slate-950 p-4 font-sans">
        <SEO title="Registration Successful | Mart System" canonical="/register" robots="noindex, nofollow" />
        <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8 shadow-2xl text-center space-y-4 animate-scale-in">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shadow-xs">
            <CheckCircle size={36} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Account Created!</h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            Your account has been created successfully. A welcome email has been sent to your email address.
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            You can now log in with your credentials to start shopping.
          </p>
          <Link
            to="/login"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#164E87] hover:bg-[#123E6C] py-3.5 text-sm font-black text-white shadow-md transition active:scale-95"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-white dark:bg-slate-950 font-sans flex flex-col justify-between overflow-x-hidden">
      <SEO title="Create Account | Mart System" canonical="/register" robots="noindex, nofollow" />

      {/* Main Split Grid Container */}
      <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Side: Brand Showcase & Value Props */}
        <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 bg-[#F8FAFC] dark:bg-slate-900/60 p-8 lg:p-12 xl:p-16 flex-col justify-between border-r border-slate-200/80 dark:border-slate-800 relative">
          <div>
            {/* Brand Logo */}
            <div className="flex items-center justify-between mb-6">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white shadow-xs group-hover:scale-105 transition-transform">
                  <ShoppingBag size={20} />
                </div>
                <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {env.appName || 'Mart System'}
                </span>
              </Link>
            </div>

            {/* Illustration */}
            <div className="my-6">
              <StorefrontIllustration />
            </div>

            {/* Value Proposition List */}
            <div className="mt-6 space-y-4">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Why {env.appName || 'Mart System'}
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <CheckCircle2 size={15} />
                  </div>
                  <span>Fast Express Delivery in Phnom Penh</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <CheckCircle2 size={15} />
                  </div>
                  <span>Seamless Bakong KHQR Instant Payment</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <CheckCircle2 size={15} />
                  </div>
                  <span>20+ Fresh Grocery &amp; Tech Categories</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <CheckCircle2 size={15} />
                  </div>
                  <span>100% Authentic Quality Guaranteed Products</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 mt-8 border-t border-slate-200/70 dark:border-slate-800 text-xs font-medium text-slate-400">
            © {new Date().getFullYear()} {env.appName || 'Mart System'}. All rights reserved.
          </div>
        </div>

        {/* Right Side: Register Form */}
        <div className="col-span-1 lg:col-span-7 xl:col-span-7 p-6 sm:p-10 lg:p-14 xl:p-20 flex flex-col justify-between bg-white dark:bg-slate-900 min-h-screen overflow-y-auto">
          {/* Top Bar on Mobile/Desktop */}
          <div className="flex items-center justify-between gap-3 text-xs font-medium text-slate-500 dark:text-slate-400 mb-6">
            <div className="flex lg:hidden items-center">
              <Link to="/" className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500 to-rose-500 text-white shadow-xs">
                  <ShoppingBag size={14} />
                </div>
                <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                  {env.appName || 'Mart System'}
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-2.5 ml-auto">
              <span className="hidden sm:inline">Already have an account?</span>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-2xs hover:scale-105"
              >
                <User size={13} />
                <span>Login</span>
              </Link>
              <ThemeToggle variant="navbar" />
            </div>
          </div>

          {/* Center Form Container */}
          <div className="my-auto py-3 sm:py-4 max-w-md w-full mx-auto">
            <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 mx-auto mb-3 border border-sky-100 dark:border-sky-900/40 shadow-xs">
              <User size={20} />
            </div>

            <div className="text-center space-y-1 mb-4 sm:mb-5">
              <h1 className="text-xl sm:text-2xl lg:text-[26px] font-black text-slate-900 dark:text-white tracking-tight">
                Create Account
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 font-medium">
                Join Mart System and start shopping today!
              </p>
            </div>

            {error && (
              <div className="mb-3.5 sm:mb-4 flex items-start gap-2.5 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 p-3 sm:p-3.5 text-xs font-semibold text-rose-700 dark:text-rose-400 shadow-2xs animate-fade-in" role="alert">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <div className="flex-1 leading-relaxed">{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5" noValidate>
              {/* Name Input */}
              <div className="relative">
                <ShieldCheck size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="register-name"
                  required
                  autoFocus
                  disabled={submitting}
                  value={form.name}
                  onChange={set('name')}
                  placeholder="Name *"
                  aria-label="Name"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-[#FBFDFF] dark:bg-slate-800/70 py-2.5 sm:py-3 pl-10 pr-4 text-base sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition shadow-2xs disabled:opacity-60"
                />
              </div>

              {/* Email Input */}
              <div className="relative">
                <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="register-email"
                  required
                  type="email"
                  disabled={submitting}
                  value={form.email}
                  onChange={set('email')}
                  placeholder="Email *"
                  aria-label="Email"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-[#FBFDFF] dark:bg-slate-800/70 py-2.5 sm:py-3 pl-10 pr-4 text-base sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition shadow-2xs disabled:opacity-60"
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="register-password"
                  required
                  type={showPassword ? 'text' : 'password'}
                  disabled={submitting}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Password *"
                  aria-label="Password"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-[#FBFDFF] dark:bg-slate-800/70 py-2.5 sm:py-3 pl-10 pr-10 text-base sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition shadow-2xs disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition focus:outline-none cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {form.password && (
                <div className="space-y-1.5 px-1 pt-0.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Password strength:</span>
                    <span className={`font-bold ${strength.textColor}`}>{strength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-1">
                    <div className={`h-full flex-1 rounded-full transition-all ${strength.score >= 1 ? strength.color : 'bg-slate-200 dark:bg-slate-700'}`} />
                    <div className={`h-full flex-1 rounded-full transition-all ${strength.score >= 2 ? strength.color : 'bg-slate-200 dark:bg-slate-700'}`} />
                    <div className={`h-full flex-1 rounded-full transition-all ${strength.score >= 3 ? strength.color : 'bg-slate-200 dark:bg-slate-700'}`} />
                  </div>
                </div>
              )}

              {/* Confirm Password Input */}
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="register-confirm-password"
                  required
                  type={showConfirmPassword ? 'text' : 'password'}
                  disabled={submitting}
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  placeholder="Confirm Password *"
                  aria-label="Confirm Password"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-[#FBFDFF] dark:bg-slate-800/70 py-2.5 sm:py-3 pl-10 pr-10 text-base sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition shadow-2xs disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition focus:outline-none cursor-pointer"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password Matching Status */}
              {form.confirmPassword && (
                <div className="flex items-center gap-1.5 text-xs px-1">
                  {form.password === form.confirmPassword ? (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <Check size={13} /> Passwords match
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-rose-500 font-semibold">
                      <X size={13} /> Passwords do not match
                    </span>
                  )}
                </div>
              )}

              {/* Optional Phone Number */}
              <div className="relative">
                <Phone size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="register-phone"
                  type="tel"
                  disabled={submitting}
                  value={form.phoneNumber}
                  onChange={set('phoneNumber')}
                  placeholder="Phone Number (optional)"
                  aria-label="Phone Number"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-[#FBFDFF] dark:bg-slate-800/70 py-2.5 sm:py-3 pl-10 pr-4 text-base sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition shadow-2xs disabled:opacity-60"
                />
              </div>

              {/* Submit Button */}
              <button
                id="register-submit-button"
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-[#164E87] hover:bg-[#123E6C] text-white py-3 sm:py-3.5 text-xs sm:text-sm font-bold shadow-md transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>

            {/* Divider OR */}
            <div className="relative my-3.5 sm:my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase">
                <span className="bg-white dark:bg-slate-900 px-3 font-bold text-slate-400 dark:text-slate-500">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Signup Button */}
            <GoogleLoginButton
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              disabled={submitting}
              text="Continue with Google"
            />
          </div>

          {/* Bottom Link Back to Store */}
          <div className="text-center pt-3 sm:pt-0">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
            >
              <ArrowLeft size={13} />
              <span>Back to Mart Storefront</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}