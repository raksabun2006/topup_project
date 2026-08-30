import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import MainLayout from '../components/layout/MainLayout';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Pos from '../pages/Pos';
import Sales from '../pages/Sales';
import SaleDetail from '../pages/SaleDetail';
import Products from '../pages/Products';
import Customers from '../pages/Customers';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import NotFound from '../pages/NotFound';

/**
 * Route Structure:
 * 
 * 1. AUTH (Full screen, unauthenticated / optional):
 *    /login, /register
 * 
 * 2. PUBLIC STOREFRONT (No login required for browsing & purchasing):
 *    / (Storefront / Products / Cart / Checkout)
 *    /pos
 * 
 * 3. PROTECTED (Staff & Admin only):
 *    /dashboard
 *    /sales
 *    /sales/:id
 *    /products (Inventory Management - Admin only)
 *    /customers (Customer Management - Admin only)
 *    /profile (Staff/Admin Profile)
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/* ---------- ១. AUTH (Login & Register) ---------- */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ---------- ២ & ៣. Main Layout ---------- */}
      <Route element={<MainLayout />}>

        {/* Public Storefront / Shopping Flow */}
        <Route path="/" element={<Pos />} />
        <Route path="/pos" element={<Pos />} />

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
          path="/products"
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
