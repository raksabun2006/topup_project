import { useState, useRef, useEffect } from 'react';
import { Search, X, Hash } from 'lucide-react';

/**
 * BarcodeInput Component
 * Clean manual barcode input form for devices without cameras or manual corrections.
 */
export default function BarcodeInput({ onSubmit, onCancel, isSearching = false }) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    // Auto-focus input on mount
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = value.trim();
    if (!code || isSearching) return;
    onSubmit(code);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="manual-barcode-input"
          className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
        >
          វាយបញ្ចូលលេខ Barcode ឬ SKU (Enter Barcode / SKU)
        </label>
        <div className="relative flex items-center rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-1 focus-within:border-emerald-500 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-emerald-500/20 transition">
          <Hash size={18} className="text-slate-400 shrink-0" />
          <input
            id="manual-barcode-input"
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={isSearching}
            placeholder="ឧទាហរណ៍៖ 8851234567890..."
            className="w-full bg-transparent px-2.5 py-2.5 text-sm sm:text-base font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
          />
          {value && !isSearching && (
            <button
              type="button"
              onClick={() => {
                setValue('');
                inputRef.current?.focus();
              }}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2.5 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSearching}
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 transition active:scale-[0.98] cursor-pointer"
          >
            បោះបង់ (Cancel)
          </button>
        )}
        <button
          type="submit"
          disabled={!value.trim() || isSearching}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-500 transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          <Search size={16} />
          <span>{isSearching ? 'កំពុងស្វែងរក...' : 'ស្វែងរក & បន្ថែម (Search)'}</span>
        </button>
      </div>
    </form>
  );
}
