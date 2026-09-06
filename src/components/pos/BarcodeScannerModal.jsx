import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  ScanBarcode,
  Keyboard,
  X,
  AlertCircle,
  Package,
  ShoppingBag,
} from 'lucide-react';
import BarcodeScanner from './BarcodeScanner';
import BarcodeInput from './BarcodeInput';
import { prefetchCatalogCache } from '../../utils/barcodeLookup';
import { playInvalidBarcodeSound } from '../../utils/sound';
import { formatCurrency } from '../../utils/format';
import { useGlobalScanner } from '../../context/GlobalScannerContext';

/**
 * Supermarket POS Barcode Scanner Modal
 * Ultra-fast continuous scanning: SCAN -> BEEP -> ADD -> NEXT SCAN.
 * Camera stays active continuously. No waiting, no freezing, instant cart update.
 */
export default function BarcodeScannerModal({
  isOpen,
  onClose,
  products = [],
  onProcessBarcode,
  cartItems = [],
}) {
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'manual'
  const [lastScannedProduct, setLastScannedProduct] = useState(null); // { product, quantity, timestamp }
  const [scanFeedback, setScanFeedback] = useState(null); // { type: 'success' | 'not_found' | 'error', message, code }
  const [isProcessing, setIsProcessing] = useState(false);
  const feedbackTimeoutRef = useRef(null);

  const globalScanner = useGlobalScanner();
  const sharedProcessBarcode = onProcessBarcode || globalScanner?.processBarcode;

  // Total items scanned and subtotal in cart for live supermarket counter
  const totalItemCount = useMemo(
    () => cartItems.reduce((sum, i) => sum + (i?.quantity || 0), 0),
    [cartItems]
  );
  const cartSubtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, i) => sum + (Number(i?.product?.price) || 0) * (i?.quantity || 0) - (i?.discount || 0),
        0
      ),
    [cartItems]
  );

  // Warm up catalog cache when opened (Audio unlock happens on user tap "Start Scanner")
  useEffect(() => {
    if (isOpen) {
      prefetchCatalogCache();
    } else {
      setScanFeedback(null);
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    }
  }, [isOpen]);

  // Keyboard shortcut: ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Unified barcode processor: Scan -> Beep -> Add -> Ready for next scan
  const handleBarcodeProcess = useCallback(
    async (code) => {
      const trimmed = String(code || '').trim();
      if (!trimmed) {
        playInvalidBarcodeSound();
        return;
      }

      setIsProcessing(true);
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }

      try {
        if (typeof sharedProcessBarcode === 'function') {
          // Shared global processBarcode pipeline (handles lookup, beep/error sound, active cart update)
          const res = await sharedProcessBarcode(trimmed, products);

          if (res?.success && res?.product) {
            setLastScannedProduct({
              product: res.product,
              quantity: res.quantity,
              timestamp: Date.now(),
            });

            setScanFeedback({
              type: 'success',
              product: res.product,
              quantity: res.quantity,
              code: trimmed,
            });

            feedbackTimeoutRef.current = setTimeout(() => {
              setScanFeedback(null);
            }, 1200);
          } else if (res?.reason === 'not_found') {
            setScanFeedback({
              type: 'not_found',
              code: trimmed,
              message: `រកមិនឃើញបាកូដ "${trimmed}" (Product not found)`,
            });

            feedbackTimeoutRef.current = setTimeout(() => {
              setScanFeedback(null);
            }, 2400);
          } else {
            setScanFeedback({
              type: 'error',
              code: trimmed,
              message: res?.message || 'បញ្ហាតភ្ជាប់ សូមព្យាយាមម្តងទៀត',
            });

            feedbackTimeoutRef.current = setTimeout(() => {
              setScanFeedback(null);
            }, 2400);
          }
        }
      } catch (err) {
        console.error('Scan processing error:', err);
        setScanFeedback({
          type: 'error',
          code: trimmed,
          message: 'Error processing barcode',
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [products, sharedProcessBarcode]
  );

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Supermarket Barcode Scanner"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 sm:p-4 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl animate-scale-in max-h-[96vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header: Title, Live Supermarket Scan Counter & ESC */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 sm:px-5 py-3 sm:py-3.5 bg-slate-50/80 dark:bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/25">
              <ScanBarcode size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                  ម៉ាស៊ីនស្កេនទំនិញ (POS Scanner)
                </h3>
                {/* Live Scanner Status Indicator */}
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{isProcessing ? 'Processing...' : 'Ready'}</span>
                </span>
              </div>
              {/* Scan Counter */}
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                ស្កេនបាន៖ <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">{totalItemCount} ចំនួន</strong> • សរុប៖ <strong className="text-slate-800 dark:text-slate-200">{formatCurrency(cartSubtotal)}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="hidden sm:inline-block rounded-md bg-slate-200/80 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-400">
              ESC
            </span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
              aria-label="Close scanner modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Switcher: Camera vs. Manual Input */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/40 p-1 sm:p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('camera')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition cursor-pointer ${
              activeTab === 'camera'
                ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ScanBarcode size={15} />
            <span>កាមេរ៉ាស្កេនជាប់គ្នា (Continuous Scan)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition cursor-pointer ${
              activeTab === 'manual'
                ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Keyboard size={15} />
            <span>វាយលេខកូដ (Manual)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
          {/* Real-time Scan Flash Feedback Overlay (Non-blocking toast banner) */}
          {scanFeedback && (
            <div
              className={`rounded-2xl p-3 text-xs font-bold shadow-md animate-slide-down flex items-center justify-between gap-3 ${
                scanFeedback.type === 'success'
                  ? 'bg-emerald-600 text-white border border-emerald-400/40'
                  : 'bg-rose-600 text-white border border-rose-400/40'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {scanFeedback.type === 'success' ? (
                  <div className="relative shrink-0">
                    {scanFeedback.product.imageUrl ? (
                      <img
                        src={scanFeedback.product.imageUrl}
                        alt={scanFeedback.product.name}
                        className="h-11 w-11 rounded-xl object-cover bg-white border border-white/30"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 text-white">
                        <Package size={20} />
                      </div>
                    )}
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-emerald-700 shadow-xs text-[10px] font-black">
                      ✓
                    </span>
                  </div>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 text-white shrink-0">
                    <AlertCircle size={18} />
                  </div>
                )}

                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-90 block">
                    {scanFeedback.type === 'success' ? '✓ PRODUCT SCANNED' : '⚠ SCAN ERROR'}
                  </span>
                  <p className="text-xs truncate font-bold">
                    {scanFeedback.type === 'success'
                      ? scanFeedback.product.name
                      : scanFeedback.message}
                  </p>
                  {scanFeedback.type === 'success' && (
                    <p className="text-[10px] opacity-80 truncate">
                      Barcode: {scanFeedback.product.barcode || scanFeedback.product.sku || scanFeedback.code}
                    </p>
                  )}
                </div>
              </div>

              {scanFeedback.type === 'success' && (
                <div className="text-right shrink-0">
                  <span className="font-extrabold">{formatCurrency(scanFeedback.product.price)}</span>
                  <p className="text-emerald-200 text-[11px] font-bold">
                    Qty: {scanFeedback.quantity}
                  </p>
                </div>
              )}

              {scanFeedback.type === 'not_found' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('manual')}
                  className="rounded-lg bg-white/25 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-white/35 transition cursor-pointer"
                >
                  វាយកូដ →
                </button>
              )}
            </div>
          )}

          {/* Tab 1: Camera Scanner (Continuous, never pauses) */}
          {activeTab === 'camera' && (
            <div className="space-y-3">
              <BarcodeScanner
                onDetect={handleBarcodeProcess}
                onSwitchToManual={() => setActiveTab('manual')}
              />
            </div>
          )}

          {/* Tab 2: Manual Barcode Entry */}
          {activeTab === 'manual' && (
            <div className="py-2">
              <BarcodeInput
                onSubmit={handleBarcodeProcess}
                onCancel={() => setActiveTab('camera')}
                isSearching={isProcessing}
              />
            </div>
          )}

          {/* Section 9: Last Scanned Product Card (Pinned & Always visible) */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/70 p-3 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-500 dark:text-slate-400">
                ទំនិញស្កេនចុងក្រោយ (LAST SCANNED)
              </span>
              {lastScannedProduct && (
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  ✓ ក្នុងរទេះ
                </span>
              )}
            </div>

            {lastScannedProduct ? (
              <div className="flex items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-3 min-w-0">
                  {lastScannedProduct.product.imageUrl ? (
                    <img
                      src={lastScannedProduct.product.imageUrl}
                      alt={lastScannedProduct.product.name}
                      className="h-12 w-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 bg-white"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
                      <Package size={22} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {lastScannedProduct.product.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {lastScannedProduct.product.barcode ? `Barcode: ${lastScannedProduct.product.barcode}` : lastScannedProduct.product.sku ? `SKU: ${lastScannedProduct.product.sku}` : ''}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
                    {formatCurrency(lastScannedProduct.product.price)}
                  </div>
                  <div className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800">
                    ចំនួន៖ x{lastScannedProduct.quantity}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 py-2 text-xs text-slate-400 dark:text-slate-500">
                <ShoppingBag size={18} className="opacity-60 shrink-0" />
                <span>មិនទាន់បានស្កេនទំនិញនៅឡើយទេ។ តម្រង់កាមេរ៉ាទៅលើបាកូដដើម្បីចាប់ផ្តើម។</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer: Current Cart Summary & Action to Close */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 px-5 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <span>រទេះបច្ចុប្បន្ន៖</span>
            <strong className="text-slate-900 dark:text-white font-extrabold">{totalItemCount} មុខទំនិញ</strong>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <strong className="text-emerald-700 dark:text-emerald-400 font-extrabold">{formatCurrency(cartSubtotal)}</strong>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 dark:bg-white px-4 py-2 text-xs font-bold text-white dark:text-slate-900 shadow-sm hover:opacity-90 transition active:scale-95 cursor-pointer"
          >
            រួចរាល់ (Done)
          </button>
        </div>
      </div>
    </div>
  );
}
