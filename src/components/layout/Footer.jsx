import { Link } from 'react-router-dom';
import { Store } from 'lucide-react';
import { env } from '../../config/env';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-ink-950">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <Link to="/pos" className="flex items-center gap-2">
            <Store size={22} className="text-emerald-600" />
            <span className="font-bold text-slate-900">{env.appName}</span>
          </Link>

          <nav className="flex gap-6 text-sm text-slate-500">
            <Link to="/pos" className="transition hover:text-slate-900">ចំណុចលក់</Link>
            <Link to="/sales" className="transition hover:text-slate-900">ការលក់</Link>
          </nav>
        </div>

        <p className="mt-8 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} {env.appName}. ប្រព័ន្ធគិតលុយសម្រាប់ហាងលក់រាយ។
        </p>
      </div>
    </footer>
  );
}
