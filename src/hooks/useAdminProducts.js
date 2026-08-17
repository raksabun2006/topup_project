import { useState, useEffect, useCallback } from 'react';
import { adminProductsApi } from '../api/adminProductsApi';
import { getErrorMessage } from '../api/client';

/**
 * GET /api/v1/admin/products/by-game/{gameId} ត្រឡប់កញ្ចប់ទាំងអស់
 * រួមទាំងកញ្ចប់ដែលបិទ (deactivated) ដែល public endpoint មិនបង្ហាញទេ។
 * ត្រូវការ gameId (UUID) មិនមែន gameCode ទេ។
 */
export function useAdminProducts(game) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!game?.id) return;
    setLoading(true);
    setError('');
    try {
      const data = await adminProductsApi.listByGame(game.id);
      setProducts(data ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [game?.id]);

  useEffect(() => {
    load();
  }, [load]);

  return { products, loading, error, reload: load };
}
