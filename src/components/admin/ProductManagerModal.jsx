import { useState } from 'react';
import { X } from 'lucide-react';
import { useAdminProducts } from '../../hooks/useAdminProducts';
import { ProductList } from './ProductList';
import { ProductModal } from './ProductModal';

export function ProductManagerModal({ game, onClose }) {
  const { products, loading, reload } = useAdminProducts(game);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  if (!game) return null;

  const openCreate = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg">
        <div className="mb-3 flex items-center justify-between px-1">
          <h3 className="text-lg font-bold text-white">កញ្ចប់ថវិកា - {game.name}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-300 transition hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        <ProductList
          products={products}
          loading={loading}
          onOpenCreate={openCreate}
          onOpenEdit={openEdit}
          onRefresh={reload}
        />
      </div>

      <ProductModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        editingProduct={editingProduct}
        gameId={game.id}
        onSuccess={reload}
      />
    </div>
  );
}
