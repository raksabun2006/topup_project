import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, normalizeRole } from '../context/AuthContext';


export function ProtectedRoute({
  children,
  allowedRoles,
  requireAdmin = false,
  requireManagerOrAdmin = false,
}) {
  const { isAuthenticated, role, user, loading } = useAuth();
  const location = useLocation();

  // Prevent UI flash while authentication state & role are resolving
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] dark:bg-slate-950 font-sans">
        <div className="flex flex-col items-center gap-3.5 p-6 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-lg shadow-emerald-500/5 text-center">
          <div className="relative flex items-center justify-center w-12 h-12">
            <div className="absolute inset-0 rounded-2xl bg-emerald-500/20 dark:bg-emerald-500/30 animate-ping opacity-60" />
            <img
              src="/mart.jpg"
              alt="Mart System"
              className="relative w-10 h-10 rounded-xl object-cover shadow-sm border border-slate-200/60 dark:border-slate-700/60"
            />
          </div>
          <div className="space-y-0.5">
            <span className="block text-xs font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              MART SYSTEM
            </span>
            <span className="block text-[11px] font-medium text-slate-400 dark:text-slate-500">
              Verifying permissions...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in -> redirect to login with original target location
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = normalizeRole(role || user?.role);

  // Check allowedRoles array if provided
  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const normalizedAllowed = allowedRoles.map(normalizeRole);
    if (!normalizedAllowed.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Backwards compatibility for requireAdmin
  if (requireAdmin && userRole !== 'ADMIN') {
    return <Navigate to="/unauthorized" replace />;
  }

  // Backwards compatibility for requireManagerOrAdmin
  if (requireManagerOrAdmin && userRole !== 'ADMIN' && userRole !== 'STAFF') {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}