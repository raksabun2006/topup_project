import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useCart } from './CartContext';
import { lookupProductByBarcode, prefetchCatalogCache } from '../utils/barcodeLookup';
import { unlockAudioContext, initAudioContext, playBeepSound, playErrorSound, playInvalidBarcodeSound } from '../utils/sound';

const GlobalScannerContext = createContext(null);

export function GlobalScannerProvider({ children }) {
  const { addItem, items: cartItems } = useCart();
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [globalToast, setGlobalToast] = useState(null); // { id, isError, name, price, quantity, message }
  const toastTimerRef = useRef(null);
  const cartItemsRef = useRef(cartItems);

  useEffect(() => {
    cartItemsRef.current = cartItems;
  }, [cartItems]);

  const openScanner = useCallback(() => {
    unlockAudioContext().catch(() => {});
    prefetchCatalogCache();
    setIsScannerOpen(true);
  }, []);

  const closeScanner = useCallback(() => {
    setIsScannerOpen(false);
  }, []);

  const openDrawer = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
  }, []);

  const showToast = useCallback((data, durationMs = 2800) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setGlobalToast({ id: Date.now(), ...data });
    toastTimerRef.current = setTimeout(() => {
      setGlobalToast(null);
    }, durationMs);
  }, []);

  const hideToast = useCallback(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setGlobalToast(null);
  }, []);

  // Serialized queue to prevent async race conditions during rapid supermarket scanning
  const queueRef = useRef(Promise.resolve());

  // Centralized barcode processor that adds directly to active order
  const processBarcode = useCallback(
    (code, localProducts = []) => {
      const trimmed = String(code || '').trim();
      console.log('[SCANNER 2] processBarcode:', trimmed || code);

      if (!trimmed) {
        playInvalidBarcodeSound();
        const res = { success: false, reason: 'invalid' };
        console.log('[SCANNER ERROR] invalid empty barcode');
        return Promise.resolve(res);
      }

      // Chain execution sequentially to avoid racing
      const task = async () => {
        try {
          const result = await lookupProductByBarcode(trimmed, localProducts);

          if (result.status === 'found' && result.product) {
            const product = result.product;
            const currentItems = cartItemsRef.current || [];
            const existing = currentItems.find((i) => i?.product?.id === product.id);
            const currentQty = existing?.quantity || 0;
            const stock = product.stockQuantity;
            const isStockFinite = typeof stock === 'number' && !isNaN(stock);

            // Stock Check 1: Out of stock (0 units in store)
            if (isStockFinite && stock <= 0) {
              console.log('[SCANNER ERROR] out of stock (0 units):', product.name);
              playErrorSound();
              showToast(
                {
                  isError: true,
                  barcode: trimmed,
                  message: `ស្តុកមិនគ្រប់គ្រាន់ (${product.name}) - អស់ស្តុក (Out of stock)`,
                },
                3200
              );
              return {
                success: false,
                reason: 'out_of_stock',
                message: `ស្តុកមិនគ្រប់គ្រាន់ (${product.name}) - អស់ស្តុក`,
              };
            }

            // Stock Check 2: Cart already has all available stock
            if (isStockFinite && currentQty >= stock) {
              console.log(`[SCANNER ERROR] max stock reached in cart (${currentQty}/${stock}):`, product.name);
              playErrorSound();
              showToast(
                {
                  isError: true,
                  barcode: trimmed,
                  message: `ចំនួនក្នុងរទេះ (${currentQty}) ស្មើនឹងស្តុកដែលមាន (${stock}) ហើយ`,
                },
                3200
              );
              return {
                success: false,
                reason: 'out_of_stock',
                message: `ចំនួនក្នុងរទេះ (${currentQty}) ស្មើនឹងស្តុកដែលមាន (${stock}) ហើយ`,
              };
            }

            console.log('[SCANNER 6] adding to cart:', product.name);

            // Add to active cart (increments quantity if already in cart)
            addItem(product, 1);

            const nextQty = currentQty + 1;

            // Synchronously update ref for sequential rapid-scan accuracy
            const existingIndex = currentItems.findIndex((i) => i?.product?.id === product.id);
            if (existingIndex >= 0) {
              cartItemsRef.current = currentItems.map((item, idx) =>
                idx === existingIndex ? { ...item, quantity: nextQty } : item
              );
            } else {
              cartItemsRef.current = [...currentItems, { product, quantity: 1, discount: 0 }];
            }

            console.log('[SCANNER 7] cart quantity:', nextQty);

            // Play supermarket beep immediately on verified real product
            console.log('[SCANNER 8] success beep');
            playBeepSound();

            showToast({
              isError: false,
              product,
              name: product.name,
              imageUrl: product.imageUrl,
              barcode: product.barcode || product.sku || trimmed,
              price: product.price,
              quantity: nextQty,
            });

            return {
              success: true,
              product,
              quantity: nextQty,
            };
          } else {
            // Product not found
            console.log('[SCANNER ERROR] product not found for barcode:', trimmed);
            playErrorSound();
            showToast(
              {
                isError: true,
                barcode: trimmed,
                message: `រកមិនឃើញទំនិញដែលមានបាកូដ "${trimmed}" ទេ (Not Found)`,
              },
              3400
            );
            return {
              success: false,
              reason: 'not_found',
            };
          }
        } catch (err) {
          console.error('[SCANNER ERROR] global process error:', err);
          playErrorSound();
          showToast(
            {
              isError: true,
              message: err?.message || 'មានបញ្ហាក្នុងការស្វែងរកទំនិញ (Connection error)',
            },
            3000
          );
          return {
            success: false,
            reason: 'error',
            message: err?.message || 'Connection error',
          };
        }
      };

      const queuedPromise = queueRef.current.then(task, task);
      queueRef.current = queuedPromise.catch(() => {});
      return queuedPromise;
    },
    [addItem, showToast]
  );

  const value = {
    isScannerOpen,
    openScanner,
    closeScanner,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    globalToast,
    showToast,
    hideToast,
    processBarcode,
  };

  return (
    <GlobalScannerContext.Provider value={value}>
      {children}
    </GlobalScannerContext.Provider>
  );
}

export function useGlobalScanner() {
  const context = useContext(GlobalScannerContext);
  if (!context) {
    throw new Error('useGlobalScanner must be used within a GlobalScannerProvider');
  }
  return context;
}
