import { useState, useEffect, useRef, useMemo } from 'react';
import { NavLink, Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  Home, Menu, X, User, LogOut, Package, ShoppingCart, Search,
  ChevronDown, Layers, ShoppingBag, LogIn, UserPlus, LayoutDashboard, Shield,
  ArrowRight, Sparkles, Globe
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCategories } from '../../hooks/useCategories';
import { productApi } from '../../api/productApi';
import { DEFAULT_PRODUCTS } from '../../constants/products';
import { env } from '../../config/env';
import { formatCurrency } from '../../utils/format';
import ThemeToggle from '../ui/ThemeToggle';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import UserAvatar from '../ui/UserAvatar';
import BrandLogo from '../ui/BrandLogo';

export default function Navbar({ onOpenCart }) {
  const { isAuthenticated, user, logout, isAdmin, isManagerOrAdmin, isStaff, displayRole } = useAuth();
  const { itemCount, subtotal } = useCart();
  const { t, isKhmer, language } = useLanguage();
  const { categories } = useCategories();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState('');
  const [headerSearch, setHeaderSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allProducts, setAllProducts] = useState(DEFAULT_PRODUCTS);
  const searchContainerRef = useRef(null);

  // Sync with current URL query parameters
  const urlSearch = searchParams.get('search') || '';
  const urlCat = searchParams.get('category') || '';

  useEffect(() => {
    setHeaderSearch(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    setSelectedCat(urlCat);
  }, [urlCat]);

  // Load fresh catalog for instant search suggestions
  useEffect(() => {
    productApi.list({ size: 100 })
      .then((res) => {
        if (res?.content && Array.isArray(res.content) && res.content.length > 0) {
          setAllProducts(res.content);
        }
      })
      .catch(() => {});
  }, []);

  // Close suggestions and menus on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setMobileOpen(false);
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMenuOpen(false);
    setMobileOpen(false);
    setShowSuggestions(false);
  }, [pathname]);

  // Compute matching products in real-time
  const liveMatches = useMemo(() => {
    const q = headerSearch.trim().toLowerCase();
    if (!q) return [];
    return allProducts
      .filter((p) => {
        const matchCat = !selectedCat || p.category?.toLowerCase() === selectedCat.toLowerCase();
        const matchQuery =
          p.name?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q);
        return matchCat && matchQuery;
      })
      .slice(0, 5);
  }, [headerSearch, selectedCat, allProducts]);

  // Dynamic live search handler (as user types)
  const handleSearchChange = (value) => {
    setHeaderSearch(value);
    setShowSuggestions(Boolean(value.trim()));

    if (pathname === '/shop') {
      const next = new URLSearchParams(searchParams);
      if (value.trim()) {
        next.set('search', value.trim());
      } else {
        next.delete('search');
      }
      if (selectedCat) {
        next.set('category', selectedCat);
      }
      setSearchParams(next, { replace: true });
    }
  };

  const handleCategoryChange = (cat) => {
    setSelectedCat(cat);
    if (pathname === '/shop') {
      const next = new URLSearchParams(searchParams);
      if (cat) {
        next.set('category', cat);
      } else {
        next.delete('category');
      }
      if (headerSearch.trim()) {
        next.set('search', headerSearch.trim());
      }
      setSearchParams(next, { replace: true });
    } else if (headerSearch.trim() || cat) {
      const query = new URLSearchParams();
      if (headerSearch.trim()) query.set('search', headerSearch.trim());
      if (cat) query.set('category', cat);
      navigate(`/shop?${query.toString()}`);
    }
  };

  const handleClearSearch = () => {
    setHeaderSearch('');
    setShowSuggestions(false);
    if (pathname === '/shop') {
      const next = new URLSearchParams(searchParams);
      next.delete('search');
      setSearchParams(next, { replace: true });
    }
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setMobileOpen(false);
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    const query = new URLSearchParams();
    if (headerSearch.trim()) query.set('search', headerSearch.trim());
    if (selectedCat) query.set('category', selectedCat);
    navigate(`/shop?${query.toString()}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-2xs transition-colors duration-200">
      {/* 1. Top Clean Running Announcement Strip */}
      <div className="bg-[#18181B] dark:bg-slate-950 text-white py-1.5 sm:py-2 overflow-hidden whitespace-nowrap select-none">
        <div className="animate-marquee flex items-center gap-12 text-[10px] sm:text-[11px] font-bold tracking-wide">
          <span>{t('announcement')}</span>
          <span>Free Delivery Orders over $25 | Pay via Bakong KHQR | Authentic Quality Guaranteed</span>
          <span>{t('announcement')}</span>
          <span>Free Delivery Orders over $25 | Pay via Bakong KHQR | Authentic Quality Guaranteed</span>
        </div>
      </div>

      {/* 2. Main Navbar Bar */}
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-2.5 sm:px-4 md:px-6 lg:px-8 gap-1.5 sm:gap-3 lg:gap-4">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link to="/" className="flex items-center gap-2 group">
            <BrandLogo size={32} className="sm:w-[34px] sm:h-[34px] group-hover:scale-105 transition-transform" />
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm md:text-base font-black text-slate-900 dark:text-white tracking-tight leading-none">
                {env.appName || 'Mart System'}
              </span>
              <span className="text-[8px] sm:text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider pt-0.5">
                Online Store
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Dynamic Integrated Search Bar with Live Suggestions (Desktop) */}
        <div ref={searchContainerRef} className="relative hidden md:flex flex-1 max-w-xl mx-4">
          <form onSubmit={handleSearchSubmit} className="w-full">
            <div className="relative w-full flex items-center rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 p-1 pl-3.5 focus-within:border-slate-400 dark:focus-within:border-slate-500 focus-within:bg-white dark:focus-within:bg-slate-900 shadow-2xs transition-all">
              {/* Category Filter Inside Search */}
              <select
                value={selectedCat}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="bg-transparent text-slate-700 dark:text-slate-300 text-[11px] font-bold pr-2 border-r border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer max-w-[130px] truncate shrink-0"
              >
                <option value="">{t('allCategories')}</option>
                {categories.map((c) => {
                  const cName = typeof c === 'string' ? c : c?.name;
                  return cName ? <option key={cName} value={cName}>{cName}</option> : null;
                })}
              </select>

              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={headerSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setShowSuggestions(Boolean(headerSearch.trim()))}
                className="w-full bg-transparent px-3 text-base md:text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />

              {headerSearch && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="p-1 mr-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-700 transition"
                  title={t('clearSearch')}
                >
                  <X size={13} />
                </button>
              )}

              <button
                type="submit"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#18181B] dark:bg-white text-white dark:text-slate-900 hover:bg-black transition cursor-pointer shrink-0 shadow-2xs"
              >
                <Search size={14} />
              </button>
            </div>
          </form>

          {/* Live Search Suggestions Dropdown */}
          {showSuggestions && headerSearch.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden z-50 animate-scale-in">
              <div className="p-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-400 px-3">
                <span className="flex items-center gap-1">
                  <Sparkles size={12} className="text-amber-500" />
                  {t('liveSuggestions')}
                </span>
                <span>{liveMatches.length} {t('matching')}</span>
              </div>

              {liveMatches.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  {t('noProductsFound')} &ldquo;<span className="font-semibold text-slate-700 dark:text-slate-200">{headerSearch}</span>&rdquo;
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {liveMatches.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => {
                        setShowSuggestions(false);
                        navigate(`/product/${prod.id}`);
                      }}
                      className="flex items-center justify-between gap-3 p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-100 dark:bg-slate-800 p-1 flex items-center justify-center overflow-hidden border border-slate-200/60 dark:border-slate-700">
                          {prod.imageUrl ? (
                            <img src={prod.imageUrl} alt={prod.name} className="h-full w-full object-contain" />
                          ) : (
                            <Package size={16} className="text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {prod.name}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {prod.category || 'General'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {formatCurrency(prod.price)}
                        </span>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={(e) => handleSearchSubmit(e)}
                    className="w-full p-2.5 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>{t('viewAllResults')}</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Nav Links & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 lg:gap-3 shrink-0">
          {/* Main Desktop Links (≥ 1024px) */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `hover:text-black dark:hover:text-white transition ${isActive ? 'text-black dark:text-white font-extrabold' : ''}`
              }
            >
              {t('home')}
            </NavLink>
            <NavLink
              to="/shop"
              className={({ isActive }) =>
                `hover:text-black dark:hover:text-white transition ${isActive ? 'text-black dark:text-white font-extrabold' : ''}`
              }
            >
              {t('shop')}
            </NavLink>
            <NavLink
              to="/categories"
              className={({ isActive }) =>
                `hover:text-black dark:hover:text-white transition ${isActive ? 'text-black dark:text-white font-extrabold' : ''}`
              }
            >
              {t('categories')}
            </NavLink>
            <NavLink
              to="/orders"
              className={({ isActive }) =>
                `hover:text-black dark:hover:text-white transition ${isActive ? 'text-black dark:text-white font-extrabold' : ''}`
              }
            >
              {t('orders')}
            </NavLink>
          </div>

          {/* Language Switcher (Desktop & Tablet top header) */}
          <LanguageSwitcher className="hidden sm:inline-flex" />

          {/* Theme Mode Toggle (Desktop & Tablet top header) */}
          <ThemeToggle className="hidden sm:inline-flex" />

          {/* Cart Pill Button */}
          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`Shopping cart with ${itemCount} items`}
            className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 transition cursor-pointer shadow-2xs active:scale-95 shrink-0"
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

          {/* Account / Auth Profile Menu (Desktop & Tablet only ≥ 640px) */}
          {!isAuthenticated ? (
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold shrink-0">
              <Link
                to="/login"
                className="rounded-full border border-slate-200 dark:border-slate-700 px-3.5 py-1.5 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                {t('signIn')}
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-[#18181B] dark:bg-white text-white dark:text-slate-900 px-3.5 py-1.5 hover:bg-black dark:hover:bg-slate-100 transition shadow-2xs"
              >
                {t('register')}
              </Link>
            </div>
          ) : (
            <div className="relative hidden sm:block">
              {/* User Avatar Trigger Button */}
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-expanded={menuOpen}
                aria-haspopup="true"
                aria-label="User profile menu"
                className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 p-0.5 sm:p-1 pr-1.5 sm:pr-2.5 text-xs text-slate-700 dark:text-slate-200 transition cursor-pointer shadow-2xs active:scale-95 shrink-0"
              >
                <UserAvatar user={user} className="h-7 w-7 sm:h-8 sm:w-8 text-xs font-bold" />
                <ChevronDown size={13} className={`text-slate-400 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Customer Profile Dropdown Menu */}
              {menuOpen && (
                <>
                  {/* Backdrop for outside click */}
                  <div
                    className="fixed inset-0 z-40 bg-black/20 sm:bg-transparent backdrop-blur-[1px] sm:backdrop-blur-none transition-opacity"
                    onClick={() => setMenuOpen(false)}
                    aria-hidden="true"
                  />

                  {/* Dropdown Container */}
                  <div
                    role="menu"
                    aria-orientation="vertical"
                    className="fixed sm:absolute top-[68px] sm:top-full right-3 sm:right-0 z-50 mt-1.5 sm:mt-2 w-[calc(100vw-24px)] max-w-[360px] sm:w-[290px] overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl animate-scale-in max-h-[calc(100vh-80px)] overflow-y-auto touch-scroll"
                    style={{
                      maxWidth: 'min(360px, calc(100vw - 24px))',
                    }}
                  >
                    {/* 1. User Header Info Section */}
                    <div className="p-3.5 sm:p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                          {user?.displayName || user?.username || 'Customer'}
                        </p>
                        {isAdmin ? (
                          <span className="shrink-0 rounded-lg bg-indigo-600 px-2 py-0.5 text-[9px] font-black uppercase text-white tracking-wide shadow-2xs">
                            ADMIN
                          </span>
                        ) : isStaff ? (
                          <span className="shrink-0 rounded-lg bg-emerald-600 px-2 py-0.5 text-[9px] font-black uppercase text-white tracking-wide shadow-2xs">
                            STAFF
                          </span>
                        ) : (
                          <span className="shrink-0 rounded-lg bg-[#00A86B] px-2 py-0.5 text-[9px] font-black uppercase text-white tracking-wide shadow-2xs">
                            CUSTOMER
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-mono truncate pt-0.5">
                        @{user?.username || 'customer'}
                      </p>
                    </div>

                    {/* 2. Language Row */}
                    <div className="px-3.5 sm:px-4 py-2.5 sm:py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between min-h-[44px]">
                      <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                        {t('language')}
                      </span>
                      <LanguageSwitcher variant="segmented" />
                    </div>

                    {/* 3. Appearance Row */}
                    <div className="px-3.5 sm:px-4 py-2.5 sm:py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between min-h-[44px]">
                      <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                        {t('appearance')}
                      </span>
                      <ThemeToggle showLabel={true} />
                    </div>

                    {/* 4. Role-Specific Dashboard Row */}
                    {isAdmin ? (
                      <div className="p-1.5 sm:p-2 border-b border-slate-100 dark:border-slate-800 bg-indigo-50/60 dark:bg-indigo-950/20">
                        <Link
                          to="/admin/dashboard"
                          role="menuitem"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center justify-between gap-2 rounded-2xl px-3 py-2.5 min-h-[44px] text-xs sm:text-sm font-bold text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/40 transition group"
                        >
                          <span className="flex items-center gap-2.5 min-w-0">
                            <LayoutDashboard size={18} className="shrink-0 text-indigo-600 dark:text-indigo-400" />
                            <span className="truncate">{t('adminDashboard')}</span>
                          </span>
                          <span className="shrink-0 text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-600 text-white shadow-2xs">
                            ADMIN
                          </span>
                        </Link>
                      </div>
                    ) : isStaff ? (
                      <div className="p-1.5 sm:p-2 border-b border-slate-100 dark:border-slate-800 bg-emerald-50/60 dark:bg-emerald-950/20">
                        <Link
                          to="/staff/dashboard"
                          role="menuitem"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center justify-between gap-2 rounded-2xl px-3 py-2.5 min-h-[44px] text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/40 transition group"
                        >
                          <span className="flex items-center gap-2.5 min-w-0">
                            <LayoutDashboard size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                            <span className="truncate">{t('staffDashboard')}</span>
                          </span>
                          <span className="shrink-0 text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-600 text-white shadow-2xs">
                            STAFF
                          </span>
                        </Link>
                      </div>
                    ) : (
                      <div className="p-1.5 sm:p-2 border-b border-slate-100 dark:border-slate-800 bg-blue-50/60 dark:bg-blue-950/20">
                        <Link
                          to="/customer/dashboard"
                          role="menuitem"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center justify-between gap-2 rounded-2xl px-3 py-2.5 min-h-[44px] text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-400 hover:bg-blue-100/70 dark:hover:bg-blue-900/40 transition group"
                        >
                          <span className="flex items-center gap-2.5 min-w-0">
                            <LayoutDashboard size={18} className="shrink-0 text-blue-600 dark:text-blue-400" />
                            <span className="truncate font-black">{t('customerDashboard')}</span>
                          </span>
                          <span className="shrink-0 text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-600 text-white shadow-2xs">
                            PORTAL
                          </span>
                        </Link>
                      </div>
                    )}

                    {/* 5. Menu Links (My Account, My Orders, Sign Out) */}
                    <div className="p-1.5 sm:p-2 space-y-0.5">
                      <Link
                        to="/account"
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 rounded-2xl px-3 py-2.5 min-h-[44px] text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition"
                      >
                        <User size={18} className="text-slate-400 shrink-0" />
                        <span>{t('myAccount')}</span>
                      </Link>

                      <Link
                        to="/orders"
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 rounded-2xl px-3 py-2.5 min-h-[44px] text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition"
                      >
                        <Package size={18} className="text-slate-400 shrink-0" />
                        <span>{t('myOrders')}</span>
                      </Link>

                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 min-h-[44px] text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                      >
                        <LogOut size={18} className="shrink-0 text-rose-600 dark:text-rose-400" />
                        <span>{t('signOut')}</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Mobile Hamburger Menu Button (Positioned on the RIGHT) */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-xl p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden cursor-pointer active:scale-95 transition shrink-0"
            aria-label="Toggle mobile menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </nav>

      {/* Mobile Integrated Search */}
      <div className="md:hidden px-3 sm:px-4 pb-2.5 pt-1">
        <form onSubmit={handleSearchSubmit} className="flex items-center rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1 pl-3.5 shadow-2xs">
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={headerSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full bg-transparent text-base md:text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
          {headerSearch && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="p-1 mr-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer rounded-full"
              title={t('clearSearch')}
            >
              <X size={12} />
            </button>
          )}
          <button
            type="submit"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#18181B] text-white shrink-0"
          >
            <Search size={13} />
          </button>
        </form>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 md:hidden animate-slide-down space-y-3 shadow-xl">
          {/* Mobile Auth Card */}
          {!isAuthenticated ? (
            <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/80 dark:to-slate-800/40 p-3.5 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
              <div>
                <p className="text-xs font-black text-slate-900 dark:text-white">{t('welcomeMart')}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('signInDescription')}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-[#18181B] dark:bg-white text-white dark:text-slate-900 py-2.5 px-3 text-xs font-bold shadow-xs hover:opacity-90 active:scale-95 transition"
                >
                  <LogIn size={14} />
                  <span>{t('signIn')}</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white py-2.5 px-3 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition"
                >
                  <UserPlus size={14} />
                  <span>{t('register')}</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/80 dark:to-slate-800/40 p-3.5 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
              <div className="flex items-center gap-3">
                <UserAvatar user={user} className="h-10 w-10 text-sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                      {user?.displayName || user?.username}
                    </p>
                    <span className="rounded bg-emerald-600 px-1.5 py-0.2 text-[9px] font-black uppercase text-white">
                      {displayRole}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono truncate">@{user?.username}</p>
                </div>
              </div>

              {/* Role-Specific Dashboard Button */}
              {isAdmin ? (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-2 text-xs font-bold transition shadow-xs"
                >
                  <LayoutDashboard size={14} />
                  <span>{t('adminDashboard')}</span>
                </Link>
              ) : isStaff ? (
                <Link
                  to="/staff/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2 text-xs font-bold transition shadow-xs"
                >
                  <LayoutDashboard size={14} />
                  <span>{t('staffDashboard')}</span>
                </Link>
              ) : (
                <Link
                  to="/customer/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#164E87] hover:bg-[#123E6C] text-white py-2 text-xs font-bold transition shadow-xs"
                >
                  <LayoutDashboard size={14} />
                  <span>{t('customerDashboard')}</span>
                </Link>
              )}

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                <Link
                  to="/account"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 active:scale-95 transition"
                >
                  <User size={13} />
                  <span>{t('account')}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 py-2 text-xs font-bold active:scale-95 transition cursor-pointer"
                >
                  <LogOut size={13} />
                  <span>{t('signOut')}</span>
                </button>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <div className="space-y-1 pt-1">
            {[
              { to: '/', label: t('home'), icon: Home },
              { to: '/shop', label: t('shop'), icon: ShoppingBag },
              { to: '/categories', label: t('categories'), icon: Layers },
              { to: '/orders', label: t('myOrders'), icon: Package },
              { to: '/cart', label: t('myCart'), icon: ShoppingCart },
            ].map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${
                  pathname === to
                    ? 'bg-slate-100 dark:bg-slate-800 text-black dark:text-white font-black'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} className="text-slate-500" />
                  <span>{label}</span>
                </div>
                {to === '/cart' && itemCount > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-black text-white">
                    {itemCount}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Bottom Settings (Language & Appearance) */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 px-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">{t('language')}</span>
              <LanguageSwitcher variant="segmented" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">{t('appearance')}</span>
              <ThemeToggle showLabel={true} />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
