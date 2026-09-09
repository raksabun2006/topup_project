import { useState, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Loader2, AlertCircle, CheckCircle, CheckCircle2, Eye, EyeOff, Lock,
  ShoppingBag, ArrowLeft, KeyRound, AlertTriangle, Check, X, Send, Mail
} from 'lucide-react';
import { authApi } from '../api/authApi';
import { getErrorMessage } from '../api/client';
import { env } from '../config/env';
import SEO from '../components/SEO';
import ThemeToggle from '../components/ui/ThemeToggle';

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
        <rect x="90" y="110" width="180" height="140" rx="4" fill="#FFFFFF" stroke="#334155" strokeWidth="2.5" />
        <rect x="80" y="100" width="200" height="15" rx="3" fill="#F8FAFC" stroke="#334155" strokeWidth="2" />
        <path d="M75 115 L85 150 Q97.5 160 110 150 L105 115 Z" fill="#0284C7" stroke="#334155" strokeWidth="1.5" />
        <path d="M105 115 L110 150 Q122.5 160 135 150 L130 115 Z" fill="#FFFFFF" stroke="#334155" strokeWidth="1.5" />
        <path d="M130 115 L135 150 Q147.5 160 160 150 L155 115 Z" fill="#0284C7" stroke="#334155" strokeWidth="1.5" />
        <path d="M155 115 L160 150 Q172.5 160 185 150 L180 115 Z" fill="#FFFFFF" stroke="#334155" strokeWidth="1.5" />
        <rect x="110" y="65" width="140" height="35" rx="4" fill="#FFFFFF" stroke="#334155" strokeWidth="2" />
        <text x="180" y="88" textAnchor="middle" fill="#0284C7" fontWeight="900" fontSize="13" letterSpacing="1">
          MART SYSTEM
        </text>
        <rect x="105" y="170" width="40" height="80" rx="3" fill="#F0F9FF" stroke="#334155" strokeWidth="2" />
        <rect x="160" y="170" width="95" height="65" rx="3" fill="#F0F9FF" stroke="#334155" strokeWidth="2" />
        <circle cx="45" cy="242" r="14" fill="#334155" />
        <circle cx="95" cy="242" r="14" fill="#334155" />
        <circle cx="340" cy="245" r="14" fill="#22C55E" stroke="#334155" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Read raw token securely from URL query param
  const urlToken = useMemo(() => {
    return (
      searchParams.get('token') ||
      searchParams.get('resetToken') ||
      searchParams.get('token_hash') ||
      searchParams.get('code') ||
      searchParams.get('key') ||
      searchParams.get('t') ||
      ''
    );
  }, [searchParams]);

  const [manualToken, setManualToken] = useState(urlToken);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenInvalid, setTokenInvalid] = useState(false);

  const activeToken = (manualToken || urlToken || '').trim();

  const strength = useMemo(() => calculatePasswordStrength(password), [password]);
  const hasMinLength = password.length >= 6;
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (submitting || success) return;

    if (!activeToken) {
      setError('Please enter your password reset token or verification code.');
      return;
    }

    if (!password) {
      setError('Please enter a new password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!confirmPassword) {
      setError('Please confirm your new password.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await authApi.resetPassword({
        token: activeToken,
        newPassword: password,
      });

      // Clear password from component state and mark successful
      setPassword('');
      setConfirmPassword('');
      setSuccess(true);
    } catch (err) {
      const status = err.status || err.response?.status;
      const msg = err.response?.data?.message || err.message || '';

      if (
        status === 400 ||
        status === 404 ||
        msg.toLowerCase().includes('expired') ||
        msg.toLowerCase().includes('invalid') ||
        msg.toLowerCase().includes('used')
      ) {
        setTokenInvalid(true);
        setError('This password reset link or code is invalid or has expired. Please request a new link or contact support.');
      } else if (status >= 500) {
        setError('Server error occurred. Please try again later.');
      } else {
        setError(getErrorMessage(err) || 'Failed to reset password. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-white dark:bg-slate-950 font-sans flex flex-col justify-between overflow-x-hidden">
      <SEO title="Reset Password | Mart System" canonical="/reset-password" robots="noindex, nofollow" />

      {/* Main Full-Screen Grid */}
      <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Side: Brand Showcase */}
        <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 bg-[#F8FAFC] dark:bg-slate-900/60 p-8 lg:p-12 xl:p-16 flex-col justify-between border-r border-slate-200/80 dark:border-slate-800 relative">
          <div>
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

            <div className="my-6">
              <StorefrontIllustration />
            </div>

            <div className="mt-6 space-y-4">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Account Security
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <CheckCircle2 size={15} />
                  </div>
                  <span>High-strength password encryption</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <CheckCircle2 size={15} />
                  </div>
                  <span>Instant account access recovery</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <CheckCircle2 size={15} />
                  </div>
                  <span>Single-use token safety verification</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 mt-8 border-t border-slate-200/70 dark:border-slate-800 text-xs font-medium text-slate-400">
            © {new Date().getFullYear()} {env.appName || 'Mart System'}. All rights reserved.
          </div>
        </div>

        {/* Right Side: Form or Success */}
        <div className="col-span-1 lg:col-span-7 xl:col-span-7 p-6 sm:p-10 lg:p-14 xl:p-20 flex flex-col justify-between bg-white dark:bg-slate-900 min-h-screen overflow-y-auto">
          
          {/* Top Navigation Bar */}
          <div className="flex items-center justify-between gap-3 text-xs font-medium text-slate-500 dark:text-slate-400 mb-6">
            <div className="flex lg:hidden items-center">
              <Link to="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white shadow-xs">
                  <ShoppingBag size={16} />
                </div>
                <span className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                  {env.appName || 'Mart System'}
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-2.5 ml-auto">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-2xs hover:scale-105"
              >
                <ArrowLeft size={13} />
                <span>Back to Login</span>
              </Link>
              <ThemeToggle variant="navbar" />
            </div>
          </div>

          {/* Center Content Container */}
          <div className="my-auto py-8 sm:py-10 max-w-md w-full mx-auto">
            {/* State 1: Reset Success */}
            {success ? (
              <div className="text-center space-y-4 py-4 animate-scale-in">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto border border-emerald-100 dark:border-emerald-900/40 shadow-xs">
                  <CheckCircle size={32} />
                </div>

                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Password Reset Complete
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                    Your password has been successfully updated. You can now log in to your account.
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/login', { replace: true })}
                    className="w-full rounded-xl bg-[#164E87] hover:bg-[#123E6C] text-white py-3.5 sm:py-4 text-sm font-bold shadow-md transition active:scale-98 cursor-pointer"
                  >
                    Go to Login
                  </button>
                </div>
              </div>
            ) : (
              /* State 3: Reset Password Form */
              <div>
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 mx-auto mb-4 border border-sky-100 dark:border-sky-900/40 shadow-xs">
                  <KeyRound size={22} />
                </div>

                <div className="text-center space-y-1 mb-6">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Reset Password
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 font-medium">
                    {urlToken ? 'Please enter and confirm your new password.' : 'Enter your reset code or token and choose a new password.'}
                  </p>
                </div>

                {error && (
                  <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 p-3.5 text-xs sm:text-sm font-semibold text-rose-700 dark:text-rose-400 shadow-2xs animate-fade-in" role="alert">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <div className="flex-1 leading-relaxed">{error}</div>
                  </div>
                )}

                {tokenInvalid && (
                  <div className="mb-5 p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/70 dark:bg-amber-950/20 text-xs space-y-2">
                    <div className="font-semibold text-amber-900 dark:text-amber-200">
                      Need direct help from administrator?
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <a
                        href="https://t.me/raksa_bun?text=Hello%20Admin%2C%20I%20need%20assistance%20with%20my%20password%20reset%20on%20Mart%20System."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#229ED9] hover:bg-[#1e8cc0] text-white font-bold transition shadow-2xs"
                      >
                        <Send size={13} />
                        <span>Telegram Support</span>
                      </a>
                      <Link
                        to="/forgot-password"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-2xs"
                      >
                        <span>Request New Link</span>
                      </Link>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  {/* Reset Token Input (shown if no url token or user wants to edit) */}
                  {!urlToken && (
                    <div className="relative">
                      <KeyRound size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id="reset-token-input"
                        required
                        type="text"
                        disabled={submitting}
                        value={manualToken}
                        onChange={(e) => {
                          setManualToken(e.target.value);
                          if (error) setError('');
                        }}
                        placeholder="Paste Reset Token / Code"
                        aria-label="Reset Token or Code"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-[#FBFDFF] dark:bg-slate-800/70 py-3 sm:py-3.5 pl-11 pr-4 text-base sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition shadow-2xs disabled:opacity-60"
                      />
                    </div>
                  )}
                  {/* New Password */}
                  <div className="relative">
                    <Lock size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="reset-password-input"
                      required
                      autoFocus
                      type={showPassword ? 'text' : 'password'}
                      disabled={submitting}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="New Password (min. 6 characters)"
                      aria-label="New Password"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-[#FBFDFF] dark:bg-slate-800/70 py-3 sm:py-3.5 pl-11 pr-11 text-base sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition shadow-2xs disabled:opacity-60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition focus:outline-none cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="space-y-1.5 px-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Strength:</span>
                        <span className={`font-bold ${strength.textColor}`}>{strength.label}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-1">
                        <div className={`h-full flex-1 rounded-full transition-all ${strength.score >= 1 ? strength.color : 'bg-slate-200 dark:bg-slate-700'}`} />
                        <div className={`h-full flex-1 rounded-full transition-all ${strength.score >= 2 ? strength.color : 'bg-slate-200 dark:bg-slate-700'}`} />
                        <div className={`h-full flex-1 rounded-full transition-all ${strength.score >= 3 ? strength.color : 'bg-slate-200 dark:bg-slate-700'}`} />
                      </div>
                    </div>
                  )}

                  {/* Confirm Password */}
                  <div className="relative">
                    <Lock size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="reset-confirm-password-input"
                      required
                      type={showConfirmPassword ? 'text' : 'password'}
                      disabled={submitting}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm New Password"
                      aria-label="Confirm New Password"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-[#FBFDFF] dark:bg-slate-800/70 py-3 sm:py-3.5 pl-11 pr-11 text-base sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition shadow-2xs disabled:opacity-60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition focus:outline-none cursor-pointer"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Requirement & Match Status */}
                  <div className="space-y-1.5 text-xs px-1">
                    <div className={`flex items-center gap-2 ${hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                      <div className={`h-1.5 w-1.5 rounded-full ${hasMinLength ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                      <span>At least 6 characters</span>
                    </div>
                    {confirmPassword && (
                      <div className={`flex items-center gap-1.5 ${passwordsMatch ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-rose-500 font-semibold'}`}>
                        {passwordsMatch ? <Check size={14} /> : <X size={14} />}
                        <span>{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    id="reset-password-submit-button"
                    type="submit"
                    disabled={submitting || (confirmPassword && !passwordsMatch)}
                    className="w-full rounded-xl bg-[#164E87] hover:bg-[#123E6C] text-white py-3.5 sm:py-4 text-sm font-bold shadow-md transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2 mt-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Resetting...</span>
                      </>
                    ) : (
                      <span>Reset Password</span>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Bottom Link Back to Store */}
          <div className="text-center pt-4 sm:pt-0">
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
