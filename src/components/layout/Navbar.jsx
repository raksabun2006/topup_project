import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Store, Menu, X, User, LogOut, Receipt, LayoutDashboard, ShoppingCart,
  Package, ChevronDown, Users, LogIn,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { env } from '../../config/env';

const ICON_LINKS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products', icon: Package, label: 'Products', adminOnly: true },
  { to: '/customers', icon: Users, label: 'Customers', adminOnly: true },
  { to: '/sales', icon: Receipt, label: 'Sales' },
];

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setMobileOpen(false);
    navigate('/login');
  };

  const iconLinks = ICON_LINKS.filter((l) => !l.adminOnly || isAdmin);
  const initial = (user?.username || '?').charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 bg-emerald-600 shadow-md shadow-emerald-900/10">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-1.5 text-white/90 transition hover:bg-white/10 md:hidden"
            aria-label="បើកម៉ឺនុយ"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link to="/pos" className="flex items-center gap-2">
            <Store size={24} className="text-white" />
            <span className="text-lg font-bold text-white">{env.appName}</span>
          </Link>
        </div>

        {/* ---------- Desktop ---------- */}
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated && (
            <div className="flex items-center gap-1.5">
              {iconLinks.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  title={label}
                  className={({ isActive }) =>
                    `flex h-10 w-10 items-center justify-center rounded-full transition ${
                      isActive ? 'bg-white text-emerald-700' : 'text-white/90 hover:bg-white/10'
                    }`
                  }
                >
                  <Icon size={19} />
                </NavLink>
              ))}
            </div>
          )}

          {!isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50 active:scale-95"
              >
                <LogIn size={16} />
                ចូលគណនី (Login)
              </Link>
            </div>
          ) : (
            <div className="relative ml-1.5">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm text-white transition hover:bg-white/10"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/25 text-sm font-bold text-white">
                  {initial}
                </span>
                {user?.username}
                <ChevronDown size={16} className="text-white/80" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg shadow-black/20">
                    {[
                      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                      { to: '/sales', icon: Receipt, label: 'Sales' },
                      ...(isAdmin ? [{ to: '/products', icon: Package, label: 'Products' }] : []),
                      ...(isAdmin ? [{ to: '/customers', icon: Users, label: 'Customers' }] : []),
                      { to: '/profile', icon: User, label: 'Information' },
                    ].map(({ to, icon: Icon, label }) => (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 transition hover:bg-emerald-50 hover:text-slate-900"
                      >
                        <Icon size={16} className="text-slate-500" />
                        {label}
                      </Link>
                    ))}

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 border-t border-slate-200 px-4 py-3 text-sm text-rose-700 transition hover:bg-rose-500/10"
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
      </nav>

      {/* ---------- Mobile ---------- */}
      {mobileOpen && (
        <div className="border-t border-emerald-500/50 bg-emerald-600 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {isAuthenticated ? (
              <>
                {[
                  { to: '/pos', label: 'ចំណុចលក់', icon: ShoppingCart },
                  { to: '/sales', label: 'ការលក់', icon: Receipt },
                  ...(isAdmin ? [{ to: '/products', label: 'ផលិតផល', icon: Package }] : []),
                  ...(isAdmin ? [{ to: '/customers', label: 'អតិថិជន', icon: Users }] : []),
                  { to: '/dashboard', label: 'ផ្ទាំងគ្រប់គ្រង', icon: LayoutDashboard },
                  { to: '/profile', label: 'ព័ត៌មានផ្ទាល់ខ្លួន', icon: User },
                ].map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${
                        isActive ? 'bg-white text-emerald-700' : 'text-white/90 hover:bg-white/10'
                      }`
                    }
                  >
                    <Icon size={16} />
                    {label}
                  </NavLink>
                ))}
                <button
                  onClick={handleLogout}
                  className="mt-2 rounded-xl border border-white/30 px-3 py-3 text-left text-sm font-medium text-white"
                >
                  ចាកចេញ
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-3 text-center text-sm font-bold text-emerald-700 shadow-sm"
                >
                  <LogIn size={17} />
                  ចូលគណនី (Login)
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
