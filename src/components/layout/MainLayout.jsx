import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * Outlet ជាកន្លែងដែល child route បង្ហាញ។
 *
 * ទំព័រ /pos ត្រូវការកម្ពស់ពេញអេក្រង់ដូចម៉ាស៊ីនគិតលុយពិត (គ្មាន
 * scroll នៅកម្រិត page) - ដូច្នេះលាក់ Footer ចោលនៅទំព័រនោះ។
 */
export default function MainLayout() {
  const { pathname } = useLocation();
  const isPos = pathname === '/pos';

  return (
    <div className={`flex flex-col bg-ink-950 text-slate-700 selection:bg-emerald-500 selection:text-white ${isPos ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      <Navbar />
      <main className={isPos ? 'min-h-0 flex-1' : 'flex-1'}>
        <Outlet />
      </main>
      {!isPos && <Footer />}
    </div>
  );
}