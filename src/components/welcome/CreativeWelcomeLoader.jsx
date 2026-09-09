import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Package, ShoppingCart, CreditCard, QrCode, CheckCircle2,
  Sparkles, ArrowRight, ShieldCheck
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import './CreativeWelcomeLoader.css';

/**
 * CreativeWelcomeLoader (MartSystemIntro)
 *
 * Silky Smooth, Feel-Good Experience: "The System Comes Alive"
 *
 * Sequence:
 * 1. · (Glowing seed point)
 * 2. ◉ (Digital expanding circle)
 * 3. MART SYSTEM Logo & bilingual tagline blooms from center
 * 4. The System Flows: Product → Cart → Checkout → KHQR → ✓ Paid
 * 5. Smooth, luxurious dissolve into the real website
 *
 * Features for effortless, feel-good usability:
 * - Tap or click anywhere to enter immediately
 * - Press Escape, Space, or Enter to enter immediately
 * - Clean, spacious aesthetics with soft emerald halo
 * - Reliable playback on page visit/refresh
 */
export default function CreativeWelcomeLoader({ onFinish }) {
  const { isDark } = useTheme();
  const { isKhmer } = useLanguage();
  const { loading: authLoading } = useAuth();

  // Story step: 0 (point), 1 (ring), 2 (logo & brand), 3 (system flow), 4 (ready)
  const [step, setStep] = useState(0);
  const [activeNode, setActiveNode] = useState(-1);
  const [isExiting, setIsExiting] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);

  const minTimeElapsedRef = useRef(false);
  const isReducedMotion = useRef(
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ).current;

  // Gentle exit handler with smooth 750ms dissolve
  const handleDismiss = useCallback(() => {
    if (isExiting || hasDismissed) return;
    setIsExiting(true);

    setTimeout(() => {
      setHasDismissed(true);
      if (onFinish) onFinish();
    }, 750); // Matches mart-backdrop-exit animation duration
  }, [isExiting, hasDismissed, onFinish]);

  // Console helper for developer testing: window.__replayMartIntro()
  useEffect(() => {
    window.__replayMartIntro = () => {
      setHasDismissed(false);
      setIsExiting(false);
      setStep(0);
      setActiveNode(-1);
      minTimeElapsedRef.current = false;
    };
  }, []);

  // Keyboard accessibility: Escape, Space, Enter immediately glides into store
  useEffect(() => {
    if (hasDismissed || isExiting) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasDismissed, isExiting, handleDismiss]);

  // Silky Smooth Story Progression Timeline
  useEffect(() => {
    if (hasDismissed) return;

    if (isReducedMotion) {
      setStep(4);
      setActiveNode(4);
      minTimeElapsedRef.current = true;
      return;
    }

    // Step 1: Point expands into digital ring (0.4s)
    const t1 = setTimeout(() => setStep(1), 400);

    // Step 2: Logo and brand smoothly emerge (0.85s)
    const t2 = setTimeout(() => setStep(2), 850);

    // Step 3: System elements flow alive (1.4s)
    const t3 = setTimeout(() => {
      setStep(3);
      setActiveNode(0); // Product
    }, 1400);

    // Staggered node lights: Product -> Cart -> Checkout -> KHQR -> Paid
    const tNodes = [
      setTimeout(() => setActiveNode(1), 1650), // Cart
      setTimeout(() => setActiveNode(2), 1900), // Checkout
      setTimeout(() => setActiveNode(3), 2150), // KHQR
      setTimeout(() => {
        setActiveNode(4); // Paid & Verified
        setStep(4);
      }, 2400),
      setTimeout(() => {
        minTimeElapsedRef.current = true; // Hold completion state briefly
      }, 2850),
    ];

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      tNodes.forEach((t) => clearTimeout(t));
    };
  }, [hasDismissed, isReducedMotion]);

  // Synchronize seamlessly with application hydration
  useEffect(() => {
    if (hasDismissed || isExiting) return;

    const checkReadyInterval = setInterval(() => {
      if (minTimeElapsedRef.current && !authLoading) {
        handleDismiss();
        clearInterval(checkReadyInterval);
      }
    }, 60);

    // Safety fallback cap (4.2s) so the user is never delayed
    const maxCapTimer = setTimeout(() => {
      if (!isExiting) {
        handleDismiss();
      }
    }, 4200);

    return () => {
      clearInterval(checkReadyInterval);
      clearTimeout(maxCapTimer);
    };
  }, [hasDismissed, isExiting, authLoading, handleDismiss]);

  if (hasDismissed) {
    return null;
  }

  const nodes = [
    { id: 'product', icon: Package, km: 'ទំនិញ', en: 'Product' },
    { id: 'cart', icon: ShoppingCart, km: 'កន្ត្រក', en: 'Cart' },
    { id: 'checkout', icon: CreditCard, km: 'ទូទាត់', en: 'Checkout' },
    { id: 'khqr', icon: QrCode, km: 'KHQR', en: 'KHQR' },
    { id: 'paid', icon: CheckCircle2, km: 'ជោគជ័យ', en: 'Paid' },
  ];

  const welcomePrefix = isKhmer ? 'សូមស្វាគមន៍មកកាន់' : 'Welcome to';
  const tagline = isKhmer
    ? 'អាជីវកម្មឆ្លាតវៃ បទពិសោធន៍ងាយស្រួល។'
    : 'Smart Business. Simple Experience.';
  const enterPrompt = isKhmer ? 'ចុចទីនេះដើម្បីចូលហាង' : 'Tap anywhere to enter';

  return (
    <div
      onClick={handleDismiss}
      className={`fixed inset-0 z-9999 flex flex-col items-center justify-center select-none overflow-hidden cursor-pointer transition-all ${
        isExiting ? 'mart-backdrop-exit pointer-events-none' : ''
      } ${
        isDark
          ? 'bg-[#080d1a] text-slate-100'
          : 'bg-[#F8FAFC] text-slate-900'
      }`}
      style={{
        backgroundImage: isDark
          ? 'radial-gradient(ellipse at 50% 40%, rgba(16, 185, 129, 0.16) 0%, rgba(14, 165, 233, 0.06) 45%, rgba(8, 13, 26, 0.98) 78%)'
          : 'radial-gradient(ellipse at 50% 40%, rgba(16, 185, 129, 0.1) 0%, rgba(56, 189, 248, 0.04) 50%, rgba(248, 250, 252, 0.98) 82%)',
      }}
      aria-label="Mart System Welcome Experience"
      role="dialog"
      aria-modal="true"
      title="Click or tap anywhere to enter Mart System"
    >
      {/* Precision ambient grid lines */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Main Experience Content */}
      <div
        className={`relative flex flex-col items-center justify-center px-4 max-w-lg w-full z-10 transition-all ${
          isExiting ? 'mart-content-exit' : ''
        }`}
      >
        {/* Soft Ambient Ethereal Glow */}
        <div className="absolute -inset-10 bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-sky-500/20 rounded-full blur-3xl -z-10 opacity-70" />

        {/* -------------------------------------------------------------
            STAGE 0 & 1 & 2: Center Point → Pulse Ring → Logo Emergence
           ------------------------------------------------------------- */}
        <div className="relative flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 mb-4">
          {/* Step 0: The glowing genesis seed point */}
          {step === 0 && (
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 mart-genesis-dot shadow-[0_0_20px_#10b981]" />
          )}

          {/* Step 1+: Expanding digital circle */}
          {step >= 1 && step < 2 && (
            <div className="absolute inset-0 rounded-full border border-emerald-500/50 mart-genesis-ring" />
          )}

          {/* Step 2+: Real Mart System Logo emerges from center */}
          {step >= 2 && (
            <div className="relative mart-logo-enter flex items-center justify-center">
              {/* Soft background halo */}
              <div className="absolute -inset-2 rounded-2xl bg-gradient-to-tr from-emerald-500/40 to-teal-400/30 blur-md" />

              {/* Logo Card */}
              <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl p-1 bg-white/95 dark:bg-slate-800/95 shadow-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center overflow-hidden">
                <img
                  src="/mart.jpg"
                  alt="Mart System"
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>

              {/* Sparkle Badge */}
              <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-emerald-600 text-white text-[9px] font-extrabold flex items-center gap-0.5 shadow-sm uppercase tracking-wider">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Mart</span>
              </div>
            </div>
          )}
        </div>

        {/* -------------------------------------------------------------
            STAGE 2+: Brand Name & Bilingual Tagline
           ------------------------------------------------------------- */}
        {step >= 2 && (
          <div className="text-center mb-6 space-y-1 mart-text-enter">
            <span className="block text-[11px] sm:text-xs font-semibold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">
              {welcomePrefix}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              MART SYSTEM
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-xs mx-auto">
              {tagline}
            </p>
          </div>
        )}

        {/* -------------------------------------------------------------
            STAGE 3+: The System Flow ("Product → Cart → Checkout → KHQR → Paid")
           ------------------------------------------------------------- */}
        {step >= 3 && (
          <div className="w-full max-w-md mart-text-enter">
            <div className="mart-glass-pill rounded-2xl p-3.5 sm:p-4 transition-all">
              
              {/* Flow Track */}
              <div className="flex items-center justify-between relative">
                {/* Background track line */}
                <div className="absolute top-1/2 left-4 right-4 h-0.5 -translate-y-1/2 bg-slate-200/80 dark:bg-slate-800 z-0" />

                {/* Dynamic animated active energy line */}
                <div
                  className="absolute top-1/2 left-4 h-0.5 -translate-y-1/2 bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-400 z-0 transition-all duration-500 ease-out"
                  style={{
                    width: activeNode >= 0 ? `${(activeNode / 4) * 85}%` : '0%',
                  }}
                />

                {/* Nodes */}
                {nodes.map((node, index) => {
                  const Icon = node.icon;
                  const isActive = activeNode >= index;
                  const isCurrent = activeNode === index;

                  return (
                    <div
                      key={node.id}
                      className="relative z-10 flex flex-col items-center"
                    >
                      <div
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105'
                            : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                        } ${isCurrent ? 'ring-2 ring-emerald-400/80 ring-offset-2 dark:ring-offset-slate-900 animate-pulse' : ''}`}
                      >
                        <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                      </div>

                      <span
                        className={`mt-1.5 text-[10px] sm:text-[11px] font-semibold transition-colors duration-200 ${
                          isActive
                            ? 'text-slate-800 dark:text-slate-200 font-bold'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {isKhmer ? node.km : node.en}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Status Micro-Bar */}
              <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span>
                    {activeNode >= 4
                      ? isKhmer ? 'ហាងរួចរាល់ ចូលហាងឥឡូវនេះ...' : 'Platform ready • Entering store...'
                      : isKhmer ? 'ប្រព័ន្ធកំពុងដំណើរការ...' : 'Starting platform services...'}
                  </span>
                </div>

                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                  <span>{enterPrompt}</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Gentle Bottom Trust Footnote */}
      <div className="absolute bottom-4 sm:bottom-6 text-center text-[11px] text-slate-400 dark:text-slate-500 font-medium z-10 flex items-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>Authentic Quality • Fast Delivery • Bakong KHQR Checkout</span>
      </div>
    </div>
  );
}

// Named alias export as requested in requirements
export { CreativeWelcomeLoader as MartSystemIntro };
