import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Loader2, AlertCircle, Mail, CheckCircle2,
  ShoppingBag, ArrowLeft, Send, RefreshCw
} from 'lucide-react';
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

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (submitting || cooldown > 0) return;

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await authApi.forgotPassword({ email: trimmedEmail });
      setSubmittedEmail(trimmedEmail);
      setSubmitted(true);
      setCooldown(60);
    } catch (err) {
      const status = err.status || err.response?.status;
      const backendMessage = err.response?.data?.message;

      if (!err.response) {
        setError(getErrorMessage(err));
      } else if (status >= 500) {
        setError('Server is temporarily busy. Please try again later.');
      } else if (status === 429) {
        setError('Too many requests. Please wait a moment before trying again.');
      } else if (backendMessage && typeof backendMessage === 'string' && !backendMessage.toLowerCase().includes('internal')) {
        setError(backendMessage);
      } else {
        // Fallback for security enumeration standard
        setSubmittedEmail(trimmedEmail);
        setSubmitted(true);
        setCooldown(60);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditEmail = () => {
    setSubmitted(false);
    setError('');
  };

  return (
    <div className="relative min-h-screen w-full bg-white dark:bg-slate-950 font-sans flex flex-col justify-between overflow-x-hidden">
      <SEO title="Forgot Password | Mart System" canonical="/forgot-password" robots="noindex, nofollow" />

      {/* Main Full-Screen Grid */}
      <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Side: Brand Showcase (Hidden on small screens, full height on desktop) */}
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
                Secure Account Recovery
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <CheckCircle2 size={15} />
                  </div>
                  <span>Instant one-time password reset link</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <CheckCircle2 size={15} />
                  </div>
                  <span>Secure token expiration protection</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <CheckCircle2 size={15} />
                  </div>
                  <span>End-to-end encrypted credentials</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 mt-8 border-t border-slate-200/70 dark:border-slate-800 text-xs font-medium text-slate-400">
            © {new Date().getFullYear()} {env.appName || 'Mart System'}. All rights reserved.
          </div>
        </div>

        {/* Right Side: Form or Success Confirmation */}
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
            {submitted ? (
              /* Success State */
              <div className="text-center space-y-4 animate-scale-in">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto border border-emerald-100 dark:border-emerald-900/40 shadow-xs">
                  <Mail size={30} />
                </div>

                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Check your email
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                    We've requested a password reset link for:
                  </p>
                  <div className="inline-block px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-bold break-all border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                    {submittedEmail || email}
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium pt-1">
                    Click the link in your email to set a new password. Check your <span className="font-semibold text-slate-700 dark:text-slate-300">Spam or Junk</span> folder if you don't see it within a few minutes.
                  </p>
                </div>

                {/* Quick Mail Shortcuts & Support Fallback */}
                <div className="pt-2 space-y-2.5">
                  <a
                    href="https://mail.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 text-xs sm:text-sm font-bold shadow-sm hover:opacity-90 transition cursor-pointer"
                  >
                    <Mail size={15} />
                    <span>Open Gmail Inbox</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting || cooldown > 0}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <RefreshCw size={15} />
                    )}
                    <span>
                      {cooldown > 0 ? `Resend email in ${cooldown}s` : 'Resend Email'}
                    </span>
                  </button>

                  <div className="p-3.5 rounded-xl border border-sky-100 dark:border-sky-900/40 bg-sky-50/60 dark:bg-sky-950/20 text-left space-y-2">
                    <p className="text-xs font-semibold text-sky-900 dark:text-sky-200">
                      Didn't receive an email or have a reset code?
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <a
                        href={`https://t.me/raksa_bun?text=${encodeURIComponent(`Hello Support, I need help resetting my password for my account (${submittedEmail || email}) on Mart System.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#229ED9] hover:bg-[#1e8cc0] text-white text-xs font-bold transition shadow-2xs"
                      >
                        <Send size={13} />
                        <span>Telegram Support</span>
                      </a>
                      <Link
                        to="/reset-password"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-2xs"
                      >
                        <span>Enter Reset Code</span>
                      </Link>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleEditEmail}
                    className="w-full text-center text-xs sm:text-sm font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 py-1 transition cursor-pointer"
                  >
                    Entered wrong email? Try a different address
                  </button>

                  <Link
                    to="/login"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#164E87] hover:bg-[#123E6C] py-3 text-xs sm:text-sm font-bold text-white shadow-md transition active:scale-98 mt-1"
                  >
                    <span>Return to Login</span>
                  </Link>
                </div>
              </div>
            ) : (
              /* Input Form */
              <div>
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 mx-auto mb-4 border border-sky-100 dark:border-sky-900/40 shadow-xs">
                  <Mail size={22} />
                </div>

                <div className="text-center space-y-1 mb-6">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Forgot Password
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 font-medium">
                    Enter your email and we'll send you a password reset link.
                  </p>
                </div>

                {error && (
                  <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 p-3.5 text-xs sm:text-sm font-semibold text-rose-700 dark:text-rose-400 shadow-2xs animate-fade-in" role="alert">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <div className="flex-1 leading-relaxed">{error}</div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div className="relative">
                    <Mail size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="forgot-password-email"
                      required
                      type="email"
                      autoFocus
                      disabled={submitting}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="Enter your registered email"
                      aria-label="Registered Email"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-[#FBFDFF] dark:bg-slate-800/70 py-3 sm:py-3.5 pl-11 pr-4 text-base sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition shadow-2xs disabled:opacity-60"
                    />
                  </div>

                  <button
                    id="forgot-password-submit-button"
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-xl bg-[#164E87] hover:bg-[#123E6C] text-white py-3.5 sm:py-4 text-sm font-bold shadow-md transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2 mt-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Sending Link...</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Send Reset Link</span>
                      </>
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
