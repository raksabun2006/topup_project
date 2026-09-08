import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutGrid, ShoppingBag, Package, Users, BarChart2,
  WalletCards, Tag, Globe, ShoppingCart, ChevronLeft, ChevronRight,
  Menu, X, Sparkles, LogOut, User, Plus, ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSales } from '../../hooks/useSales';
import { adminApi } from '../../api/adminApi';
import { getCustomerOrders } from '../pos/CustomerOrdersModal';
import ThemeToggle from '../ui/ThemeToggle';
import UserAvatar from '../ui/UserAvatar';
import NotificationDropdown from '../ui/NotificationDropdown';
import { env } from '../../config/env';

export default function AdminLayout() {
  const { user, logout, isAdmin, isManagerOrAdmin, displayRole } = useAuth();
  const { sales } = useSales();
  const [onlineOrdersCount, setOnlineOrdersCount] = useState(0);
  const { pathname } = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    adminApi.getAllOrders({ page: 0, size: 500 })
      .then((res) => {
        const list = Array.isArray(res) ? res : (res?.content ?? res?.orders ?? []);
        setOnlineOrdersCount(list.length);
      })
      .catch(() => {});
  }, []);

  const totalCombinedCount = (sales.length || 0) + onlineOrdersCount + (getCustomerOrders()?.length || 0);
  const pendingOrTotalCount = totalCombinedCount > 0 ? totalCombinedCount : undefined;
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

// Authentic Brand SVG Icons
function BakongIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="9" fill="#E11938" />
      <circle cx="20" cy="20" r="13.5" stroke="white" strokeWidth="1.2" strokeOpacity="0.35" />
      <path
        d="M12.5 13.5H18C20.5 13.5 22.3 15.1 22.3 17.5C22.3 19 21.5 20.3 20.3 20.9C21.9 21.6 23 23.1 23 25C23 27.5 21 29 18.5 29H12.5V13.5ZM15.7 16.3V19.7H18C19.3 19.7 20.1 18.9 20.1 18C20.1 17.1 19.3 16.3 18 16.3H15.7ZM15.7 22.7V26.2H18.5C19.9 26.2 20.7 25.3 20.7 24.4C20.7 23.5 19.9 22.7 18.5 22.7H15.7Z"
        fill="white"
      />
      <text x="23.5" y="20.5" fill="white" fontSize="7.5" fontWeight="900" fontFamily="system-ui, -apple-system, sans-serif">KH</text>
      <text x="23.5" y="27.5" fill="white" fontSize="7" fontWeight="900" fontFamily="system-ui, -apple-system, sans-serif">QR</text>
    </svg>
  );
}

function ShopeeIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="9" fill="#EE4D2D" />
      <path
        d="M15.5 16C15.5 13.5 17.5 11.5 20 11.5C22.5 11.5 24.5 13.5 24.5 16"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M11 15.5H29L27.8 29.5C27.6 30.5 26.8 31.5 25.8 31.5H14.2C13.2 31.5 12.4 30.5 12.2 29.5L11 15.5Z"
        fill="white"
        fillOpacity="0.2"
      />
      <path
        d="M22.2 20.2C21.8 19.8 21 19.5 20 19.5C18.8 19.5 18 20.1 18 21C18 21.8 18.7 22.3 20.3 22.8C22.2 23.4 23.2 24.3 23.2 25.7C23.2 27.4 21.8 28.5 19.8 28.5C18.2 28.5 17 27.9 16.3 26.9L17.8 25.6C18.3 26.3 19 26.8 19.8 26.8C20.8 26.8 21.4 26.3 21.4 25.6C21.4 24.7 20.6 24.3 19.1 23.7C17.3 23.1 16.2 22.2 16.2 20.8C16.2 19.2 17.6 18 19.8 18C21.2 18 22.2 18.5 23 19.3L22.2 20.2Z"
        fill="white"
      />
    </svg>
  );
}

function TiktokIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="9" fill="#010101" />
      <g transform="translate(8.5, 7.5)">
        <path
          d="M15 0C15 2.8 17 5.1 19.8 5.5V8.5C18 8.4 16.3 7.8 15 6.7V16.5C15 20.4 11.8 23.5 7.8 23.5C3.8 23.5 0.6 20.4 0.6 16.5C0.6 12.6 3.8 9.5 7.8 9.5C8.3 9.5 8.8 9.6 9.3 9.7V12.8C8.8 12.6 8.3 12.5 7.8 12.5C5.6 12.5 3.8 14.3 3.8 16.5C3.8 18.7 5.6 20.5 7.8 20.5C10 20.5 11.8 18.7 11.8 16.5V0H15Z"
          fill="#00F2FE"
        />
        <path
          d="M16.5 1.5C16.5 4.3 18.5 6.6 21.3 7V10C19.5 9.9 17.8 9.3 16.5 8.2V18C16.5 21.9 13.3 25 9.3 25C5.3 25 2.1 21.9 2.1 18C2.1 14.1 5.3 11 9.3 11C9.8 11 10.3 11.1 10.8 11.2V14.3C10.3 14.1 9.8 14 9.3 14C7.1 14 5.3 15.8 5.3 18C5.3 20.2 7.1 22 9.3 22C11.5 22 13.3 20.2 13.3 18V1.5H16.5Z"
          fill="#FE2C55"
        />
        <path
          d="M15.8 0.8C15.8 3.6 17.8 5.9 20.6 6.3V9.3C18.8 9.2 17.1 8.6 15.8 7.5V17.3C15.8 21.2 12.6 24.3 8.6 24.3C4.6 24.3 1.4 21.2 1.4 17.3C1.4 13.4 4.6 10.3 8.6 10.3C9.1 10.3 9.6 10.4 10.1 10.5V13.6C9.6 13.4 9.1 13.3 8.6 13.3C6.4 13.3 4.6 15.1 4.6 17.3C4.6 19.5 6.4 21.3 8.6 21.3C10.8 21.3 12.6 19.5 12.6 17.3V0.8H15.8Z"
          fill="#FFFFFF"
        />
      </g>
    </svg>
  );
}

function TelegramIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="9" fill="#229ED9" />
      <path
        d="M29.5 11.2L8.7 19.3C7.3 19.9 7.3 20.7 8.5 21L13.8 22.7L26.1 15C26.7 14.6 27.2 14.8 26.8 15.2L16.8 24.2L16.5 29C17 29 17.2 28.8 17.5 28.5L20 26.1L25.2 29.9C26.1 30.4 26.8 30.1 27.1 29L30.4 13.3C30.7 12 29.9 11.4 29.5 11.2Z"
        fill="white"
      />
    </svg>
  );
}

  const mainMenuItems = isAdmin ? roleNavigation.ADMIN : roleNavigation.STAFF;

  const salesChannels = [
    { to: '/shop', icon: Globe, label: 'Online store', external: false },
    { to: '/pos', icon: ShoppingCart, label: 'Point of sale', external: false },
  ];

  const appIntegrations = [
    { name: 'Bakong KHQR', icon: BakongIcon, badge: 'Live' },
    { name: 'Shopee', icon: ShopeeIcon, badge: 'Connected' },
    { name: 'Tiktok Shop', icon: TiktokIcon, badge: 'Sync' },
    { name: 'Telegram Bot', icon: TelegramIcon, badge: 'Active' },
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
              {appIntegrations.map((app) => {
                const IconComponent = app.icon;
                return (
                  <div
                    key={app.name}
                    className="flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <IconComponent className="h-5 w-5 rounded-md shrink-0 shadow-2xs group-hover:scale-105 transition-transform" />
                      <span className="truncate">{app.name}</span>
                    </div>
                    {app.badge && (
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        {app.badge}
                      </span>
                    )}
                  </div>
                );
              })}
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
        {/* Global Header Top Bar (visible on both Mobile and Desktop) */}
        <header className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 sm:px-5 lg:px-6 py-2.5 shrink-0 relative z-30 transition-colors">
          {/* Left Side: Mobile Menu Button or Desktop Breadcrumbs */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* Mobile Sidebar Hamburger Toggle */}
            <button
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition active:scale-95"
              aria-label="Open navigation menu"
            >
              <Menu size={18} />
            </button>

            {/* Mobile App Title */}
            <span className="lg:hidden text-sm font-black text-slate-900 dark:text-white truncate">
              {env.appName || 'Saledash'}
            </span>

            {/* Desktop Current Page Indicator */}
            <div className="hidden lg:flex items-center gap-2 text-xs font-bold">
              <span className="text-slate-400 dark:text-slate-500 font-medium">Dashboard</span>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span className="text-slate-900 dark:text-white font-extrabold">
                {pathname.includes('/dashboard/reports')
                  ? 'Analytics & Reports'
                  : pathname.includes('/dashboard/sales')
                  ? 'Orders & Sales'
                  : pathname.includes('/dashboard/products')
                  ? 'Product Catalog'
                  : pathname.includes('/dashboard/customers')
                  ? 'Customers'
                  : pathname.includes('/dashboard/expenses')
                  ? 'Store Expenses'
                  : pathname.includes('/dashboard/discounts')
                  ? 'Discounts & Promo'
                  : pathname.includes('/dashboard/profile')
                  ? 'Profile & Settings'
                  : pathname.includes('/staff/dashboard')
                  ? 'Staff Operations'
                  : 'Overview'}
              </span>
              <span className="ml-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live System
              </span>
            </div>
          </div>

          {/* Right Side: Quick Action Links + ThemeToggle + Notification Bell + User Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Desktop POS Quick Link */}
            <Link
              to="/pos"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition active:scale-95"
              title="Open Point of Sale"
            >
              <ShoppingCart size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span>POS Screen</span>
            </Link>

            {/* Desktop Online Store Quick Link */}
            <Link
              to="/shop"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition active:scale-95"
              title="View Public Storefront"
            >
              <Globe size={14} className="text-slate-500 dark:text-slate-400" />
              <span>Online Store</span>
            </Link>

            {/* Theme Toggle (Dark / Light) */}
            <div className="shrink-0">
              <ThemeToggle variant="admin" />
            </div>

            {/* Notification Bell Dropdown (with real-time unread badge) */}
            <div className="shrink-0 relative">
              <NotificationDropdown variant="admin" />
            </div>

            {/* User Profile Avatar / Chip */}
            <Link
              to="/dashboard/profile"
              className="flex items-center gap-2 rounded-xl sm:rounded-full border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 p-1 sm:pr-3 hover:border-slate-300 dark:hover:border-slate-600 transition shrink-0"
              title="View Profile & Settings"
            >
              <UserAvatar user={user} className="h-7 w-7 text-xs" />
              <div className="hidden sm:block text-left min-w-0">
                <p className="text-xs font-black text-slate-900 dark:text-white leading-none truncate max-w-[100px]">
                  {user?.name || user?.username || 'Admin'}
                </p>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none mt-0.5">
                  {displayRole || (isAdmin ? 'Admin' : 'Staff')}
                </p>
              </div>
            </Link>
          </div>
        </header>

        {/* Scrollable Viewport Main Outlet */}
        <main className="flex-1 min-h-0 p-3 sm:p-5 md:p-6 lg:p-7 overflow-y-auto scrollbar-thin">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

