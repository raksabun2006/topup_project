import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from '../cart/CartDrawer';
import CustomerBottomNav from './CustomerBottomNav';
import { useAuth } from '../../context/AuthContext';

export default function MainLayout() {
  const { pathname } = useLocation();
  const { isAdmin } = useAuth();
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  const isStaffPos = pathname === '/pos';
  const isAdminDashboard = (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) && isAdmin;
  const isFullScreen = isStaffPos || isAdminDashboard;

  return (
    <div className={`flex flex-col bg-[#F8FAFC] dark:bg-slate-950 text-slate-800 dark:text-slate-200 selection:bg-emerald-500 selection:text-white transition-colors duration-200 ${isFullScreen ? 'h-[100dvh] max-h-[100dvh] overflow-hidden' : 'min-h-[100dvh]'}`}>
      {!isAdminDashboard && (
        <Navbar onOpenCart={() => setCartDrawerOpen(true)} />
      )}

      <main className={isFullScreen ? 'min-h-0 flex-1 flex flex-col overflow-hidden' : 'flex-1'}>
        <Outlet />
      </main>

      {/* Global Slide-out Cart Drawer */}
      <CartDrawer isOpen={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} />

      {/* Mobile Customer Bottom Navigation (on public customer pages) */}
      {!isFullScreen && (
        <CustomerBottomNav onOpenCart={() => setCartDrawerOpen(true)} />
      )}

      {/* Modern E-Commerce Footer */}
      {!isFullScreen && <Footer />}
    </div>
  );
}