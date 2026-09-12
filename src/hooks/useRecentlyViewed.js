import { useState, useEffect, useCallback } from 'react';

const RECENTLY_VIEWED_KEY = 'mart_recently_viewed';
const RECENTLY_VIEWED_EVENT = 'mart_recently_viewed_updated';

function getStoredRecentlyViewed() {
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRecentlyViewed(items) {
  try {
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(RECENTLY_VIEWED_EVENT, { detail: items }));
  } catch {
    // ignore
  }
}

export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState(getStoredRecentlyViewed);

  useEffect(() => {
    const handleUpdate = (e) => {
      setRecentlyViewed(e.detail || getStoredRecentlyViewed());
    };
    window.addEventListener(RECENTLY_VIEWED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(RECENTLY_VIEWED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const addRecentlyViewed = useCallback((product) => {
    if (!product || !product.id) return;
    const current = getStoredRecentlyViewed();
    const filtered = current.filter((item) => item.id !== product.id);
    const itemToSave = {
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      category: product.category,
      stockQuantity: product.stockQuantity,
      sku: product.sku,
    };
    const next = [itemToSave, ...filtered].slice(0, 12);
    setRecentlyViewed(next);
    saveRecentlyViewed(next);
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewed([]);
    saveRecentlyViewed([]);
  }, []);

  return {
    recentlyViewed,
    addRecentlyViewed,
    clearRecentlyViewed,
  };
}
