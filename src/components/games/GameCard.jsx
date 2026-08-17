import { Link } from 'react-router-dom';
import { Flame, Gamepad2, Zap } from 'lucide-react';
import { CATEGORY_LABELS, getGameMeta } from '../../config/gameCatalog';

/**
 * ប្រើទាំងក្នុង Popular Games និង All Games section - card design តែមួយ
 * ដូច្នេះទំព័រមើលទៅដូចគ្នាទាំងអស់។ Card ទាំងមូលជា Link ដូច Home.jsx។
 */
export default function GameCard({ game }) {
  const meta = getGameMeta(game);

  return (
    <Link
      to={`/games/${game.code}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-purple-900/30 bg-ink-900 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-purple-500/60 hover:shadow-xl hover:shadow-purple-950/70"
    >
      {/* Cover */}
      <div className="relative aspect-square w-full overflow-hidden bg-ink-800">
        {game.imageUrl ? (
          <img
            src={game.imageUrl}
            alt={game.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Gamepad2 size={36} className="text-purple-900/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-transparent to-transparent opacity-90" />

        {meta.popular && (
          <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 px-2.5 py-1 text-[10px] font-bold text-white shadow-lg shadow-purple-900/50">
            <Flame size={10} />
            ពេញនិយម
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <p className="line-clamp-1 text-sm font-bold text-white transition group-hover:text-purple-300">
          {game.name}
        </p>

        <p className="line-clamp-1 text-[11px] font-medium text-slate-500">
          {[meta.tag, CATEGORY_LABELS[meta.category]].filter(Boolean).join(' • ')}
        </p>

        {game.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">{game.description}</p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          {meta.product ? (
            <span className="rounded-md border border-purple-500/20 bg-purple-950/40 px-2 py-1 text-[10px] font-semibold text-purple-300">
              {meta.product}
            </span>
          ) : (
            <span />
          )}

          <span className="inline-flex items-center gap-1 rounded-lg bg-purple-950/50 px-2.5 py-1.5 text-[11px] font-bold text-purple-300 transition group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-fuchsia-600 group-hover:text-white group-hover:shadow-md group-hover:shadow-purple-600/40">
            <Zap size={12} />
            បញ្ចូលលុយ
          </span>
        </div>
      </div>
    </Link>
  );
}
