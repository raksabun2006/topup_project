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

  // Centralized barcode processor that adds directly to active order
  const processBarcode = useCallback(
    async (code, localProducts = []) => {
      const trimmed = String(code || '').trim();
      if (!trimmed) {
        playInvalidBarcodeSound();
        return { success: false, reason: 'invalid' };
      }

      console.log('[Scanner] processing:', trimmed);

      try {
        const result = await lookupProductByBarcode(trimmed, localProducts);

        if (result.status === 'found' && result.product) {
          // Play supermarket beep immediately on verified real product
          playBeepSound();

          // Add to active cart (increments quantity if already in cart)
          addItem(result.product, 1);

          // Compute updated quantity from latest ref
          const currentItems = cartItemsRef.current || [];
          const existing = currentItems.find((i) => i?.product?.id === result.product.id);
          const nextQty = (existing?.quantity || 0) + 1;

          console.log('[Scanner] product:', result.product);
          console.log('[Scanner] cart updated:', nextQty);

          showToast({
            isError: false,
            product: result.product,
            name: result.product.name,
            imageUrl: result.product.imageUrl,
            barcode: result.product.barcode || result.product.sku || trimmed,
            price: result.product.price,
            quantity: nextQty,
          });

          return {
            success: true,
            product: result.product,
            quantity: nextQty,
          };
        } else {
          // Product not found
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
        console.error('Global barcode process error:', err);
        playErrorSound();
        showToast(
          {
            isError: true,
            message: 'មានបញ្ហាក្នុងការស្វែងរកទំនិញ (Connection error)',
          },
          3000
        );
        return {
          success: false,
          reason: 'error',
          message: err?.message || 'Connection error',
        };
      }
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
