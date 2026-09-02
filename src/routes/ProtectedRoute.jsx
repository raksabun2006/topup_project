import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children, requireAdmin = false, requireManagerOrAdmin = false }) {
  const { isAuthenticated, isAdmin, isManagerOrAdmin, loading } = useAuth();
  const location = useLocation();

  // កុំសម្រេចចិត្តមុនពេលដឹងថាអ្នកប្រើជានរណា។
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // state.from អនុញ្ញាតឱ្យ Login បញ្ជូនត្រឡប់ទៅកន្លែងដើមវិញ។
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireManagerOrAdmin && !isManagerOrAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}