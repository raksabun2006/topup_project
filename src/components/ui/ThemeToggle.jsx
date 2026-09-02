import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Icon-only Theme Toggle Button.
 * Strictly no emojis and no text labels.
 * Provides accessible keyboard focus and smooth icon micro-transitions.
 */
export default function ThemeToggle({ className = '', variant = 'navbar' }) {
  const { isDark, toggleTheme } = useTheme();

  const baseStyles =
    'relative inline-flex items-center justify-center rounded-full transition-all duration-200 outline-none select-none active:scale-95 cursor-pointer';

  const variants = {
    // In emerald navbar (white-tinted buttons)
    navbar:
      'h-10 w-10 text-white/90 hover:bg-white/15 hover:text-white focus-visible:ring-2 focus-visible:ring-white/50 active:bg-white/20',
    // In Admin dashboard header / neutral headers
    admin:
      'h-9 w-9 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white active:bg-slate-200 dark:active:bg-slate-700 focus-visible:ring-2 focus-visible:ring-emerald-500',
    // In login/register or standalone pages
    floating:
      'h-10 w-10 text-slate-600 dark:text-slate-300 bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md backdrop-blur-xs focus-visible:ring-2 focus-visible:ring-emerald-500',
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`${baseStyles} ${variants[variant] || variants.navbar} ${className}`}
      aria-label={isDark ? 'ប្តូរទៅ Light Mode (Switch to Light Mode)' : 'ប្តូរទៅ Dark Mode (Switch to Dark Mode)'}
      title={isDark ? 'ប្តូរទៅ Light Mode' : 'ប្តូរទៅ Dark Mode'}
    >
      <span className="sr-only">
        {isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      </span>
      {isDark ? (
        <Sun size={19} className="transition-transform duration-300 rotate-0 hover:rotate-45 text-amber-400" />
      ) : (
        <Moon size={19} className="transition-transform duration-300 -rotate-12 hover:rotate-0" />
      )}
    </button>
  );
}
