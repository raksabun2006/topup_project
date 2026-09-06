import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Store, Menu, X, User, LogOut, Receipt, LayoutDashboard, ShoppingCart,
  Package, ChevronDown, Users, LogIn, BarChart3, WalletCards,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { env } from '../../config/env';
import ThemeToggle from '../ui/ThemeToggle';
import UserAvatar from '../ui/UserAvatar';
import NotificationDropdown from '../ui/NotificationDropdown';

const ICON_LINKS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard/reports', icon: BarChart3, label: 'Reports', managerOrAdminOnly: true },
  { to: '/dashboard/expenses', icon: WalletCards, label: 'Expenses', managerOrAdminOnly: true },
  { to: '/dashboard/products', icon: Package, label: 'Products', adminOnly: true },
  { to: '/dashboard/customers', icon: Users, label: 'Customers', adminOnly: true },
  { to: '/dashboard/sales', icon: Receipt, label: 'Sales' },
];

export default function Navbar() {
  const { isAuthenticated, isAdmin, isManagerOrAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setMobileOpen(false);
    navigate('/login');
  };

  const iconLinks = ICON_LINKS.filter(
    (l) => (!l.adminOnly || isAdmin) && (!l.managerOrAdminOnly || isManagerOrAdmin)
  );

  return (
    <header className="sticky top-0 z-50 bg-emerald-600 dark:bg-slate-900 border-b border-emerald-500/30 dark:border-slate-800 shadow-md shadow-emerald-950/10 transition-colors duration-200">
      <nav className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-3 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-1.5 text-white/90 transition hover:bg-white/10 md:hidden"
            aria-label="បើកម៉ឺនុយ"
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
            <span className="text-lg font-bold text-white tracking-tight">{env.appName}</span>
          </Link>
        </div>

        {/* ---------- Desktop ---------- */}
        <div className="hidden items-center gap-2 sm:gap-3 md:flex">
          {isAuthenticated && (
            <div className="flex items-center gap-1.5">
              {iconLinks.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  title={label}
                  className={({ isActive }) =>
                    `flex h-10 w-10 items-center justify-center rounded-full transition ${
                      isActive
                        ? 'bg-white text-emerald-700 dark:bg-emerald-500 dark:text-white shadow-xs'
                        : 'text-white/90 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <Icon size={19} />
                </NavLink>
              ))}
            </div>
          )}

          {/* Theme Toggle Button */}
          <ThemeToggle variant="navbar" />

          {/* Notifications */}
          {isAuthenticated && <NotificationDropdown variant="navbar" />}

          {!isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="flex items-center gap-1.5 rounded-xl bg-white dark:bg-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-700 dark:text-white shadow-sm transition hover:bg-emerald-50 dark:hover:bg-emerald-500 active:scale-95"
              >
                <LogIn size={16} />
                ចូលគណនី (Login)
              </Link>
            </div>
          ) : (
            <div className="relative ml-1">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm text-white transition hover:bg-white/10"
              >
                <UserAvatar
                  user={user}
                  className="h-8 w-8 text-xs"
                  fallbackClass="bg-white/25 text-white"
                />
                <span className="font-medium truncate max-w-[120px]">{user?.displayName || user?.username}</span>
                <ChevronDown size={16} className="text-white/80" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-black/20 animate-scale-in">
                    {[
                      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                      { to: '/dashboard/sales', icon: Receipt, label: 'Sales' },
                      ...(isAdmin ? [{ to: '/dashboard/products', icon: Package, label: 'Products' }] : []),
                      ...(isAdmin ? [{ to: '/dashboard/customers', icon: Users, label: 'Customers' }] : []),
                      { to: '/profile', icon: User, label: 'Information' },
                    ].map(({ to, icon: Icon, label }) => (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 transition hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                      >
                        <Icon size={16} className="text-slate-500 dark:text-slate-400" />
                        {label}
                      </Link>
                    ))}

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 border-t border-slate-200 dark:border-slate-800 px-4 py-3 text-sm text-rose-600 dark:text-rose-400 transition hover:bg-rose-50 dark:hover:bg-rose-500/10"
                    >
                      <LogOut size={16} />
                      ចាកចេញ
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Mobile Header Notification & Theme Toggle Shortcuts */}
        <div className="flex items-center gap-1.5 md:hidden">
          {isAuthenticated && <NotificationDropdown variant="navbar" />}
          <ThemeToggle variant="navbar" />
        </div>
      </nav>

      {/* ---------- Mobile Menu Overlay & Drawer ---------- */}
      {mobileOpen && (
        <div className="border-t border-emerald-500/40 dark:border-slate-800 bg-emerald-600 dark:bg-slate-900 px-4 py-4 md:hidden animate-slide-down shadow-xl">
          <div className="flex flex-col gap-1">
            {isAuthenticated ? (
              <>
                {/* Mobile User Profile Header */}
                <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white/10 dark:bg-slate-800/80 p-3 text-white">
                  <UserAvatar
                    user={user}
                    className="h-10 w-10 text-base"
                    fallbackClass="bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-white">{user?.displayName || user?.username}</p>
                    <p className="text-xs text-emerald-100 dark:text-emerald-400/80 font-medium">
                      {isAdmin ? 'អ្នកគ្រប់គ្រង (Admin)' : 'បុគ្គលិក (Staff)'}
                    </p>
                  </div>
                </div>

                {[
                  { to: '/pos', label: 'ចំណុចលក់ (POS)', icon: ShoppingCart },
                  { to: '/dashboard/sales', label: 'ការលក់ (Sales)', icon: Receipt },
                  ...(isAdmin ? [{ to: '/dashboard/products', label: 'ផលិតផល (Products)', icon: Package }] : []),
                  ...(isAdmin ? [{ to: '/dashboard/customers', label: 'អតិថិជន (Customers)', icon: Users }] : []),
                  { to: '/dashboard', label: 'ផ្ទាំងគ្រប់គ្រង (Dashboard)', icon: LayoutDashboard },
                  { to: '/profile', label: 'ព័ត៌មានផ្ទាល់ខ្លួន (Profile)', icon: User },
                ].map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition active:scale-[0.98] ${
                        isActive
                          ? 'bg-white text-emerald-700 dark:bg-emerald-600 dark:text-white shadow-xs'
                          : 'text-white/95 hover:bg-white/15 dark:hover:bg-slate-800'
                      }`
                    }
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </NavLink>
                ))}

                <button
                  onClick={handleLogout}
                  className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-white/20 dark:border-rose-500/30 bg-rose-500/20 dark:bg-rose-500/10 px-3.5 py-3 text-sm font-bold text-white dark:text-rose-400 transition hover:bg-rose-600/30 active:scale-[0.98]"
                >
                  <LogOut size={16} />
                  <span>ចាកចេញ (Sign Out)</span>
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-white dark:bg-emerald-600 px-4 py-3 text-center text-sm font-bold text-emerald-700 dark:text-white shadow-md transition hover:bg-emerald-50 active:scale-95"
                >
                  <LogIn size={18} />
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
