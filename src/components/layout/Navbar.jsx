import { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Store, Menu, X, User, LogOut, Receipt, LayoutDashboard, ShoppingCart,
  Package, ChevronDown, Users, LogIn, BarChart3, WalletCards,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { env } from '../../config/env';
import ThemeToggle from '../ui/ThemeToggle';
import UserAvatar from '../ui/UserAvatar';
import NotificationDropdown from '../ui/NotificationDropdown';

const STAFF_ICON_LINKS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard/reports', icon: BarChart3, label: 'Reports', managerOrAdminOnly: true },
  { to: '/dashboard/expenses', icon: WalletCards, label: 'Expenses', managerOrAdminOnly: true },
  { to: '/dashboard/products', icon: Package, label: 'Products', adminOnly: true },
  { to: '/dashboard/customers', icon: Users, label: 'Customers', adminOnly: true },
  { to: '/dashboard/sales', icon: Receipt, label: 'Sales' },
];

export default function Navbar({ onOpenOrders, onOpenCart }) {
  const { isAuthenticated, isAdmin, isManagerOrAdmin, user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setMobileOpen(false);
    navigate('/login');
  };

  const staffIconLinks = STAFF_ICON_LINKS.filter(
    (l) => (!l.adminOnly || isAdmin) && (!l.managerOrAdminOnly || isManagerOrAdmin)
  );

  return (
    <header className="sticky top-0 z-40 bg-emerald-600 dark:bg-slate-900 border-b border-emerald-500/30 dark:border-slate-800 shadow-md shadow-emerald-950/10 transition-colors duration-200">
      <nav className="mx-auto flex h-14 sm:h-15 max-w-7xl items-center justify-between px-3 sm:px-4">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-1.5 text-white/90 transition hover:bg-white/10 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link to="/pos" className="flex items-center gap-2 sm:gap-2.5 group">
            {!logoError ? (
              <img
                src="/mart.jpg"
                alt={env.appName || 'Mart Logo'}
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl object-cover transition duration-200 group-hover:scale-105"
                onError={() => setLogoError(true)}
              />
            ) : (
              <Store size={24} className="text-white dark:text-emerald-400" />
            )}
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                {env.appName || 'Mart System'}
              </span>
              <span className="text-[10px] text-emerald-100 dark:text-emerald-400/80 font-semibold tracking-wider uppercase">
                {isAuthenticated && (isAdmin || isManagerOrAdmin) ? 'Staff POS' : 'Online Store POS'}
              </span>
            </div>
          </Link>
        </div>

        {/* Center/Right Desktop Navigation */}
        <div className="hidden items-center gap-2 sm:gap-3 md:flex">
          {/* Customer Main Links (For all shoppers) */}
          <div className="flex items-center gap-1 bg-black/10 dark:bg-slate-800/60 p-1 rounded-2xl border border-white/10 dark:border-slate-700">
            <NavLink
              to="/pos"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-white text-emerald-700 dark:bg-emerald-600 dark:text-white shadow-2xs'
                    : 'text-white/90 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Store size={15} />
              <span>ទំនិញ (Shop)</span>
            </NavLink>

            {/* Orders Modal Trigger */}
            <button
              type="button"
              onClick={() => {
                if (onOpenOrders) onOpenOrders();
                else window.dispatchEvent(new CustomEvent('mart:open-orders'));
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white/90 hover:bg-white/10 hover:text-white transition cursor-pointer"
            >
              <Receipt size={15} />
              <span>ការបញ្ជាទិញ (Orders)</span>
            </button>

            {/* Cart Indicator / Trigger */}
            <button
              type="button"
              onClick={() => {
                if (onOpenCart) onOpenCart();
                else window.dispatchEvent(new CustomEvent('mart:open-cart'));
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white/90 hover:bg-white/10 hover:text-white transition cursor-pointer"
            >
              <div className="relative">
                <ShoppingCart size={15} />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-rose-500 px-1 text-[8px] font-black text-white shadow-xs">
                    {itemCount}
                  </span>
                )}
              </div>
              <span>រទេះ (Cart)</span>
            </button>
          </div>

          {/* Staff Specific Icon Shortcuts */}
          {isAuthenticated && staffIconLinks.length > 0 && (
            <div className="flex items-center gap-1 border-l border-white/20 dark:border-slate-700 pl-2 ml-1">
              {staffIconLinks.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  title={label}
                  className={({ isActive }) =>
                    `flex h-9 w-9 items-center justify-center rounded-xl transition ${
                      isActive
                        ? 'bg-white text-emerald-700 dark:bg-emerald-500 dark:text-white shadow-2xs'
                        : 'text-white/90 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <Icon size={17} />
                </NavLink>
              ))}
            </div>
          )}

          {/* Theme Toggle Button */}
          <ThemeToggle variant="navbar" />

          {/* Staff Notifications */}
          {isAuthenticated && <NotificationDropdown variant="navbar" />}

          {/* Account / User Button */}
          {!isAuthenticated ? (
            <Link
              to="/login"
              className="flex items-center gap-1.5 rounded-xl bg-white dark:bg-emerald-600 px-3.5 py-2 text-xs font-bold text-emerald-700 dark:text-white shadow-sm transition hover:bg-emerald-50 dark:hover:bg-emerald-500 active:scale-95"
            >
              <LogIn size={15} />
              <span>ចូលគណនី (Login)</span>
            </Link>
          ) : (
            <div className="relative ml-1">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2.5 text-xs text-white transition hover:bg-white/10"
              >
                <UserAvatar
                  user={user}
                  className="h-8 w-8 text-xs"
                  fallbackClass="bg-white/25 text-white"
                />
                <span className="font-bold truncate max-w-[100px]">{user?.displayName || user?.username}</span>
                <ChevronDown size={14} className="text-white/80" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-black/20 animate-scale-in">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {user?.displayName || user?.username}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {isAdmin ? 'អ្នកគ្រប់គ្រង (Admin)' : 'បុគ្គលិក (Staff)'}
                      </p>
                    </div>

                    {[
                      { to: '/profile', icon: User, label: 'ព័ត៌មានផ្ទាល់ខ្លួន (Profile)' },
                      { to: '/dashboard', icon: LayoutDashboard, label: 'ផ្ទាំងគ្រប់គ្រង (Dashboard)' },
                      { to: '/dashboard/sales', icon: Receipt, label: 'ការលក់ (Sales)' },
                      ...(isAdmin ? [{ to: '/dashboard/products', icon: Package, label: 'ផលិតផល (Products)' }] : []),
                      ...(isAdmin ? [{ to: '/dashboard/customers', icon: Users, label: 'អតិថិជន (Customers)' }] : []),
                    ].map(({ to, icon: Icon, label }) => (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                      >
                        <Icon size={15} className="text-slate-400" />
                        <span>{label}</span>
                      </Link>
                    ))}

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 border-t border-slate-100 dark:border-slate-800 px-4 py-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 transition hover:bg-rose-50 dark:hover:bg-rose-500/10"
                    >
                      <LogOut size={15} />
                      <span>ចាកចេញ (Sign Out)</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Mobile Header Shortcuts */}
        <div className="flex items-center gap-1.5 md:hidden">
          {/* Quick Orders Button on Mobile Header */}
          <button
            type="button"
            onClick={onOpenOrders}
            className="rounded-lg p-1.5 text-white/90 transition hover:bg-white/10"
            title="ការបញ្ជាទិញ"
            aria-label="My Orders"
          >
            <Receipt size={20} />
          </button>

          {/* Theme Toggle */}
          <ThemeToggle variant="navbar" />
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t border-emerald-500/40 dark:border-slate-800 bg-emerald-600 dark:bg-slate-900 px-4 py-4 md:hidden animate-slide-down shadow-xl">
          <div className="flex flex-col gap-1">
            <Link
              to="/pos"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white bg-white/10"
            >
              <Store size={17} />
              <span>ទំព័រទំនិញ (Shop / POS)</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                if (onOpenOrders) onOpenOrders();
              }}
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white hover:bg-white/10 text-left cursor-pointer"
            >
              <Receipt size={17} />
              <span>ការបញ្ជាទិញរបស់ខ្ញុំ (My Orders)</span>
            </button>

            {isAuthenticated ? (
              <>
                <div className="my-2 border-t border-white/15 dark:border-slate-800" />
                <div className="px-3 py-1 text-[11px] font-bold text-emerald-200">
                  ផ្ទាំងគ្រប់គ្រង (Management)
                </div>

                {[
                  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
                  { to: '/dashboard/sales', label: 'Sales', icon: Receipt },
                  ...(isAdmin ? [{ to: '/dashboard/products', label: 'Products', icon: Package }] : []),
                  ...(isAdmin ? [{ to: '/dashboard/customers', label: 'Customers', icon: Users }] : []),
                  { to: '/profile', label: 'Profile', icon: User },
                ].map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                        isActive ? 'bg-white text-emerald-700' : 'text-white/90 hover:bg-white/10'
                      }`
                    }
                  >
                    <Icon size={16} />
                    <span>{label}</span>
                  </NavLink>
                ))}

                <button
                  onClick={handleLogout}
                  className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-rose-500/20 px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-rose-600/30"
                >
                  <LogOut size={15} />
                  <span>ចាកចេញ (Sign Out)</span>
                </button>
              </>
            ) : (
              <div className="pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-center text-xs font-bold text-emerald-700 shadow-md"
                >
                  <LogIn size={16} />
                  <span>ចូលគណនី (Login)</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
