import { Link, useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, ShieldCheck, LogOut, Receipt, ShoppingBag,
  ArrowRight, KeyRound, MapPin, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getCustomerOrders } from '../components/pos/CustomerOrdersModal';
import { formatCurrency, formatDate } from '../utils/format';
import UserAvatar from '../components/ui/UserAvatar';
import SEO from '../components/SEO';

export default function Account() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const orders = getCustomerOrders();
  const recentOrders = orders.slice(0, 3);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center bg-white dark:bg-slate-950 px-4 py-16 text-center space-y-4">
        <SEO title="My Account | Mart System" canonical="/account" />
        <div className="flex h-18 w-18 items-center justify-center rounded-full bg-[#F7F7F8] dark:bg-slate-900 text-slate-400 mb-2">
          <User size={32} />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Welcome to Mart System
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm font-medium">
          Sign in or create an account to view your past orders and saved details.
        </p>
        <div className="flex items-center gap-3 pt-2">
          <Link
            to="/login"
            className="flex items-center gap-2 rounded-full bg-[#18181B] px-6 py-2.5 text-xs font-bold text-white hover:bg-black transition shadow-xs"
          >
            <span>Sign In</span>
          </Link>
          <Link
            to="/register"
            className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50"
          >
            <span>Register</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-20">
      <SEO title="My Account | Mart System" canonical="/account" />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            My Account
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your personal profile and recent purchases
          </p>
        </div>

        {/* Profile Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-[#F7F7F8] dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6">
          <div className="flex items-center gap-4">
            <UserAvatar user={user} className="h-16 w-16 text-xl" />
            <div className="space-y-1">
              <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                {user?.displayName || user?.name || user?.username}
              </h2>
              <p className="text-xs text-slate-400 font-mono">@{user?.username}</p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500">
                {user?.email && (
                  <span className="flex items-center gap-1">
                    <Mail size={13} className="text-slate-400" />
                    <span>{user.email}</span>
                  </span>
                )}
                {user?.phoneNumber && (
                  <span className="flex items-center gap-1">
                    <Phone size={13} className="text-slate-400" />
                    <span>{user.phoneNumber}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 dark:border-slate-800">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Quick Links & Recent Orders */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Quick Menu */}
          <div className="md:col-span-5 rounded-3xl bg-[#F7F7F8] dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 px-2 pb-1">
              Quick Menu
            </h3>

            {[
              { to: '/orders', icon: Receipt, label: 'My Orders' },
              { to: '/cart', icon: ShoppingBag, label: 'Shopping Bag' },
              { to: '/shop', icon: ShieldCheck, label: 'Explore Store' },
            ].map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition"
              >
                <span className="flex items-center gap-2.5">
                  <Icon size={16} className="text-slate-400" />
                  <span>{label}</span>
                </span>
                <ChevronRight size={14} className="text-slate-400" />
              </Link>
            ))}
          </div>

          {/* Recent Orders */}
          <div className="md:col-span-7 rounded-3xl bg-[#F7F7F8] dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Recent Orders
              </h3>
              <Link to="/orders" className="text-xs font-bold text-emerald-600 hover:underline">
                View All
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No recent orders found.
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="flex items-center justify-between rounded-2xl bg-white dark:bg-slate-800 p-3 text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white font-mono">
                        #{ord.invoiceNumber || ord.id}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {formatDate(ord.createdAt || ord.saleDate || new Date())}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency(ord.total || ord.finalTotal || ord.totalAmount || 0)}
                      </p>
                      <span className="text-[10px] font-bold text-emerald-600">
                        ✓ Paid (Bakong KHQR)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
