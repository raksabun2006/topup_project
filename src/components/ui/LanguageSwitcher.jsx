import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export function KhmerFlag({ size = 16, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 rounded-xs overflow-hidden shadow-2xs ${className}`}
    >
      <rect width="32" height="24" fill="#032EA6" />
      <rect y="6" width="32" height="12" fill="#E00025" />
      {/* Angkor Wat Simplified Icon */}
      <path
        d="M16 8l-1.5 3h3L16 8zm-4 3l-1.2 2.5h2.4L12 11zm8 0l-1.2 2.5h2.4L20 11zM10 15h12v1.5H10V15zm1-3.5h10v2H11v-2z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function EnglishFlag({ size = 16, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 rounded-xs overflow-hidden shadow-2xs ${className}`}
    >
      <rect width="32" height="24" fill="#012169" />
      <path d="M0 0l32 24m0-24L0 24" stroke="#FFFFFF" strokeWidth="4" />
      <path d="M0 0l32 24m0-24L0 24" stroke="#C8102E" strokeWidth="2" />
      <path d="M16 0v24M0 12h32" stroke="#FFFFFF" strokeWidth="6" />
      <path d="M16 0v24M0 12h32" stroke="#C8102E" strokeWidth="3.5" />
    </svg>
  );
}

export default function LanguageSwitcher({ className = '', showLabel = false, variant = 'button' }) {
  const { language, setLanguage, toggleLanguage, isKhmer } = useLanguage();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  if (variant === 'segmented') {
    return (
      <div className={`inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 ${className}`}>
        <button
          type="button"
          onClick={() => setLanguage('km')}
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black transition-all cursor-pointer ${
            isKhmer
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <KhmerFlag size={14} />
          <span>ខ្មែរ</span>
        </button>
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black transition-all cursor-pointer ${
            !isKhmer
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <EnglishFlag size={14} />
          <span>EN</span>
        </button>
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`group relative inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all duration-200 active:scale-95 cursor-pointer shadow-2xs ${
          showLabel ? 'px-3 py-1.5 text-xs font-bold' : 'h-8.5 px-2.5'
        } ${className}`}
        aria-label="Switch Language"
        title="Switch Language / ប្តូរភាសា"
      >
        <div className="flex items-center gap-1.5">
          {isKhmer ? <KhmerFlag size={15} /> : <EnglishFlag size={15} />}
          <span className="text-[11px] font-black uppercase tracking-wide">
            {isKhmer ? 'ខ្មែរ' : 'EN'}
          </span>
        </div>
        <ChevronDown size={11} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-36 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden z-50 animate-scale-in p-1 space-y-0.5">
          <button
            type="button"
            onClick={() => {
              setLanguage('km');
              setOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition cursor-pointer ${
              isKhmer
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2">
              <KhmerFlag size={16} />
              <span>ភាសាខ្មែរ</span>
            </div>
            {isKhmer && <Check size={14} className="text-emerald-600 dark:text-emerald-400" />}
          </button>

          <button
            type="button"
            onClick={() => {
              setLanguage('en');
              setOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition cursor-pointer ${
              !isKhmer
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2">
              <EnglishFlag size={16} />
              <span>English</span>
            </div>
            {!isKhmer && <Check size={14} className="text-emerald-600 dark:text-emerald-400" />}
          </button>
        </div>
      )}
    </div>
  );
}
