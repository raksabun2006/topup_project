import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const CartContext = createContext(null);

/**
 * រទេះទំនិញ POS - state ស្ថិតនៅ client រហូតដល់ checkout ជោគជ័យ។
 * តម្លៃដែលបង្ហាញនៅទីនេះសម្រាប់មើលជាមុនប៉ុណ្ណោះ - SaleResponseDto
 * ដែល backend ត្រឡប់មកវិញទើបជាតម្លៃពិត (មើល client.md #18)។
 */
export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

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

  const clear = useCallback(() => setItems([]), []);

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
