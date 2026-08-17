import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * Outlet ជាកន្លែងដែល child route បង្ហាញ។
 *
 * flex-col + flex-1 ធានាថា footer នៅបាតអេក្រង់ទោះទំព័រខ្លី។
 */
export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-ink-950 text-slate-200 selection:bg-purple-500 selection:text-white">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}