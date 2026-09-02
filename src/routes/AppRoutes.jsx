import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import AdminLayout from '../components/layout/AdminLayout';
import Login from '../pages/Login';
import Pos from '../pages/Pos';
import Sales from '../pages/Sales';
import SaleDetail from '../pages/SaleDetail';
import Products from '../pages/Products';
import Customers from '../pages/Customers';
import Dashboard from '../pages/Dashboard';
import Reports from '../pages/Reports';
import Expenses from '../pages/Expenses';
import Profile from '../pages/Profile';
import NotFound from '../pages/NotFound';

/**
 * Route handler for /products:
 * - Admin logged in: Admin Products Management (/dashboard/products)
 * - Customers/Guests: Public Product Storefront (Pos)
 */
function ProductsRouteHandler() {
  const { isAdmin, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated && isAdmin) {
    return <Navigate to="/dashboard/products" replace />;
  }
  return <Pos />;
}

function DashboardWrapper() {
  const { isAdmin, loading } = useAuth();
  if (loading) return null;
  if (isAdmin) {
    return <AdminLayout />;
  }
  return <Dashboard />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* ---------- ១. AUTH (Login Only) ---------- */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Navigate to="/login" replace />} />

      {/* ---------- ២ & ៣. Main Layout ---------- */}
      <Route element={<MainLayout />}>

        {/* Public Storefront / Shopping Flow (No login required) */}
        <Route path="/" element={<Pos />} />
        <Route path="/pos" element={<Pos />} />
        <Route path="/cart" element={<Pos />} />
        <Route path="/checkout" element={<Pos />} />
        <Route path="/payment/:saleId" element={<Pos />} />
        <Route path="/products" element={<ProductsRouteHandler />} />

        {/* Protected Dashboard & Admin Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardWrapper />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route
            path="products"
            element={
              <ProtectedRoute requireAdmin>
                <Products />
              </ProtectedRoute>
            }
          />
          <Route
            path="sales"
            element={
              <ProtectedRoute>
                <Sales />
              </ProtectedRoute>
            }
          />
          <Route
            path="sales/:id"
            element={
              <ProtectedRoute>
                <SaleDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="customers"
            element={
              <ProtectedRoute requireAdmin>
                <Customers />
              </ProtectedRoute>
            }
          />
          <Route
            path="reports"
            element={
              <ProtectedRoute requireManagerOrAdmin>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="expenses"
            element={
              <ProtectedRoute requireManagerOrAdmin>
                <Expenses />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Legacy / Direct Route Aliases */}
        <Route path="/reports" element={<Navigate to="/dashboard/reports" replace />} />
        <Route path="/expenses" element={<Navigate to="/dashboard/expenses" replace />} />
        <Route path="/sales" element={<Navigate to="/dashboard/sales" replace />} />
        <Route path="/sales/:id" element={<Navigate to="/dashboard/sales" replace />} />
        <Route path="/customers" element={<Navigate to="/dashboard/customers" replace />} />
        <Route path="/admin/products" element={<Navigate to="/dashboard/products" replace />} />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* 404 Fallback */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
