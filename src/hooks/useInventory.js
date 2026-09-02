import { useState, useEffect, useCallback } from 'react';
import { inventoryApi } from '../api/inventoryApi';
import { adminProductApi } from '../api/adminProductApi';
import { productApi } from '../api/productApi';
import { getErrorMessage } from '../api/client';

export function useLowStockInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let rawList = [];
      try {
        const invData = await inventoryApi.lowStock();
        if (Array.isArray(invData) && invData.length > 0) {
          rawList = invData.map((item) => ({
            id: item.id,
            product: item.product || item.productName || 'ទំនិញ',
            name: item.product || item.productName || 'ទំនិញ',
            quantity: item.quantity ?? 0,
            minimumStock: item.minimumStock ?? 10,
            location: item.location || '',
            updatedAt: item.updatedAt,
          }));
        }
      } catch (invErr) {
        console.warn('Inventory API low-stock check notice:', invErr?.message);
      }

      // If backend inventory endpoint returned empty,
      // fallback to scanning store products with stockQuantity <= 10
      if (rawList.length === 0) {
        let prodList = [];
        try {
          const adminProds = await adminProductApi.list({ page: 0, size: 200 });
          prodList = adminProds?.content || (Array.isArray(adminProds) ? adminProds : []);
        } catch {
          const pubProds = await productApi.list({ page: 0, size: 200 });
          prodList = pubProds?.content || (Array.isArray(pubProds) ? pubProds : []);
        }

        rawList = (prodList || [])
          .filter((p) => (p.stockQuantity ?? 0) <= 10)
          .map((p) => ({
            id: p.id,
            product: p.name || 'ទំនិញ',
            name: p.name || 'ទំនិញ',
            quantity: p.stockQuantity ?? 0,
            minimumStock: 10,
            imageUrl: p.imageUrl,
            price: p.price,
            category: p.category,
            updatedAt: p.updatedAt || p.createdAt,
          }));
      }

      setItems(rawList);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { items, loading, error, reload: load };
}

