import { useMemo } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useGlobalScanner } from '../../context/GlobalScannerContext';
import { formatCurrency } from '../../utils/format';

/**
 * Mini Active Order Indicator
 * Placed in global headers (Navbar & AdminLayout) so cashiers can see
 * real-time item count and total, and click to slide out the Active Order Drawer.
 */
export default function ActiveOrderIndicator({ variant = 'default' }) {
  const { itemCount, subtotal } = useCart();
  const { openDrawer } = useGlobalScanner();

  const formattedTotal = useMemo(() => formatCurrency(subtotal), [subtotal]);
  const isAdmin = variant === 'admin';

  return (
    <button
      type="button"
      onClick={openDrawer}
      className={`group relative flex items-center gap-2 rounded-2xl px-2.5 sm:px-3 py-1.5 transition-all duration-200 active:scale-95 cursor-pointer ${
        isAdmin
          ? 'border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200'
          : 'bg-white/15 hover:bg-white/25 text-white border border-white/20 shadow-xs'
      }`}
      title="មើលរទេះបច្ចុប្បន្ន (View Active Order)"
      aria-label="View Active Order"
    >
      {/* Icon with Counter Badge */}
      <div className="relative flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500 text-white shrink-0 shadow-xs">
        <ShoppingCart size={15} />
        {itemCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-extrabold text-white shadow-xs animate-scale-in">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </div>

      {/* Text Info */}
      <div className="text-left leading-tight hidden xs:block">
        <p
          className={`text-[10px] font-bold uppercase tracking-wider leading-none ${
            isAdmin ? 'text-slate-500 dark:text-slate-400' : 'text-emerald-100'
          }`}
        >
          រទេះបច្ចុប្បន្ន
        </p>
        <p className="text-xs font-black leading-tight mt-0.5">
          <span>{itemCount} មុខ</span>
          <span className="mx-1 opacity-40">•</span>
          <span className={isAdmin ? 'text-emerald-600 dark:text-emerald-400' : 'text-white'}>
            {formattedTotal}
          </span>
        </p>
      </div>
    </button>
  );
}
