import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from '../../context/AuthContext';

/**
 * Outlet ជាកន្លែងដែល child route បង្ហាញ។
 *
 * ទំព័រ /pos ត្រូវការកម្ពស់ពេញអេក្រង់ដូចម៉ាស៊ីនគិតលុយពិត (គ្មាន
 * scroll នៅកម្រិត page) - ដូច្នេះលាក់ Footer ចោលនៅទំព័រនោះ។ ទំព័រ
 * /dashboard សម្រាប់ admin មាន sidebar+topbar ផ្ទាល់ខ្លួន ដូច្នេះលាក់
 * Navbar/Footer ខាងក្រៅចោលដែរ ដើម្បីកុំឲ្យមាន navigation ជាន់គ្នា។
 */
export default function MainLayout() {
  const { pathname } = useLocation();
  const { isAdmin } = useAuth();
  const isPos = pathname === '/pos' || pathname === '/' || pathname === '/cart' || pathname === '/checkout' || pathname.startsWith('/payment');
  const isAdminDashboard = pathname === '/dashboard' && isAdmin;
  const isFullScreen = isPos || isAdminDashboard;

  return (
    <div className={`flex flex-col bg-ink-950 text-slate-700 selection:bg-emerald-500 selection:text-white ${isFullScreen ? 'h-[100dvh] max-h-[100dvh] overflow-hidden' : 'min-h-[100dvh]'}`}>
      {!isAdminDashboard && <Navbar />}
      <main className={isFullScreen ? 'min-h-0 flex-1 flex flex-col overflow-hidden' : 'flex-1'}>
        <Outlet />
      </main>
      {!isPos && !isAdminDashboard && <Footer />}
    </div>
  );
}