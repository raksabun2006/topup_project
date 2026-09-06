import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * ThemeToggle Component
 * Sleek toggle button for switching between Light and Dark mode.
 */
export default function ThemeToggle({ className = '', showLabel = false }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`group relative items-center justify-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all duration-200 active:scale-95 cursor-pointer shadow-2xs ${
        showLabel ? 'px-3 py-1.5 text-xs font-bold inline-flex' : 'h-8.5 w-8.5 p-0'
      } ${className ? className : 'inline-flex'}`}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <div className="relative flex items-center justify-center">
        {isDark ? (
          <Sun size={16} className="text-amber-400 transition-transform duration-300 rotate-0 group-hover:rotate-45" />
        ) : (
          <Moon size={16} className="text-slate-700 dark:text-slate-300 transition-transform duration-300 -rotate-12 group-hover:rotate-0" />
        )}
      </div>

      {showLabel && (
        <span className="text-[11px] font-bold">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
}
