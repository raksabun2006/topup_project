import { Check } from 'lucide-react';
import { formatCurrency } from '../utils/format';

/**
 * ប្រើក្នុងទាំង GameDetails (ចុចដើម្បីទៅ TopUp) និង TopUp
 * (ចុចដើម្បីជ្រើសរើសនៅក្នុងទំព័រតែមួយ) - ដូច្នេះ style ត្រូវតែដូចគ្នា
 * នឹង card ហ្គេមក្នុង Games.jsx (rounded-2xl, border-purple-900/30, shadow-sm)។
 */
export default function ProductCard({ product, selected = false, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative flex flex-col items-start gap-1.5 rounded-2xl border p-4 text-left shadow-sm transition ${
        selected
          ? 'border-purple-500 bg-purple-950/40 ring-1 ring-purple-500'
          : 'border-purple-900/30 bg-ink-900 hover:border-purple-500/50 hover:shadow-md'
      }`}
    >
      {selected && (
        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white">
          <Check size={12} />
        </span>
      )}
      <p className="pr-6 text-sm font-semibold text-white">{product.name}</p>
      <p className="text-xs text-slate-500">{product.amount} Units</p>
      <p className="mt-1 text-base font-bold text-purple-400">
        {formatCurrency(product.price, product.currency)}
      </p>
    </button>
  );
}
