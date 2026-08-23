import { useState, useEffect, useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Loader2, CheckCircle, XCircle, Clock, AlertCircle, X, RefreshCw, Smartphone,
} from 'lucide-react';
import { salePaymentApi } from '../../api/salePaymentApi';
import { useSalePaymentPolling } from '../../hooks/useSalePaymentPolling';
import { saleApi } from '../../api/saleApi';
import { getErrorMessage } from '../../api/client';
import { formatCurrency } from '../../utils/format';
import { env } from '../../config/env';

function formatCountdown(totalSeconds) {
  if (totalSeconds == null) return null;
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function BakongPaymentModal({ sale, onPaid, onClose }) {
  const [creating, setCreating] = useState(true);
  const [createError, setCreateError] = useState('');
  const [pollingEnabled, setPollingEnabled] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState('');

  const { payment, error: pollError, timedOut, setPayment } = useSalePaymentPolling(sale.id, pollingEnabled);
  const status = payment?.status;
  const isMock = payment?.provider?.toUpperCase() === 'MOCK';

  const initRef = useRef(false);
  const finalizedRef = useRef(false);
  const isRegeneratingRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    (async () => {
      try {
        const created = await salePaymentApi.create(sale.id, 'BAKONG');
        setPayment(created);
        setPollingEnabled(created.status === 'PENDING');
      } catch (err) {
        setCreateError(getErrorMessage(err));
      } finally {
        setCreating(false);
      }
    })();
  }, []);

  const qrIssuedAtRef = useRef(null);
  useEffect(() => {
    if (payment?.qrString) qrIssuedAtRef.current = Date.now();
  }, [payment?.qrString]);

  const regenerateQr = useCallback(async () => {
    if (isRegeneratingRef.current) return;
    isRegeneratingRef.current = true;
    setRegenerating(true);
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

  const [secondsLeft, setSecondsLeft] = useState(null);
  useEffect(() => {
    if (!payment?.qrString || status !== 'PENDING' || isMock) {
      setSecondsLeft(null);
      return;
    }
    const expiresAtMs = payment?.expiresAt
      ? new Date(payment.expiresAt).getTime()
      : (qrIssuedAtRef.current ?? Date.now()) + env.qrExpirationMinutes * 60000;

    const tick = () => {
      const remaining = Math.max(0, Math.round((expiresAtMs - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining <= 0) regenerateQr();
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [payment?.qrString, payment?.expiresAt, status, isMock, regenerateQr]);

  useEffect(() => {
    if (status !== 'PAID' || finalizedRef.current) return;
    finalizedRef.current = true;

    (async () => {
      setFinishing(true);
      setFinishError('');
      try {
        const updatedSale = await saleApi.markPaid(sale.id);
        onPaid(updatedSale);
      } catch (err) {
        setFinishError(getErrorMessage(err));
        finalizedRef.current = false;
      } finally {
        setFinishing(false);
      }
    })();
  }, [status, sale.id, onPaid]);

  const handleCancel = async () => {
    setCanceling(true);
    try {
      await salePaymentApi.cancel(sale.id);
    } catch {
      // Continue canceling even if request fails
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-2xl animate-scale-in">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-900">ស្កេនដើម្បីបង់ប្រាក់</h3>
          <button
            onClick={status === 'PAID' ? onClose : handleCancel}
            disabled={canceling}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Loading State */}
        {creating && (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <Loader2 size={32} className="animate-spin text-emerald-600" />
            <p className="text-sm text-slate-500">កំពុងបង្កើត QR...</p>
          </div>
        )}

        {/* Creation Error State */}
        {!creating && createError && (
          <div className="p-8 text-center">
            <AlertCircle size={32} className="mx-auto mb-3 text-rose-600" />
            <p className="mb-5 text-sm text-rose-600">{createError}</p>
            <button
              onClick={handleCancel}
              disabled={canceling}
              className="rounded-xl border border-slate-300 bg-slate-100 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 disabled:opacity-50"
            >
              បិទ
            </button>
          </div>
        )}

        {/* Paid State */}
        {!creating && !createError && status === 'PAID' && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            {finishing ? (
              <>
                <Loader2 size={32} className="animate-spin text-emerald-600" />
                <p className="text-sm text-slate-500">បង់ប្រាក់ជោគជ័យ - កំពុងបញ្ចប់ការលក់...</p>
              </>
            ) : finishError ? (
              <>
                <AlertCircle size={32} className="text-rose-600" />
                <p className="px-6 text-sm text-rose-600">{finishError}</p>
                <p className="px-6 text-xs text-slate-500">ការបង់ប្រាក់ជោគជ័យរួចហើយ - សូមព្យាយាមម្តងទៀត</p>
              </>
            ) : (
              <>
                <CheckCircle size={36} className="text-emerald-600" />
                <p className="text-sm text-slate-600">ជោគជ័យ!</p>
              </>
            )}
          </div>
        )}

        {/* Malformed Response State */}
        {!creating && !createError && !status && (
          <div className="p-8 text-center">
            <AlertCircle size={32} className="mx-auto mb-3 text-amber-600" />
            <p className="mb-2 text-sm text-amber-600">
              បង្កើត QR ជោគជ័យ តែមិនអាចអានស្ថានភាពការទូទាត់បានទេ (ចម្លើយ server មិនមានទម្រង់ត្រឹមត្រូវ)
            </p>
            {payment != null && (
              <pre className="mt-3 max-h-32 overflow-auto rounded-lg bg-slate-900 p-2 text-left text-[10px] text-slate-300">
                {JSON.stringify(payment, null, 2)}
              </pre>
            )}
            <button
              onClick={regenerateQr}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-100 px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
            >
              <RefreshCw size={14} />
              ព្យាយាមម្តងទៀត
            </button>
          </div>
        )}

        {/* Main Display Section */}
        {!creating && !createError && status && status !== 'PAID' && (
          <>
            <div className="flex justify-center px-6 py-6">
              {isMock ? (
                <div className="rounded-2xl border-2 border-dashed border-amber-400/40 bg-amber-500/10 p-6 text-center">
                  <AlertCircle size={28} className="mx-auto mb-3 text-amber-600" />
                  <p className="font-semibold text-amber-600">របៀបសាកល្បង (Mock)</p>
                  <p className="mt-2 max-w-[220px] text-xs text-amber-600/80">
                    ការបង់ប្រាក់នឹងបញ្ចប់ដោយស្វ័យប្រវត្តិក្នុងរយៈពេលប៉ុន្មានវិនាទី
                  </p>
                </div>
              ) : status === 'PENDING' ? (
                <div className="relative w-full">
                  {payment?.qrString ? (
                    /* Clean KHQR Standard Card Layout */
                    <div className="relative mx-auto w-full max-w-[280px] overflow-hidden rounded-2xl bg-white shadow-xl border border-slate-100 animate-fade-in-up">
                      
                      {/* KHQR Header Banner */}
                      <div 
                        className="bg-[#E61924] px-5 py-3 text-right text-white font-bold tracking-wider"
                        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 93% 100%, 0 100%)' }}
                      >
                        <span className="text-xl font-extrabold italic tracking-tight">KHQR</span>
                      </div>

                      {/* Merchant Details */}
                      <div className="px-6 pt-4 pb-3 text-left">
                        <p className="truncate text-xs font-semibold uppercase tracking-wide text-slate-600">
                          {env.appName || 'MERCHANT NAME'}
                        </p>
                        <p className="mt-1 text-2xl font-black text-slate-900">
                          {formatCurrency(payment?.amount ?? sale.total, payment?.currency)}
                        </p>
                      </div>

                      {/* Dashed Separator */}
                      <div className="mx-5 border-t-2 border-dashed border-slate-200" />

                      {/* Pure Standard QR Code (No center logo overlay) */}
                      <div className="flex items-center justify-center p-6 bg-white">
                        <QRCodeSVG 
                          value={payment.qrString} 
                          size={200} 
                          level="M" 
                          marginSize={0} 
                        />
                      </div>

                      {/* KHQR Network Acceptance Footer */}
                      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-4 py-2.5 text-[10px] text-slate-500">
                        <div className="flex flex-col text-left">
                          <span className="text-[9px] uppercase tracking-wider text-slate-400">Member of</span>
                          <span className="font-extrabold italic text-slate-700">KHQR</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="rounded bg-[#00427A] px-1.5 py-0.5 text-[9px] font-bold text-white">UnionPay</span>
                          <span className="rounded bg-[#E60012] px-1.5 py-0.5 text-[9px] font-bold text-white">云闪付</span>
                          <span className="rounded bg-[#1677FF] px-1.5 py-0.5 text-[9px] font-bold text-white">Alipay+</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-80 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <Loader2 size={32} className="animate-spin text-slate-600" />
                    </div>
                  )}

                  {regenerating && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl bg-white/90">
                      <Loader2 size={28} className="animate-spin text-emerald-500" />
                      <p className="text-xs font-medium text-slate-500">កំពុងបង្កើត QR ថ្មី...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                  {status === 'EXPIRED' ? (
                    <Clock size={32} className="text-rose-600" />
                  ) : (
                    <XCircle size={32} className="text-rose-600" />
                  )}
                  <p className="text-sm text-rose-600">
                    {status === 'EXPIRED' ? 'QR ផុតកំណត់' : status === 'CANCELLED' ? 'ការទូទាត់ត្រូវបានបោះបង់' : 'ការបង់ប្រាក់បរាជ័យ'}
                  </p>
                  {status === 'FAILED' && (payment?.message || payment?.failureReason) && (
                    <p className="max-w-60 text-xs text-rose-600/80">
                      {payment.message || payment.failureReason}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Expiration Timer */}
            {status === 'PENDING' && !isMock && secondsLeft != null && (
              <p className={`-mt-2 pb-2 text-center text-xs font-medium ${secondsLeft <= 60 ? 'text-rose-600' : 'text-slate-500'}`}>
                QR ផុតកំណត់ក្នុង {formatCountdown(secondsLeft)}
              </p>
            )}

            {/* Total Amount Block */}
            {status !== 'PENDING' && (
              <div className="border-y border-slate-200 bg-slate-50 px-6 py-4 text-center">
                <p className="text-xs text-slate-500">ចំនួនទឹកប្រាក់</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {formatCurrency(payment?.amount ?? sale.total, payment?.currency)}
                </p>
              </div>
            )}

            {/* Actions Area */}
            <div className="px-6 py-4">
              {status === 'PENDING' ? (
                pollError ? (
                  <p className="text-center text-sm text-rose-600">{pollError}</p>
                ) : timedOut ? (
                  <p className="text-center text-sm text-amber-600">ឈប់ពិនិត្យស្វ័យប្រវត្តិ - សូម refresh</p>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                    <Loader2 size={16} className="animate-spin text-emerald-600" />
                    កំពុងរង់ចាំការបង់ប្រាក់...
                  </div>
                )
              ) : (
                <button
                  onClick={regenerateQr}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500"
                >
                  <RefreshCw size={15} />
                  បង្កើត QR ថ្មី
                </button>
              )}

              {payment?.deeplinkUrl && status === 'PENDING' && (
                <a
                  href={payment.deeplinkUrl}
                  className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-50 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  <Smartphone size={16} />
                  បើកកម្មវិធី Bakong
                </a>
              )}

              {status === 'PENDING' && (
                <button
                  onClick={handleCancel}
                  disabled={canceling}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/5 py-2 text-sm font-medium text-rose-600 hover:bg-rose-500/10 disabled:opacity-50"
                >
                  {canceling ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                  បោះបង់ការទូទាត់
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}