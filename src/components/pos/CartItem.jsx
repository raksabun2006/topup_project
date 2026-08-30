import { useState, useEffect } from 'react';
import { Minus, Plus, Trash2, Package } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

export default function CartItem({ item, onSetQuantity, onRemove }) {
  const { product, quantity } = item;
  const lineTotal = product.price * quantity - (item.discount || 0);
  const atMaxStock = quantity >= (product.stockQuantity ?? Infinity);
  const [imageBroken, setImageBroken] = useState(false);

  useEffect(() => setImageBroken(false), [product.imageUrl]);

  return (
    <div className="flex items-center gap-2.5 py-3 border-b border-slate-100 last:border-0">
      {/* Delete button */}
      <button
        type="button"
        onClick={() => onRemove(product.id)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-300 transition hover:bg-rose-50 hover:text-rose-600 active:scale-95"
        title="លុបចេញ"
      >
        <Trash2 size={16} />
      </button>

      {/* Product thumbnail */}
      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50 p-1">
        {product.imageUrl && !imageBroken ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-contain"
            onError={() => setImageBroken(true)}
          />
        ) : (
          <Package size={20} className="text-slate-300" />
        )}
      </div>

      {/* Product info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-slate-900" title={product.name}>
          {product.name}
        </p>
        <p className="text-[11px] font-medium text-slate-500">
          {formatCurrency(product.price)}
        </p>
      </div>

      {/* Touch-friendly Quantity selector */}
      <div className="flex shrink-0 items-center gap-1.5 bg-slate-50 rounded-full p-0.5 border border-slate-200">
        <button
          type="button"
          onClick={() => onSetQuantity(product.id, quantity - 1)}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-700 shadow-xs transition hover:bg-slate-100 active:scale-90"
          aria-label="Decrease quantity"
        >
          <Minus size={13} />
        </button>
        <span className="w-6 text-center text-xs font-bold text-slate-900">{quantity}</span>
        <button
          type="button"
          onClick={() => onSetQuantity(product.id, quantity + 1)}
          disabled={atMaxStock}
          title={atMaxStock ? 'លើសស្តុកដែលមាន' : undefined}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-700 shadow-xs transition hover:bg-slate-100 active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Increase quantity"
        >
          <Plus size={13} />
        </button>
      </div>

      {/* Line Total */}
      <span className="w-16 shrink-0 text-right text-xs font-bold text-emerald-600">
        {formatCurrency(lineTotal)}
      </span>
    </div>
  );
}
