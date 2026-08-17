import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Gamepad2, Loader2, ShieldCheck, Zap, 
  Trophy, Gift, Sparkles, Flame, ChevronRight, UserCheck 
} from 'lucide-react';
import { gamesApi } from '../api/gamesApi';
import { getErrorMessage } from '../api/client';
import heroImage from '../assets/hero.png';

const FEATURED_COUNT = 6;

const CATEGORIES = [
  { id: 'all', name: 'ហ្គេមទាំងអស់', icon: Gamepad2 },
  { id: 'popular', name: 'ពេញនិយម', icon: Flame },
  { id: 'fast', name: 'ទូទាត់លឿន', icon: Zap },
  { id: 'secure', name: 'សុវត្ថិភាព 100%', icon: ShieldCheck },
];

export default function Home() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    let cancelled = false;

    const fetchGames = async () => {
      try {
        const data = await gamesApi.getAll();
        if (!cancelled) setGames(data ?? []);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchGames();

    return () => {
      cancelled = true;
    };
  }, []);

  const featured = games.slice(0, FEATURED_COUNT);

  return (
    <div className="min-h-screen bg-[#0d0e15] text-slate-200 selection:bg-purple-500 selection:text-white">
      {/* Background Decorative Neon Glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-fuchsia-600/15 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        
        {/* HERO BANNER SECTION */}
        <section className="relative overflow-hidden rounded-3xl border border-purple-900/40 bg-gradient-to-r from-[#16122b] via-[#1a1438] to-[#120e24] p-6 shadow-2xl shadow-purple-950/50 lg:p-10">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            
            {/* Main Banner Content */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-semibold text-purple-300 backdrop-blur-md">
                <Sparkles size={14} className="text-purple-400" />
                <span>ការបញ្ជូលទឹកប្រាក់ហ្គេមទំនើប</span>
              </div>
              
              <h1 className="mt-4 text-3xl font-black tracking-wide text-white uppercase sm:text-5xl lg:text-6xl">
                បញ្ចូលទឹកប្រាក់ <br />
                <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-500 bg-clip-text text-transparent">
                  លឿន & សុវត្ថិភាព
                </span>
              </h1>
              
              <p className="mt-4 max-w-lg text-sm text-slate-300 sm:text-base">
                ជ្រើសរើសហ្គេមដែលអ្នកចូលចិត្ត បង់ប្រាក់តាម Bakong KHQR 
                ទទួលបាន Diamonds និង Game Coins ភ្លាមៗជាមួយប្រព័ន្ធស្វ័យប្រវត្តិ 24/7.
              </p>

              <div className="mt-6 flex flex-wrap gap-4">
                <Link
                  to="/games"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-purple-600/30 transition hover:scale-105 hover:from-purple-500 hover:to-fuchsia-500"
                >
                  <Gamepad2 size={20} />
                  បញ្ជូលទឹកប្រាក់ឥឡូវនេះ
                </Link>
              </div>
            </div>

            {/* Banner Side Widget / Image */}
            <div className="relative flex justify-center lg:col-span-5">
              <div className="relative w-full max-w-sm rounded-2xl border border-purple-500/30 bg-purple-950/30 p-4 backdrop-blur-xl">
                <div className="overflow-hidden rounded-xl bg-slate-900/80">
                  <img
                    src={heroImage}
                    alt="Hero Promotion"
                    className="h-48 w-full object-cover object-center transition duration-500 hover:scale-105"
                  />
                </div>
                
                {/* Micro Leaderboard Card */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between rounded-lg bg-[#110d24] p-2.5 border border-purple-800/30">
                    <div className="flex items-center gap-2 text-xs text-purple-200">
                      <Trophy size={16} className="text-amber-400" />
                      <span>ការទូទាត់ចុងក្រោយ</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-400">+ $10.00</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* CATEGORY NAV BAR */}
        <div className="mt-8 flex items-center gap-2 overflow-x-auto border-b border-purple-900/30 pb-4 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40'
                    : 'border border-purple-900/30 bg-[#141424] text-slate-400 hover:bg-purple-950/40 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* FEATURED GAMES GRID */}
        <section className="mt-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-extrabold uppercase tracking-wider text-white">
              <Flame className="text-fuchsia-500" />
              ហ្គេមពេញនិយម
            </h2>
            <Link
              to="/games"
              className="group flex items-center gap-1 text-sm font-bold text-purple-400 transition hover:text-purple-300"
            >
              មើលទាំងអស់
              <ChevronRight size={16} className="transition group-hover:translate-x-1" />
            </Link>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-purple-400">
              <Loader2 size={36} className="animate-spin" />
              <p className="mt-3 text-sm text-slate-400">កំពុងទាញយកទិន្នន័យ...</p>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-4 text-center text-sm text-red-400">
              {error}
            </div>
          )}

          {!loading && !error && featured.length === 0 && (
            <div className="rounded-2xl border border-purple-900/30 bg-[#121124] py-16 text-center text-slate-400">
              មិនទាន់មានហ្គេមនៅឡើយទេ។
            </div>
          )}

          {!loading && !error && featured.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {featured.map((game) => (
                <Link
                  key={game.code ?? game.id}
                  to={`/games/${game.code}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-purple-900/30 bg-[#141326] transition duration-300 hover:-translate-y-1 hover:border-purple-500/60 hover:shadow-xl hover:shadow-purple-950/80"
                >
                  {/* Game Thumbnail */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-900">
                    {game.imageUrl ? (
                      <img
                        src={game.imageUrl}
                        alt={game.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-slate-900">
                        <Gamepad2 size={36} className="text-purple-900/50" />
                      </div>
                    )}
                    
                    {/* Dark gradient overlay for title */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141326] via-transparent to-transparent opacity-80" />
                  </div>

                  {/* Card Info */}
                  <div className="flex flex-1 flex-col justify-between p-3 text-center">
                    <p className="line-clamp-1 text-sm font-bold text-slate-200 group-hover:text-purple-300">
                      {game.name}
                    </p>
                    <span className="mt-2 inline-block rounded-lg border border-purple-500/20 bg-purple-950/40 py-1 text-[10px] font-semibold text-purple-400">
                      បញ្ចូលភ្លាមៗ
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* BOTTOM PROMO & FEATURES BANNER */}
        <section className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              icon: Zap,
              title: 'ប្រព័ន្ធស្វ័យប្រវត្តិ',
              desc: 'ទូទាត់ និងទទួលបាន Items ក្នុងហ្គេមភ្លាមៗ 24 ម៉ោង',
            },
            {
              icon: ShieldCheck,
              title: 'សុវត្ថិភាពខ្ពស់',
              desc: 'គាំទ្រការទូទាត់ផ្ទាល់តាម Bakong KHQR Standard',
            },
            {
              icon: Gift,
              title: 'ប្រូម៉ូសិនជារៀងរាល់ថ្ងៃ',
              desc: 'ទទួលបានការបញ្ចុះតម្លៃ និង Rewards ពិសេសៗ',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-4 rounded-2xl border border-purple-900/30 bg-[#131126] p-5 backdrop-blur-sm"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-950/50 text-purple-400">
                <item.icon size={24} />
              </div>
              <div>
                <h3 className="font-bold text-white">{item.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </section>

      </div>
    </div>
  );
}