import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Flame, Gamepad2, Loader2, RefreshCw } from 'lucide-react';
import { gamesApi } from '../api/gamesApi';
import { getErrorMessage } from '../api/client';
import { CATEGORY_LABELS, getGameMeta } from '../config/gameCatalog';
import ProductCard from '../components/ProductCard';

export default function GameDetails() {
  const { gameCode } = useParams();
  const navigate = useNavigate();

  const [game, setGame] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    Promise.all([
      gamesApi.getByCode(gameCode),
      gamesApi.getProducts(gameCode),
    ])
      .then(([gameData, productList]) => {
        setGame(gameData);
        setProducts(productList ?? []);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [gameCode]);

  const selectProduct = (product) => {
    navigate(`/top-up/${gameCode}?productId=${product.id}`);
  };

  const meta = getGameMeta(game ?? {});
  const metaLine = [meta.tag, CATEGORY_LABELS[meta.category]].filter(Boolean).join(' • ');

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 size={28} className="animate-spin text-purple-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16">
        <div className="mx-auto max-w-md rounded-2xl border border-rose-500/30 bg-rose-500/10 p-10 text-center">
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
      </div>
    );
  }

  return (
    <div className="py-10">
      <div className="mx-auto max-w-4xl px-4">
        <Link
          to="/games"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          ត្រឡប់ទៅហ្គេមទាំងអស់
        </Link>

        {/* Game banner - ដូច hero style ក្នុង Games.jsx ដើម្បីភ្ជាប់ visual language */}
        <div className="mb-8 overflow-hidden rounded-3xl border border-purple-900/40 shadow-2xl shadow-purple-950/40">
          <div className="relative h-32 overflow-hidden bg-gradient-to-r from-[#16122b] via-[#1a1438] to-[#120e24] sm:h-40">
            {game?.imageUrl && (
              <img
                src={game.imageUrl}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-25 blur-md"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/30 to-transparent" />
          </div>

          <div className="relative flex flex-col gap-4 bg-ink-900 px-6 pb-6 sm:flex-row sm:items-end sm:gap-5">
            <div className="-mt-12 flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-ink-900 bg-ink-800 shadow-lg sm:h-28 sm:w-28">
              {game?.imageUrl ? (
                <img src={game.imageUrl} alt={game.name} className="h-full w-full object-cover" />
              ) : (
                <Gamepad2 size={32} className="text-slate-600" />
              )}
            </div>

            <div className="pt-1 sm:pt-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-white">{game?.name}</h1>
                {meta.popular && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 px-2.5 py-1 text-[10px] font-bold text-white">
                    <Flame size={10} />
                    ពេញនិយម
                  </span>
                )}
              </div>
              {metaLine && (
                <p className="mt-1 text-xs font-semibold text-purple-400">{metaLine}</p>
              )}
              {game?.description && (
                <p className="mt-2 max-w-xl text-sm text-slate-400">{game.description}</p>
              )}
            </div>
          </div>
        </div>

        <h2 className="mb-4 text-lg font-bold text-white">ជ្រើសរើសកញ្ចប់ថវិកា</h2>

        {products.length === 0 ? (
          <div className="rounded-2xl border border-purple-900/30 bg-ink-900 p-14 text-center shadow-sm">
            <p className="text-slate-400">មិនទាន់មានកញ្ចប់សម្រាប់ហ្គេមនេះទេ។</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={() => selectProduct(product)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
