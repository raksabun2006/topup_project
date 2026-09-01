import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Receipt as ReceiptIcon, Package, Users, User, LogOut,
  Bell, Menu, X, Store,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLowStockInventory } from '../../hooks/useInventory';
import ThemeToggle from '../ui/ThemeToggle';
import UserAvatar from '../ui/UserAvatar';
import { env } from '../../config/env';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'ផ្ទាំងគ្រប់គ្រង', end: true },
  { to: '/pos', icon: ShoppingCart, label: 'ចំណុចលក់' },
  { to: '/dashboard/sales', icon: ReceiptIcon, label: 'ការលក់' },
  { to: '/dashboard/products', icon: Package, label: 'ផលិតផល', adminOnly: true },
  { to: '/dashboard/customers', icon: Users, label: 'អតិថិជន', adminOnly: true },
];

export default function AdminLayout() {
  const { user, logout, isAdmin } = useAuth();
  const { pathname } = useLocation();
  const { items: lowStock } = useLowStockInventory();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  const getPageTitle = () => {
    if (pathname === '/dashboard/products') return 'គ្រប់គ្រងផលិតផល (Products)';
    if (pathname === '/dashboard/sales') return 'ប្រវត្តិការលក់ (Sales)';
    if (pathname.startsWith('/dashboard/sales/')) return 'ព័ត៌មានលម្អិតការលក់ (Sale Details)';
    if (pathname === '/dashboard/customers') return 'គ្រប់គ្រងអតិថិជន (Customers)';
    if (pathname === '/dashboard') return 'ផ្ទាំងគ្រប់គ្រង (Dashboard)';
    if (pathname.startsWith('/dashboard/')) return 'Dashboard';
    return 'Mart System';
  };

  return (
    <div className="flex h-full w-full bg-ink-950 text-slate-700 dark:text-slate-200">
      {/* Mobile Sidebar Backdrop */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* ------- Left Sidebar ------- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-slate-200 dark:border-slate-800 bg-ink-900 transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 px-6 py-5">
          <Store size={22} className="text-emerald-600 dark:text-emerald-400" />
          <span className="text-lg font-bold text-slate-900 dark:text-white">{env.appName}</span>
          <button
            onClick={() => setMobileNavOpen(false)}
            className="ml-auto rounded-lg p-1 text-slate-500 hover:bg-emerald-50 dark:hover:bg-slate-800 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">ម៉ឺនុយ</p>
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileNavOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <Icon size={17} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 p-3 space-y-1">
          <Link
            to="/profile"
            onClick={() => setMobileNavOpen(false)}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 transition hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
          >
            <User size={17} />
            <span>ព័ត៌មានផ្ទាល់ខ្លួន</span>
          </Link>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-700 dark:text-rose-400 transition hover:bg-rose-500/10 dark:hover:bg-rose-950/30"
          >
            <LogOut size={17} />
            <span>ចាកចេញ</span>
          </button>
        </div>
      </aside>

      {/* ------- Main Content Column ------- */}
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 bg-ink-900 px-3 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="rounded-lg p-2 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800 lg:hidden"
              aria-label="បើកម៉ឺនុយ"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-base font-bold text-slate-900 dark:text-white sm:text-xl">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle variant="admin" />

            <Link
              to="/dashboard"
              className="relative rounded-full p-2 text-slate-600 dark:text-slate-400 transition hover:bg-emerald-50 dark:hover:bg-slate-800"
              title="ស្តុកជិតអស់"
            >
              <Bell size={18} />
              {lowStock.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-xs">
                  {lowStock.length}
                </span>
              )}
            </Link>

            <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-2.5 sm:pl-3">
              <UserAvatar
                user={user}
                className="h-8 w-8 sm:h-9 sm:w-9 text-xs sm:text-sm"
                fallbackClass="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              />
              <div className="hidden sm:block">
                <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[120px]">
                  {user?.displayName || user?.username}
                </p>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">អ្នកគ្រប់គ្រង</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Viewport Outlet */}
        <main className="flex-1 min-h-0 bg-ink-950 p-3 sm:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
