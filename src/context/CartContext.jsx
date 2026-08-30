import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

const CART_STORAGE_KEY = 'pos_cart';

const CartContext = createContext(null);

function loadInitialCart() {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY) || localStorage.getItem('cart');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
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
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      const maxQty = product.stockQuantity ?? Infinity;

      if (existing) {
        const nextQty = Math.min(existing.quantity + quantity, maxQty);
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: nextQty } : i
        );
      }

      return [...prev, { product, quantity: Math.min(quantity, maxQty), discount: 0 }];
    });
  }, []);

  const setQuantity = useCallback((productId, quantity) => {
    setItems((prev) =>
      prev
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
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
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

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.product.price * i.quantity - (i.discount || 0), 0),
    [items]
  );

  const value = {
    items,
    addItem,
    setQuantity,
    removeItem,
    clear,
    subtotal,
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
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
