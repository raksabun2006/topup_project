import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Receipt as ReceiptIcon, Package, Users, User, LogOut,
  Menu, X, Store, Sparkles, ChevronRight, BarChart3, WalletCards
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../ui/ThemeToggle';
import UserAvatar from '../ui/UserAvatar';
import NotificationDropdown from '../ui/NotificationDropdown';
import { env } from '../../config/env';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'ផ្ទាំងគ្រប់គ្រង', end: true },
  { to: '/pos', icon: ShoppingCart, label: 'ចំណុចលក់ (POS)', isPos: true },
  { to: '/dashboard/reports', icon: BarChart3, label: 'របាយការណ៍', managerOrAdminOnly: true },
  { to: '/dashboard/expenses', icon: WalletCards, label: 'ការចំណាយ', managerOrAdminOnly: true },
  { to: '/dashboard/sales', icon: ReceiptIcon, label: 'ការលក់' },
  { to: '/dashboard/products', icon: Package, label: 'ផលិតផល', adminOnly: true },
  { to: '/dashboard/customers', icon: Users, label: 'អតិថិជន', adminOnly: true },
];

export default function AdminLayout() {
  const { user, logout, isAdmin, isManagerOrAdmin } = useAuth();
  const { pathname } = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navItems = NAV_ITEMS.filter(
    (item) => (!item.adminOnly || isAdmin) && (!item.managerOrAdminOnly || isManagerOrAdmin)
  );

  const getPageInfo = () => {
    if (pathname === '/dashboard/reports') return { title: 'របាយការណ៍ហិរញ្ញវត្ថុ', subtitle: 'Financial Analytics & Reports' };
    if (pathname === '/dashboard/expenses') return { title: 'ការគ្រប់គ្រងចំណាយ', subtitle: 'Expense Tracking & Receipts' };
    if (pathname === '/dashboard/products') return { title: 'គ្រប់គ្រងផលិតផល', subtitle: 'Products Management' };
    if (pathname === '/dashboard/sales') return { title: 'ប្រវត្តិការលក់', subtitle: 'Sales Transactions' };
    if (pathname.startsWith('/dashboard/sales/')) return { title: 'ព័ត៌មានលម្អិតការលក់', subtitle: 'Sale Invoice Details' };
    if (pathname === '/dashboard/customers') return { title: 'គ្រប់គ្រងអតិថិជន', subtitle: 'Customer Directory' };
    if (pathname === '/dashboard') return { title: 'ផ្ទាំងគ្រប់គ្រង', subtitle: 'Mart Analytics Overview' };
    if (pathname.startsWith('/dashboard/')) return { title: 'ផ្ទាំងគ្រប់គ្រង', subtitle: 'Dashboard' };
    return { title: 'Mart System', subtitle: 'POS Management' };
  };

  const pageInfo = getPageInfo();

  return (
    <div className="flex h-full w-full bg-slate-50/50 dark:bg-ink-950 text-slate-700 dark:text-slate-200 transition-colors duration-200">
      {/* Mobile Sidebar Backdrop */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden animate-fade-in"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* ------- Left Sidebar (Desktop + Mobile Drawer) ------- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 sm:w-64 shrink-0 flex-col border-r border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl lg:shadow-none transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4 bg-gradient-to-r from-emerald-600/10 via-emerald-600/5 to-transparent">
          <Link to="/dashboard" onClick={() => setMobileNavOpen(false)} className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30 group-hover:scale-105 transition">
              <Store size={22} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black text-slate-900 dark:text-white tracking-tight">{env.appName}</span>
                <span className="rounded-md bg-emerald-600 px-1.5 py-0.2 text-[9px] font-black uppercase text-white shadow-2xs">
                  ADMIN
                </span>
              </div>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <Sparkles size={10} />
                <span>ប្រព័ន្ធគ្រប់គ្រងហាង</span>
              </p>
            </div>
          </Link>

          <button
            onClick={() => setMobileNavOpen(false)}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 lg:hidden"
            aria-label="បិទម៉ឺនុយ"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Card in Mobile Drawer */}
        <div className="lg:hidden mx-3.5 mt-3.5 p-3 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/70 dark:from-slate-800/80 dark:to-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-3">
          <UserAvatar
            user={user}
            className="h-10 w-10 text-sm shadow-2xs"
            fallbackClass="bg-gradient-to-br from-emerald-600 to-teal-600 text-white font-bold"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {user?.displayName || user?.username}
            </p>
            <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              {isAdmin ? 'អ្នកគ្រប់គ្រង (Admin)' : 'បុគ្គលិក (Staff)'}
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto p-3.5 touch-scroll">
          <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            ម៉ឺនុយមេ (Main Menu)
          </p>
          {navItems.map(({ to, icon: Icon, label, end, isPos }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileNavOpen(false)}
              className={({ isActive }) =>
                `group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold transition-all duration-150 ${
                  isActive
                    ? isPos
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30 translate-x-0.5'
                      : 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md shadow-emerald-600/25 translate-x-0.5'
                    : isPos
                    ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-950/40 hover:bg-emerald-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-400'
                }`
              }
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon size={18} className="shrink-0" />
                <span className="truncate">{label}</span>
              </div>
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-60 transition" />
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-100 dark:border-slate-800 p-3 space-y-1 bg-slate-50/60 dark:bg-slate-900">
          <Link
            to="/profile"
            onClick={() => setMobileNavOpen(false)}
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 transition hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
          >
            <User size={16} className="text-slate-400 dark:text-slate-400" />
            <span>ព័ត៌មានផ្ទាល់ខ្លួន (Profile)</span>
          </Link>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 transition hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
          >
            <LogOut size={16} />
            <span>ចាកចេញ (Sign Out)</span>
          </button>
        </div>
      </aside>

      {/* ------- Main Content Column ------- */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex shrink-0 items-center justify-between gap-3 border-b border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 sm:px-6 py-2.5 sm:py-3.5 shadow-2xs">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800 lg:hidden cursor-pointer"
              aria-label="បើកម៉ឺនុយ"
            >
              <Menu size={19} />
            </button>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block h-2 w-2 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50" />
              <div>
                <h1 className="text-sm sm:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                  {pageInfo.title}
                </h1>
                <p className="hidden xs:block text-[11px] text-slate-400 dark:text-slate-500 leading-tight">
                  {pageInfo.subtitle}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <ThemeToggle variant="admin" />

            {/* Interactive Notification Bell with Dropdown */}
            <NotificationDropdown variant="admin" />

            {/* User Profile Pill */}
            <Link
              to="/profile"
              className="flex items-center gap-2 h-9 rounded-full border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 pl-1 pr-3 shadow-2xs transition hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <UserAvatar
                user={user}
                className="h-7 w-7 text-xs shadow-2xs"
                fallbackClass="bg-gradient-to-br from-emerald-600 to-teal-600 text-white font-bold"
              />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[110px] leading-tight">
                  {user?.displayName || user?.username}
                </p>
                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 leading-tight">
                  {isAdmin ? 'អ្នកគ្រប់គ្រង (Admin)' : 'បុគ្គលិក (Staff)'}
                </p>
              </div>
            </Link>
          </div>
        </header>

        {/* Scrollable Viewport Main Outlet (pb-24 on mobile ensures bottom nav clearance) */}
        <main className="flex-1 min-h-0 bg-slate-50/50 dark:bg-ink-950 p-3 sm:p-5 md:p-6 pb-24 lg:pb-6 overflow-y-auto touch-scroll">
          <Outlet />
        </main>
      </div>

      {/* ------- Mobile Bottom Navigation Bar (< 1024px) ------- */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-2 py-1.5 pb-safe shadow-2xl lg:hidden">
        <NavLink
          to="/dashboard"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-1.5 transition ${
              isActive
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white'
            }`
          }
        >
          <BarChart3 size={19} />
          <span className="text-[10px] leading-none">ផ្ទាំងគ្រប់គ្រង</span>
        </NavLink>

        <NavLink
          to="/dashboard/sales"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-1.5 transition ${
              isActive
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white'
            }`
          }
        >
          <ReceiptIcon size={19} />
          <span className="text-[10px] leading-none">ការលក់</span>
        </NavLink>

        {/* Highlighted POS center button */}
        <Link
          to="/pos"
          className="flex flex-col items-center justify-center -mt-4 group"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/40 transition group-hover:scale-105 active:scale-95">
            <ShoppingCart size={22} />
          </div>
          <span className="mt-1 text-[10px] font-black text-emerald-700 dark:text-emerald-400">POS</span>
        </Link>

        {isAdmin && (
          <NavLink
            to="/dashboard/products"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-1.5 transition ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            <Package size={19} />
            <span className="text-[10px] leading-none">ផលិតផល</span>
          </NavLink>
        )}

        {isAdmin ? (
          <NavLink
            to="/dashboard/customers"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-1.5 transition ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            <Users size={19} />
            <span className="text-[10px] leading-none">អតិថិជន</span>
          </NavLink>
        ) : (
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-1.5 transition ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            <User size={19} />
            <span className="text-[10px] leading-none">ព័ត៌មាន</span>
          </NavLink>
        )}
      </nav>
    </div>
  );
}

