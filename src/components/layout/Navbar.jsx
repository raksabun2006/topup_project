import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Gamepad2, Menu, X, User, LogOut, Package, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { env } from '../../config/env';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setMobileOpen(false);
    navigate('/');
  };

  /** NavLink ផ្តល់ isActive ដោយស្វ័យប្រវត្តិ។ */
  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition ${
      isActive ? 'text-purple-400' : 'text-slate-400 hover:text-white'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-purple-900/30 bg-ink-950/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">

        <Link to="/" className="flex items-center gap-2">
          <Gamepad2 size={26} className="text-purple-400" />
          <span className="text-lg font-bold text-white">{env.appName}</span>
        </Link>

        {/* ---------- Desktop ---------- */}
        <div className="hidden items-center gap-8 md:flex">
          <NavLink to="/" className={linkClass} end>ទំព័រដើម</NavLink>
          <NavLink to="/games" className={linkClass}>ហ្គេម</NavLink>
          {isAuthenticated && (
            <NavLink to="/orders" className={linkClass}>ការបញ្ជាទិញ</NavLink>
          )}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-slate-400 transition hover:text-white"
              >
                ចូល
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-600/30 transition hover:scale-105 hover:from-purple-500 hover:to-fuchsia-500"
              >
                ចុះឈ្មោះ
              </Link>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-xl border border-purple-900/40 bg-ink-900 px-3 py-2 text-sm text-slate-300 shadow-sm transition hover:border-purple-500/40 hover:text-white"
              >
                <User size={16} />
                {user?.username}
              </button>

              {menuOpen && (
                <>
                  {/* ចុចខាងក្រៅដើម្បីបិទ - ត្រូវនៅមុខ menu ក្នុង DOM។ */}
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-purple-900/40 bg-ink-900 shadow-lg shadow-black/40">
                    {[
                      { to: '/dashboard', icon: LayoutDashboard, label: 'ផ្ទាំងគ្រប់គ្រង' },
                      { to: '/orders', icon: Package, label: 'ការបញ្ជាទិញ' },
                      { to: '/profile', icon: User, label: 'ព័ត៌មានផ្ទាល់ខ្លួន' },
                    ].map(({ to, icon: Icon, label }) => (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 transition hover:bg-purple-950/40 hover:text-white"
                      >
                        <Icon size={16} className="text-slate-500" />
                        {label}
                      </Link>
                    ))}

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 border-t border-purple-900/30 px-4 py-3 text-sm text-rose-400 transition hover:bg-rose-500/10"
                    >
                      <LogOut size={16} />
                      ចាកចេញ
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-slate-300 md:hidden"
          aria-label="បើកម៉ឺនុយ"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* ---------- Mobile ---------- */}
      {mobileOpen && (
        <div className="border-t border-purple-900/30 bg-ink-950 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {[
              { to: '/', label: 'ទំព័រដើម', end: true },
              { to: '/games', label: 'ហ្គេម' },
            ].map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-3 text-sm font-medium ${
                    isActive ? 'bg-purple-950/50 text-purple-300' : 'text-slate-400'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}

            {isAuthenticated ? (
              <>
                {[
                  { to: '/dashboard', label: 'ផ្ទាំងគ្រប់គ្រង' },
                  { to: '/orders', label: 'ការបញ្ជាទិញ' },
                  { to: '/profile', label: 'ព័ត៌មានផ្ទាល់ខ្លួន' },
                ].map(({ to, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `rounded-xl px-3 py-3 text-sm font-medium ${
                        isActive ? 'bg-purple-950/50 text-purple-300' : 'text-slate-400'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                ))}
                <button
                  onClick={handleLogout}
                  className="mt-2 rounded-xl border border-purple-900/40 px-3 py-3 text-left text-sm font-medium text-rose-400"
                >
                  ចាកចេញ
                </button>
              </>
            ) : (
              <div className="mt-3 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl border border-purple-900/40 px-3 py-3 text-center text-sm font-medium text-slate-300"
                >
                  ចូល
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-3 py-3 text-center text-sm font-semibold text-white"
                >
                  ចុះឈ្មោះ
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
