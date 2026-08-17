import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import MainLayout from '../components/layout/MainLayout';
import Payment from '../pages/Payment';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Games from '../pages/Games';
import GameDetails from '../pages/GameDetails';
import TopUp from '../pages/TopUp';
import Dashboard from '../pages/Dashboard';
import Orders from '../pages/Orders';
import OrderDetails from '../pages/OrderDetails';
import Profile from '../pages/Profile';
import NotFound from '../pages/NotFound';

/** Navigate to="/games/:gameCode" ជា literal string, មិនចាប់យក param ទេ។ */
function LegacyGameRedirect() {
  const { gameCode } = useParams();
  return <Navigate to={`/games/${gameCode}`} replace />;
}

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

        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/games" element={<Games />} />

        {/* gameCode មិនមែន gameId ទេ - backend ស្វែងរកតាម code
            ដូចជា MLBB ព្រោះវាស្អាតជាងក្នុង URL ជាង UUID។ */}
        <Route path="/games/:gameCode" element={<GameDetails />} />

        {/* Protected */}
        <Route
          path="/top-up/:gameCode"
          element={<ProtectedRoute><TopUp /></ProtectedRoute>}
        />
        <Route
          path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />
        <Route
          path="/orders"
          element={<ProtectedRoute><Orders /></ProtectedRoute>}
        />
        {/* orderNumber ដូចជា ORD-20260811-000001 មិនមែន UUID ទេ */}
        <Route
          path="/orders/:orderNumber"
          element={<ProtectedRoute><OrderDetails /></ProtectedRoute>}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute><Profile /></ProtectedRoute>}
        />

        {/* ផ្លូវចាស់ - បញ្ជូនបន្តជំនួសឱ្យការបំបែក bookmark */}
        <Route path="/game/:gameCode" element={<LegacyGameRedirect />} />
<Route
  path="/payment/:orderId"
  element={<ProtectedRoute><Payment /></ProtectedRoute>}
/>
        {/* ត្រូវនៅចុងក្រោយ - "*" ចាប់អ្វីៗទាំងអស់ដែលមិនផ្គូផ្គង */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}