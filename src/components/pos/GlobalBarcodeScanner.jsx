import { useCallback } from 'react';
import { CheckCircle2, AlertCircle, Package } from 'lucide-react';
import { useGlobalScanner } from '../../context/GlobalScannerContext';
import { useCart } from '../../context/CartContext';
import { useBarcodeScanner } from '../../hooks/useBarcodeScanner';
import BarcodeScannerModal from './BarcodeScannerModal';
import ActiveOrderDrawer from './ActiveOrderDrawer';
import FloatingScanButton from './FloatingScanButton';
import { formatCurrency } from '../../utils/format';

/**
 * GlobalBarcodeScanner Manager Component
 * 1. Listens for physical USB/Bluetooth barcode guns globally across all pages.
 * 2. Renders the Floating Scan Button (bottom-right).
 * 3. Renders the Global Camera Scanner Modal.
 * 4. Renders the Slide-out Active Order Drawer.
 * 5. Renders the Global Scan Toast notification with real product image and info.
 */
export default function GlobalBarcodeScanner() {
  const {
    isScannerOpen,
    closeScanner,
    globalToast,
    hideToast,
    processBarcode,
    openDrawer,
  } = useGlobalScanner();
  const { items: cartItems, addItem } = useCart();

  // Global Hardware USB / Bluetooth Scanner listener (works from ANY screen)
  useBarcodeScanner(
    useCallback(
      async (code) => {
        if (!code) return;
        await processBarcode(code);
      },
      [processBarcode]
    )
  );

  return (
    <>
      {/* 1. Global Floating Scan Button */}
      <FloatingScanButton />

      {/* 2. Global Camera Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={closeScanner}
        onAddProduct={(product) => {
          addItem(product, 1);
        }}
        cartItems={cartItems}
      />

      {/* 3. Global Active Order Slide-Out Drawer */}
      <ActiveOrderDrawer />

      {/* 4. Global Scan Toast Notification (Appears on scan from anywhere) */}
      {globalToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-4 sm:top-5 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between gap-3 sm:gap-4 rounded-2xl px-3.5 sm:px-4 py-2.5 text-xs font-semibold shadow-2xl backdrop-blur-md animate-slide-down max-w-[94vw] sm:max-w-md cursor-pointer border"
          style={{
            backgroundColor: globalToast.isError
              ? 'rgba(225, 29, 72, 0.95)'
              : 'rgba(15, 23, 42, 0.95)',
            borderColor: globalToast.isError
              ? 'rgba(251, 113, 133, 0.5)'
              : 'rgba(16, 185, 129, 0.5)',
            color: '#FFFFFF',
          }}
          onClick={() => {
            if (!globalToast.isError) {
              hideToast();
              openDrawer();
            } else {
              hideToast();
            }
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Real Product Image or Status Icon */}
            {!globalToast.isError ? (
              <div className="relative shrink-0">
                {globalToast.imageUrl ? (
                  <img
                    src={globalToast.imageUrl}
                    alt={globalToast.name || 'Product'}
                    className="h-11 w-11 rounded-xl object-cover border border-white/20 bg-white"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600/80 border border-emerald-400/40 text-white">
                    <Package size={20} />
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
                  <CheckCircle2 size={12} />
                </span>
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white shrink-0">
                <AlertCircle size={20} />
              </div>
            )}

            <div className="min-w-0 text-left">
              <span
                className={`block text-[10px] font-extrabold uppercase tracking-wider ${
                  globalToast.isError ? 'text-rose-200' : 'text-emerald-400'
                }`}
              >
                {globalToast.isError ? '⚠ រកមិនឃើញទំនិញ' : '✓ PRODUCT SCANNED'}
              </span>
              <p className="font-bold text-xs sm:text-sm text-white truncate max-w-[200px] sm:max-w-[240px]">
                {globalToast.isError ? globalToast.message : globalToast.name}
              </p>
              {!globalToast.isError && globalToast.barcode && (
                <p className="text-[10px] text-slate-300 truncate">
                  Barcode: {globalToast.barcode}
                </p>
              )}
            </div>
          </div>

          {!globalToast.isError && (
            <div className="text-right shrink-0 border-l border-white/20 pl-3">
              <span className="font-extrabold text-sm text-white">
                {formatCurrency(globalToast.price)}
              </span>
              <p className="text-[10px] font-bold text-emerald-300">
                Qty: {globalToast.quantity}
              </p>
              <p className="text-[9px] text-emerald-200/80 font-medium">
                ✓ Added
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
