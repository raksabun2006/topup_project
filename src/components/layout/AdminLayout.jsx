import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutGrid, ShoppingBag, Package, Users, BarChart2,
  WalletCards, Tag, Globe, ShoppingCart, ChevronLeft, ChevronRight,
  Menu, X, Sparkles, LogOut, User, Plus, ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSales } from '../../hooks/useSales';
import ThemeToggle from '../ui/ThemeToggle';
import UserAvatar from '../ui/UserAvatar';
import NotificationDropdown from '../ui/NotificationDropdown';
import { env } from '../../config/env';

export default function AdminLayout() {
  const { user, logout, isAdmin, isManagerOrAdmin, displayRole } = useAuth();
  const { sales } = useSales();
  const { pathname } = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const pendingOrTotalCount = sales.length > 0 ? sales.length : undefined;
  const overviewPath = isAdmin ? '/admin/dashboard' : '/staff/dashboard';

  // Role-based navigation maps
  const roleNavigation = {
    ADMIN: [
      { to: '/admin/dashboard', icon: LayoutGrid, label: 'Overview', end: true },
      { to: '/dashboard/sales', icon: ShoppingBag, label: 'Orders & Sales', badge: pendingOrTotalCount ? String(pendingOrTotalCount) : undefined },
      { to: '/dashboard/products', icon: Package, label: 'Products' },
      { to: '/dashboard/customers', icon: Users, label: 'Customers' },
      { to: '/dashboard/discounts', icon: Tag, label: 'Discounts & Promo' },
      { to: '/dashboard/reports', icon: BarChart2, label: 'Analytics' },
      { to: '/dashboard/expenses', icon: WalletCards, label: 'Store Expenses' },
    ],
    STAFF: [
      { to: '/staff/dashboard', icon: LayoutGrid, label: 'Operations Overview', end: true },
      { to: '/dashboard/sales', icon: ShoppingBag, label: 'Orders & Receipts', badge: pendingOrTotalCount ? String(pendingOrTotalCount) : undefined },
      { to: '/dashboard/products', icon: Package, label: 'Product Catalog' },
    ],
  };

  const mainMenuItems = isAdmin ? roleNavigation.ADMIN : roleNavigation.STAFF;

  const salesChannels = [
    { to: '/shop', icon: Globe, label: 'Online store', external: false },
    { to: '/pos', icon: ShoppingCart, label: 'Point of sale', external: false },
  ];

  const appIntegrations = [
    { name: 'Bakong KHQR', color: 'bg-rose-500 text-white', icon: 'KH' },
    { name: 'Shopee', color: 'bg-orange-500 text-white', icon: 'S' },
    { name: 'Tiktok', color: 'bg-black text-white dark:bg-white dark:text-black', icon: 'T' },
    { name: 'Telegram Bot', color: 'bg-sky-500 text-white', icon: 'TG' },
  ];

  return (
    <div className="flex h-screen w-full bg-[#F4F5F7] dark:bg-slate-950 text-slate-700 dark:text-slate-200 transition-colors duration-200 overflow-hidden font-sans">
      {/* Mobile Sidebar Backdrop */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden animate-fade-in"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* ------- Left Sidebar (Saledash Minimalist Style) ------- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex shrink-0 flex-col border-r border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xl lg:shadow-none transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileNavOpen ? 'translate-x-0 w-64' : '-translate-x-full'
        } ${collapsed ? 'lg:w-20' : 'lg:w-60'}`}
      >
        {/* Brand Header */}
        <div className="relative flex items-center justify-between px-5 py-5 border-b border-slate-100 dark:border-slate-800/60">
          <Link to={overviewPath} onClick={() => setMobileNavOpen(false)} className="flex items-center gap-3 group min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200/60 dark:border-slate-700 shadow-2xs group-hover:scale-105 transition-transform">
              <img
                src="/mart.jpg"
                alt="Logo"
                className="h-7 w-7 rounded-lg object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
            {!collapsed && (
              <div className="min-w-0 truncate">
                <span className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-none block">
                  {env.appName || 'Saledash'}
                </span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Admin Panel
                </span>
              </div>
            )}
          </Link>

          {/* Collapse Toggle Button on Desktop */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex absolute -right-3.5 top-6 h-7 w-7 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white shadow-sm transition hover:scale-105 cursor-pointer z-10"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>

          {/* Close for mobile */}
          <button
            onClick={() => setMobileNavOpen(false)}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6 scrollbar-thin">
          {/* Main Menu */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 pb-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-500">
                Main Menu
              </p>
            )}
            {mainMenuItems.map(({ to, icon: Icon, label, end, badge }) => (
              <NavLink
                key={to + label}
                to={to}
                end={end}
                onClick={() => setMobileNavOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition-all duration-150 ${
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold shadow-2xs'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                  } ${collapsed ? 'justify-center px-2' : ''}`
                }
                title={collapsed ? label : undefined}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon size={18} className="shrink-0 text-slate-600 dark:text-slate-300 group-hover:scale-105 transition-transform" />
                  {!collapsed && <span className="truncate">{label}</span>}
                </div>
                {!collapsed && badge && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-black text-white shadow-2xs">
                    {badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>

          {/* Sales Channels */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 pb-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-500">
                Sales Channel
              </p>
            )}
            {salesChannels.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileNavOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition-all duration-150 ${
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                  } ${collapsed ? 'justify-center px-2' : ''}`
                }
                title={collapsed ? label : undefined}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon size={18} className="shrink-0 text-slate-600 dark:text-slate-300" />
                  {!collapsed && <span className="truncate">{label}</span>}
                </div>
              </NavLink>
            ))}
          </div>

          {/* Apps / Integrations */}
          {!collapsed && (
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
              <p className="px-3 pb-1 text-[11px] font-bold text-slate-400 dark:text-slate-500">
                Apps
              </p>
              {appIntegrations.map((app) => (
                <div
                  key={app.name}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer"
                >
                  <span className={`flex h-5 w-5 items-center justify-center rounded-md text-[9px] font-black shrink-0 ${app.color}`}>
                    {app.icon}
                  </span>
                  <span className="truncate">{app.name}</span>
                </div>
              ))}
              <button
                type="button"
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                <Plus size={14} />
                <span>Add apps</span>
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-100 dark:border-slate-800/80 p-3 bg-slate-50/50 dark:bg-slate-900/60 space-y-1">
          <NavLink
            to="/dashboard/profile"
            onClick={() => setMobileNavOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                isActive
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              } ${collapsed ? 'justify-center px-1' : ''}`
            }
            title="Profile"
          >
            <User size={16} className="text-slate-400 shrink-0" />
            {!collapsed && <span className="truncate">Profile & Account</span>}
          </NavLink>
          <button
            type="button"
            onClick={logout}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer ${
              collapsed ? 'justify-center px-1' : ''
            }`}
            title="Sign Out"
          >
            <LogOut size={16} className="shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ------- Main Content Area ------- */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Mobile Header Top Bar (on mobile only) */}
        <div className="lg:hidden flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Menu size={18} />
            </button>
            <span className="text-sm font-black text-slate-900 dark:text-white">
              {env.appName || 'Saledash'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle variant="admin" />
            <NotificationDropdown variant="admin" />
            <Link to="/dashboard/profile">
              <UserAvatar user={user} className="h-8 w-8 text-xs" />
            </Link>
          </div>
        </div>

        {/* Scrollable Viewport Main Outlet */}
        <main className="flex-1 min-h-0 p-3 sm:p-5 md:p-6 lg:p-7 overflow-y-auto scrollbar-thin">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

