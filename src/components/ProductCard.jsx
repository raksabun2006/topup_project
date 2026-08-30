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
    <div
      onClick={() => !outOfStock && onAdd(product)}
      className={`group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs transition-all duration-150 ${
        outOfStock
          ? 'cursor-not-allowed opacity-60'
          : 'cursor-pointer hover:-translate-y-0.5 hover:border-emerald-500/50 hover:shadow-md'
      }`}
    >
      <div className="flex aspect-[4/3] items-center justify-center bg-slate-50/80 p-2 overflow-hidden">
        {product.imageUrl && !imageBroken ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
            onError={() => setImageBroken(true)}
          />
        ) : (
          <Package size={22} className="text-slate-300" />
        )}
      </div>

      <div className="flex flex-1 flex-col p-2 sm:p-2.5">
        <p
          className="line-clamp-1 text-xs font-semibold text-slate-800 transition-colors group-hover:text-emerald-600"
          title={product.name}
        >
          {product.name}
        </p>
        <p className="truncate text-[10px] text-slate-400">
          {product.sku ? `SKU: ${product.sku}` : '\u00A0'}
        </p>

        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="text-xs font-bold text-emerald-600 sm:text-sm">
            {formatCurrency(product.price)}
          </span>
          <span
            className={`text-[10px] font-medium ${
              outOfStock ? 'text-rose-600' : 'text-slate-400'
            }`}
          >
            ស្តុក: {Math.max(0, available)}
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAdd(product);
          }}
          disabled={outOfStock}
          className="mt-1.5 flex h-7 items-center justify-center gap-1 rounded-lg bg-emerald-600 px-2 text-xs font-medium text-white transition hover:bg-emerald-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:opacity-60"
        >
          <Plus size={13} />
          <span>{outOfStock ? 'អស់ស្តុក' : 'បន្ថែម'}</span>
        </button>
      </div>
    </div>
  );
}
