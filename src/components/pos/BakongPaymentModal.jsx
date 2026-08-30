import { useState, useEffect, useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Loader2, CheckCircle, XCircle, Clock, AlertCircle, X, RefreshCw, Smartphone,
} from 'lucide-react';
import { salePaymentApi } from '../../api/salePaymentApi';
import { useSalePaymentPolling } from '../../hooks/useSalePaymentPolling';
import { saleApi } from '../../api/saleApi';
import { getErrorMessage } from '../../api/client';
import { formatCurrency, parseBackendDate, formatCountdown } from '../../utils/format';

export default function BakongPaymentModal({ sale, onPaid, onClose }) {
  const [creating, setCreating] = useState(true);
  const [createError, setCreateError] = useState('');
  const [pollingEnabled, setPollingEnabled] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState('');
  const [isExpiredLocal, setIsExpiredLocal] = useState(false);

  const { payment, error: pollError, setPayment, stop: stopPolling } =
    useSalePaymentPolling(sale.id, pollingEnabled);

  // Normalize status string from backend
  const rawStatus = payment?.status ? String(payment.status).toUpperCase() : '';
  const status = isExpiredLocal && rawStatus === 'PENDING' ? 'EXPIRED' : rawStatus;

  const initRef = useRef(false);
  const finalizedRef = useRef(false);
  const isRegeneratingRef = useRef(false);

  // Initial QR creation (POST /sales/{saleId}/payment)
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    (async () => {
      try {
        const created = await salePaymentApi.create(sale.id, 'BAKONG');
        setPayment(created);
        setIsExpiredLocal(false);
        setPollingEnabled(created?.status === 'PENDING');
      } catch (err) {
        setCreateError(getErrorMessage(err));
      } finally {
        setCreating(false);
      }
    })();
  }, [sale.id, setPayment]);

  // Clean up polling timer when component unmounts
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  // Regenerate / Retry QR
  const regenerateQr = useCallback(async () => {
    if (isRegeneratingRef.current) return;
    isRegeneratingRef.current = true;
    setRegenerating(true);
    setCreateError('');
    setIsExpiredLocal(false);
    try {
      const created = await salePaymentApi.create(sale.id, 'BAKONG');
      setPayment(created);
      setPollingEnabled(true);
    } catch (err) {
      setCreateError(getErrorMessage(err));
    } finally {
      isRegeneratingRef.current = false;
      setRegenerating(false);
    }
  }, [sale.id, setPayment]);

  // Dynamic Countdown calculation derived strictly from backend expiresAt
  const [secondsLeft, setSecondsLeft] = useState(null);

  useEffect(() => {
    if (!payment?.qrString || status !== 'PENDING') {
      setSecondsLeft(null);
      return;
    }

    const expiresDate = parseBackendDate(payment.expiresAt);
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
  }, [payment?.qrString, payment?.expiresAt, status, stopPolling]);

  // When payment status reaches PAID / COMPLETED / SUCCESS (confirmed by Backend)
  useEffect(() => {
    if ((status !== 'PAID' && status !== 'COMPLETED' && status !== 'SUCCESS') || finalizedRef.current) {
      return;
    }
    finalizedRef.current = true;
    setPollingEnabled(false);
    stopPolling();

    (async () => {
      setFinishing(true);
      setFinishError('');
      try {
        const updatedSale = await saleApi.markPaid(sale.id);
        onPaid(updatedSale || sale);
      } catch (err) {
        console.warn('Notice while completing sale:', err);
        onPaid(sale);
      } finally {
        setFinishing(false);
      }
    })();
  }, [status, sale, onPaid, stopPolling]);

  const handleCancel = async () => {
    setCanceling(true);
    stopPolling();
    try {
      await salePaymentApi.cancel(sale.id);
    } catch {
      // Continue canceling
    }
    try {
      await saleApi.cancel(sale.id);
    } catch {
      // Close modal regardless
    } finally {
      setCanceling(false);
      onClose();
    }
  };

  const isSuccess = status === 'PAID' || status === 'COMPLETED' || status === 'SUCCESS';
  const isExpired = status === 'EXPIRED';
  const isCancelled = status === 'CANCELLED';

  const billNo = payment?.billNumber || sale.invoiceNumber || 'INV';
  const paymentAmount = payment?.amount ?? sale.total;
  const paymentCurrency = payment?.currency || 'USD';
  const merchantDisplayName = payment?.merchantName || 'Bun Raksa';

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
            onClick={isSuccess ? onClose : handleCancel}
            disabled={canceling}
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

        {/* Payment Success State */}
        {!creating && !createError && isSuccess && (
          <div className="flex flex-col items-center gap-3 py-12 px-6 text-center animate-fade-in">
            {finishing ? (
              <>
                <Loader2 size={36} className="animate-spin text-emerald-600" />
                <p className="text-base font-bold text-slate-900 dark:text-white">ការទូទាត់បានជោគជ័យ</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">កំពុងបញ្ចប់ការបញ្ជាទិញ...</p>
              </>
            ) : finishError ? (
              <>
                <AlertCircle size={36} className="text-amber-600" />
                <p className="text-base font-bold text-slate-900 dark:text-white">ការទូទាត់បានជោគជ័យ</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{finishError}</p>
              </>
            ) : (
              <>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle size={38} />
                </div>
                <h4 className="text-xl font-black text-slate-900 dark:text-white">ការទូទាត់បានជោគជ័យ!</h4>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Invoice: {billNo}
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                  {formatCurrency(paymentAmount, paymentCurrency)} · បានទូទាត់រួចរាល់
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[240px]">
                  ការបញ្ជាទិញរបស់អ្នកត្រូវបានបញ្ជាក់។ សូមអរគុណសម្រាប់ការគាំទ្រ។
                </p>
              </>
            )}
          </div>
        )}

        {/* Main Body Container with Scroll */}
        <div className="flex-1 overflow-y-auto">
          {/* Main Display: PENDING QR Code or Failed / Expired state */}
          {!creating && !createError && !isSuccess && (
            <>
              <div className="flex justify-center px-4 py-4 sm:px-6 sm:py-5">
                {status === 'PENDING' ? (
                  <div className="relative w-full">
                    {payment?.qrString ? (
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

                        {/* Real KHQR QR Code rendered from backend data.qrString */}
                        <div className="flex items-center justify-center p-4 sm:p-5 bg-white">
                          <QRCodeSVG
                            value={payment.qrString}
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

              {/* Expiration Countdown Banner (Pending State) */}
              {status === 'PENDING' && secondsLeft != null && (
                <div className="px-4 sm:px-6 pb-2 text-center">
                  <p className={`text-xs font-semibold ${secondsLeft <= 60 ? 'text-rose-600 dark:text-rose-400 animate-pulse' : 'text-slate-500 dark:text-slate-400'}`}>
                    QR ផុតកំណត់ក្នុង {formatCountdown(secondsLeft)}
                  </p>
                </div>
              )}

              {/* Bill Details Summary when not pending */}
              {status !== 'PENDING' && (
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
            {status === 'PENDING' ? (
              <>
                {pollError ? (
                  <p className="mb-2 text-center text-xs text-rose-600 dark:text-rose-400">{pollError}</p>
                ) : (
                  <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 py-2 sm:py-2.5 text-xs font-medium text-emerald-800 dark:text-emerald-300">
                    <Loader2 size={14} className="animate-spin text-emerald-600 shrink-0" />
                    <span className="truncate">កំពុងរង់ចាំការទូទាត់...</span>
                  </div>
                )}

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