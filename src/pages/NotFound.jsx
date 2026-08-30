import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import SEO from '../components/SEO';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <SEO
        title="រកមិនឃើញទំព័រ (404) | Mart System"
        robots="noindex, nofollow"
      />
      <p className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 bg-clip-text text-7xl font-black text-transparent">404</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">រកមិនឃើញទំព័រ</h1>
      <p className="mt-2 max-w-sm text-slate-500 dark:text-slate-400">
        ទំព័រដែលអ្នកកំពុងស្វែងរកមិនមានទេ ឬត្រូវបានផ្លាស់ទី។
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/pos"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white shadow-lg shadow-emerald-600/30 transition hover:scale-105 hover:bg-emerald-500"
        >
          <ShoppingCart size={18} />
          ចំណុចលក់
        </Link>
      </div>
    </div>
  );
}
