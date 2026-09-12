import { Link, useLocation } from 'react-router-dom';
import { Store, ShoppingBag, Heart, ShoppingCart, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../hooks/useWishlist';

export default function CustomerBottomNav({ onOpenCart }) {
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuth();
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();

  const isHome = pathname === '/';
  const isShop = pathname === '/shop' || pathname === '/products' || pathname === '/categories';
  const isWishlist = pathname === '/wishlist';
  const isCart = pathname === '/cart';
  const isAccount = pathname.startsWith('/account') || pathname.startsWith('/customer') || pathname === '/profile' || pathname === '/orders' || pathname === '/login';

  return (
    <nav aria-label="Mobile Navigation" className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md md:hidden pb-[max(0.4rem,env(safe-area-inset-bottom))] shadow-xl select-none">
      <div className="mx-auto flex max-w-md items-center justify-around px-1 py-1 text-[10px] font-bold">
        {/* 1. Home */}
        <Link
          to="/"
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition ${
            isHome
              ? 'text-emerald-600 dark:text-emerald-400 font-black'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Store size={20} className={isHome ? 'stroke-[2.5]' : ''} />
          <span>Home</span>
        </Link>

        {/* 2. Shop */}
        <Link
          to="/shop"
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition ${
            isShop
              ? 'text-emerald-600 dark:text-emerald-400 font-black'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <ShoppingBag size={20} className={isShop ? 'stroke-[2.5]' : ''} />
          <span>Shop</span>
        </Link>

        {/* 3. Wishlist */}
        <Link
          to="/wishlist"
          className={`relative flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition ${
            isWishlist
              ? 'text-emerald-600 dark:text-emerald-400 font-black'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <div className="relative">
            <Heart size={20} className={isWishlist ? 'stroke-[2.5] fill-emerald-600 dark:fill-emerald-400' : ''} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white shadow-xs">
                {wishlistCount}
              </span>
            )}
          </div>
          <span>Wishlist</span>
        </Link>

        {/* 4. Cart */}
        <button
          type="button"
          onClick={onOpenCart}
          className={`relative flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition cursor-pointer ${
            isCart
              ? 'text-emerald-600 dark:text-emerald-400 font-black'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
          }`}
          aria-label={`Shopping cart with ${itemCount} items`}
        >
          <div className="relative">
            <ShoppingCart size={20} className={isCart ? 'stroke-[2.5]' : ''} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white shadow-xs">
                {itemCount}
              </span>
            )}
          </div>
          <span>Cart</span>
        </button>

        {/* 5. Account */}
        <Link
          to={isAuthenticated ? '/account' : '/login'}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition ${
            isAccount
              ? 'text-emerald-600 dark:text-emerald-400 font-black'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <User size={20} className={isAccount ? 'stroke-[2.5]' : ''} />
          <span>Account</span>
        </Link>
      </div>
    </nav>
  );
}
