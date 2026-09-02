import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

const CART_STORAGE_KEY = 'pos_cart';

const CartContext = createContext(null);

function loadInitialCart() {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY) || localStorage.getItem('cart');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (i) => i && i.product && typeof i.product === 'object' && typeof i.quantity === 'number'
        );
      }
    }
  } catch (e) {
    console.warn('Failed to load saved cart:', e);
  }
  return [];
}

/**
 * រទេះទំនិញ POS - state ស្ថិតនៅ client (localStorage) រហូតដល់ checkout ជោគជ័យ។
 * គាំទ្រ guest customers ដោយមិនចាំបាច់ login។
 */
export function CartProvider({ children }) {
  const [items, setItems] = useState(loadInitialCart);

  // រក្សាទុកក្នុង localStorage រាល់ពេលទំនិញក្នុងរទេះផ្លាស់ប្តូរ
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to persist cart to localStorage:', e);
    }
  }, [items]);

  const addItem = useCallback((product, quantity = 1) => {
    if (!product || typeof product.id === 'undefined') return;
    setItems((prev) => {
      const safePrev = Array.isArray(prev) ? prev.filter((i) => i?.product?.id) : [];
      const existing = safePrev.find((i) => i.product.id === product.id);
      const maxQty = product.stockQuantity ?? Infinity;

      if (existing) {
        const nextQty = Math.min(existing.quantity + quantity, maxQty);
        return safePrev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: nextQty } : i
        );
      }

      return [...safePrev, { product, quantity: Math.min(quantity, maxQty), discount: 0 }];
    });
  }, []);

  const setQuantity = useCallback((productId, quantity) => {
    setItems((prev) =>
      (Array.isArray(prev) ? prev : [])
        .filter((i) => i?.product?.id)
        .map((i) => {
          if (i.product.id !== productId) return i;
          const maxQty = i.product.stockQuantity ?? Infinity;
          const clamped = Math.max(1, Math.min(quantity, maxQty));
          return { ...i, quantity: clamped };
        })
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((productId) => {
    setItems((prev) => (Array.isArray(prev) ? prev : []).filter((i) => i?.product?.id !== productId));
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem('cart');
    } catch {
      // ignore
    }
  }, []);

  const safeItems = Array.isArray(items) ? items.filter((i) => i?.product) : [];

  const subtotal = useMemo(
    () =>
      safeItems.reduce(
        (sum, i) => sum + (Number(i.product?.price) || 0) * (i.quantity || 0) - (i.discount || 0),
        0
      ),
    [safeItems]
  );

  const value = {
    items: safeItems,
    addItem,
    setQuantity,
    removeItem,
    clear,
    subtotal,
    itemCount: safeItems.reduce((sum, i) => sum + (i.quantity || 0), 0),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart ត្រូវប្រើក្នុង CartProvider');
  }
  return context;
}
