import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, ShieldCheck, LogOut, Receipt, ShoppingBag,
  ArrowRight, LayoutDashboard, ShoppingCart, Package, Users,
  BarChart3, WalletCards, Shield, Sparkles, ChevronRight, Tag,
  Clock, CheckCircle2, CreditCard, Settings, Eye, RefreshCw,
  ExternalLink, ArrowUpRight, Globe, Camera, Check, AlertCircle,
  Loader2, Image, Link2, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getCustomerOrders } from '../components/pos/CustomerOrdersModal';
import { formatCurrency, formatDate } from '../utils/format';
import { usersApi } from '../api/userApi';
import { getErrorMessage } from '../api/client';
import UserAvatar from '../components/ui/UserAvatar';
import SEO from '../components/SEO';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=250&q=80',
];

export default function Account() {
  const { isAuthenticated, user, logout, refreshProfile, isAdmin, isManager, isManagerOrAdmin, isStaff, displayRole } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isProfileRoute = pathname.includes('/profile');
  const [activeTab, setActiveTab] = useState(isProfileRoute ? 'profile' : (isManagerOrAdmin || isStaff) ? 'tools' : 'orders');
  const [profileForm, setProfileForm] = useState({
    displayName: user?.displayName || user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    avatarUrl: user?.avatarUrl || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [avatarPreviewBroken, setAvatarPreviewBroken] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        displayName: user.displayName || user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        avatarUrl: user.avatarUrl || '',
      });
    }
  }, [user]);

  const orders = getCustomerOrders();
  const recentOrders = orders.slice(0, 5);

  const totalSpent = orders.reduce((sum, ord) => sum + (Number(ord.total || ord.finalTotal || ord.totalAmount) || 0), 0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-slate-950 px-4 py-16 text-center space-y-4">
        <SEO title="My Account | Mart System" canonical="/account" />
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white dark:bg-slate-900 shadow-md text-slate-400 mb-2 border border-slate-200/80 dark:border-slate-800">
          <User size={30} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Welcome to Mart System
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm font-medium">
          Sign in or create an account to view your past orders, manage your profile and access store tools.
        </p>
        <div className="flex items-center gap-3 pt-2">
          <Link
            to="/login"
            className="flex items-center gap-2 rounded-xl bg-[#164E87] hover:bg-[#123E6C] text-white px-6 py-2.5 text-xs font-bold transition shadow-md"
          >
            <span>Sign In</span>
          </Link>
          <Link
            to="/register"
            className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 transition"
          >
            <span>Register</span>
          </Link>
        </div>
      </div>
    );
  }

  // Management & Admin tools with distinct vibrant color palettes
  const adminTools = [
    {
      to: '/dashboard',
      icon: LayoutDashboard,
      title: 'Admin Dashboard',
      description: 'Overview, analytics & real-time store metrics',
      badge: 'Overview',
      visible: isStaff || isManagerOrAdmin,
      color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50',
      hoverColor: 'group-hover:bg-indigo-600 group-hover:text-white',
    },
    {
      to: '/pos',
      icon: ShoppingCart,
      title: 'POS Terminal',
      description: 'Point-of-sale checkout, barcode scanning & receipt print',
      badge: 'Cashier',
      visible: true,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50',
      hoverColor: 'group-hover:bg-emerald-600 group-hover:text-white',
    },
    {
      to: '/dashboard/products',
      icon: Package,
      title: 'Product Management',
      description: 'Manage items, pricing, inventory stock & categories',
      badge: 'Admin',
      visible: isAdmin,
      color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-900/50',
      hoverColor: 'group-hover:bg-violet-600 group-hover:text-white',
    },
    {
      to: '/dashboard/discounts',
      icon: Tag,
      title: 'Discounts & Promotions',
      description: 'Manage active promo campaigns, coupons & percentage discounts',
      badge: 'Admin',
      visible: isManagerOrAdmin,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50',
      hoverColor: 'group-hover:bg-amber-600 group-hover:text-white',
    },
    {
      to: '/dashboard/sales',
      icon: Receipt,
      title: 'Sales & Invoices',
      description: 'Transaction logs, payment records & invoice receipts',
      badge: 'Staff',
      visible: isStaff || isManagerOrAdmin,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50',
      hoverColor: 'group-hover:bg-blue-600 group-hover:text-white',
    },
    {
      to: '/dashboard/customers',
      icon: Users,
      title: 'Customer Directory',
      description: 'Customer list, contact details & buyer profiles',
      badge: 'Admin',
      visible: isAdmin,
      color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-900/50',
      hoverColor: 'group-hover:bg-teal-600 group-hover:text-white',
    },
    {
      to: '/dashboard/reports',
      icon: BarChart3,
      title: 'Financial Reports',
      description: 'Revenue breakdown, profit/loss & exportable reports',
      badge: 'Manager',
      visible: isManagerOrAdmin,
      color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-900/50',
      hoverColor: 'group-hover:bg-cyan-600 group-hover:text-white',
    },
    {
      to: '/dashboard/expenses',
      icon: WalletCards,
      title: 'Store Expenses',
      description: 'Track operating expenses, receipts & cash outflows',
      badge: 'Manager',
      visible: isManagerOrAdmin,
      color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50',
      hoverColor: 'group-hover:bg-rose-600 group-hover:text-white',
    },
  ].filter((tool) => tool.visible);

  return (
    <div className={`${isDashboardRoute ? 'space-y-6' : 'min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-20'} font-sans`}>
      <SEO title="My Account & Store Hub | Mart System" canonical={isDashboardRoute ? '/dashboard/profile' : '/account'} />

      <div className={isDashboardRoute ? 'space-y-6' : 'mx-auto max-w-5xl px-3 sm:px-6 py-6 sm:py-10 space-y-6'}>
        
        {/* Top Header & Page Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {isDashboardRoute ? 'Profile & Store Hub' : 'My Account'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Manage your profile, order history, and store administration tools
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {isDashboardRoute ? (
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2.5 text-xs font-bold transition shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <Globe size={14} />
                <span>Visit Storefront</span>
              </Link>
            ) : (
              (isManagerOrAdmin || isStaff) && (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#164E87] hover:bg-[#123E6C] text-white px-4 py-2.5 text-xs font-bold transition shadow-md hover:shadow-lg active:scale-98"
                >
                  <LayoutDashboard size={15} />
                  <span>Go to Admin Dashboard</span>
                  <ArrowRight size={14} />
                </Link>
              )
            )}
          </div>
        </div>

        {/* Profile Card Hero */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md p-5 sm:p-7">
          {/* Subtle Background Accent */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
            {/* User Info Left */}
            <div className="flex items-start sm:items-center gap-4">
              <div className="relative shrink-0 group">
                <UserAvatar user={{ ...user, avatarUrl: profileForm.avatarUrl || user?.avatarUrl }} className="h-16 w-16 sm:h-20 sm:w-20 text-2xl ring-4 ring-slate-100 dark:ring-slate-800" />
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                  title="Change profile photo"
                >
                  <Camera size={20} />
                </button>
                <span className="absolute bottom-0 right-0 block h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    {user?.displayName || user?.name || user?.username}
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                      isAdmin
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : isManager
                        ? 'bg-blue-600 text-white'
                        : isStaff
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Shield size={10} />
                    <span>{displayRole}</span>
                  </span>
                </div>

                <p className="text-xs font-mono text-slate-400 dark:text-slate-500">@{user?.username}</p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {user?.email && (
                    <span className="flex items-center gap-1.5">
                      <Mail size={13} className="text-slate-400 shrink-0" />
                      <span>{user.email}</span>
                    </span>
                  )}
                  {user?.phoneNumber && (
                    <span className="flex items-center gap-1.5">
                      <Phone size={13} className="text-slate-400 shrink-0" />
                      <span>{user.phoneNumber}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions Right */}
            <div className="flex items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/40 px-4 py-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100/70 dark:hover:bg-rose-900/50 transition cursor-pointer active:scale-98 shadow-2xs"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Stats Chips Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-100 dark:border-slate-800/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
              <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">{orders.length}</p>
            </div>

            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-100 dark:border-slate-800/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Spent</span>
              <p className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                {formatCurrency(totalSpent)}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-100 dark:border-slate-800/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Method</span>
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1">
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                <span>Bakong KHQR</span>
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-100 dark:border-slate-800/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Status</span>
              <p className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                <ShieldCheck size={14} />
                <span>Verified</span>
              </p>
            </div>
          </div>
        </div>

        {/* Tabbed Navigation Bar */}
        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-x-auto">
          {(isManagerOrAdmin || isStaff) && (
            <button
              onClick={() => setActiveTab('tools')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'tools'
                  ? 'bg-[#164E87] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard size={15} />
              <span>Store Tools & Management</span>
              <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">{adminTools.length}</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#164E87] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Receipt size={15} />
            <span>Customer Orders</span>
            <span className="ml-1 rounded-full bg-slate-200 dark:bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-700 dark:text-slate-300">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#164E87] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Settings size={15} />
            <span>Profile & Security</span>
          </button>
        </div>

        {/* TAB 1: STORE TOOLS & MANAGEMENT */}
        {activeTab === 'tools' && (isManagerOrAdmin || isStaff) && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Store Administration Tools</h3>
                <p className="text-xs text-slate-400">Quick access to store modules based on your {displayRole} access privileges</p>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 size={13} />
                <span>Privileges Active</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {adminTools.map(({ to, icon: Icon, title, description, badge, color, hoverColor }) => (
                <Link
                  key={to}
                  to={to}
                  className="group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${color} ${hoverColor} transition-all duration-200 shadow-2xs`}>
                        <Icon size={19} />
                      </div>
                      <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[10px] font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                        {badge}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-[#164E87] dark:group-hover:text-blue-400 transition">
                        {title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 pt-3.5 mt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] font-bold text-[#164E87] dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                    <span>Open Module</span>
                    <ArrowUpRight size={13} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: MY ORDERS & HISTORY */}
        {activeTab === 'orders' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Customer Order History</h3>
                <p className="text-xs text-slate-400">View receipts and invoice records created on this browser</p>
              </div>
              <Link to="/orders" className="text-xs font-bold text-[#164E87] dark:text-blue-400 hover:underline flex items-center gap-1">
                <span>All Orders</span>
                <ChevronRight size={13} />
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-10 text-center space-y-3 shadow-2xs">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400">
                  <ShoppingBag size={24} />
                </div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">No Orders Found</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
                  You have not placed any orders yet. Browse our storefront catalog to start shopping!
                </p>
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#164E87] hover:bg-[#123E6C] text-white px-5 py-2.5 text-xs font-bold transition shadow-xs mt-2"
                >
                  <ShoppingBag size={14} />
                  <span>Start Shopping</span>
                </Link>
              </div>
            ) : (
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                {orders.map((ord) => (
                  <div key={ord.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#164E87] dark:text-blue-400 shrink-0">
                        <Receipt size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-extrabold text-slate-900 dark:text-white">
                            #{ord.invoiceNumber || ord.id}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.2 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 size={10} />
                            <span>Paid (Bakong KHQR)</span>
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {formatDate(ord.createdAt || ord.saleDate || new Date())}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Amount</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          {formatCurrency(ord.total || ord.finalTotal || ord.totalAmount || 0)}
                        </span>
                      </div>

                      <Link
                        to="/orders"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition shadow-2xs"
                      >
                        <Eye size={13} />
                        <span>View</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PROFILE & SECURITY */}
        {activeTab === 'profile' && (
          <div className="space-y-4 animate-fade-in">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSavingProfile(true);
                setProfileError('');
                setProfileSuccess('');
                try {
                  await usersApi.updateMe({
                    displayName: profileForm.displayName.trim() || undefined,
                    email: profileForm.email.trim() || undefined,
                    phoneNumber: profileForm.phoneNumber.trim() || undefined,
                    avatarUrl: profileForm.avatarUrl.trim() || null,
                  });
                  await refreshProfile?.();
                  setProfileSuccess('Profile photo and details saved successfully!');
                  setTimeout(() => setProfileSuccess(''), 4000);
                } catch (err) {
                  setProfileError(getErrorMessage(err));
                } finally {
                  setSavingProfile(false);
                }
              }}
              className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 space-y-6 shadow-2xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">ព័ត៌មានផ្ទាល់ខ្លួន (Profile & Account Details)</h3>
                  <p className="text-xs text-slate-400 mt-0.5">គ្រប់គ្រងរូបភាព ព័ត៌មានទំនាក់ទំនង និងសុវត្ថិភាពគណនី</p>
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#18181B] dark:bg-white text-white dark:text-slate-900 px-5 py-2 text-xs font-black shadow-md hover:opacity-90 active:scale-95 transition disabled:opacity-50 cursor-pointer self-start sm:self-auto"
                >
                  {savingProfile ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                  <span>{savingProfile ? 'កំពុងរក្សាទុក...' : 'Save Profile'}</span>
                </button>
              </div>

              {profileSuccess && (
                <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 p-3.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 animate-fade-in">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              {profileError && (
                <div className="flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-50 dark:bg-rose-950/40 p-3.5 text-xs font-bold text-rose-700 dark:text-rose-400 animate-fade-in">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              {/* 1. Avatar Image URL & Live Preview */}
              <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800 p-4 sm:p-5 bg-slate-50/60 dark:bg-slate-850/50 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Live Avatar Preview */}
                  <div className="relative shrink-0 flex items-center justify-center">
                    <UserAvatar
                      user={{ ...user, avatarUrl: profileForm.avatarUrl || user?.avatarUrl }}
                      className="h-16 w-16 sm:h-20 sm:w-20 text-2xl ring-4 ring-white dark:ring-slate-800 shadow-md"
                    />
                  </div>

                  {/* URL Input Box */}
                  <div className="flex-1 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Link2 size={13} className="text-indigo-600 dark:text-indigo-400" />
                      <span>តំណភ្ជាប់រូបភាព (Profile Image URL)</span>
                    </label>

                    <div className="relative flex items-center">
                      <input
                        type="url"
                        value={profileForm.avatarUrl}
                        onChange={(e) => {
                          setProfileForm((prev) => ({ ...prev, avatarUrl: e.target.value }));
                          setAvatarPreviewBroken(false);
                        }}
                        placeholder="https://example.com/my-photo.jpg (or select a preset below)"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-slate-900 dark:focus:border-white focus:outline-none transition pr-8 shadow-2xs"
                      />
                      {profileForm.avatarUrl && (
                        <button
                          type="button"
                          onClick={() => setProfileForm((prev) => ({ ...prev, avatarUrl: '' }))}
                          className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                          title="Clear avatar URL"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400">
                      បញ្ចូលតំណភ្ជាប់រូបភាពពី Unsplash, Imgur, ឬវេបសាយផ្ទាល់ខ្លួន
                    </p>
                  </div>
                </div>

                {/* Preset Avatars */}
                <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    ជ្រើសរើសរូបតំណាងគំរូ (Quick Presets)
                  </span>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {AVATAR_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setProfileForm((prev) => ({ ...prev, avatarUrl: preset }))}
                        className={`relative h-10 w-10 rounded-full overflow-hidden border-2 transition active:scale-95 cursor-pointer ${
                          profileForm.avatarUrl === preset
                            ? 'border-emerald-500 ring-2 ring-emerald-500/40 scale-105'
                            : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                        title={`Select preset ${idx + 1}`}
                      >
                        <img src={preset} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                    {profileForm.avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setProfileForm((prev) => ({ ...prev, avatarUrl: '' }))}
                        className="px-2.5 py-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Text Fields (Display Name, Email, Phone, Username) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">ឈ្មោះបង្ហាញ (Display Name)</label>
                  <input
                    type="text"
                    value={profileForm.displayName}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, displayName: e.target.value }))}
                    placeholder="Bun Raksa"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-slate-900 dark:focus:border-white focus:outline-none transition shadow-2xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">អ៊ីមែល (Email Address)</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-slate-900 dark:focus:border-white focus:outline-none transition shadow-2xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">លេខទូរស័ព្ទ (Phone Number)</label>
                  <input
                    type="tel"
                    value={profileForm.phoneNumber}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                    placeholder="096 XXX XXXX"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-slate-900 dark:focus:border-white focus:outline-none transition shadow-2xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">ឈ្មោះគណនី (Username ID)</label>
                  <input
                    type="text"
                    disabled
                    value={user?.username || ''}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 px-3.5 py-2.5 text-xs text-slate-500 font-mono cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Form Bottom Save Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs text-slate-400">
                  Account Role: <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase">{displayRole}</span>
                </span>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#18181B] dark:bg-white hover:opacity-90 text-white dark:text-slate-900 px-6 py-2.5 text-xs font-black transition shadow-md active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  {savingProfile ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  <span>{savingProfile ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកព័ត៌មាន (Save Changes)'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

