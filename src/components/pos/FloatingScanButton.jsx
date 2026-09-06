import { useLocation } from 'react-router-dom';
import { ScanBarcode } from 'lucide-react';
import { useGlobalScanner } from '../../context/GlobalScannerContext';
import { useCart } from '../../context/CartContext';

/**
 * FloatingScanButton Component
 * Fixed floating button on bottom-right of the screen so cashiers can trigger
 * camera scanning from any page in the POS (Products, Customers, Dashboard, etc.).
 */
export default function FloatingScanButton() {
  const { openScanner } = useGlobalScanner();
  const { itemCount } = useCart();
  const { pathname } = useLocation();

  // If user is currently in /pos with desktop layout, they already have a search bar scanner button,
  // but keep this available everywhere or positioned nicely on mobile
  const isPos = pathname === '/pos';

  return (
    <div
      className={`fixed z-40 transition-all duration-300 ${
        isPos && itemCount > 0
          ? 'bottom-20 sm:bottom-6 right-4 sm:right-6'
          : 'bottom-5 sm:bottom-6 right-4 sm:right-6'
      }`}
    >
      <button
        type="button"
        onClick={openScanner}
        className="group flex items-center gap-2 rounded-full border-2 border-emerald-500/80 bg-emerald-600 dark:bg-emerald-600 px-3.5 sm:px-4 py-3 sm:py-3.5 text-white shadow-xl shadow-emerald-600/35 hover:bg-emerald-500 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        title="ស្កេន Barcode (Scan Barcode from anywhere)"
        aria-label="Scan barcode"
      >
        <div className="relative flex items-center justify-center">
          <ScanBarcode size={21} className="transition group-hover:rotate-6" />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white shadow-xs">
              {itemCount}
            </span>
          )}
        </div>
        <span className="hidden sm:inline-block text-xs font-bold tracking-tight">
          ស្កេន Barcode
        </span>
      </button>
    </div>
  );
}
