import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, Receipt, CheckCircle2, Clock, CreditCard,
  User, ShieldCheck, ArrowRight, RefreshCw, AlertCircle,
  Eye, Package, Settings, ExternalLink, ChevronRight,
  Heart, MapPin, Award, HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getCustomerOrders } from '../components/pos/CustomerOrdersModal';
import { formatCurrency, formatDate } from '../utils/format';
import UserAvatar from '../components/ui/UserAvatar';
import SEO from '../components/SEO';

export default function CustomerDashboard() {
  const { user, refreshProfile } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      // Sync fresh profile & customer order history
      await refreshProfile?.();
      const localOrders = getCustomerOrders();
      setOrders(localOrders);
    } catch (err) {
      console.error('Failed to load customer dashboard data:', err);
      setError('Unable to load your latest customer data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalSpent = orders.reduce((sum, ord) => sum + (Number(ord.total || ord.finalTotal || ord.totalAmount) || 0), 0);
  const completedCount = orders.filter((ord) => ord.status !== 'CANCELLED').length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-20 font-sans">
      <SEO title="Customer Dashboard | Mart System" canonical="/customer/dashboard" />

      <div className="mx-auto max-w-5xl px-3 sm:px-6 py-6 sm:py-10 space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-blue-100 dark:bg-blue-950/80 px-2.5 py-0.5 text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                Customer Portal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              Customer Dashboard
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Welcome back! Track your orders, view receipts, and manage your account details.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>

            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-xl bg-[#164E87] hover:bg-[#123E6C] text-white px-4 py-2 text-xs font-bold transition shadow-md hover:shadow-lg active:scale-98"
            >
              <ShoppingBag size={14} />
              <span>Browse Store</span>
            </Link>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 p-4 text-xs font-semibold text-rose-700 dark:text-rose-400">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadData}
              className="underline font-bold hover:text-rose-800 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Customer Profile Hero Card */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md p-5 sm:p-7">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start sm:items-center gap-4">
              <div className="relative shrink-0">
                <UserAvatar user={user} className="h-16 w-16 sm:h-20 sm:w-20 text-2xl ring-4 ring-slate-100 dark:ring-slate-800" />
                <span className="absolute bottom-0 right-0 block h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    {user?.displayName || user?.name || user?.username}
                  </h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                    <ShieldCheck size={11} />
                    <span>Customer Account</span>
                  </span>
                </div>

                <p className="text-xs font-mono text-slate-400 dark:text-slate-500">@{user?.username}</p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {user?.email && <span>{user.email}</span>}
                  {user?.phoneNumber && <span>{user.phoneNumber}</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <Link
                to="/account"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition shadow-2xs"
              >
                <Settings size={13} />
                <span>Account Settings</span>
              </Link>
            </div>
          </div>

          {/* Metric Chips Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-100 dark:border-slate-800/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">My Total Orders</span>
              <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
                {loading ? '—' : orders.length}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-100 dark:border-slate-800/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Spent</span>
              <p className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                {loading ? '—' : formatCurrency(totalSpent)}
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
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Delivery Support</span>
              <p className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                $1.50 Express
              </p>
            </div>
          </div>
        </div>

        {/* Quick Customer Hub Shortcuts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Link
            to="/shop"
            className="group flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-emerald-500 transition"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#164E87] dark:text-blue-400 group-hover:scale-105 transition-transform">
                <ShoppingBag size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">Store Catalog</h3>
                <p className="text-[11px] text-slate-400">Fresh grocery & electronic items</p>
              </div>
            </div>
            <ChevronRight size={15} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            to="/orders"
            className="group flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-emerald-500 transition"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
                <Receipt size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">Orders & Receipts</h3>
                <p className="text-[11px] text-slate-400">Track order delivery & status</p>
              </div>
            </div>
            <ChevronRight size={15} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            to="/wishlist"
            className="group flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-emerald-500 transition"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 group-hover:scale-105 transition-transform">
                <Heart size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">Saved Wishlist</h3>
                <p className="text-[11px] text-slate-400">View favorite bookmarked items</p>
              </div>
            </div>
            <ChevronRight size={15} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            to="/account/addresses"
            className="group flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-emerald-500 transition"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
                <MapPin size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">Delivery Addresses</h3>
                <p className="text-[11px] text-slate-400">Manage home & work locations</p>
              </div>
            </div>
            <ChevronRight size={15} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            to="/account/loyalty"
            className="group flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-emerald-500 transition"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <Award size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">Loyalty & Rewards</h3>
                <p className="text-[11px] text-slate-400">Redeem points for discounts</p>
              </div>
            </div>
            <ChevronRight size={15} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            to="/help"
            className="group flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-emerald-500 transition"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 group-hover:scale-105 transition-transform">
                <HelpCircle size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">Help Center & Support</h3>
                <p className="text-[11px] text-slate-400">FAQs, KHQR guides & tickets</p>
              </div>
            </div>
            <ChevronRight size={15} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Recent Customer Orders Section */}
        <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#164E87] dark:text-blue-400">
                <Receipt size={16} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Recent Customer Orders</h3>
                <p className="text-[11px] text-slate-400">Your latest purchases and Bakong KHQR invoices</p>
              </div>
            </div>

            <Link to="/orders" className="text-xs font-bold text-[#164E87] dark:text-blue-400 hover:underline flex items-center gap-1">
              <span>View All</span>
              <ChevronRight size={13} />
            </Link>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="p-10 sm:p-14 text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400">
                <ShoppingBag size={24} />
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">No Orders Found</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
                You have not placed any orders yet. Explore our grocery and electronics store to start shopping!
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
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {orders.slice(0, 5).map((ord) => (
                <div
                  key={ord.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition"
                >
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
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Paid</span>
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        {formatCurrency(ord.total || ord.finalTotal || ord.totalAmount || 0)}
                      </span>
                    </div>

                    <Link
                      to="/orders"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition shadow-2xs"
                    >
                      <Eye size={13} />
                      <span>View Receipt</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
