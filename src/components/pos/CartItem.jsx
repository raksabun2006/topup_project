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
    <div className="group relative flex items-center gap-2.5 py-3 transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/50 -mx-2 px-2 rounded-xl border-b border-slate-100 dark:border-slate-800/80 last:border-0">
      {/* Product thumbnail */}
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 p-1 shadow-2xs">
        {product.imageUrl && !imageBroken ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-contain"
            onError={() => setImageBroken(true)}
          />
        ) : (
          <Package size={20} className="text-slate-400 dark:text-slate-500" />
        )}
      </div>

      {/* Product info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors" title={product.name}>
          {product.name}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
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
      <div className="flex shrink-0 items-center gap-1 bg-slate-100/80 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200/70 dark:border-slate-700">
        <button
          type="button"
          onClick={() => {
            if (quantity === 1) {
              onRemove(product.id);
            } else {
              onSetQuantity(product.id, quantity - 1);
            }
          }}
          className="flex h-6 w-6 items-center justify-center rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-2xs transition hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 dark:hover:text-rose-400 active:scale-90"
          title={quantity === 1 ? 'លុបទំនិញ' : 'បន្ថយចំនួន'}
          aria-label="Decrease quantity"
        >
          {quantity === 1 ? <Trash2 size={12} className="text-rose-500 dark:text-rose-400" /> : <Minus size={12} />}
        </button>

        <span className="w-5 text-center text-xs font-bold text-slate-800 dark:text-white select-none">
          {quantity}
        </span>

        <button
          type="button"
          onClick={() => onSetQuantity(product.id, quantity + 1)}
          disabled={atMaxStock}
          title={atMaxStock ? `ស្តុកអតិបរមា ${maxStock}` : 'បន្ថែមចំនួន'}
          className="flex h-6 w-6 items-center justify-center rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-2xs transition hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 dark:hover:text-emerald-400 active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Increase quantity"
        >
          <Plus size={12} />
        </button>
      </div>

      {/* Line Total */}
      <div className="w-16 shrink-0 text-right">
        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
          {formatCurrency(lineTotal)}
        </span>
      </div>

      {/* Quick remove button */}
      <button
        type="button"
        onClick={() => onRemove(product.id)}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 active:scale-95 sm:opacity-0 focus:opacity-100"
        title="លុបចេញ"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

