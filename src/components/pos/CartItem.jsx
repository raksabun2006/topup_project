import { useState, useEffect } from 'react';
import { Minus, Plus, Trash2, Package, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

export default function CartItem({ item, onSetQuantity, onRemove }) {
  const { product, quantity } = item;
  const lineTotal = product.price * quantity - (item.discount || 0);
  const maxStock = product.stockQuantity ?? Infinity;
  const atMaxStock = quantity >= maxStock;
  const [imageBroken, setImageBroken] = useState(false);

  useEffect(() => setImageBroken(false), [product.imageUrl]);

  return (
    <div className="group relative flex items-center gap-2.5 py-2.5 sm:py-3 transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/60 -mx-1.5 px-2 rounded-xl border-b border-slate-100 dark:border-slate-800/80 last:border-0">
      {/* Product thumbnail */}
      <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 p-1 shadow-2xs">
        {product.imageUrl && !imageBroken ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-contain"
            onError={() => setImageBroken(true)}
          />
        ) : (
          <Package size={18} className="text-slate-400 dark:text-slate-500" />
        )}
      </div>

      {/* Product info (Receipt Style) */}
      <div className="min-w-0 flex-1">
        <h4
          className="truncate text-xs sm:text-[13px] font-bold text-[#172033] dark:text-slate-100 leading-tight"
          title={product.name}
        >
          {product.name}
        </h4>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[11px] font-medium text-[#667085] dark:text-slate-400">
            {formatCurrency(product.price)}
          </span>
          {atMaxStock && (
            <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 px-1 py-0.2 text-[9px] font-semibold text-amber-700 dark:text-amber-400">
              <AlertCircle size={10} /> អតិបរមា
            </span>
          )}
        </div>
      </div>

      {/* Touch-friendly Quantity selector */}
      <div className="flex shrink-0 items-center gap-1 bg-slate-100/90 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200/70 dark:border-slate-700">
        <button
          type="button"
          onClick={() => {
            if (quantity === 1) {
              onRemove(product.id);
            } else {
              onSetQuantity(product.id, quantity - 1);
            }
          }}
          className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-2xs transition hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 dark:hover:text-rose-400 active:scale-90 cursor-pointer"
          title={quantity === 1 ? 'លុបទំនិញ' : 'បន្ថយចំនួន'}
          aria-label="Decrease quantity"
        >
          {quantity === 1 ? <Trash2 size={12} className="text-rose-500" /> : <Minus size={12} />}
        </button>

        <span className="w-5 sm:w-6 text-center text-xs font-bold text-[#172033] dark:text-white select-none">
          {quantity}
        </span>

        <button
          type="button"
          onClick={() => onSetQuantity(product.id, quantity + 1)}
          disabled={atMaxStock}
          title={atMaxStock ? `ស្តុកអតិបរមា ${maxStock}` : 'បន្ថែមចំនួន'}
          className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-2xs transition hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-[#009F6B] dark:hover:text-emerald-400 active:scale-90 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
          aria-label="Increase quantity"
        >
          <Plus size={12} />
        </button>
      </div>

      {/* Line Total */}
      <div className="w-16 sm:w-20 shrink-0 text-right">
        <span className="text-xs sm:text-[13px] font-black text-[#009F6B] dark:text-emerald-400">
          {formatCurrency(lineTotal)}
        </span>
      </div>

      {/* Quick remove button */}
      <button
        type="button"
        onClick={() => onRemove(product.id)}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-300 dark:text-slate-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 active:scale-95 transition cursor-pointer"
        title="លុបចេញ"
        aria-label="Remove item"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

