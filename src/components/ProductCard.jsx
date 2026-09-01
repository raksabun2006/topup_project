import { useState, useEffect } from 'react';
import { Package, Plus, Check } from 'lucide-react';
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
      className={`group relative flex flex-col overflow-hidden rounded-xl border bg-white dark:bg-slate-900 shadow-2xs transition-all duration-150 select-none ${
        outOfStock
          ? 'border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed'
          : cartQuantity > 0
          ? 'border-emerald-500/60 dark:border-emerald-500/60 ring-2 ring-emerald-500/20 dark:ring-emerald-500/30 cursor-pointer hover:-translate-y-0.5 hover:shadow-md'
          : 'border-slate-200 dark:border-slate-800 cursor-pointer hover:-translate-y-0.5 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-md'
      }`}
    >
      {/* In-Cart Quantity Badge */}
      {cartQuantity > 0 && (
        <span className="absolute top-1.5 right-1.5 z-10 flex items-center gap-0.5 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs animate-scale-in">
          <Check size={10} />
          <span>{cartQuantity} ក្នុងរទេះ</span>
        </span>
      )}

      {/* Product Image Area - shrink-0 prevents flex compression */}
      <div className="relative flex aspect-[4/3] max-h-24 sm:max-h-28 w-full shrink-0 items-center justify-center bg-slate-50/80 dark:bg-slate-800/60 p-1.5 sm:p-2 overflow-hidden">
        {product.imageUrl && !imageBroken ? (
          <img
            src={product.imageUrl}
            alt={`${product.name} - Mart System`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
            onError={() => setImageBroken(true)}
          />
        ) : (
          <Package size={22} className="text-slate-300 dark:text-slate-600" />
        )}
      </div>

      <div className="flex flex-1 flex-col p-1.5 sm:p-2">
        <p
          className="line-clamp-1 text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-100 transition-colors group-hover:text-emerald-700 dark:group-hover:text-emerald-400"
          title={product.name}
        >
          {product.name}
        </p>
        <p className="truncate text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-400">
          {product.sku ? `SKU: ${product.sku}` : '\u00A0'}
        </p>

        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="text-[11px] sm:text-xs font-black text-emerald-600 dark:text-emerald-400">
            {formatCurrency(product.price)}
          </span>
          <span
            className={`text-[9px] sm:text-[10px] font-semibold ${
              outOfStock ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400 dark:text-slate-400'
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
          className={`mt-1.5 flex h-6 sm:h-6.5 items-center justify-center gap-1 rounded-lg text-[10px] sm:text-xs font-bold text-white transition active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 ${
            cartQuantity > 0
              ? 'bg-emerald-700 dark:bg-emerald-700 hover:bg-emerald-600 shadow-2xs'
              : 'bg-emerald-600 hover:bg-emerald-500 shadow-2xs'
          }`}
        >
          <Plus size={12} />
          <span>{outOfStock ? 'អស់ស្តុក' : cartQuantity > 0 ? `បន្ថែមទៀត (${cartQuantity})` : 'បន្ថែម'}</span>
        </button>
      </div>
    </div>
  );
}

