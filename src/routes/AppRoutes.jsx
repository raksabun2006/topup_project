import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import AdminLayout from '../components/layout/AdminLayout';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Home from '../pages/Home';
import Shop from '../pages/Shop';
import Categories from '../pages/Categories';
import ProductDetail from '../pages/ProductDetail';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import Orders from '../pages/Orders';
import Account from '../pages/Account';
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
      {/* ---------- ១. AUTH ROUTES ---------- */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

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

        {/* Staff / In-Store POS Screen */}
        <Route path="/pos" element={<Pos />} />

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
