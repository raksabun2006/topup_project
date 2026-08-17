import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  Loader2, CheckCircle, XCircle, Clock, Copy, Check,
  Smartphone, AlertCircle, ArrowLeft, RefreshCw,
} from 'lucide-react';
import { paymentApi } from '../api/paymentApi';
import { ordersApi } from '../api/ordersApi';
import { getErrorMessage } from '../api/client';
import { formatCurrency } from '../utils/format';
import { usePaymentPolling } from '../hooks/usePaymentPolling';
import { env } from '../config/env';

function formatCountdown(totalSeconds) {
  if (totalSeconds == null) return null;
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function Payment() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [creating, setCreating] = useState(true);
  const [createError, setCreateError] = useState('');
  const [copied, setCopied] = useState(false);

  // ចាប់ផ្តើម poll តែបន្ទាប់ពី QR ត្រូវបានបង្កើត
  const [pollingEnabled, setPollingEnabled] = useState(false);
  const { payment, error: pollError, timedOut, setPayment } =
    usePaymentPolling(orderId, pollingEnabled);

  const status = payment?.status;
  const isMock = payment?.provider?.toUpperCase() === 'MOCK';

  // ពេល QR ថ្មីមកដល់ (បង្កើតដំបូង ឬ auto-refresh) - កត់ត្រាម៉ោង
  // ដើម្បីគណនា countdown។ បើ backend ផ្ញើ payment.expiresAt មកវិញ
  // យើងប្រើតម្លៃនោះជាចម្បង ព្រោះវាជា timestamp ពិតរបស់ Tag 08។
  const qrIssuedAtRef = useRef(null);
  useEffect(() => {
    if (payment?.qrString) qrIssuedAtRef.current = Date.now();
  }, [payment?.qrString]);

  const [secondsLeft, setSecondsLeft] = useState(null);
  const [regenerating, setRegenerating] = useState(false);
  const isRegeneratingRef = useRef(false);

  const regenerateQr = useCallback(async () => {
    if (isRegeneratingRef.current) return;
    isRegeneratingRef.current = true;
    setRegenerating(true);
    try {
      const created = await paymentApi.create(orderId, 'BAKONG', env.qrExpirationMinutes);
      setPayment(created);
      setPollingEnabled(true);
    } catch (err) {
      setCreateError(getErrorMessage(err));
    } finally {
      isRegeneratingRef.current = false;
      setRegenerating(false);
    }
  }, [orderId, setPayment]);

  // Countdown + auto-refresh: ស្កេន QR ថ្មីដោយស្វ័យប្រវត្តិមុនពេលផុតកំណត់
  // ដើម្បីអ្នកប្រើមិនចាំបាច់ជួប "QR ផុតកំណត់" ទេ។
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

  /**
   * ព្យាយាមអានការបង់ប្រាក់ដែលមានស្រាប់មុន។
   *
   * ការហៅ create ដោយងងឹតងងុលនឹងបរាជ័យជាមួយ 409 បើអ្នកប្រើ
   * refresh ទំព័រ - QR មានរួចហើយសម្រាប់ order នេះ។
   */
  // React.StrictMode ហៅ effect នេះពីរដងក្នុងរបៀប dev (mount → cleanup →
  // mount) ដែលធ្វើឲ្យ create() ត្រូវបានហៅព្រម ២ ដងក្នុងពេលតែមួយសម្រាប់
  // order តែមួយ - ប៉ះពាល់ quota Bakong (១០០/ថ្ងៃ) ហើយអាចបណ្តាលឲ្យ
  // backend racing រវាង ២ requests ព្រម (payment ចប់ស្ថានភាព FAILED
  // ខុសពីការរំពឹងទុក)។ initKeyRef+initPromiseRef ធានាថាមានតែ request
  // មួយប៉ុណ្ណោះចេញ per orderId ទោះបើ effect រត់ច្រើនដងក៏ដោយ។
  const initKeyRef = useRef(null);
  const initPromiseRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    if (initKeyRef.current !== orderId) {
      initKeyRef.current = orderId;
      initPromiseRef.current = (async () => {
        let orderData = null;
        try {
          orderData = await ordersApi.getById(orderId);
        } catch {
          // មិនសំខាន់ទេ - ព័ត៌មាន order ជាការបន្ថែម។
        }

        let paymentResult = null;
        let error = null;
        try {
          // GET មិនហៅ Bakong ទេ ដូច្នេះវាមិនចំណាយ quota។
          paymentResult = await paymentApi.get(orderId);
        } catch {
          // គ្មានការបង់ប្រាក់នៅឡើយ - បង្កើតថ្មី។
          try {
            paymentResult = await paymentApi.create(orderId, 'BAKONG');
          } catch (err) {
            error = err;
          }
        }

        return { orderData, paymentResult, error };
      })();
    }

    initPromiseRef.current.then(({ orderData, paymentResult, error }) => {
      if (cancelled) return;

      if (orderData) setOrder(orderData);
      if (paymentResult) {
        setPayment(paymentResult);
        setPollingEnabled(paymentResult.status === 'PENDING');
      } else if (error) {
        setCreateError(getErrorMessage(error));
      }
      setCreating(false);
    });

    return () => { cancelled = true; };
  }, [orderId, setPayment]);

  const copyReference = () => {
    navigator.clipboard.writeText(payment.paymentReference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ---------- កំពុងបង្កើត ----------
  if (creating) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center px-4">
        <div className="text-center">
          <Loader2 size={40} className="mx-auto mb-4 animate-spin text-purple-400" />
          <p className="text-slate-400">កំពុងបង្កើត QR...</p>
        </div>
      </div>
    );
  }

  // ---------- បង្កើតបរាជ័យ ----------
  if (createError) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-8 text-center">
          <AlertCircle size={40} className="mx-auto mb-4 text-rose-400" />
          <p className="mb-6 text-rose-300">{createError}</p>
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 rounded-xl border border-purple-900/40 bg-ink-900 px-5 py-2.5 text-sm font-medium text-slate-300 shadow-sm transition hover:border-purple-500/40 hover:text-white"
          >
            <ArrowLeft size={16} />
            ត្រឡប់ទៅការបញ្ជាទិញ
          </Link>
        </div>
      </div>
    );
  }

  // ---------- ជោគជ័យ ----------
  if (status === 'PAID') {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-2xl border border-emerald-500/30 bg-ink-900 p-10 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle size={36} className="text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">បង់ប្រាក់ជោគជ័យ</h1>
          <p className="mt-3 text-slate-400">
            ការបញ្ចូលទឹកប្រាក់កំពុងដំណើរការ។ អ្នកនឹងទទួលបានក្នុងពេលឆាប់ៗ។
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <Link
              to={`/orders/${payment.orderNumber}`}
              className="rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-5 py-3 font-semibold text-white shadow-lg shadow-purple-600/30 transition hover:from-purple-500 hover:to-fuchsia-500"
            >
              មើលការបញ្ជាទិញ
            </Link>
            <Link
              to="/games"
              className="rounded-xl border border-purple-900/40 bg-ink-950 px-5 py-3 font-medium text-slate-300 shadow-sm transition hover:border-purple-500/40 hover:text-white"
            >
              បញ្ចូលទឹកប្រាក់បន្ថែម
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ---------- បរាជ័យ ឬផុតកំណត់ ----------
  if (status === 'FAILED' || status === 'EXPIRED') {
    const expired = status === 'EXPIRED';
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-2xl border border-purple-900/30 bg-ink-900 p-10 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10">
            {expired ? (
              <Clock size={36} className="text-rose-400" />
            ) : (
              <XCircle size={36} className="text-rose-400" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-white">
            {expired ? 'QR ផុតកំណត់' : 'ការបង់ប្រាក់បរាជ័យ'}
          </h1>
          <p className="mt-3 text-slate-400">
            {expired
              ? 'QR នេះលែងមានសុពលភាព។ សូមបង្កើតការបញ្ជាទិញថ្មី។'
              : 'ការបង់ប្រាក់មិនបានបញ្ចប់។ គ្មានប្រាក់ត្រូវបានកាត់ទេ។'}
          </p>

          <Link
            to="/games"
            className="mt-8 inline-block rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-5 py-3 font-semibold text-white shadow-lg shadow-purple-600/30 transition hover:from-purple-500 hover:to-fuchsia-500"
          >
            ព្យាយាមម្តងទៀត
          </Link>
        </div>
      </div>
    );
  }

  // ---------- រង់ចាំ: បង្ហាញ QR ----------
  return (
    <div className="mx-auto max-w-md px-4 py-10">

      <Link
        to="/orders"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-white"
      >
        <ArrowLeft size={16} />
        ត្រឡប់ក្រោយ
      </Link>

      <div className="overflow-hidden rounded-2xl border border-purple-900/30 bg-ink-900 shadow-sm">

        <div className="border-b border-purple-900/30 px-6 py-5 text-center">
          <h1 className="text-lg font-bold text-white">ស្កេនដើម្បីបង់ប្រាក់</h1>
          <p className="mt-1 text-sm text-slate-400">
            ប្រើកម្មវិធីធនាគារណាមួយដែលគាំទ្រ KHQR
          </p>
        </div>

        {/* ---------- QR ---------- */}
        <div className="flex justify-center px-6 py-8">
          {isMock ? (
            <div className="rounded-2xl border-2 border-dashed border-amber-400/40 bg-amber-500/10 p-6 text-center">
              <AlertCircle size={28} className="mx-auto mb-3 text-amber-400" />
              <p className="font-semibold text-amber-300">របៀបសាកល្បង (Mock)</p>
              <p className="mt-2 max-w-[220px] text-xs text-amber-400/80">
                QR នេះជាការក្លែងក្លាយ ហើយ scan មិនបានទេ។
                ការបង់ប្រាក់នឹងបញ្ចប់ដោយស្វ័យប្រវត្តិក្នុងរយៈពេលប៉ុន្មានវិនាទី។
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-purple-900/30 bg-white p-5 shadow-sm">
              {payment?.qrString ? (
                /* level="M" ផ្តល់ការកែកំហុសល្មម - QR នៅតែស្កេនបាន
                   ទោះមានស្នាមប្រឡាក់តូចលើអេក្រង់។ */
                <QRCodeSVG
                  value={payment.qrString}
                  size={220}
                  level="M"
                  marginSize={0}
                />
              ) : (
                <div className="flex h-[220px] w-[220px] items-center justify-center">
                  <Loader2 size={32} className="animate-spin text-slate-300" />
                </div>
              )}
            </div>
          )}
        </div>

        {!isMock && secondsLeft != null && (
          <p
            className={`-mt-4 pb-6 text-center text-xs font-medium ${
              secondsLeft <= 60 ? 'text-rose-400' : 'text-slate-500'
            }`}
          >
            QR ផុតកំណត់ក្នុង {formatCountdown(secondsLeft)}
          </p>
        )}

        {/* ---------- ចំនួនទឹកប្រាក់ ---------- */}
        <div className="border-y border-purple-900/30 bg-ink-950 px-6 py-5 text-center">
          <p className="text-sm text-slate-400">ចំនួនទឹកប្រាក់</p>
          <p className="mt-1 text-3xl font-bold text-white">
            {formatCurrency(payment?.amount, payment?.currency)}
          </p>
        </div>

        {/* ---------- ស្ថានភាព ---------- */}
        <div className="px-6 py-5">
          {regenerating ? (
            <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
              <Loader2 size={16} className="animate-spin text-purple-400" />
              កំពុងបង្កើត QR ថ្មី...
            </div>
          ) : timedOut ? (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-center">
              <Clock size={20} className="mx-auto mb-2 text-amber-400" />
              <p className="text-sm font-medium text-amber-300">
                ឈប់ពិនិត្យស្វ័យប្រវត្តិ
              </p>
              <p className="mt-1 text-xs text-amber-400/80">
                បើអ្នកបានបង់ប្រាក់រួច សូមចុចពិនិត្យម្តងទៀត
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-purple-900/40 bg-ink-900 px-4 py-2 text-sm font-medium text-slate-300 shadow-sm transition hover:border-purple-500/40 hover:text-white"
              >
                <RefreshCw size={14} />
                ពិនិត្យម្តងទៀត
              </button>
            </div>
          ) : pollError ? (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-center">
              <p className="text-sm text-rose-300">{pollError}</p>
              <p className="mt-1 text-xs text-rose-400/80">
                បើអ្នកបានបង់ប្រាក់រួច សូមចុចពិនិត្យម្តងទៀត
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-purple-900/40 bg-ink-900 px-4 py-2 text-sm font-medium text-slate-300 shadow-sm transition hover:border-purple-500/40 hover:text-white"
              >
                <RefreshCw size={14} />
                ពិនិត្យម្តងទៀត
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
              <Loader2 size={16} className="animate-spin text-purple-400" />
              កំពុងរង់ចាំការបង់ប្រាក់...
            </div>
          )}
        </div>

        {/* ---------- Deeplink ទូរស័ព្ទ ---------- */}
        {payment?.deeplinkUrl && (
          <div className="border-t border-purple-900/30 px-6 py-5">
            <a
              href={payment.deeplinkUrl}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-5 py-3 font-semibold text-white shadow-lg shadow-purple-600/30 transition hover:from-purple-500 hover:to-fuchsia-500"
            >
              <Smartphone size={18} />
              បើកកម្មវិធី Bakong
            </a>
            <p className="mt-2 text-center text-xs text-slate-500">
              សម្រាប់ទូរស័ព្ទតែប៉ុណ្ណោះ
            </p>
          </div>
        )}

        {/* ---------- លេខយោង ---------- */}
        <div className="border-t border-purple-900/30 bg-ink-950 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs text-slate-500">លេខយោង</p>
              <p className="truncate font-mono text-sm text-slate-300">
                {payment?.paymentReference}
              </p>
            </div>
            <button
              onClick={copyReference}
              className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-purple-950/40 hover:text-white"
              title="ចម្លង"
            >
              {copied ? (
                <Check size={16} className="text-emerald-400" />
              ) : (
                <Copy size={16} />
              )}
            </button>
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-slate-500">
        QR ផុតកំណត់ក្នុងរយៈពេលដែលកំណត់។ សូមកុំបិទទំព័រនេះ
        រហូតដល់ការបង់ប្រាក់បញ្ចប់។
      </p>
    </div>
  );
}
