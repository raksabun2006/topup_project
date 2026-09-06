import { Link, useLocation } from 'react-router-dom';
import { Store, Layers, Receipt, ShoppingCart, User, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function CustomerBottomNav({ onOpenCart }) {
  const { pathname } = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { itemCount } = useCart();

  const isHome = pathname === '/';
  const isShop = pathname === '/shop' || pathname === '/products';
  const isCategories = pathname === '/categories';
  const isOrders = pathname === '/orders';
  const isCart = pathname === '/cart';
  const isAccount = pathname === '/account' || pathname === '/profile' || pathname === '/login';

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md md:hidden pb-[max(0.35rem,env(safe-area-inset-bottom))] shadow-lg">
      <div className="mx-auto flex max-w-md items-center justify-around px-1 py-1.5 text-[10px] font-bold">
        {/* 1. Home */}
        <Link
          to="/"
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition ${
            isHome
              ? 'text-[#009F6B] dark:text-emerald-400 font-extrabold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <Store size={18} className={isHome ? 'stroke-[2.5]' : ''} />
          <span>ទំព័រដើម</span>
        </Link>

        {/* 2. Shop */}
        <Link
          to="/shop"
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition ${
            isShop
              ? 'text-[#009F6B] dark:text-emerald-400 font-extrabold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <ShoppingBag size={18} className={isShop ? 'stroke-[2.5]' : ''} />
          <span>ទំនិញ</span>
        </Link>

        {/* 3. Categories */}
        <Link
          to="/categories"
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition ${
            isCategories
              ? 'text-[#009F6B] dark:text-emerald-400 font-extrabold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <Layers size={18} className={isCategories ? 'stroke-[2.5]' : ''} />
          <span>ប្រភេទ</span>
        </Link>

        {/* 4. Orders */}
        <Link
          to="/orders"
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition ${
            isOrders
              ? 'text-[#009F6B] dark:text-emerald-400 font-extrabold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <Receipt size={18} className={isOrders ? 'stroke-[2.5]' : ''} />
          <span>ការទិញ</span>
        </Link>

        {/* 5. Cart */}
        <button
          type="button"
          onClick={onOpenCart}
          className={`relative flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition cursor-pointer ${
            isCart
              ? 'text-[#009F6B] dark:text-emerald-400 font-extrabold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <ShoppingCart size={18} className={isCart ? 'stroke-[2.5]' : ''} />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#009F6B] px-1 text-[9px] font-black text-white shadow-xs">
                {itemCount}
              </span>
            )}
          </div>
          <span>រទេះ</span>
        </button>

        {/* 6. Account */}
        <Link
          to={isAuthenticated ? '/account' : '/login'}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition ${
            isAccount
              ? 'text-[#009F6B] dark:text-emerald-400 font-extrabold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <User size={18} className={isAccount ? 'stroke-[2.5]' : ''} />
          <span className="truncate max-w-[42px]">{isAuthenticated ? 'គណនី' : 'ចូល'}</span>
        </Link>
      </div>
    </nav>
  );
}
