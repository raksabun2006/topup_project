import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Loader2, RefreshCw, Zap } from 'lucide-react';
import { gamesApi } from '../api/gamesApi';
import { ordersApi } from '../api/ordersApi';
import { getErrorMessage } from '../api/client';
import { formatCurrency } from '../utils/format';
import ProductCard from '../components/ProductCard';

export default function TopUp() {
  const { gameCode } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const preselectedProductId = searchParams.get('productId');

  const [game, setGame] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [gameUserId, setGameUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

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
        if (preselectedProductId) {
          const match = (productList ?? []).find((p) => String(p.id) === preselectedProductId);
          if (match) setSelectedProduct(match);
        }
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [gameCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setSubmitError('');
    setSubmitting(true);
    try {
      const order = await ordersApi.create({
        gameCode,
        productId: selectedProduct.id,
        gameUserId,
      });
      navigate(`/payment/${order.id}`);
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

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
      <div className="mx-auto max-w-2xl px-4">
        <Link
          to={`/games/${gameCode}`}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          ត្រឡប់ក្រោយ
        </Link>

        <h1 className="mb-1 text-2xl font-bold text-white">បញ្ចូលទឹកប្រាក់ - {game?.name}</h1>
        <p className="mb-8 text-slate-400">ជ្រើសរើសកញ្ចប់ ហើយបញ្ចូល ID គណនីរបស់អ្នក</p>

        {/* កញ្ចប់ - នៅតែអាចប្តូរបានទោះមកពី GameDetails រួចហើយក៏ដោយ */}
        <div className="mb-8">
          <h2 className="mb-3 text-sm font-semibold text-slate-300">កញ្ចប់ថវិកា</h2>

          {products.length === 0 ? (
            <div className="rounded-2xl border border-purple-900/30 bg-ink-900 p-10 text-center shadow-sm">
              <p className="text-sm text-slate-400">មិនទាន់មានកញ្ចប់សម្រាប់ហ្គេមនេះទេ។</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  selected={selectedProduct?.id === product.id}
                  onSelect={() => setSelectedProduct(product)}
                />
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-purple-900/30 bg-ink-900 p-6 shadow-sm">
          {submitError && (
            <div className="mb-5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {submitError}
            </div>
          )}

          <label className="mb-2 block text-sm font-medium text-slate-300">
            ID គណនីហ្គេម
          </label>
          <input
            type="text"
            required
            value={gameUserId}
            onChange={(e) => setGameUserId(e.target.value)}
            placeholder="ឧ. 123456789"
            className="mb-6 w-full rounded-lg border border-purple-900/40 bg-ink-950 px-4 py-3 text-white placeholder-slate-500 transition focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />

          {selectedProduct && (
            <div className="mb-6 flex items-center justify-between rounded-xl border border-purple-900/30 bg-ink-950 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-white">{selectedProduct.name}</p>
                <p className="text-xs text-slate-500">{selectedProduct.amount} Units</p>
              </div>
              <p className="text-lg font-bold text-white">
                {formatCurrency(selectedProduct.price, selectedProduct.currency)}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={!selectedProduct || submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-600 px-4 py-3 font-semibold text-white shadow-lg shadow-purple-600/30 transition hover:from-purple-500 hover:to-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
            {submitting ? 'កំពុងបង្កើតការបញ្ជាទិញ...' : 'បន្តទៅការទូទាត់'}
          </button>
        </form>
      </div>
    </div>
  );
}
