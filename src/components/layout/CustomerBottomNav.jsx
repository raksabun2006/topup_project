import { Link, useLocation } from 'react-router-dom';
import { Store, Layers, Receipt, ShoppingCart, User, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/format';

export default function CustomerBottomNav({ onOpenCart, onOpenOrders, onSelectCategoryFocus }) {
  const { pathname } = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { itemCount, subtotal } = useCart();

  const isShopActive = pathname === '/' || pathname === '/pos' || pathname === '/products';

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md lg:hidden pb-[max(0.35rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-md items-center justify-around px-1 py-1.5 text-[11px] font-bold">
        {/* 1. Shop (Main POS Screen) */}
        <Link
          to="/pos"
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition ${
            isShopActive
              ? 'text-[#009F6B] dark:text-emerald-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Store size={19} className={isShopActive ? 'stroke-[2.5]' : ''} />
          <span>ទំព័រដើម</span>
        </Link>

        {/* 2. Categories Shortcut */}
        <button
          type="button"
          onClick={onSelectCategoryFocus}
          className="flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
        >
          <Layers size={19} />
          <span>ប្រភេទ</span>
        </button>

        {/* 3. Orders */}
        <button
          type="button"
          onClick={onOpenOrders}
          className="flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
        >
          <Receipt size={19} />
          <span>ការទិញ</span>
        </button>

        {/* 4. Cart with Dynamic Badge */}
        <button
          type="button"
          onClick={onOpenCart}
          className="relative flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
        >
          <div className="relative">
            <ShoppingCart size={19} />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#009F6B] px-1 text-[9px] font-black text-white shadow-xs">
                {itemCount}
              </span>
            )}
          </div>
          <span>រទេះ</span>
        </button>

        {/* 5. Account / Profile */}
        {isAuthenticated ? (
          <Link
            to="/profile"
            className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition ${
              pathname === '/profile'
                ? 'text-[#009F6B] dark:text-emerald-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <User size={19} className={pathname === '/profile' ? 'stroke-[2.5]' : ''} />
            <span className="max-w-[48px] truncate">{user?.displayName || user?.username || 'គណនី'}</span>
          </Link>
        ) : (
          <Link
            to="/login"
            className="flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition"
          >
            <LogIn size={19} />
            <span>ចូលគណនី</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
