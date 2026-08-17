import { Link } from 'react-router-dom';
import { Home, Gamepad2 } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-500 bg-clip-text text-7xl font-black text-transparent">404</p>
      <h1 className="mt-4 text-2xl font-bold text-white">រកមិនឃើញទំព័រ</h1>
      <p className="mt-2 max-w-sm text-slate-400">
        ទំព័រដែលអ្នកកំពុងស្វែងរកមិនមានទេ ឬត្រូវបានផ្លាស់ទី។
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-5 py-3 font-medium text-white shadow-lg shadow-purple-600/30 transition hover:scale-105 hover:from-purple-500 hover:to-fuchsia-500"
        >
          <Home size={18} />
          ទំព័រដើម
        </Link>
        <Link
          to="/games"
          className="inline-flex items-center gap-2 rounded-xl border border-purple-900/40 px-5 py-3 font-medium text-slate-300 transition hover:border-purple-500/40 hover:text-white"
        >
          <Gamepad2 size={18} />
          មើលហ្គេម
        </Link>
      </div>
    </div>
  );
}
