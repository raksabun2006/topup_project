import { Routes, Route, Navigate } from 'react-router-dom';
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
 * Route ចែកជាបីក្រុម:
 *   ១. Auth - គ្មាន navbar (អេក្រង់ពេញ)
 *   ២. Public - មាន navbar តែមិនត្រូវការ token
 *   ៣. Protected - រុំដោយ ProtectedRoute
 *
 * Route ដែលមាន MainLayout ជា PARENT ហើយ child បង្ហាញតាម <Outlet/>។
 * នេះមានន័យថា navbar មិន re-render ពេលប្តូរទំព័រ។
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/* ---------- ១. AUTH - អេក្រង់ពេញ គ្មាន navbar ---------- */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ---------- ២ + ៣. ទំព័រដែលមាន layout ---------- */}
      <Route element={<MainLayout />}>

        {/* Root - នាំផ្លូវទៅចំណុចលក់ដោយផ្ទាល់ */}
        <Route path="/" element={<Navigate to="/pos" replace />} />

        {/* Protected */}
        <Route
          path="/pos"
          element={<ProtectedRoute><Pos /></ProtectedRoute>}
        />
        <Route
          path="/sales"
          element={<ProtectedRoute><Sales /></ProtectedRoute>}
        />
        <Route
          path="/sales/:id"
          element={<ProtectedRoute><SaleDetail /></ProtectedRoute>}
        />
        <Route
          path="/products"
          element={<ProtectedRoute requireAdmin><Products /></ProtectedRoute>}
        />
        <Route
          path="/customers"
          element={<ProtectedRoute requireAdmin><Customers /></ProtectedRoute>}
        />
        <Route
          path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute><Profile /></ProtectedRoute>}
        />

        {/* ត្រូវនៅចុងក្រោយ - "*" ចាប់អ្វីៗទាំងអស់ដែលមិនផ្គូផ្គង */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
