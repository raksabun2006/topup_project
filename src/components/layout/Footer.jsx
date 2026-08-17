import { Link } from 'react-router-dom';
import { Gamepad2 } from 'lucide-react';
import { env } from '../../config/env';

export default function Footer() {
  return (
    <footer className="border-t border-purple-900/30 bg-ink-950">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <Link to="/" className="flex items-center gap-2">
            <Gamepad2 size={22} className="text-purple-400" />
            <span className="font-bold text-white">{env.appName}</span>
          </Link>

          <nav className="flex gap-6 text-sm text-slate-400">
            <Link to="/games" className="transition hover:text-white">ហ្គេម</Link>
            <Link to="/orders" className="transition hover:text-white">ការបញ្ជាទិញ</Link>
          </nav>
        </div>

        <p className="mt-8 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} {env.appName}. បញ្ចូលទឹកប្រាក់ហ្គេមតាមរយៈ
          អ្នកផ្តល់សេវាដែលមានការអនុញ្ញាត។
        </p>
      </div>
    </footer>
  );
}
