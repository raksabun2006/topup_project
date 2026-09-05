import { useState, useEffect, useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Loader2, CheckCircle, XCircle, Clock, AlertCircle, X, RefreshCw, Smartphone,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { salePaymentApi } from '../../api/salePaymentApi';
import { useSalePaymentPolling } from '../../hooks/useSalePaymentPolling';
import { saleApi } from '../../api/saleApi';
import { getErrorMessage } from '../../api/client';
import { formatCurrency, parseBackendDate, formatCountdown } from '../../utils/format';

export default function BakongPaymentModal({ sale, onPaid, onClose }) {
  const { isAuthenticated } = useAuth();
  const isGuest = Boolean(sale?.isGuest ?? !isAuthenticated);

  // 1. Resolve and strictly lock the original Sale ID from sale creation
  const originalSaleId = useRef(
    (typeof sale === 'string' ? sale : null) ||
    sale?.saleId ||
    sale?.orderId ||
    sale?.entityId ||
    sale?.id ||
    sale?.data?.id ||
    sale?.data?.saleId ||
    (typeof sale?.getSaleId === 'function' ? sale.getSaleId() : null) ||
    null
  ).current;

  // 2. Track paymentId separately from saleId
  const paymentIdRef = useRef(
    sale?.paymentId ||
    (typeof sale?.getPaymentId === 'function' ? sale.getPaymentId() : null) ||
    null
  );

  const ACTIVE_PAYMENT_KEY = 'pos_active_bakong_payment';

  const [creating, setCreating] = useState(true);
  const [createError, setCreateError] = useState('');
  const [pollingEnabled, setPollingEnabled] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [isExpiredLocal, setIsExpiredLocal] = useState(false);

  // Payment polling always uses originalSaleId and options via single controller
  const pollingOptions = useRef({ isGuest });
  pollingOptions.current = { isGuest };
  const {
    payment,
    paymentState,
    isChecking,
    statusMessage,
    error: pollError,
    checkNow,
    setPayment,
    stop: stopPolling,
  } = useSalePaymentPolling(originalSaleId, pollingEnabled, pollingOptions.current);

  // Normalize status string from backend
  const statusUpper = String(
    payment?.status ||
    (typeof payment?.getStatus === 'function' ? payment.getStatus() : '') ||
    ''
  ).toUpperCase();

  const paymentStatusUpper = String(
    payment?.paymentStatus ||
    (typeof payment?.getPaymentStatus === 'function' ? payment.getPaymentStatus() : '') ||
    ''
  ).toUpperCase();

  const isPaid =
    paymentState === 'PAID' ||
    paymentState === 'COMPLETED' ||
    payment?.paid === true ||
    (typeof payment?.isPaid === 'function' && payment.isPaid()) ||
    ['PAID', 'SUCCESS', 'COMPLETED'].includes(statusUpper) ||
    ['PAID', 'SUCCESS', 'COMPLETED'].includes(paymentStatusUpper);

  const isTerminalFailure =
    paymentState === 'FAILED' ||
    paymentState === 'CANCELLED' ||
    paymentState === 'REFUNDED' ||
    ['FAILED', 'CANCELLED', 'REFUNDED'].includes(statusUpper) ||
    ['FAILED', 'CANCELLED', 'REFUNDED'].includes(paymentStatusUpper);

  const isExpired =
    isExpiredLocal ||
    paymentState === 'EXPIRED' ||
    statusUpper === 'EXPIRED' ||
    paymentStatusUpper === 'EXPIRED';

  const isCancelled =
    paymentState === 'CANCELLED' ||
    statusUpper === 'CANCELLED' ||
    paymentStatusUpper === 'CANCELLED';

  const isRateLimited = paymentState === 'RATE_LIMITED';
  const isTemporaryError = paymentState === 'ERROR';

  // QR card remains actively rendered while waiting, checking, rate limited, or temporary error
  const isQrActive = !isPaid && !isExpired && !isCancelled && !isTerminalFailure;

  const status = isPaid
    ? 'PAID'
    : isExpired
    ? 'EXPIRED'
    : isCancelled
    ? 'CANCELLED'
    : isTerminalFailure
    ? 'FAILED'
    : paymentState || statusUpper || paymentStatusUpper || 'PENDING';

  const initRef = useRef(false);
  const finalizedRef = useRef(false);
  const isRegeneratingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Complete sale flow with strict idempotency lock
  const completeSale = useCallback(async () => {
    if (finalizedRef.current || !mountedRef.current) return;
    finalizedRef.current = true;

    try {
      sessionStorage.removeItem(ACTIVE_PAYMENT_KEY);
    } catch {
      // ignore
    }

    setPollingEnabled(false);
    stopPolling();
    setFinishing(true);

    try {
      // 1. Fetch latest verified sale entity from backend using originalSaleId
      let updatedSale = null;
      try {
        console.log(`[BakongPaymentModal] Completing sale: fetching sale with originalSaleId:`, originalSaleId);
        updatedSale = await saleApi.getById(originalSaleId, { isGuest });
      } catch (err) {
        console.warn('Notice fetching sale by ID:', err);
      }

      // Visual confirmation of payment success before transitioning to receipt
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (!mountedRef.current) return;

      // 2. Complete sale in POS (moves to Receipt modal and resets cart)
      onPaid(updatedSale || { ...sale, paymentStatus: 'PAID', status: 'COMPLETED' });
    } catch (err) {
      console.warn('Notice during sale completion:', err);
      if (mountedRef.current) {
        onPaid({ ...sale, paymentStatus: 'PAID', status: 'COMPLETED' });
      }
    } finally {
      if (mountedRef.current) {
        setFinishing(false);
      }
    }
  }, [originalSaleId, sale, onPaid, stopPolling, isGuest]);

  // Initial Check & Create (handles refresh, reopen, and already-paid states safely)
  useEffect(() => {
    if (initRef.current || !originalSaleId) return;
    initRef.current = true;

    let isMounted = true;

    (async () => {
      try {
        console.log(`[BakongPaymentModal] Mounted with originalSaleId:`, originalSaleId);

        // Step 1: ALWAYS check payment status FIRST using GET /sales/{saleId}/payment/status
        // If payment is already PAID or exists, DO NOT create a new payment!
        let statusCheck = null;
        try {
          statusCheck = await salePaymentApi.checkStatus(originalSaleId, { isGuest });
          if (statusCheck?.paymentId) {
            paymentIdRef.current = statusCheck.paymentId;
          }
        } catch {
          // Status endpoint might return 404 if payment hasn't been created yet
        }

        if (!isMounted) return;

        // If statusCheck returned a result:
        if (statusCheck) {
          const isCheckPaid =
            statusCheck.paid === true ||
            (typeof statusCheck.isPaid === 'function' && statusCheck.isPaid()) ||
            statusCheck.paymentStatus === 'PAID' ||
            statusCheck.status === 'PAID';

          if (isCheckPaid) {
            try {
              sessionStorage.removeItem(ACTIVE_PAYMENT_KEY);
            } catch {
              // ignore
            }
            setPayment(statusCheck);
            setPollingEnabled(false);
            stopPolling();
            setCreating(false);
            return;
          }

          // If pending and has QR, use existing payment and start polling
          if (statusCheck.qr || statusCheck.qrString) {
            setPayment(statusCheck);
            setIsExpiredLocal(false);
            try {
              sessionStorage.setItem(
                ACTIVE_PAYMENT_KEY,
                JSON.stringify({
                  saleId: originalSaleId,
                  paymentId: statusCheck.paymentId,
                  isGuest,
                  sale,
                })
              );
            } catch {
              // ignore
            }
            setPollingEnabled(true);
            setCreating(false);
            return;
          }
        }

        // Step 2: If status check didn't have QR, check GET /sales/{saleId}/payment
        let existing = null;
        try {
          existing = await salePaymentApi.get(originalSaleId, { isGuest });
          if (existing?.paymentId) {
            paymentIdRef.current = existing.paymentId;
          }
        } catch {
          // Payment has not been created yet (404)
        }

        if (!isMounted) return;

        if (existing) {
          const combined = {
            ...existing,
            ...(statusCheck || {}),
            qrString: existing.qrString || statusCheck?.qrString || null,
            qr: existing.qr || statusCheck?.qr || null,
            paid: statusCheck?.paid ?? existing.paid,
            status: statusCheck?.status ?? existing.status,
            paymentStatus: statusCheck?.paymentStatus ?? existing.paymentStatus,
          };

          setPayment(combined);

          const isExistingPaid =
            combined.paid === true ||
            (typeof combined.isPaid === 'function' && combined.isPaid()) ||
            combined.paymentStatus === 'PAID' ||
            combined.status === 'PAID';

          if (isExistingPaid) {
            try {
              sessionStorage.removeItem(ACTIVE_PAYMENT_KEY);
            } catch {
              // ignore
            }
            setPollingEnabled(false);
            stopPolling();
            setCreating(false);
            return;
          }

          if (combined.qrString || combined.qr) {
            setIsExpiredLocal(false);
            try {
              sessionStorage.setItem(
                ACTIVE_PAYMENT_KEY,
                JSON.stringify({
                  saleId: originalSaleId,
                  paymentId: combined.paymentId,
                  isGuest,
                  sale,
                })
              );
            } catch {
              // ignore
            }
            setPollingEnabled(true);
            setCreating(false);
            return;
          }
        }

        // Step 3: ONLY create payment if NO existing payment exists
        console.log(`[BakongPaymentModal] No existing payment found. Creating payment for originalSaleId:`, originalSaleId);
        const created = await salePaymentApi.create(originalSaleId, 'BAKONG', { isGuest });
        if (!isMounted) return;

        if (created?.paymentId) {
          paymentIdRef.current = created.paymentId;
        }

        console.log(`[BakongPaymentModal] Payment created successfully:`, {
          originalSaleId,
          paymentId: created?.paymentId,
          status: created?.status,
        });

        setPayment(created);
        setIsExpiredLocal(false);

        const isCreatedPaid =
          created?.paid === true ||
          (typeof created?.isPaid === 'function' && created.isPaid()) ||
          created?.paymentStatus === 'PAID' ||
          created?.status === 'PAID';

        if (isCreatedPaid) {
          try {
            sessionStorage.removeItem(ACTIVE_PAYMENT_KEY);
          } catch {
            // ignore
          }
          setPollingEnabled(false);
          stopPolling();
        } else {
          try {
            sessionStorage.setItem(
              ACTIVE_PAYMENT_KEY,
              JSON.stringify({
                saleId: originalSaleId,
                paymentId: created?.paymentId,
                isGuest,
                sale,
              })
            );
          } catch {
            // ignore
          }
          setPollingEnabled(true);
        }
      } catch (err) {
        if (!isMounted) return;

        // If backend returned 409 Conflict (payment already created for this sale)
        if (err?.response?.status === 409) {
          try {
            const fallbackStatus = await salePaymentApi.checkStatus(originalSaleId, { isGuest });
            if (!isMounted) return;
            if (fallbackStatus?.paymentId) {
              paymentIdRef.current = fallbackStatus.paymentId;
            }
            setPayment(fallbackStatus);
            setIsExpiredLocal(false);
            const isFallbackPaid =
              fallbackStatus?.paid === true ||
              (typeof fallbackStatus?.isPaid === 'function' && fallbackStatus.isPaid()) ||
              fallbackStatus?.paymentStatus === 'PAID' ||
              fallbackStatus?.status === 'PAID';

            if (isFallbackPaid) {
              try {
                sessionStorage.removeItem(ACTIVE_PAYMENT_KEY);
              } catch {
                // ignore
              }
              setPollingEnabled(false);
              stopPolling();
            } else {
              try {
                sessionStorage.setItem(
                  ACTIVE_PAYMENT_KEY,
                  JSON.stringify({
                    saleId: originalSaleId,
                    paymentId: fallbackStatus?.paymentId,
                    isGuest,
                    sale,
                  })
                );
              } catch {
                // ignore
              }
              setPollingEnabled(true);
            }
            return;
          } catch {
            try {
              const fallbackGet = await salePaymentApi.get(originalSaleId, { isGuest });
              if (!isMounted) return;
              if (fallbackGet?.paymentId) {
                paymentIdRef.current = fallbackGet.paymentId;
              }
              setPayment(fallbackGet);
              setIsExpiredLocal(false);
              try {
                sessionStorage.setItem(
                  ACTIVE_PAYMENT_KEY,
                  JSON.stringify({
                    saleId: originalSaleId,
                    paymentId: fallbackGet?.paymentId,
                    isGuest,
                    sale,
                  })
                );
              } catch {
                // ignore
              }
              setPollingEnabled(true);
              return;
            } catch {
              // ignore
            }
          }
        }

        setCreateError(getErrorMessage(err));
      } finally {
        if (isMounted) {
          setCreating(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [originalSaleId, isGuest, stopPolling, setPayment, sale]);

  // Clean up polling timer when component unmounts
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  // When payment reaches PAID / SUCCESS (confirmed by Backend)
  useEffect(() => {
    if (!isPaid || finalizedRef.current) {
      return;
    }
    completeSale();
  }, [isPaid, completeSale]);

  // Instant Manual Status Verification (delegates to single controller with inFlight concurrency guard)
  const handleManualCheck = useCallback(() => {
    if (isChecking || finalizedRef.current || isPaid) return;
    checkNow();
  }, [isChecking, isPaid, checkNow]);

  // Regenerate / Retry QR
  const regenerateQr = useCallback(async () => {
    if (isRegeneratingRef.current || isPaid) return;
    isRegeneratingRef.current = true;
    setRegenerating(true);
    setCreateError('');
    setIsExpiredLocal(false);
    try {
      // First check if payment was already completed before recreating
      try {
        const check = await salePaymentApi.checkStatus(originalSaleId, { isGuest });
        if (check?.paid || check?.paymentStatus === 'PAID' || check?.status === 'PAID') {
          if (check.paymentId) paymentIdRef.current = check.paymentId;
          setPayment(check);
          setPollingEnabled(false);
          stopPolling();
          return;
        }
      } catch {
        // continue
      }

      console.log(`[BakongPaymentModal.regenerateQr] Creating new payment QR with originalSaleId:`, originalSaleId);
      const created = await salePaymentApi.create(originalSaleId, 'BAKONG', { isGuest });
      if (created?.paymentId) {
        paymentIdRef.current = created.paymentId;
      }
      setPayment(created);
      const isCreatedPaid =
        created?.paid === true ||
        created?.paymentStatus === 'PAID' ||
        created?.status === 'PAID';
      setPollingEnabled(!isCreatedPaid);
    } catch (err) {
      setCreateError(getErrorMessage(err));
    } finally {
      isRegeneratingRef.current = false;
      setRegenerating(false);
    }
  }, [originalSaleId, isPaid, isGuest, stopPolling, setPayment]);

  // Dynamic Countdown calculation derived strictly from backend expiresAt
  const [secondsLeft, setSecondsLeft] = useState(null);

  useEffect(() => {
    const qrText = payment?.qrString || payment?.qr;
    if (!qrText || status !== 'PENDING') {
      setSecondsLeft(null);
      return;
    }

    const expiresDate = parseBackendDate(payment?.expiresAt);
    if (!expiresDate) {
      setSecondsLeft(null);
      return;
    }

    const expiresAtMs = expiresDate.getTime();

    const tick = () => {
      const remainingMs = expiresAtMs - Date.now();
      const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));
      setSecondsLeft(remainingSeconds);

      if (remainingSeconds <= 0) {
        setIsExpiredLocal(true);
        setPollingEnabled(false);
        stopPolling();
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [payment?.qrString, payment?.qr, payment?.expiresAt, status, stopPolling]);

  const handleCancel = async () => {
    try {
      sessionStorage.removeItem(ACTIVE_PAYMENT_KEY);
    } catch {
      // ignore
    }

    if (finalizedRef.current || isPaid) {
      onClose();
      return;
    }
    setCanceling(true);
    setPollingEnabled(false);
    stopPolling();

    // Cancellation uses paymentId for payment cancellation
    const activePaymentId = paymentIdRef.current || payment?.paymentId || payment?.id;
    console.log(`[BakongPaymentModal.handleCancel] Canceling payment with paymentId:`, activePaymentId, `and saleId:`, originalSaleId);

    if (activePaymentId) {
      try {
        await salePaymentApi.cancel(activePaymentId, { isGuest });
      } catch (err) {
        console.warn('Notice canceling payment:', err?.message);
      }
    }

    try {
      if (originalSaleId) {
        await saleApi.cancel(originalSaleId, { isGuest });
      }
    } catch {
      // Close modal regardless
    } finally {
      if (mountedRef.current) {
        setCanceling(false);
      }
      onClose();
    }
  };

  const isSuccess = isPaid;

  const billNo = payment?.billNumber || payment?.invoiceNumber || sale?.invoiceNumber || 'INV';
  const paymentAmount = payment?.amount ?? sale?.total;
  const paymentCurrency = payment?.currency || 'USD';
  const merchantDisplayName = payment?.merchantName || 'Mart System';
  const qrValue = payment?.qrString || payment?.qr || (typeof payment?.getQr === 'function' ? payment.getQr() : null);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm max-h-[92vh] flex flex-col overflow-hidden rounded-t-3xl sm:rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl animate-slide-up sm:animate-scale-in">
        {/* Modal Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4 py-3 sm:px-6 sm:py-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">ស្កេនដើម្បីបង់ប្រាក់ KHQR</h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">លេខវិក្កយបត្រ៖ {billNo}</p>
          </div>
          <button
            onClick={isSuccess || finalizedRef.current ? onClose : handleCancel}
            disabled={canceling || finishing}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-50 transition"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Loading State */}
        {creating && (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <Loader2 size={32} className="animate-spin text-emerald-600" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">កំពុងបង្កើត Bakong KHQR...</p>
          </div>
        )}

        {/* Creation Error State */}
        {!creating && createError && (
          <div className="p-8 text-center">
            <AlertCircle size={32} className="mx-auto mb-3 text-rose-600" />
            <p className="mb-5 text-sm text-rose-600 dark:text-rose-400">{createError}</p>
            <div className="flex gap-3">
              <button
                onClick={regenerateQr}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-500"
              >
                <RefreshCw size={14} />
                ព្យាយាមម្តងទៀត
              </button>
              <button
                onClick={handleCancel}
                disabled={canceling}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-50"
              >
                បិទ
              </button>
            </div>
          </div>
        )}

        {/* Payment Success State: Immediately show ✓ Payment Successful / Sale Completed */}
        {!creating && !createError && isSuccess && (
          <div className="flex flex-col items-center gap-3 py-12 px-6 text-center animate-fade-in">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle size={38} />
            </div>
            <h4 className="text-xl font-black text-slate-900 dark:text-white">✓ ការទូទាត់ជោគជ័យ</h4>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Payment completed successfully.</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Invoice: {billNo}
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
              {formatCurrency(paymentAmount, paymentCurrency)} · បានទូទាត់រួចរាល់
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[240px]">
              {finishing
                ? 'កំពុងរៀបចំវិក្កយបត្រ... (Preparing receipt...)'
                : 'ការបញ្ជាទិញរបស់អ្នកត្រូវបានបញ្ជាក់។ សូមអរគុណសម្រាប់ការគាំទ្រ។'}
            </p>
          </div>
        )}

        {/* Main Body Container with Scroll */}
        <div className="flex-1 overflow-y-auto">
          {/* Main Display: Active QR Code or Failed / Expired state */}
          {!creating && !createError && !isSuccess && (
            <>
              <div className="flex justify-center px-4 py-4 sm:px-6 sm:py-5">
                {isQrActive ? (
                  <div className="relative w-full">
                    {qrValue ? (
                      /* Standard KHQR Red Card - Keep white bg inside card for optical scanner contrast */
                      <div className="relative mx-auto w-full max-w-[260px] sm:max-w-[270px] overflow-hidden rounded-2xl bg-white shadow-lg border border-slate-200 animate-fade-in">
                        {/* KHQR Header Banner */}
                        <div
                          className="bg-[#E61924] px-4 sm:px-5 py-2 sm:py-2.5 text-right text-white font-bold tracking-wider"
                          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 93% 100%, 0 100%)' }}
                        >
                          <span className="text-lg sm:text-xl font-extrabold italic tracking-tight">KHQR</span>
                        </div>

                        {/* Merchant & Amount Details */}
                        <div className="px-4 sm:px-5 pt-2.5 pb-1.5 text-left">
                          <p className="truncate text-[10px] sm:text-[11px] font-bold uppercase tracking-wide text-slate-600">
                            {merchantDisplayName}
                          </p>
                          <p className="mt-0.5 text-xl sm:text-2xl font-black text-slate-900">
                            {formatCurrency(paymentAmount, paymentCurrency)}
                          </p>
                        </div>

                        {/* Dashed Separator */}
                        <div className="mx-4 border-t-2 border-dashed border-slate-200" />

                        {/* Real KHQR QR Code rendered from backend data.qr / qrString */}
                        <div className="flex items-center justify-center p-4 sm:p-5 bg-white">
                          <QRCodeSVG
                            value={qrValue}
                            size={180}
                            level="M"
                            marginSize={0}
                            className="max-w-full h-auto"
                          />
                        </div>

                        {/* Acceptance Networks Footer */}
                        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-3.5 sm:px-4 py-2 text-[9px] sm:text-[10px] text-slate-500">
                          <div className="flex flex-col text-left">
                            <span className="text-[7px] sm:text-[8px] uppercase tracking-wider text-slate-400">Member of</span>
                            <span className="font-extrabold italic text-slate-700">KHQR</span>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-1.5">
                            <span className="rounded bg-[#00427A] px-1.5 py-0.5 text-[7px] sm:text-[8px] font-bold text-white">UnionPay</span>
                            <span className="rounded bg-[#E60012] px-1.5 py-0.5 text-[7px] sm:text-[8px] font-bold text-white">云闪付</span>
                            <span className="rounded bg-[#1677FF] px-1.5 py-0.5 text-[7px] sm:text-[8px] font-bold text-white">Alipay+</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-64 sm:h-72 w-full items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                        <Loader2 size={32} className="animate-spin text-slate-600 dark:text-slate-400" />
                      </div>
                    )}

                    {regenerating && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl bg-white/95 dark:bg-slate-900/95">
                        <Loader2 size={28} className="animate-spin text-emerald-600" />
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-300">កំពុងបង្កើត QR ថ្មី...</p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Expired or Failed State */
                  <div className="flex flex-col items-center gap-2.5 py-6 sm:py-8 text-center animate-fade-in">
                    {isExpired ? (
                      <Clock size={36} className="text-amber-500" />
                    ) : (
                      <XCircle size={36} className="text-rose-500" />
                    )}
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      {isExpired
                        ? 'QR បានផុតកំណត់'
                        : isCancelled
                        ? 'ការទូទាត់ត្រូវបានបោះបង់ (Payment Cancelled)'
                        : 'ការទូទាត់មិនបានជោគជ័យ'}
                    </h4>
                    <p className="max-w-[240px] text-xs text-slate-500 dark:text-slate-400">
                      {isExpired
                        ? 'QR បានផុតកំណត់ សូមបង្កើតការទូទាត់ថ្មី។'
                        : payment?.message || 'សូមព្យាយាមម្តងទៀត ឬបង្កើតការទូទាត់ថ្មី។'}
                    </p>
                  </div>
                )}
              </div>

              {/* Expiration Countdown Banner (Active QR State) */}
              {isQrActive && secondsLeft != null && (
                <div className="px-4 sm:px-6 pb-2 text-center">
                  <p className={`text-xs font-semibold ${secondsLeft <= 60 ? 'text-rose-600 dark:text-rose-400 animate-pulse' : 'text-slate-500 dark:text-slate-400'}`}>
                    QR ផុតកំណត់ក្នុង {formatCountdown(secondsLeft)}
                  </p>
                </div>
              )}

              {/* Bill Details Summary when not active QR */}
              {!isQrActive && (
                <div className="border-y border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 px-4 sm:px-6 py-2.5 sm:py-3 text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">ចំនួនទឹកប្រាក់សរុប</p>
                  <p className="mt-0.5 text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    {formatCurrency(paymentAmount, paymentCurrency)}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Action Buttons Footer */}
        {!creating && !createError && !isSuccess && (
          <div className="shrink-0 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 sm:px-6 sm:py-4">
            {isQrActive ? (
              <>
                {isRateLimited ? (
                  <div className="flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 p-2.5 text-xs text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 animate-fade-in">
                    <AlertCircle size={15} className="shrink-0 text-amber-600 dark:text-amber-400" />
                    <span className="leading-snug">
                      {statusMessage || 'មិនអាចពិនិត្យស្ថានភាពការទូទាត់បានជាបណ្តោះអាសន្ន។ កំពុងផ្ទៀងផ្ទាត់ការទូទាត់... សូមរង់ចាំបន្តិច'}
                    </span>
                  </div>
                ) : isTemporaryError ? (
                  <div className="flex items-center gap-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 p-2.5 text-xs text-blue-800 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60 animate-fade-in">
                    <Loader2 size={15} className="shrink-0 text-blue-600 dark:text-blue-400 animate-spin" />
                    <span className="leading-snug">
                      {statusMessage || 'កំពុងពិនិត្យការទូទាត់... សូមរង់ចាំបន្តិច។'}
                    </span>
                  </div>
                ) : pollError ? (
                  <p className="mb-2 text-center text-xs text-rose-600 dark:text-rose-400">{pollError}</p>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 py-2.5 px-3 text-center">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      {isChecking ? (
                        <>
                          <Loader2 size={14} className="animate-spin text-emerald-600 shrink-0" />
                          <span>● កំពុងពិនិត្យ... (Checking payment...)</span>
                        </>
                      ) : (
                        <>
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                          <span>កំពុងរង់ចាំការបង់ប្រាក់ (Waiting for payment...)</span>
                        </>
                      )}
                    </div>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                      Please complete payment · សូមស្កេន KHQR ដើម្បីបង់ប្រាក់
                    </p>
                  </div>
                )}

                {/* Instant Verification Check Button */}
                <button
                  type="button"
                  onClick={handleManualCheck}
                  disabled={isChecking || canceling || finishing}
                  className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-600/30 bg-emerald-50/70 dark:bg-emerald-950/40 py-2.5 px-3 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition cursor-pointer disabled:opacity-50"
                >
                  {isChecking ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-emerald-600" />
                      <span>● កំពុងពិនិត្យ... (Checking...)</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw size={14} className="text-emerald-600" />
                      <span>ពិនិត្យស្ថានភាពទូទាត់ (Check Payment)</span>
                    </>
                  )}
                </button>

                {payment?.deeplinkUrl && (
                  <a
                    href={payment.deeplinkUrl}
                    className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 sm:py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                  >
                    <Smartphone size={14} />
                    បើកកម្មវិធី Bakong
                  </a>
                )}

                <button
                  onClick={handleCancel}
                  disabled={canceling}
                  className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/30 py-2 text-xs font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-100/60 dark:hover:bg-rose-900/40 disabled:opacity-50 transition"
                >
                  {canceling ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
                  បោះបង់ការទូទាត់
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={regenerateQr}
                  disabled={regenerating}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-500 disabled:opacity-60"
                >
                  {regenerating ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                  បង្កើតការទូទាត់ថ្មី (Generate New QR)
                </button>

                <button
                  onClick={handleCancel}
                  disabled={canceling}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition"
                >
                  ត្រឡប់ក្រោយ (Close)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}