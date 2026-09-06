import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, normalizeRole } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

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
        <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <Loader2 className="h-7 w-7 animate-spin text-[#164E87] dark:text-blue-400" />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Verifying permissions...
          </span>
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