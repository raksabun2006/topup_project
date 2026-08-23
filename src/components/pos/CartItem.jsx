import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

export default function CartItem({ item, onSetQuantity, onRemove }) {
  const { product, quantity } = item;
  const lineTotal = product.price * quantity - (item.discount || 0);
  const atMaxStock = quantity >= (product.stockQuantity ?? Infinity);

  return (
    <div className="flex items-center gap-3 py-3">
      <button
        onClick={() => onRemove(product.id)}
        className="shrink-0 text-slate-400 transition hover:text-rose-600"
      >
        <Trash2 size={16} />
      </button>

      <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">{product.name}</p>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          onClick={() => onSetQuantity(product.id, quantity - 1)}
          className="flex h-6 w-6 items-center justify-center rounded-full border border-emerald-600 text-emerald-600 transition hover:bg-emerald-50"
        >
          <Minus size={12} />
        </button>
        <span className="w-5 text-center text-sm font-semibold text-slate-900">{quantity}</span>
        <button
          onClick={() => onSetQuantity(product.id, quantity + 1)}
          disabled={atMaxStock}
          title={atMaxStock ? 'លើសស្តុកដែលមាន' : undefined}
          className="flex h-6 w-6 items-center justify-center rounded-full border border-emerald-600 text-emerald-600 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-300"
        >
          <Plus size={12} />
        </button>
      </div>

      <span className="w-16 shrink-0 text-right text-sm font-semibold text-slate-900">
        {formatCurrency(lineTotal)}
      </span>
    </div>
  );
}
