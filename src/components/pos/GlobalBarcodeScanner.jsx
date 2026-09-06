import { useCallback } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
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
 * 5. Renders the Global Scan Toast notification.
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
          className="fixed top-4 sm:top-5 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between gap-3 sm:gap-4 rounded-2xl px-4 py-2.5 text-xs font-semibold shadow-2xl backdrop-blur-md animate-slide-down max-w-[92vw] sm:max-w-md cursor-pointer border"
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
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-xl text-white shrink-0 ${
                globalToast.isError ? 'bg-white/20' : 'bg-emerald-600'
              }`}
            >
              {globalToast.isError ? <AlertCircle size={17} /> : <CheckCircle2 size={17} />}
            </div>

            <div className="min-w-0 text-left">
              <span
                className={`block text-[10px] font-extrabold uppercase tracking-wider ${
                  globalToast.isError ? 'text-rose-200' : 'text-emerald-400'
                }`}
              >
                {globalToast.isError ? '⚠ រកមិនឃើញទំនិញ' : '✓ Added to Active Order'}
              </span>
              <p className="font-bold text-xs sm:text-sm text-white truncate max-w-[220px] sm:max-w-[280px]">
                {globalToast.isError ? globalToast.message : globalToast.name}
              </p>
            </div>
          </div>

          {!globalToast.isError && (
            <div className="text-right shrink-0 border-l border-white/20 pl-3">
              <span className="font-extrabold text-white">
                {formatCurrency(globalToast.price)}
              </span>
              <p className="text-[10px] font-bold text-emerald-300">
                ចំនួន៖ x{globalToast.quantity}
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
