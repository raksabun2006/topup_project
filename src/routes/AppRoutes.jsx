import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth, getRoleDashboardPath } from '../context/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import AdminLayout from '../components/layout/AdminLayout';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import Home from '../pages/Home';
import Shop from '../pages/Shop';
import Categories from '../pages/Categories';
import ProductDetail from '../pages/ProductDetail';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import Orders from '../pages/Orders';
import Account from '../pages/Account';
import AboutDeveloper from '../pages/AboutDeveloper';
import UserGuide from '../pages/UserGuide';
import Pos from '../pages/Pos';
import Sales from '../pages/Sales';
import SaleDetail from '../pages/SaleDetail';
import Products from '../pages/Products';
import Customers from '../pages/Customers';
import Dashboard from '../pages/Dashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import StaffDashboard from '../pages/StaffDashboard';
import CustomerDashboard from '../pages/CustomerDashboard';
import Reports from '../pages/Reports';
import Expenses from '../pages/Expenses';
import Discounts from '../pages/Discounts';
import Unauthorized from '../pages/Unauthorized';
import NotFound from '../pages/NotFound';

function DashboardLayoutWrapper() {
  const { role, isStaff, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (isAdmin || isStaff) {
    return <AdminLayout />;
  }
  return <MainLayout />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* ---------- ១. AUTH ROUTES ---------- */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* ---------- ២. MAIN STOREFRONT & CUSTOMER E-COMMERCE ---------- */}
      <Route element={<MainLayout />}>
        {/* Customer Storefront Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/products" element={<Shop />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/my-orders" element={<Orders />} />
        <Route path="/account" element={<Account />} />
        <Route path="/about" element={<AboutDeveloper />} />
        <Route path="/about-developer" element={<AboutDeveloper />} />
        <Route path="/developer" element={<AboutDeveloper />} />
        <Route path="/guide" element={<UserGuide />} />
        <Route path="/user-guide" element={<UserGuide />} />
        <Route path="/how-to-use" element={<Navigate to="/guide" replace />} />

        {/* Dedicated Customer Dashboard */}
        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'STAFF', 'ADMIN']}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Staff / In-Store POS Screen */}
        <Route
          path="/pos"
          element={
            <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
              <Pos />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* ---------- ៣. DEDICATED ADMIN & STAFF DASHBOARD ROUTES ---------- */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
            <DashboardLayoutWrapper />
          </ProtectedRoute>
        }
      >
        {/* Admin Dashboard Entry */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Staff Dashboard Entry */}
        <Route
          path="/staff/dashboard"
          element={
            <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />

        {/* General Dashboard Routing & Module Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/dashboard/products"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
              <Products />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/sales"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
              <Sales />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/sales/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
              <SaleDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/customers"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Customers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/reports"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/expenses"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Expenses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/discounts"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Discounts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/profile"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'STAFF', 'CUSTOMER']}>
              <Account />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* ---------- ៤. ALIASES & 404 FALLBACK ---------- */}
      <Route path="/reports" element={<Navigate to="/dashboard/reports" replace />} />
      <Route path="/expenses" element={<Navigate to="/dashboard/expenses" replace />} />
      <Route path="/discounts" element={<Navigate to="/dashboard/discounts" replace />} />
      <Route path="/admin/discounts" element={<Navigate to="/dashboard/discounts" replace />} />
      <Route path="/sales" element={<Navigate to="/dashboard/sales" replace />} />
      <Route path="/sales/:id" element={<Navigate to="/dashboard/sales" replace />} />
      <Route path="/customers" element={<Navigate to="/dashboard/customers" replace />} />
      <Route path="/admin/products" element={<Navigate to="/dashboard/products" replace />} />
      <Route path="/profile" element={<Navigate to="/dashboard/profile" replace />} />

      {/* 404 Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

