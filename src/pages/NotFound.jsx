import { Link } from 'react-router-dom';
import { Home, ShoppingBag, Layers, HelpCircle, ArrowLeft } from 'lucide-react';
import SEO from '../components/SEO';

export default function NotFound() {
  return (
    <main className="flex min-h-[75vh] flex-col items-center justify-center px-4 py-16 text-center">
      <SEO
        title="404 Page Not Found (រកមិនឃើញទំព័រ) | Mart System Cambodia"
        description="The page you are looking for does not exist or has been moved. Explore our grocery catalog and products at Mart System."
        robots="noindex, nofollow"
      />
      <div className="space-y-4 max-w-md mx-auto">
        <p className="bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 bg-clip-text text-8xl font-black text-transparent">
          404
        </p>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Page Not Found • រកមិនឃើញទំព័រ
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
          The page or product you were looking for doesn't exist or has been relocated.
          Explore our store catalog or search for fresh groceries and products.
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-2.5">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-5 py-2.5 text-xs font-black shadow-md hover:bg-slate-800 dark:hover:bg-slate-100 transition active:scale-95 cursor-pointer"
          >
            <Home size={14} />
            <span>Store Homepage</span>
          </Link>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 text-xs font-black shadow-md transition active:scale-95 cursor-pointer"
          >
            <ShoppingBag size={14} />
            <span>Browse Catalog</span>
          </Link>
          <Link
            to="/categories"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 px-4 py-2.5 text-xs font-bold shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800 transition active:scale-95 cursor-pointer"
          >
            <Layers size={14} />
            <span>Categories</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
