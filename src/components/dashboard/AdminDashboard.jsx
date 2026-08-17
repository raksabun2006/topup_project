import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, DollarSign, CheckCircle, XCircle, Gamepad2, Clock, Users,
  AlertCircle, RefreshCw, ShieldCheck, Plus, Edit2, Trash2, X, Loader2, Boxes
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ordersApi } from '../../api/ordersApi';
import { adminGamesApi } from '../../api/adminGamesApi';
import { adminApi } from '../../api/adminApi';
import { getErrorMessage } from '../../api/client';
import { formatCurrency, formatDate } from '../../utils/format';
import { StatCard } from '../ui/StatCard';
import { OrderStatusBadge } from '../ui/OrderStatusBadge';
import { ProductManagerModal } from '../admin/ProductManagerModal';
import { BakongDiagnostics } from '../admin/BakongDiagnostics';

function useAdminDashboard() {
  const [orderPage, setOrderPage] = useState(null);
  const [games, setGames] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [orders, gameList, statistics] = await Promise.all([
        ordersApi.list({ page: 0, size: 50 }),
        adminGamesApi.getAll(),
        adminApi.getStatistics(),
      ]);
      setOrderPage(orders);
      setGames(gameList);
      setStats(statistics);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const orders = useMemo(() => orderPage?.content ?? [], [orderPage]);

  const deleteGame = async (id) => {
    if (!window.confirm('តើអ្នកពិតជាចង់បិទ/លុបហ្គេមនេះមែនទេ?')) return;
    try {
      await adminGamesApi.delete(id);
      await loadData();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  return { orders, games, loading, error, stats, reload: loadData, deleteGame };
}

function GameModal({ isOpen, onClose, editingGame, onSuccess }) {
  const [formData, setFormData] = useState({ code: '', name: '', description: '', imageUrl: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingGame) {
      setFormData({
        code: editingGame.code || '',
        name: editingGame.name || '',
        description: editingGame.description || '',
        imageUrl: editingGame.imageUrl || '',
      });
    } else {
      setFormData({ code: '', name: '', description: '', imageUrl: '' });
    }
    setError('');
  }, [editingGame, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (editingGame) {
        await adminGamesApi.update(editingGame.id, formData);
      } else {
        await adminGamesApi.create(formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-purple-900/40 bg-ink-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-purple-900/30 pb-4">
          <h3 className="text-lg font-bold text-white">
            {editingGame ? 'កែប្រែហ្គេម' : 'បន្ថែមហ្គេមថ្មី'}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-purple-950/40 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">កូដហ្គេម (Code)</label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
              placeholder="MLBB"
              className="w-full rounded-xl border border-purple-900/40 bg-ink-950 px-3.5 py-2 text-white shadow-sm transition placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">ឈ្មោះហ្គេម (Name)</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Mobile Legends"
              className="w-full rounded-xl border border-purple-900/40 bg-ink-950 px-3.5 py-2 text-white shadow-sm transition placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">ការបរិយាយ (Description)</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-xl border border-purple-900/40 bg-ink-950 px-3.5 py-2 text-white shadow-sm transition placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">តំណភ្ជាប់រូបភាព (Image URL)</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))}
              placeholder="https://example.com/image.png"
              className="w-full rounded-xl border border-purple-900/40 bg-ink-950 px-3.5 py-2 text-white shadow-sm transition placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-purple-900/30 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-purple-900/40 bg-ink-950 px-4 py-2 text-sm font-medium text-slate-300 shadow-sm hover:border-purple-500/40 hover:text-white transition"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-fuchsia-500 transition disabled:opacity-60"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {editingGame ? 'រក្សាទុក' : 'បង្កើត'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { orders, games, loading, error, stats, reload, deleteGame } = useAdminDashboard();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [managingProductsGame, setManagingProductsGame] = useState(null);

  const handleOpenCreateModal = () => {
    setEditingGame(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (game) => {
    setEditingGame(game);
    setIsModalOpen(true);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Header */}
      <div className="mb-10 rounded-2xl border border-purple-900/40 bg-gradient-to-r from-[#16122b] via-[#1a1438] to-[#120e24] p-8 shadow-2xl shadow-purple-950/50">
        <div className="flex items-center gap-2 text-sm font-medium text-purple-300">
          <ShieldCheck size={16} />
          អ្នកគ្រប់គ្រង
        </div>
        <h1 className="mt-3 text-2xl font-bold text-white">ផ្ទាំងគ្រប់គ្រង</h1>
        <p className="mt-2 text-slate-300">
          សួស្តី {user?.username} — ទិដ្ឋភាពរួមនៃប្រព័ន្ធ
        </p>
      </div>

      {/* Statistics - ពី GET /api/v1/admin/statistics, មិនមែនគណនាពី client ទេ */}
      <div className="mb-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Package} label="ការបញ្ជាទិញសរុប" value={loading || !stats ? '—' : stats.totalOrders} />
        <StatCard icon={DollarSign} label="ចំណូល" value={loading || !stats ? '—' : formatCurrency(stats.totalRevenue)} accent="emerald" />
        <StatCard icon={CheckCircle} label="ជោគជ័យ" value={loading || !stats ? '—' : stats.successCount} accent="emerald" />
        <StatCard icon={XCircle} label="បរាជ័យ" value={loading || !stats ? '—' : stats.failedCount} accent="rose" />
      </div>

      <div className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Clock} label="កំពុងរង់ចាំ" value={loading || !stats ? '—' : stats.pendingCount} accent="amber" />
        <StatCard icon={Users} label="អ្នកប្រើប្រាស់សរុប" value={loading || !stats ? '—' : stats.totalUsers} />
        <StatCard icon={Gamepad2} label="ហ្គេមសកម្ម" value={loading || !stats ? '—' : stats.activeGames} />
        <StatCard icon={Boxes} label="កញ្ចប់ថវិកាសកម្ម" value={loading || !stats ? '—' : stats.activeProducts} />
      </div>

      {/* Main Content Panels */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Orders Panel */}
        <div className="rounded-2xl border border-purple-900/30 bg-ink-900 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-purple-900/30 px-6 py-5">
            <h2 className="font-semibold text-white">ការបញ្ជាទិញទាំងអស់</h2>
            <Link to="/orders" className="text-sm font-semibold text-purple-400 hover:text-purple-300 transition">
              មើលទាំងអស់
            </Link>
          </div>

          {loading && (
            <div className="space-y-3 p-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-ink-800" />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="p-10 text-center">
              <AlertCircle size={32} className="mx-auto mb-3 text-rose-400" />
              <p className="mb-5 text-sm text-rose-300">{error}</p>
              <button
                onClick={reload}
                className="inline-flex items-center gap-2 rounded-xl border border-purple-900/40 bg-ink-950 px-4 py-2 text-sm text-slate-300 shadow-sm hover:border-purple-500/40 hover:text-white transition"
              >
                <RefreshCw size={14} /> ព្យាយាមម្តងទៀត
              </button>
            </div>
          )}

          {!loading && !error && orders.length === 0 && (
            <div className="p-14 text-center">
              <Package size={40} className="mx-auto mb-4 text-slate-600" />
              <p className="text-slate-400">មិនទាន់មានការបញ្ជាទិញនៅឡើយ</p>
            </div>
          )}

          {!loading && !error && orders.length > 0 && (
            <div className="divide-y divide-purple-900/20">
              {orders.slice(0, 8).map((order) => (
                <Link
                  key={order.id}
                  to={`/orders/${order.orderNumber}`}
                  className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-purple-950/20"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-200">
                      {order.gameName} · {order.productName}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {order.orderNumber} · ID {order.gameUserId} · {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-4">
                    <span className="text-sm font-semibold text-white">
                      {formatCurrency(order.amount, order.currency)}
                    </span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Game Catalog Panel */}
        <div className="rounded-2xl border border-purple-900/30 bg-ink-900 shadow-sm">
          <div className="flex items-center justify-between border-b border-purple-900/30 px-6 py-5">
            <h2 className="font-semibold text-white">កាតាឡុកហ្គេម</h2>
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:from-purple-500 hover:to-fuchsia-500"
            >
              <Plus size={14} /> បញ្ចូលថ្មី
            </button>
          </div>

          {loading && (
            <div className="space-y-3 p-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-ink-800" />
              ))}
            </div>
          )}

          {!loading && games.length === 0 && (
            <div className="p-10 text-center">
              <Gamepad2 size={36} className="mx-auto mb-3 text-slate-600" />
              <p className="text-sm text-slate-400">មិនទាន់មានហ្គេម</p>
            </div>
          )}

          {!loading && games.length > 0 && (
            <div className="divide-y divide-purple-900/20">
              {games.map((game) => (
                <div key={game.id} className="flex items-center justify-between px-6 py-4 transition hover:bg-purple-950/20">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-200">{game.name}</span>
                    <span className="text-xs text-slate-500">Code: {game.code}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setManagingProductsGame(game)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-purple-950/40 hover:text-white transition"
                      title="គ្រប់គ្រងកញ្ចប់ថវិកា"
                    >
                      <Boxes size={16} />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(game)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-purple-950/40 hover:text-white transition"
                      title="កែប្រែ"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteGame(game.id)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition"
                      title="លុប/បិទ"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BakongDiagnostics />

      <GameModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingGame={editingGame}
        onSuccess={reload}
      />

      <ProductManagerModal
        game={managingProductsGame}
        onClose={() => setManagingProductsGame(null)}
      />
    </div>
  );
}
