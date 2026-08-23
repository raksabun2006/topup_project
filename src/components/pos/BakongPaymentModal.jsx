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

/**
 * ត្រូវការ sale ដែលបានបង្កើតរួច (paymentStatus: 'PENDING') ពី
 * CheckoutModal រួចហើយ - modal នេះគ្រាន់តែស្នើសុំ Bakong payment
 * សម្រាប់ sale នោះ (មិនកំណត់ត្រឹមទំនិញមួយប្រភេទទៀតទេ ព្រោះ payment
 * ភ្ជាប់នឹង Sale ពិតទាំងមូល)។ ក្រោយ PAID - ទាញ Sale ចុងក្រោយពី backend
 * ជា "ប្រភពការពិត" (paymentStatus/status backend ជាអ្នកកំណត់ ចុងក្រោយ)។
 */
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // ពេលបង់ប្រាក់ជោគជ័យ - ទាញ Sale ចុងក្រោយពី backend (source of truth)
  useEffect(() => {
    if (status !== 'PAID' || finalizedRef.current) return;
    finalizedRef.current = true;

    (async () => {
      setFinishing(true);
      setFinishError('');
      try {
        const updatedSale = await saleApi.getById(sale.id);
        onPaid(updatedSale);
      } catch (err) {
        setFinishError(getErrorMessage(err));
        finalizedRef.current = false;
      } finally {
        setFinishing(false);
      }
    })();
  }, [status, sale.id, onPaid]);

  // លុបចោលទាំង payment (QR) និង Sale ខ្លួនឯង - បើមិនធ្វើដូច្នេះទេ Sale
  // ដែលបានបង្កើតជាមុន (paymentStatus: PENDING) នឹងនៅសេសសល់ក្នុងប្រវត្តិ
  // ការលក់ ហើយបើ cashier ប្តូរទៅសាច់ប្រាក់វិញ នឹងបង្កើត Sale ទីពីរស្ទួន។
  const handleCancel = async () => {
    setCanceling(true);
    try {
      await salePaymentApi.cancel(sale.id);
    } catch {
      // បន្ត cancel sale ទោះ payment cancel បរាជ័យ (ឧ. គ្មាន payment ទាន់បង្កើត)
    }
    try {
      await saleApi.cancel(sale.id);
    } catch {
      // ទោះបរាជ័យក៏បិទ modal ដដែល - cashier អាចត្រឡប់ទៅជម្រើសបង់ប្រាក់ផ្សេង
    } finally {
      setCanceling(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-slate-300 bg-ink-900 shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-900">ស្កេនដើម្បីបង់ប្រាក់</h3>
          <button
            onClick={status === 'PAID' ? onClose : handleCancel}
            disabled={canceling}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-emerald-50 hover:text-slate-900 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {creating && (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <Loader2 size={32} className="animate-spin text-emerald-600" />
            <p className="text-sm text-slate-500">កំពុងបង្កើត QR...</p>
          </div>
        )}

        {!creating && createError && (
          <div className="p-8 text-center">
            <AlertCircle size={32} className="mx-auto mb-3 text-rose-700" />
            <p className="mb-5 text-sm text-rose-700">{createError}</p>
            <button
              onClick={handleCancel}
              disabled={canceling}
              className="rounded-xl border border-slate-300 bg-ink-950 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 disabled:opacity-50"
            >
              បិទ
            </button>
          </div>
        )}

        {!creating && !createError && status === 'PAID' && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            {finishing ? (
              <>
                <Loader2 size={32} className="animate-spin text-emerald-600" />
                <p className="text-sm text-slate-500">បង់ប្រាក់ជោគជ័យ - កំពុងបញ្ចប់ការលក់...</p>
              </>
            ) : finishError ? (
              <>
                <AlertCircle size={32} className="text-rose-700" />
                <p className="px-6 text-sm text-rose-700">{finishError}</p>
                <p className="px-6 text-xs text-slate-500">ការបង់ប្រាក់ជោគជ័យរួចហើយ - សូមព្យាយាមម្តងទៀត</p>
              </>
            ) : (
              <>
                <CheckCircle size={36} className="text-emerald-700" />
                <p className="text-sm text-slate-600">ជោគជ័យ!</p>
              </>
            )}
          </div>
        )}

        {!creating && !createError && status && status !== 'PAID' && (
          <>
            <div className="flex justify-center px-6 py-8">
              {isMock ? (
                <div className="rounded-2xl border-2 border-dashed border-amber-400/40 bg-amber-500/10 p-6 text-center">
                  <AlertCircle size={28} className="mx-auto mb-3 text-amber-700" />
                  <p className="font-semibold text-amber-700">របៀបសាកល្បង (Mock)</p>
                  <p className="mt-2 max-w-[220px] text-xs text-amber-700/80">
                    ការបង់ប្រាក់នឹងបញ្ចប់ដោយស្វ័យប្រវត្តិក្នុងរយៈពេលប៉ុន្មានវិនាទី
                  </p>
                </div>
              ) : status === 'PENDING' ? (
                <div className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  {payment?.qrString ? (
                    <div key={payment.qrString} className="animate-fade-in-up">
                      <QRCodeSVG value={payment.qrString} size={200} level="M" marginSize={0} />
                    </div>
                  ) : (
                    <div className="flex h-[200px] w-[200px] items-center justify-center">
                      <Loader2 size={32} className="animate-spin text-slate-600" />
                    </div>
                  )}
                  {regenerating && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl bg-white">
                      <Loader2 size={28} className="animate-spin text-emerald-500" />
                      <p className="text-xs font-medium text-slate-500">កំពុងបង្កើត QR ថ្មី...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                  {status === 'EXPIRED' ? (
                    <Clock size={32} className="text-rose-700" />
                  ) : (
                    <XCircle size={32} className="text-rose-700" />
                  )}
                  <p className="text-sm text-rose-700">
                    {status === 'EXPIRED' ? 'QR ផុតកំណត់' : status === 'CANCELLED' ? 'ការទូទាត់ត្រូវបានបោះបង់' : 'ការបង់ប្រាក់បរាជ័យ'}
                  </p>
                </div>
              )}
            </div>

            {status === 'PENDING' && !isMock && secondsLeft != null && (
              <p className={`-mt-4 pb-4 text-center text-xs font-medium ${secondsLeft <= 60 ? 'text-rose-700' : 'text-slate-500'}`}>
                QR ផុតកំណត់ក្នុង {formatCountdown(secondsLeft)}
              </p>
            )}

            <div className="border-y border-slate-200 bg-ink-950 px-6 py-4 text-center">
              <p className="text-xs text-slate-500">ចំនួនទឹកប្រាក់</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {formatCurrency(payment?.amount ?? sale.total, payment?.currency)}
              </p>
            </div>

            <div className="px-6 py-5">
              {status === 'PENDING' ? (
                pollError ? (
                  <p className="text-center text-sm text-rose-700">{pollError}</p>
                ) : timedOut ? (
                  <p className="text-center text-sm text-amber-700">ឈប់ពិនិត្យស្វ័យប្រវត្តិ - សូម refresh</p>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                    <Loader2 size={16} className="animate-spin text-emerald-600" />
                    កំពុងរង់ចាំការបង់ប្រាក់...
                  </div>
                )
              ) : (
                <button
                  onClick={regenerateQr}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 hover:from-emerald-500 hover:to-emerald-500"
                >
                  <RefreshCw size={15} />
                  បង្កើត QR ថ្មី
                </button>
              )}

              {payment?.deeplinkUrl && status === 'PENDING' && (
                <a
                  href={payment.deeplinkUrl}
                  className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-ink-950 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  <Smartphone size={16} />
                  បើកកម្មវិធី Bakong
                </a>
              )}

              {status === 'PENDING' && (
                <button
                  onClick={handleCancel}
                  disabled={canceling}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/5 py-2 text-sm font-medium text-rose-700 hover:bg-rose-500/10 disabled:opacity-50"
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
