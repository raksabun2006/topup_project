import { Link, useLocation } from 'react-router-dom';
import { Store, Code2, Receipt, ShoppingCart, User, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function CustomerBottomNav({ onOpenCart }) {
  const { pathname } = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { itemCount } = useCart();

  const isHome = pathname === '/';
  const isShop = pathname === '/shop' || pathname === '/products';
  const isAbout = pathname === '/about' || pathname === '/about-developer' || pathname === '/developer';
  const isOrders = pathname === '/orders';
  const isCart = pathname === '/cart';
  const isAccount = pathname === '/account' || pathname === '/profile' || pathname === '/login';

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md md:hidden pb-[max(0.4rem,env(safe-area-inset-bottom))] shadow-xl select-none">
      <div className="mx-auto flex max-w-md items-center justify-around px-1 py-1 text-[10px] font-bold">
        {/* 1. Home */}
        <Link
          to="/"
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition ${
            isHome
              ? 'text-emerald-600 dark:text-emerald-400 font-black'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Store size={19} className={isHome ? 'stroke-[2.5]' : ''} />
          <span>Home</span>
        </Link>

        {/* 2. Shop */}
        <Link
          to="/shop"
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition ${
            isShop
              ? 'text-emerald-600 dark:text-emerald-400 font-black'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <ShoppingBag size={19} className={isShop ? 'stroke-[2.5]' : ''} />
          <span>Shop</span>
        </Link>

        {/* 3. Orders */}
        <Link
          to="/orders"
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition ${
            isOrders
              ? 'text-emerald-600 dark:text-emerald-400 font-black'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Receipt size={19} className={isOrders ? 'stroke-[2.5]' : ''} />
          <span>Orders</span>
        </Link>

        {/* 4. About */}
        <Link
          to="/about"
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition ${
            isAbout
              ? 'text-emerald-600 dark:text-emerald-400 font-black'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Code2 size={19} className={isAbout ? 'stroke-[2.5]' : ''} />
          <span>About</span>
        </Link>

        {/* 5. Cart */}
        <button
          type="button"
          onClick={onOpenCart}
          className={`relative flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition cursor-pointer ${
            isCart
              ? 'text-emerald-600 dark:text-emerald-400 font-black'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <div className="relative">
            <ShoppingCart size={19} className={isCart ? 'stroke-[2.5]' : ''} />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white shadow-xs">
                {itemCount}
              </span>
            )}
          </div>
          <span>Cart</span>
        </button>

        {/* 6. Account */}
        <Link
          to={isAuthenticated ? '/account' : '/login'}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition ${
            isAccount
              ? 'text-emerald-600 dark:text-emerald-400 font-black'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <User size={19} className={isAccount ? 'stroke-[2.5]' : ''} />
          <span>Account</span>
        </Link>
      </div>
    </nav>
  );
}
