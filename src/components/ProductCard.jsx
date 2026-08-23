import { useState, useEffect } from 'react';
import { Package, Plus } from 'lucide-react';
import { formatCurrency } from '../utils/format';

/**
 * stockQuantity = 0 បិទប៊ូតុងបន្ថែម (backend នៅតែជាអ្នកសម្រេចចុងក្រោយ
 * ពេលបង្កើត sale ពិត - នេះគ្រាន់តែសម្រាប់ UX)។ imageUrl ជា optional -
 * bad link ធ្លាក់ត្រឡប់ទៅ icon ជំនួសវិញ។ cartQuantity ដកចេញពីស្តុកសរុប
 * ដើម្បីបង្ហាញស្តុកដែលនៅសល់ពិតប្រាកដ (មិនរាប់ចំនួនដែលរួចដាក់ក្នុងរទេះរួចហើយ)។
 */
export default function ProductCard({ product, onAdd, cartQuantity = 0 }) {
  const available = (product.stockQuantity ?? 0) - cartQuantity;
  const outOfStock = available <= 0;
  const [imageBroken, setImageBroken] = useState(false);

  useEffect(() => setImageBroken(false), [product.imageUrl]);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-ink-900 shadow-sm transition hover:border-emerald-500/40 hover:shadow-md">
      <div className="flex aspect-square items-center justify-center bg-ink-950">
        {product.imageUrl && !imageBroken ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
            onError={() => setImageBroken(true)}
          />
        ) : (
          <Package size={32} className="text-emerald-900/60" />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="line-clamp-2 text-sm font-semibold text-slate-900">{product.name}</p>
        {product.sku && <p className="text-xs text-slate-500">SKU: {product.sku}</p>}

        <div className="mt-1 flex items-center justify-between">
          <span className="text-base font-bold text-emerald-600">
            {formatCurrency(product.price)}
          </span>
          <span className={`text-xs font-medium ${outOfStock ? 'text-rose-700' : 'text-slate-500'}`}>
            ស្តុក: {Math.max(0, available)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onAdd(product)}
          disabled={outOfStock}
          className="mt-2 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-600 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-emerald-500 hover:to-emerald-500 disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-700 disabled:opacity-60"
        >
          <Plus size={16} />
          {outOfStock ? 'អស់ស្តុក' : 'បន្ថែម'}
        </button>
      </div>
    </div>
  );
}
