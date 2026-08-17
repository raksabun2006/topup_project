import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle, ArrowUpDown, ChevronLeft, ChevronRight, Gamepad2,
  Loader2, RefreshCw, Search, Sparkles, Zap,
} from 'lucide-react';
import { gamesApi } from '../api/gamesApi';
import { getErrorMessage } from '../api/client';
import { GAME_CATEGORIES, getGameMeta } from '../config/gameCatalog';
import GameCard from '../components/games/GameCard';

const PAGE_SIZE = 12;
const POPULAR_LIMIT = 6;

const SORT_OPTIONS = [
  { id: 'popular', name: 'ពេញនិយមបំផុត' },
  { id: 'newest', name: 'ថ្មីបំផុត' },
  { id: 'az', name: 'A-Z' },
];

export default function Games() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [pageIndex, setPageIndex] = useState(0);

  const load = () => {
    setLoading(true);
    setError('');
    gamesApi.getAll()
      .then((data) => setGames(data ?? []))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  // ស្វែងរក + category ត្រូវអនុវត្តមុនគេ - ប៉ះពាល់ទាំង Popular និង All Games
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return games.filter((game) => {
      const meta = getGameMeta(game);
      const matchesQuery = !q
        || game.name?.toLowerCase().includes(q)
        || game.description?.toLowerCase().includes(q);
      const matchesCategory = activeCategory === 'all'
        || (activeCategory === 'popular' ? meta.popular : meta.category === activeCategory);
      return matchesQuery && matchesCategory;
    });
  }, [games, query, activeCategory]);

  const popularGames = useMemo(
    () => filtered.filter((game) => getGameMeta(game).popular).slice(0, POPULAR_LIMIT),
    [filtered],
  );

  const sortedGames = useMemo(() => {
    const list = [...filtered];
    if (sortBy === 'az') {
      list.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
    } else if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0));
    } else {
      list.sort((a, b) => Number(getGameMeta(b).popular) - Number(getGameMeta(a).popular));
    }
    return list;
  }, [filtered, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedGames.length / PAGE_SIZE));
  const pagedGames = sortedGames.slice(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE);

  const resetToFirstPage = (fn) => (...args) => {
    fn(...args);
    setPageIndex(0);
  };

  return (
    <div className="min-h-screen text-slate-200">
      {/* Background Decorative Neon Glows - ដូច Home.jsx */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-fuchsia-600/15 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* ---------- GAME HERO ---------- */}
        <section className="relative overflow-hidden rounded-3xl border border-purple-900/40 bg-gradient-to-r from-[#16122b] via-[#1a1438] to-[#120e24] p-6 shadow-2xl shadow-purple-950/50 lg:p-10">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-semibold text-purple-300 backdrop-blur-md">
                <Gamepad2 size={14} className="text-purple-400" />
                <span>បណ្ណាល័យហ្គេមទាំងអស់</span>
              </div>

              <h1 className="mt-4 text-2xl font-black tracking-wide text-white uppercase sm:text-4xl lg:text-5xl">
                ជ្រើសរើសហ្គេម
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-500 bg-clip-text text-transparent">
                  ដែលអ្នកចូលចិត្ត
                </span>
              </h1>

              <p className="mt-4 max-w-lg text-sm text-slate-300 sm:text-base">
                ជ្រើសរើសហ្គេមរបស់អ្នក ហើយបញ្ចូល Diamonds, Coins និង Game Items
                បានយ៉ាងងាយស្រួល។
              </p>
            </div>

            {/* Abstract decorative gaming graphic - គ្មាន external asset */}
            <div className="relative flex justify-center lg:col-span-5">
              <div className="relative flex h-40 w-full max-w-sm items-center justify-center overflow-hidden rounded-2xl border border-purple-500/30 bg-purple-950/30 backdrop-blur-xl sm:h-48">
                <div className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-purple-500/30 blur-3xl" />
                <div className="absolute -right-6 -bottom-10 h-32 w-32 rounded-full bg-fuchsia-500/30 blur-3xl" />
                <Gamepad2 size={64} className="relative z-10 text-purple-300/60" />
                <Sparkles size={22} className="absolute right-8 top-7 z-10 text-pink-300/70" />
                <Zap size={18} className="absolute bottom-8 left-10 z-10 text-purple-300/70" />
              </div>
            </div>
          </div>
        </section>

        {/* ---------- SEARCH + CATEGORIES ---------- */}
        <section className="mt-8 space-y-5">
          <div className="relative max-w-md">
            <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => resetToFirstPage(setQuery)(e.target.value)}
              placeholder="ស្វែងរកហ្គេម..."
              className="w-full rounded-xl border border-purple-900/40 bg-ink-900 py-2.5 pl-10 pr-4 text-white placeholder-slate-500 shadow-sm transition focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {GAME_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => resetToFirstPage(setActiveCategory)(cat.id)}
                  className={`shrink-0 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg shadow-purple-600/40'
                      : 'border border-purple-900/30 bg-ink-900 text-slate-400 hover:bg-purple-950/40 hover:text-white'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </section>

        {/* ---------- LOADING / ERROR (រួមគ្នា) ---------- */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 text-purple-400">
            <Loader2 size={36} className="animate-spin" />
            <p className="mt-3 text-sm text-slate-400">កំពុងទាញយកទិន្នន័យ...</p>
          </div>
        )}

        {!loading && error && (
          <div className="mt-10 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-10 text-center">
            <AlertCircle size={32} className="mx-auto mb-3 text-rose-400" />
            <p className="mb-5 text-sm text-rose-300">{error}</p>
            <button
              onClick={load}
              className="inline-flex items-center gap-2 rounded-lg border border-purple-900/40 bg-ink-900 px-4 py-2 text-sm text-slate-300 shadow-sm transition hover:border-purple-500/40 hover:text-white"
            >
              <RefreshCw size={14} />
              ព្យាយាមម្តងទៀត
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* ---------- POPULAR GAMES ---------- */}
            {popularGames.length > 0 && (
              <section className="mt-12 animate-fade-in-up">
                <div className="mb-6">
                  <h2 className="text-xl font-extrabold uppercase tracking-wider text-white">
                    ហ្គេមពេញនិយម
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    ហ្គេមដែលអ្នកលេងជ្រើសរើសច្រើនបំផុត
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {popularGames.map((game) => (
                    <GameCard key={game.code ?? game.id} game={game} />
                  ))}
                </div>
              </section>
            )}

            {/* ---------- ALL GAMES ---------- */}
            <section className="mt-12 animate-fade-in-up">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-xl font-extrabold uppercase tracking-wider text-white">
                  ហ្គេមទាំងអស់
                </h2>

                <div className="flex items-center gap-2">
                  <ArrowUpDown size={14} className="text-slate-500" />
                  <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                    {SORT_OPTIONS.map((opt) => {
                      const isActive = sortBy === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => resetToFirstPage(setSortBy)(opt.id)}
                          className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                            isActive
                              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                              : 'border border-purple-900/30 bg-ink-900 text-slate-400 hover:text-white'
                          }`}
                        >
                          {opt.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {sortedGames.length === 0 ? (
                <div className="rounded-2xl border border-purple-900/30 bg-ink-900 p-16 text-center shadow-sm">
                  <Gamepad2 size={40} className="mx-auto mb-4 text-slate-600" />
                  <p className="text-slate-400">
                    {games.length === 0
                      ? 'មិនទាន់មានហ្គេមនៅឡើយទេ។'
                      : 'រកមិនឃើញហ្គេមដែលត្រូវនឹងលក្ខខណ្ឌនេះទេ។'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {pagedGames.map((game) => (
                      <GameCard key={game.code ?? game.id} game={game} />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-center gap-4">
                      <button
                        onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                        disabled={pageIndex === 0}
                        className="inline-flex items-center gap-1 rounded-xl border border-purple-900/40 bg-ink-900 px-3 py-2 text-sm text-slate-300 shadow-sm transition hover:border-purple-500/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <ChevronLeft size={14} /> មុន
                      </button>

                      <span className="text-sm text-slate-500">
                        ទំព័រ {pageIndex + 1} / {totalPages}
                      </span>

                      <button
                        onClick={() => setPageIndex((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={pageIndex >= totalPages - 1}
                        className="inline-flex items-center gap-1 rounded-xl border border-purple-900/40 bg-ink-900 px-3 py-2 text-sm text-slate-300 shadow-sm transition hover:border-purple-500/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        បន្ទាប់ <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
