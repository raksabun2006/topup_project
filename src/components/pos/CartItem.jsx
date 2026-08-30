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
    <div className="flex items-center gap-2.5 py-2.5">
      <button
        onClick={() => onRemove(product.id)}
        className="shrink-0 text-slate-300 transition hover:text-rose-600"
        title="លុបចេញ"
      >
        <Trash2 size={15} />
      </button>

      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-slate-50 p-1">
        {product.imageUrl && !imageBroken ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-contain"
            onError={() => setImageBroken(true)}
          />
        ) : (
          <Package size={18} className="text-slate-300" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-slate-800" title={product.name}>
          {product.name}
        </p>
        <p className="text-[11px] text-slate-400">
          {formatCurrency(product.price)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          onClick={() => onSetQuantity(product.id, quantity - 1)}
          className="flex h-6 w-6 items-center justify-center rounded-full border border-emerald-600 text-emerald-600 transition hover:bg-emerald-50"
        >
          <Minus size={11} />
        </button>
        <span className="w-5 text-center text-xs font-bold text-slate-800">{quantity}</span>
        <button
          onClick={() => onSetQuantity(product.id, quantity + 1)}
          disabled={atMaxStock}
          title={atMaxStock ? 'លើសស្តុកដែលមាន' : undefined}
          className="flex h-6 w-6 items-center justify-center rounded-full border border-emerald-600 text-emerald-600 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
        >
          <Plus size={11} />
        </button>
      </div>

      <span className="w-14 shrink-0 text-right text-xs font-bold text-slate-800">
        {formatCurrency(lineTotal)}
      </span>
    </div>
  );
}
