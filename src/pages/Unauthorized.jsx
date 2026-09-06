import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, LogOut } from 'lucide-react';
import { useAuth, getRoleDashboardPath } from '../context/AuthContext';
import SEO from '../components/SEO';

export default function Unauthorized() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const homeDashboard = getRoleDashboardPath(role || user?.role);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 bg-[#F8FAFC] dark:bg-slate-950 font-sans">
      <SEO title="403 Access Denied | Mart System" robots="noindex, nofollow" />

      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 text-center space-y-5 shadow-xl animate-scale-in">
        {/* Shield Icon Badge */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40 shadow-xs">
          <ShieldAlert size={34} />
        </div>

        {/* Header Text */}
        <div className="space-y-1.5">
          <span className="inline-block rounded-full bg-rose-100 dark:bg-rose-950 px-3 py-0.5 text-[11px] font-black text-rose-700 dark:text-rose-400 uppercase tracking-wider">
            403 Forbidden
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Access Denied
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-xs mx-auto leading-relaxed">
            You do not have the required permissions to access this page or administrative module.
          </p>
        </div>

        {/* User Role Badge */}
        {user && (
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3 text-xs flex items-center justify-between">
            <span className="text-slate-400 font-medium">Logged in as:</span>
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
              <span>{user.username}</span>
              <span className="rounded-full bg-slate-200 dark:bg-slate-700 px-2 py-0.2 text-[10px] font-black uppercase text-slate-700 dark:text-slate-300">
                {role || user.role || 'CUSTOMER'}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <Link
            to={homeDashboard}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#164E87] hover:bg-[#123E6C] text-white py-3 text-xs font-bold shadow-md shadow-blue-500/15 transition active:scale-98"
          >
            <Home size={15} />
            <span>Return to My Dashboard</span>
          </Link>

          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 py-2.5 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            <ArrowLeft size={14} />
            <span>Back to Storefront</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
