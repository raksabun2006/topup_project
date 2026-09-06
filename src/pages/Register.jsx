import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Loader2, AlertCircle, CheckCircle, Eye, EyeOff, Lock,
  User, Mail, Phone, ShoppingBag, CheckCircle2, ArrowLeft,
  ShieldCheck
} from 'lucide-react';
import { useAuth, getRoleDashboardPath } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import { getErrorMessage } from '../api/client';
import { env } from '../config/env';
import SEO from '../components/SEO';
import ThemeToggle from '../components/ui/ThemeToggle';

function StorefrontIllustration() {
  return (
    <div className="relative w-full max-w-[320px] mx-auto my-2 select-none flex items-center justify-center">
      <svg
        viewBox="0 0 400 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-xs"
      >
        {/* Background Clouds */}
        <path d="M60 90c0-12 10-22 22-22 4 0 8 1 11 3 5-10 16-17 28-17 16 0 30 12 32 28 4-2 9-3 14-3 14 0 26 12 26 26H60z" fill="#E2E8F0" opacity="0.6" />
        <path d="M260 70c0-10 8-18 18-18 3 0 6 1 9 2 4-8 13-14 23-14 13 0 24 10 26 23 3-2 7-2 11-2 11 0 21 10 21 21H260z" fill="#E2E8F0" opacity="0.6" />

        {/* Street Ground Line */}
        <line x1="20" y1="250" x2="380" y2="250" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="30" y1="255" x2="370" y2="255" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />

        {/* Street Lamp Left */}
        <path d="M55 250V140" stroke="#334155" strokeWidth="2" />
        <polygon points="45,140 65,140 60,125 50,125" fill="#FCD34D" stroke="#334155" strokeWidth="2" />
        <polygon points="42,125 68,125 55,115" fill="#334155" />

        {/* Street Lamp Right */}
        <path d="M335 250V140" stroke="#334155" strokeWidth="2" />
        <polygon points="325,140 345,140 340,125 330,125" fill="#FCD34D" stroke="#334155" strokeWidth="2" />
        <polygon points="322,125 348,125 335,115" fill="#334155" />

        {/* Store Building Main Body */}
        <rect x="90" y="110" width="180" height="140" rx="4" fill="#FFFFFF" stroke="#334155" strokeWidth="2.5" />
        <rect x="80" y="100" width="200" height="15" rx="3" fill="#F8FAFC" stroke="#334155" strokeWidth="2" />

        {/* Store Awning (Striped Blue & White) */}
        <path d="M75 115 L85 150 Q97.5 160 110 150 L105 115 Z" fill="#0284C7" stroke="#334155" strokeWidth="1.5" />
        <path d="M105 115 L110 150 Q122.5 160 135 150 L130 115 Z" fill="#FFFFFF" stroke="#334155" strokeWidth="1.5" />
        <path d="M130 115 L135 150 Q147.5 160 160 150 L155 115 Z" fill="#0284C7" stroke="#334155" strokeWidth="1.5" />
        <path d="M155 115 L160 150 Q172.5 160 185 150 L180 115 Z" fill="#FFFFFF" stroke="#334155" strokeWidth="1.5" />
        <path d="M180 115 L185 150 Q197.5 160 210 150 L205 115 Z" fill="#0284C7" stroke="#334155" strokeWidth="1.5" />
        <path d="M205 115 L210 150 Q222.5 160 235 150 L230 115 Z" fill="#FFFFFF" stroke="#334155" strokeWidth="1.5" />
        <path d="M230 115 L235 150 Q247.5 160 260 150 L255 115 Z" fill="#0284C7" stroke="#334155" strokeWidth="1.5" />
        <path d="M255 115 L260 150 Q272.5 160 285 150 L275 115 Z" fill="#FFFFFF" stroke="#334155" strokeWidth="1.5" />

        {/* Store Sign */}
        <rect x="110" y="65" width="140" height="35" rx="4" fill="#FFFFFF" stroke="#334155" strokeWidth="2" />
        <text x="180" y="88" textAnchor="middle" fill="#0284C7" fontWeight="900" fontSize="13" letterSpacing="1">
          MART SYSTEM
        </text>

        {/* Store Door & Window */}
        <rect x="105" y="170" width="40" height="80" rx="3" fill="#F0F9FF" stroke="#334155" strokeWidth="2" />
        <rect x="112" y="180" width="26" height="35" rx="2" fill="#BAE6FD" stroke="#334155" strokeWidth="1.5" />
        <circle cx="140" cy="215" r="2.5" fill="#334155" />

        {/* Store Showcase Window */}
        <rect x="160" y="170" width="95" height="65" rx="3" fill="#F0F9FF" stroke="#334155" strokeWidth="2" />
        <line x1="160" y1="202" x2="255" y2="202" stroke="#334155" strokeWidth="1.5" />
        <line x1="207" y1="170" x2="207" y2="235" stroke="#334155" strokeWidth="1.5" />

        {/* Hanging Sign */}
        <rect x="68" y="150" width="22" height="26" rx="2" fill="#38BDF8" stroke="#334155" strokeWidth="1.5" />
        <text x="79" y="168" textAnchor="middle" fill="#FFFFFF" fontWeight="900" fontSize="12">M</text>

        {/* Delivery Scooter */}
        <circle cx="45" cy="242" r="14" fill="#334155" />
        <circle cx="45" cy="242" r="7" fill="#F8FAFC" stroke="#334155" strokeWidth="2" />
        <circle cx="95" cy="242" r="14" fill="#334155" />
        <circle cx="95" cy="242" r="7" fill="#F8FAFC" stroke="#334155" strokeWidth="2" />

        <path d="M45 235 L60 215 L78 215 L88 238 Z" fill="#EF4444" stroke="#334155" strokeWidth="2" />
        <path d="M78 215 L92 185 L84 185" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="92" cy="183" r="3.5" fill="#FCD34D" stroke="#334155" strokeWidth="1" />
        <rect x="35" y="195" width="22" height="22" rx="3" fill="#FBBF24" stroke="#334155" strokeWidth="1.5" />
        <rect x="52" y="210" width="18" height="6" rx="2" fill="#334155" />

        {/* Sidewalk Chalk Board Right */}
        <polygon points="295,250 300,205 320,205 325,250" fill="#475569" stroke="#334155" strokeWidth="2" />
        <rect x="303" y="212" width="14" height="26" rx="1" fill="#1E293B" />
        <line x1="306" y1="220" x2="314" y2="220" stroke="#F8FAFC" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="306" y1="226" x2="314" y2="226" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />

        {/* Green Bushes Right */}
        <circle cx="340" cy="245" r="14" fill="#22C55E" stroke="#334155" strokeWidth="1.5" />
        <circle cx="355" cy="246" r="11" fill="#16A34A" stroke="#334155" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

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
  if (!usernameTrimmed) return 'Please enter a username.';
  if (usernameTrimmed.length < 3) return 'Username must be at least 3 characters.';
  if (/\s/.test(usernameTrimmed)) return 'Username cannot contain spaces.';
  if (!form.email.trim()) return 'Please enter your email.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return 'Please enter a valid email address.';
  if (!form.password || form.password.length < 4) return 'Password must be at least 4 characters.';
  if (form.password !== form.confirmPassword) return 'Passwords do not match.';
  return '';
}

export default function Register() {
  const { isAuthenticated, user, loading } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  // Auto-redirect if user is already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      navigate(getRoleDashboardPath(user.role), { replace: true });
    }
  }, [loading, isAuthenticated, user, navigate]);

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
        setError('Username or email already exists. Please choose another.');
      } else if (status === 500) {
        setError('Something went wrong on the server. Please try again later.');
      } else {
        setError(getErrorMessage(err) || 'Failed to register account.');
      }
    } finally {
      setSubmitting(false);
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
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Your Mart System customer account has been successfully created. You can now sign in and enjoy fast delivery!
          </p>
          <Link
            to="/login"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1D4ED8] hover:bg-[#1E40AF] py-3.5 text-sm font-black text-white shadow-lg shadow-blue-500/25 transition active:scale-95"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#EDF2F7] dark:bg-slate-950 p-3 sm:p-6 lg:p-8 font-sans">
      <SEO title="Create Account | Mart System" canonical="/register" robots="noindex, nofollow" />

      <div className="absolute top-3 right-3 sm:top-6 sm:right-6 z-20">
        <ThemeToggle variant="navbar" />
      </div>

      {/* Main Split Card Container */}
      <div className="w-full max-w-md lg:max-w-5xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl lg:rounded-[1.75rem] border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[auto] lg:min-h-[640px] animate-scale-in">
        
        {/* Left Side: Brand Showcase & Value Props (Desktop Only for optimal mobile UX) */}
        <div className="hidden lg:flex lg:col-span-5 bg-[#F8FAFC] dark:bg-slate-900/60 p-8 lg:p-10 flex-col justify-between border-r border-slate-200/70 dark:border-slate-800">
          <div>
            {/* Brand Logo */}
            <div className="flex items-center justify-between mb-4">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white shadow-xs group-hover:scale-105 transition-transform">
                  <ShoppingBag size={18} />
                </div>
                <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {env.appName || 'Mart System'}
                </span>
              </Link>
            </div>

            {/* Illustration */}
            <StorefrontIllustration />

            {/* Value Proposition List */}
            <div className="mt-4 space-y-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Why {env.appName || 'Mart System'}
              </h3>
              <ul className="space-y-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2.5">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <CheckCircle2 size={13} />
                  </div>
                  <span>Fast $1.50 Express Delivery in Phnom Penh</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <CheckCircle2 size={13} />
                  </div>
                  <span>Seamless Bakong KHQR Instant Payment</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <CheckCircle2 size={13} />
                  </div>
                  <span>20+ Fresh Grocery &amp; Tech Categories</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <CheckCircle2 size={13} />
                  </div>
                  <span>100% Authentic Quality Guaranteed Products</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright note */}
          <div className="pt-6 mt-6 border-t border-slate-200/70 dark:border-slate-800 text-[11px] font-medium text-slate-400">
            © {new Date().getFullYear()} {env.appName || 'Mart System'}. All rights reserved.
          </div>
        </div>

        {/* Right Side: Register Form */}
        <div className="col-span-1 lg:col-span-7 p-5 sm:p-8 lg:p-12 flex flex-col justify-between bg-white dark:bg-slate-900">
          {/* Top Bar on Mobile/Desktop */}
          <div className="flex items-center justify-between lg:justify-end gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-3 sm:mb-0">
            {/* Mobile Brand Logo */}
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

            {/* Switch to Login Button */}
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline">Already have an account?</span>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-2xs hover:scale-105"
              >
                <User size={13} />
                <span>Log in</span>
              </Link>
            </div>
          </div>

          {/* Center Form Container */}
          <div className="my-auto py-3 sm:py-4 max-w-md w-full mx-auto">
            {/* User Icon Circle */}
            <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 mx-auto mb-3 border border-sky-100 dark:border-sky-900/40 shadow-xs">
              <User size={20} />
            </div>

            <div className="text-center space-y-1 mb-4 sm:mb-5">
              <h2 className="text-xl sm:text-2xl lg:text-[26px] font-black text-slate-900 dark:text-white tracking-tight">
                Create your account
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 font-medium">
                Join Mart System and start shopping today!
              </p>
            </div>

            {error && (
              <div className="mb-3.5 sm:mb-4 flex items-start gap-2.5 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 p-3 sm:p-3.5 text-xs font-semibold text-rose-700 dark:text-rose-400 shadow-2xs animate-fade-in">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <div className="flex-1 leading-relaxed">{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5">
              {/* Username Input */}
              <div className="relative">
                <User size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  autoFocus
                  disabled={submitting}
                  value={form.username}
                  onChange={set('username')}
                  placeholder="Username *"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-[#FBFDFF] dark:bg-slate-800/70 py-2 sm:py-2.5 pl-10 pr-4 text-base sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition shadow-2xs"
                />
              </div>

              {/* Full Name & Phone Number Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div className="relative">
                  <ShieldCheck size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    disabled={submitting}
                    value={form.displayName}
                    onChange={set('displayName')}
                    placeholder="Full Name"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-[#FBFDFF] dark:bg-slate-800/70 py-2 sm:py-2.5 pl-9 pr-3 text-base sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition shadow-2xs"
                  />
                </div>

                <div className="relative">
                  <Phone size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    disabled={submitting}
                    value={form.phoneNumber}
                    onChange={set('phoneNumber')}
                    placeholder="Phone Number"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-[#FBFDFF] dark:bg-slate-800/70 py-2 sm:py-2.5 pl-9 pr-3 text-base sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition shadow-2xs"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="relative">
                <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  type="email"
                  disabled={submitting}
                  value={form.email}
                  onChange={set('email')}
                  placeholder="Email Address *"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-[#FBFDFF] dark:bg-slate-800/70 py-2 sm:py-2.5 pl-10 pr-4 text-base sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition shadow-2xs"
                />
              </div>

              {/* Password Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div className="relative">
                  <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    disabled={submitting}
                    value={form.password}
                    onChange={set('password')}
                    placeholder="Password *"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-[#FBFDFF] dark:bg-slate-800/70 py-2 sm:py-2.5 pl-9 pr-8 text-base sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                <div className="relative">
                  <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    required
                    type={showConfirmPassword ? 'text' : 'password'}
                    disabled={submitting}
                    value={form.confirmPassword}
                    onChange={set('confirmPassword')}
                    placeholder="Confirm *"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-[#FBFDFF] dark:bg-slate-800/70 py-2 sm:py-2.5 pl-9 pr-8 text-base sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-[#164E87] hover:bg-[#123E6C] text-white py-3 sm:py-3.5 text-xs sm:text-sm font-bold shadow-md transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2 mt-2 sm:mt-3"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>
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