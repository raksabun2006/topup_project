import { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Store, Menu, X, User, LogOut, Receipt, ShoppingCart, Search,
  ChevronDown, Phone, Truck, ShieldCheck, QrCode, Layers, ShoppingBag
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useCategories } from '../../hooks/useCategories';
import { env } from '../../config/env';
import { formatCurrency } from '../../utils/format';
import ThemeToggle from '../ui/ThemeToggle';
import UserAvatar from '../ui/UserAvatar';

import BrandLogo from '../ui/BrandLogo';

export default function Navbar({ onOpenCart }) {
  const { isAuthenticated, user, logout } = useAuth();
  const { itemCount, subtotal } = useCart();
  const { categories } = useCategories();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState('');
  const [headerSearch, setHeaderSearch] = useState('');

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setMobileOpen(false);
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (headerSearch.trim()) query.set('search', headerSearch.trim());
    if (selectedCat) query.set('category', selectedCat);
    navigate(`/shop?${query.toString()}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 shadow-2xs transition-colors duration-200">
      {/* 1. Top Clean Running Announcement Strip */}
      <div className="bg-[#18181B] dark:bg-slate-950 text-white py-1.5 overflow-hidden whitespace-nowrap select-none">
        <div className="animate-marquee flex items-center gap-12 text-[11px] font-bold tracking-wide">
          <span>ដឹកជញ្ជូនរហ័សត្រឹមតែ $1.50 ទូទាំងក្រុងភ្នំពេញ | ស្កេនទូទាត់តាម Bakong KHQR | សេវាកម្មទំនិញរហ័សទាន់ចិត្ត</span>
          <span>ដឹកជញ្ជូនរហ័សត្រឹមតែ $1.50 ទូទាំងក្រុងភ្នំពេញ | ស្កេនទូទាត់តាម Bakong KHQR | សេវាកម្មទំនិញរហ័សទាន់ចិត្ត</span>
          <span>ដឹកជញ្ជូនរហ័សត្រឹមតែ $1.50 ទូទាំងក្រុងភ្នំពេញ | ស្កេនទូទាត់តាម Bakong KHQR | សេវាកម្មទំនិញរហ័សទាន់ចិត្ត</span>
          <span>ដឹកជញ្ជូនរហ័សត្រឹមតែ $1.50 ទូទាំងក្រុងភ្នំពេញ | ស្កេនទូទាត់តាម Bakong KHQR | សេវាកម្មទំនិញរហ័សទាន់ចិត្ត</span>
        </div>
      </div>

      {/* 2. Main Clean Navbar Bar */}
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        {/* Left: Brand Logo & Mobile Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-xl p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link to="/" className="flex items-center gap-2.5 group">
            <BrandLogo size={36} className="group-hover:scale-105 transition-transform" />
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">
                {env.appName || 'Mart System'}
              </span>
              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider pt-0.5">
                Online Store
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Clean Integrated Search Bar (Desktop) */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-xl mx-4">
          <div className="relative w-full flex items-center rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 p-1 pl-3.5 focus-within:border-slate-400 dark:focus-within:border-slate-500 focus-within:bg-white dark:focus-within:bg-slate-900 shadow-2xs transition-all">
            {/* Category Filter Inside Search */}
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="bg-transparent text-slate-700 dark:text-slate-300 text-[11px] font-bold pr-2 border-r border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer max-w-[130px] truncate shrink-0"
            >
              <option value="">All Categories</option>
              {categories.map((c) => {
                const cName = typeof c === 'string' ? c : c?.name;
                return cName ? <option key={cName} value={cName}>{cName}</option> : null;
              })}
            </select>

            <input
              type="text"
              placeholder="Search products, drinks, groceries..."
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
              className="w-full bg-transparent px-3 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
            />

            <button
              type="submit"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#18181B] dark:bg-white text-white dark:text-slate-900 hover:bg-black transition cursor-pointer shrink-0 shadow-2xs"
            >
              <Search size={14} />
            </button>
          </div>
        </form>

        {/* Right Nav Links & Actions */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Main Desktop Links */}
          <div className="hidden lg:flex items-center gap-5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `hover:text-black dark:hover:text-white transition ${isActive ? 'text-black dark:text-white font-extrabold' : ''}`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/shop"
              className={({ isActive }) =>
                `hover:text-black dark:hover:text-white transition ${isActive ? 'text-black dark:text-white font-extrabold' : ''}`
              }
            >
              Shop
            </NavLink>
            <NavLink
              to="/categories"
              className={({ isActive }) =>
                `hover:text-black dark:hover:text-white transition ${isActive ? 'text-black dark:text-white font-extrabold' : ''}`
              }
            >
              Categories
            </NavLink>
            <NavLink
              to="/orders"
              className={({ isActive }) =>
                `hover:text-black dark:hover:text-white transition ${isActive ? 'text-black dark:text-white font-extrabold' : ''}`
              }
            >
              Orders
            </NavLink>
          </div>

          <ThemeToggle variant="navbar" />

          {/* Cart Pill Button */}
          <button
            type="button"
            onClick={onOpenCart}
            className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 transition cursor-pointer shadow-2xs"
          >
            <div className="relative flex items-center justify-center text-slate-900 dark:text-white">
              <ShoppingCart size={17} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white shadow-xs">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline font-black">
              {formatCurrency(subtotal)}
            </span>
          </button>

          {/* Account / Auth */}
          {!isAuthenticated ? (
            <div className="flex items-center gap-2 text-xs font-bold">
              <Link
                to="/login"
                className="hidden sm:inline-block rounded-full border border-slate-200 dark:border-slate-700 px-3.5 py-1.5 text-slate-800 dark:text-slate-200 hover:bg-slate-50"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-[#18181B] dark:bg-white text-white dark:text-slate-900 px-3.5 py-1.5 hover:bg-black transition shadow-2xs"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-full p-1 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <UserAvatar user={user} className="h-8 w-8 text-xs" />
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl animate-scale-in">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {user?.displayName || user?.username}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">@{user?.username}</p>
                    </div>

                    <Link
                      to="/account"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <User size={15} className="text-slate-400" />
                      <span>My Account</span>
                    </Link>

                    <Link
                      to="/orders"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Receipt size={15} className="text-slate-400" />
                      <span>My Orders</span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 border-t border-slate-100 dark:border-slate-800 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Integrated Search */}
      <div className="md:hidden px-4 pb-2.5 pt-1">
        <form onSubmit={handleSearchSubmit} className="flex items-center rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1 pl-3.5 shadow-2xs">
          <input
            type="text"
            placeholder="Search products..."
            value={headerSearch}
            onChange={(e) => setHeaderSearch(e.target.value)}
            className="w-full bg-transparent text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#18181B] text-white"
          >
            <Search size={13} />
          </button>
        </form>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 md:hidden animate-slide-down space-y-2">
          {[
            { to: '/', label: 'Home', icon: Store },
            { to: '/shop', label: 'Shop', icon: ShoppingBag },
            { to: '/categories', label: 'Categories', icon: Layers },
            { to: '/orders', label: 'My Orders', icon: Receipt },
            { to: '/cart', label: 'Cart', icon: ShoppingCart },
          ].map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Icon size={16} className="text-slate-600" />
              <span>{label}</span>
            </Link>
          ))}

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between px-2">
            <span className="text-xs font-bold text-slate-500">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      )}
    </header>
  );
}
