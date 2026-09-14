import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  Monitor,
  Maximize,
  Minimize,
  LogOut,
  Clock,
  Coins,
  History,
  Barcode,
  ReceiptText,
  ExternalLink,
  Eye,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import { KHR_RATE } from '../../utils/format';

export default function PosHeader({
  heldCount = 0,
  onOpenHeld,
  onOpenHistory,
  onFocusSearch,
  onToggleCustomerPreview,
  customerDisplayConnected = false,
}) {
  const { user, isAdmin } = useAuth();
  const { isKhmer } = useLanguage();
  const [time, setTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDisplayMenu, setShowDisplayMenu] = useState(false);

  // Live real-time clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Listen for fullscreen change
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // ignore
    }
  };

  const handleOpenSecondaryDisplay = () => {
    setShowDisplayMenu(false);
    const win = window.open(
      '/pos/customer-display',
      'MartCustomerDisplay',
      'width=1024,height=768,menubar=no,toolbar=no,location=no,status=no'
    );
    if (win) {
      win.focus();
    }
  };

  const timeFormatted = time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const dateFormatted = time.toLocaleDateString('km-KH', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="relative z-20 flex h-14 sm:h-15 w-full shrink-0 items-center justify-between border-b border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-3 sm:px-4 backdrop-blur-md shadow-xs select-none">
      {/* Left: Store Logo, Register #, Cashier Badge */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
        <Link
          to="/"
          className="flex items-center gap-2 font-black text-slate-900 dark:text-white transition hover:opacity-85"
          title="Mart System POS"
        >
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-500/20">
            <Store size={20} className="sm:size-22" />
          </div>
          <div className="hidden sm:block leading-none">
            <span className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">
              Mart System
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Register #01
              </span>
            </div>
          </div>
        </Link>

        {/* Cashier Info Pill */}
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/80 py-1 px-2 sm:px-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-[11px] font-black text-emerald-800 dark:text-emerald-300">
            {(user?.name || user?.username || 'C')[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="max-w-[80px] sm:max-w-[120px] truncate text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
              {user?.name || user?.username || 'បុគ្គលិក'}
            </p>
            <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase leading-none">
              {isAdmin ? 'Admin' : 'Cashier'}
            </p>
          </div>
        </div>
      </div>

      {/* Center: Live Digital Clock & Cambodian Exchange Rate */}
      <div className="hidden md:flex items-center gap-2 lg:gap-3">
        {/* Exchange Rate Badge */}
        <div
          className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-50/80 dark:bg-emerald-950/40 px-3 py-1 text-emerald-800 dark:text-emerald-300 shadow-2xs"
          title="អត្រាប្តូរប្រាក់ស្ដង់ដារក្នុងហាង"
        >
          <Coins size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-xs font-bold font-mono">
            $1 = {KHR_RATE.toLocaleString()} ៛
          </span>
        </div>

        {/* Live Clock */}
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/90 px-3 py-1 text-slate-700 dark:text-slate-300">
          <Clock size={13} className="text-slate-400 shrink-0" />
          <span className="font-mono text-xs font-bold tracking-tight">
            {timeFormatted}
          </span>
          <span className="text-[11px] text-slate-400">·</span>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {dateFormatted}
          </span>
        </div>
      </div>

      {/* Right: Quick POS Actions & Customer Display Menu */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Customer Display Button with dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDisplayMenu(!showDisplayMenu)}
            className={`flex items-center gap-1.5 rounded-xl border py-1.5 px-2.5 sm:px-3 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-2xs ${
              customerDisplayConnected
                ? 'border-emerald-500 bg-emerald-500 text-white shadow-emerald-500/20'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
            title={isKhmer ? 'គ្រប់គ្រងអេក្រង់បង្ហាញអតិថិជន (Customer Display)' : 'Customer-Facing Display Control'}
          >
            <Monitor size={15} className={customerDisplayConnected ? 'animate-pulse' : ''} />
            <span className="hidden sm:inline">{isKhmer ? 'អេក្រង់អតិថិជន' : 'Customer Display'}</span>
            <ChevronDown size={12} className="opacity-70" />
          </button>

          {showDisplayMenu && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowDisplayMenu(false)} />
              <div className="absolute right-0 z-40 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-2xl animate-scale-in">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                    {isKhmer ? 'អេក្រង់អតិថិជន (Customer Display)' : 'Customer Display'}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {isKhmer ? 'បង្ហាញទំនិញ តម្លៃ និង Bakong QR ជូនអតិថិជន' : 'Show items, totals, and Bakong QR to customers'}
                  </p>
                </div>

                <div className="py-1 space-y-0.5">
                  <button
                    type="button"
                    onClick={handleOpenSecondaryDisplay}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-400 transition cursor-pointer"
                  >
                    <ExternalLink size={14} className="text-emerald-600 shrink-0" />
                    <div>
                      <span>{isKhmer ? 'បើកអេក្រង់ទី ២ (Popout Window)' : 'Open Secondary Display Window'}</span>
                      <span className="block text-[10px] font-normal text-slate-400">
                        {isKhmer ? 'សម្រាប់ដាក់លើ Monitor ទី២ ឬ Tablet អតិថិជន' : 'For 2nd monitor or customer-facing tablet'}
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowDisplayMenu(false);
                      if (onToggleCustomerPreview) onToggleCustomerPreview();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    <Eye size={14} className="text-blue-500 shrink-0" />
                    <div>
                      <span>{isKhmer ? 'មើលសាកល្បងលើអេក្រង់នេះ (Preview)' : 'Preview On This Screen'}</span>
                      <span className="block text-[10px] font-normal text-slate-400">
                        {isKhmer ? 'បើកផ្ទាំងតូចដើម្បីពិនិត្យអ្វីដែលអតិថិជនឃើញ' : 'Floating preview of customer display'}
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Scan Barcode shortcut button (F2) */}
        {onFocusSearch && (
          <button
            type="button"
            onClick={onFocusSearch}
            className="hidden sm:flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
            title={isKhmer ? 'ស្វែងរកទំនិញ / ស្កេនបាកូដ (F2)' : 'Scan Barcode / Search Item (F2)'}
          >
            <Barcode size={14} className="text-emerald-600" />
            <span>{isKhmer ? 'ស្កេន (F2)' : 'Scan (F2)'}</span>
          </button>
        )}

        {/* Held orders button (F6) */}
        {onOpenHeld && heldCount > 0 && (
          <button
            type="button"
            onClick={onOpenHeld}
            className="relative flex items-center gap-1 rounded-xl border border-amber-400/80 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition cursor-pointer"
            title={isKhmer ? 'ការលក់ដែលផ្អាកទុក (F6)' : 'Held Orders (F6)'}
          >
            <History size={14} className="text-amber-600" />
            <span>{isKhmer ? 'រង់ចាំ' : 'Held'}</span>
            <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-black text-white">
              {heldCount}
            </span>
          </button>
        )}

        {/* History / Orders button (F7) */}
        {onOpenHistory && (
          <button
            type="button"
            onClick={onOpenHistory}
            className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
            title={isKhmer ? 'ប្រវត្តិវិក្កយបត្រ (Sales History)' : 'Sales History (F7)'}
          >
            <ReceiptText size={14} className="text-slate-500" />
            <span className="hidden md:inline">{isKhmer ? 'វិក្កយបត្រ' : 'History'}</span>
          </button>
        )}

        {/* Language Switcher in POS */}
        <div className="shrink-0">
          <LanguageSwitcher variant="button" />
        </div>

        {/* Fullscreen Toggle (F11) */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="hidden sm:flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
          title={isFullscreen ? (isKhmer ? 'ចេញពីពេញអេក្រង់' : 'Exit Fullscreen') : (isKhmer ? 'ពេញអេក្រង់' : 'Fullscreen')}
        >
          {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
        </button>

        {/* Exit to Store / Dashboard */}
        <Link
          to={isAdmin ? '/dashboard' : '/shop'}
          className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
          title={isKhmer ? 'ត្រឡប់ទៅផ្ទាំងដើម / ហាង' : 'Return to Dashboard / Store'}
        >
          <LogOut size={14} />
          <span className="hidden lg:inline">{isAdmin ? (isKhmer ? 'ផ្ទាំងគ្រប់គ្រង' : 'Dashboard') : (isKhmer ? 'ហាងទំនិញ' : 'Store')}</span>
        </Link>
      </div>
    </header>
  );
}
