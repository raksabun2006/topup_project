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
import PosCustomerDisplayPage from '../pages/PosCustomerDisplayPage';
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
import Wishlist from '../pages/Wishlist';
import OrderSuccess from '../pages/OrderSuccess';
import OrderDetail from '../pages/OrderDetail';
import AddressManagement from '../pages/AddressManagement';
import LoyaltyPoints from '../pages/LoyaltyPoints';
import CustomerSupport from '../pages/CustomerSupport';
import HelpCenter from '../pages/HelpCenter';
import StaffOrders from '../pages/StaffOrders';
import Unauthorized from '../pages/Unauthorized';
import NotFound from '../pages/NotFound';
import OrderTracking from '../pages/OrderTracking';
import Deliveries from '../pages/admin/Deliveries';
import DeliveryDetail from '../pages/admin/DeliveryDetail';
import DeliveryProviders from '../pages/admin/DeliveryProviders';
import DeliveryZones from '../pages/admin/DeliveryZones';
import DeliveryReports from '../pages/admin/DeliveryReports';
import Notifications from '../pages/Notifications';

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
        <Route path="/category/:categoryName" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/products/:slug" element={<ProductDetail />} />
        <Route path="/shop/product/:slug" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
        <Route path="/orders/:id/tracking" element={<OrderTracking />} />
        <Route path="/orders/:orderId/delivery" element={<OrderTracking />} />
        <Route path="/tracking" element={<OrderTracking />} />
        <Route path="/my-orders" element={<Orders />} />
        <Route path="/account" element={<Account />} />
        <Route path="/account/orders" element={<Orders />} />
        <Route path="/account/orders/:id" element={<OrderDetail />} />
        <Route path="/account/addresses" element={<AddressManagement />} />
        <Route path="/account/loyalty" element={<LoyaltyPoints />} />
        <Route path="/account/support" element={<CustomerSupport />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/about" element={<AboutDeveloper />} />
        <Route path="/about-developer" element={<AboutDeveloper />} />
        <Route path="/developer" element={<AboutDeveloper />} />
        <Route path="/guide" element={<UserGuide />} />
        <Route path="/user-guide" element={<UserGuide />} />
        <Route path="/how-to-use" element={<Navigate to="/guide" replace />} />

        {/* Real-time Notifications Center */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'STAFF', 'ADMIN']}>
              <Notifications />
            </ProtectedRoute>
          }
        />

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

        {/* Customer-Facing In-Store Display (Dual Monitor / Customer Tablet) */}
        <Route path="/pos/customer-display" element={<PosCustomerDisplayPage />} />
        <Route path="/pos-display" element={<PosCustomerDisplayPage />} />
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
          path="/dashboard/orders"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
              <StaffOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/orders"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
              <StaffOrders />
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

        {/* Courier & Delivery Operations */}
        <Route
          path="/dashboard/deliveries"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
              <Deliveries />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/deliveries/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
              <DeliveryDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/deliveries/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
              <DeliveryDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/delivery-providers"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DeliveryProviders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/delivery-zones"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DeliveryZones />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/reports/delivery"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DeliveryReports />
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
      <Route path="/orders/success" element={<Navigate to="/order-success" replace />} />
      <Route path="/loyalty" element={<Navigate to="/account/loyalty" replace />} />
      <Route path="/addresses" element={<Navigate to="/account/addresses" replace />} />
      <Route path="/support" element={<Navigate to="/account/support" replace />} />
      <Route path="/admin/deliveries" element={<Navigate to="/dashboard/deliveries" replace />} />
      <Route path="/admin/delivery-providers" element={<Navigate to="/dashboard/delivery-providers" replace />} />
      <Route path="/admin/delivery-zones" element={<Navigate to="/dashboard/delivery-zones" replace />} />
      <Route path="/admin/reports/delivery" element={<Navigate to="/dashboard/reports/delivery" replace />} />
      <Route path="/dashboard/notifications" element={<Navigate to="/notifications" replace />} />
      <Route path="/admin/notifications" element={<Navigate to="/notifications" replace />} />

      {/* 404 Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

