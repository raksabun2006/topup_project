import { useState, useEffect, useCallback } from 'react';

const WISHLIST_STORAGE_KEY = 'mart_customer_wishlist';
const WISHLIST_EVENT = 'mart_wishlist_updated';

function getStoredWishlist() {
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveWishlist(ids) {
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent(WISHLIST_EVENT, { detail: ids }));
  } catch {
    // ignore
  }
}

export function useWishlist() {
  const [wishlistIds, setWishlistIds] = useState(getStoredWishlist);

  useEffect(() => {
    const handleUpdate = (e) => {
      setWishlistIds(e.detail || getStoredWishlist());
    };
    window.addEventListener(WISHLIST_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(WISHLIST_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const isInWishlist = useCallback(
    (id) => {
      if (!id) return false;
      return wishlistIds.includes(id);
    },
    [wishlistIds]
  );

  const toggleWishlist = useCallback(
    (id) => {
      if (!id) return false;
      let next;
      if (wishlistIds.includes(id)) {
        next = wishlistIds.filter((item) => item !== id);
      } else {
        next = [...wishlistIds, id];
      }
      setWishlistIds(next);
      saveWishlist(next);
      return next.includes(id);
    },
    [wishlistIds]
  );

  const removeFromWishlist = useCallback(
    (id) => {
      if (!id) return;
      const next = wishlistIds.filter((item) => item !== id);
      setWishlistIds(next);
      saveWishlist(next);
    },
    [wishlistIds]
  );

  const clearWishlist = useCallback(() => {
    setWishlistIds([]);
    saveWishlist([]);
  }, []);

  return {
    wishlistIds,
    isInWishlist,
    toggleWishlist,
    removeFromWishlist,
    clearWishlist,
    count: wishlistIds.length,
  };
}
