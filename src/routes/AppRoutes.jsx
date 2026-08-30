import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import Login from '../pages/Login';
import Pos from '../pages/Pos';
import Sales from '../pages/Sales';
import SaleDetail from '../pages/SaleDetail';
import Products from '../pages/Products';
import Customers from '../pages/Customers';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import NotFound from '../pages/NotFound';

/**
 * Route handler for /products:
 * - Admin logged in: Admin Products Management
 * - Customers/Guests: Public Product Storefront (Pos)
 */
function ProductsRouteHandler() {
  const { isAdmin, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated && isAdmin) {
    return <Products />;
  }
  return <Pos />;
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

        {/* Protected Staff & Admin Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales"
          element={
            <ProtectedRoute>
              <Sales />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/:id"
          element={
            <ProtectedRoute>
              <SaleDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute requireAdmin>
              <Products />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <ProtectedRoute requireAdmin>
              <Customers />
            </ProtectedRoute>
          }
        />
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
