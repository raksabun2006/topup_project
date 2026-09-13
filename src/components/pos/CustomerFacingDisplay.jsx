import { useState, useEffect, useMemo } from 'react';
import {
  Store,
  QrCode,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  Coins,
  Clock,
  User,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { formatCurrency, formatKhr, KHR_RATE } from '../../utils/format';

export const POS_SYNC_CHANNEL = 'mart_pos_sync_channel';
export const POS_SYNC_STORAGE_KEY = 'mart_pos_sync_state';

/** Helper to broadcast POS cashier state to any active customer displays */
export function broadcastPosState(state) {
  try {
    const payload = {
      ...state,
      timestamp: Date.now(),
    };
    // 1. BroadcastChannel (fast, same origin)
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel(POS_SYNC_CHANNEL);
      bc.postMessage(payload);
      bc.close();
    }
    // 2. localStorage fallback for cross-window / tab sync
    localStorage.setItem(POS_SYNC_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

export default function CustomerFacingDisplay({
  initialState = null,
  isEmbeddedPreview = false,
  onClosePreview,
}) {
  const [syncedState, setSyncedState] = useState(() => {
    if (initialState) return initialState;
    try {
      const raw = localStorage.getItem(POS_SYNC_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return null;
  });

  const [time, setTime] = useState(new Date());

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Listen for broadcasts from POS cashier window
  useEffect(() => {
    if (initialState) {
      setSyncedState(initialState);
      return;
    }

    let bc;
    if (typeof BroadcastChannel !== 'undefined') {
      bc = new BroadcastChannel(POS_SYNC_CHANNEL);
      bc.onmessage = (event) => {
        if (event?.data) {
          setSyncedState(event.data);
        }
      };
    }

    const handleStorage = (e) => {
      if (e.key === POS_SYNC_STORAGE_KEY && e.newValue) {
        try {
          setSyncedState(JSON.parse(e.newValue));
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, [initialState]);

  // Extract display variables
  const items = syncedState?.items || [];
  const customer = syncedState?.customer || null;
  const subtotal = Number(syncedState?.subtotal) || 0;
  const discountAmount = Number(syncedState?.discountAmount) || 0;
  const taxAmount = Number(syncedState?.taxAmount) || 0;
  const total = Number(syncedState?.total) || 0;
  const status = syncedState?.status || 'IDLE'; // 'IDLE', 'CART', 'CHECKOUT', 'COMPLETED'
  const qrData = syncedState?.qrData || null;
  const completedSale = syncedState?.completedSale || null;
  const cashTendered = Number(syncedState?.cashTendered) || 0;
  const changeDue = Number(syncedState?.changeDue) || 0;

  const totalItemCount = useMemo(
    () => items.reduce((acc, item) => acc + (Number(item?.quantity) || 1), 0),
    [items]
  );

  const timeFormatted = time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <div
      className={`flex flex-col bg-slate-950 text-white select-none ${
        isEmbeddedPreview ? 'h-full w-full' : 'h-screen w-screen'
      } overflow-hidden font-sans`}
    >
      {/* Top Customer Display Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800/90 bg-slate-900/90 px-6 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/20">
            <Store size={22} />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
              <span>Mart System</span>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                Customer Display
              </span>
            </h1>
            <p className="text-xs text-slate-400">សូមស្វាគមន៍ / Welcome to our store</p>
          </div>
        </div>

        {/* Center: Live Rate & Time */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/50 px-3 py-1 text-xs font-mono font-bold text-emerald-300">
            <Coins size={14} className="text-emerald-400" />
            <span>$1 = {KHR_RATE.toLocaleString()} ៛</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-800/60 px-3 py-1 text-xs font-mono text-slate-300">
            <Clock size={13} className="text-slate-400" />
            <span>{timeFormatted}</span>
          </div>

          {isEmbeddedPreview && onClosePreview && (
            <button
              type="button"
              onClick={onClosePreview}
              className="ml-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300 hover:bg-slate-700 cursor-pointer"
            >
              បិទផ្ទាំង
            </button>
          )}
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* State 1: COMPLETED (Success & Change Due) */}
        {status === 'COMPLETED' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-scale-in">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-500/20 border-2 border-emerald-500/60 text-emerald-400 shadow-2xl shadow-emerald-500/30 mb-6">
              <CheckCircle2 size={56} className="animate-bounce" />
            </div>

            <h2 className="text-3xl font-black text-white tracking-tight">
              ការទូទាត់ជោគជ័យ!
            </h2>
            <p className="text-base text-slate-400 mt-1">
              Payment Successful! Thank you for shopping with us!
            </p>

            {completedSale?.billNumber && (
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-slate-900 border border-slate-800 px-4 py-1 text-xs font-mono text-emerald-400">
                វិក្កយបត្រ #{completedSale.billNumber}
              </span>
            )}

            {/* Change Due Callout */}
            {changeDue > 0 && (
              <div className="mt-8 max-w-md w-full rounded-3xl border border-emerald-500/40 bg-emerald-950/40 p-6 shadow-xl">
                <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  ប្រាក់អាប់ជូនអតិថិជន (Change Due)
                </p>
                <div className="mt-2 flex items-baseline justify-center gap-3">
                  <span className="text-4xl font-black text-white tracking-tight">
                    {formatCurrency(changeDue)}
                  </span>
                  <span className="text-2xl font-extrabold text-emerald-400">
                    ({formatKhr(changeDue)})
                  </span>
                </div>
                {cashTendered > 0 && (
                  <p className="mt-2 text-xs text-slate-400">
                    បានទទួល: {formatCurrency(cashTendered)} ({formatKhr(cashTendered)})
                  </p>
                )}
              </div>
            )}

            <div className="mt-8 flex items-center gap-2 text-xs text-slate-500">
              <Sparkles size={14} className="text-amber-400" />
              <span>សូមពិនិត្យវិក្កយបត្រ និងទំនិញរបស់លោកអ្នក</span>
            </div>
          </div>
        )}

        {/* State 2: CHECKOUT with BAKONG KHQR */}
        {status === 'CHECKOUT' && qrData && (
          <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-10 items-center max-w-6xl mx-auto w-full animate-fade-in">
            {/* Left: Summary & Instructions */}
            <div className="space-y-6">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-bold text-emerald-400">
                  <QrCode size={14} />
                  <span>Bakong KHQR Payment</span>
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-3">
                  ស្កេនទូទាត់ប្រាក់
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Scan QR with any Cambodian Mobile Banking App
                </p>
              </div>

              {/* Total Card */}
              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>ចំនួនទំនិញ (Total Items)</span>
                  <span className="font-bold text-white">{totalItemCount} មុខ</span>
                </div>
                <div className="h-px bg-slate-800" />
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    ទឹកប្រាក់ត្រូវទូទាត់ (Amount to Pay)
                  </span>
                  <div className="mt-1 flex flex-col">
                    <span className="text-4xl sm:text-5xl font-black text-emerald-400 tracking-tight">
                      {formatCurrency(total)}
                    </span>
                    <span className="text-2xl sm:text-3xl font-bold text-slate-300 mt-0.5">
                      {formatKhr(total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Supported Banks */}
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4">
                <p className="text-xs font-bold text-slate-400 mb-2">
                  គាំទ្រគ្រប់កម្មវិធីធនាគារក្នុងប្រទេសកម្ពុជា៖
                </p>
                <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-300">
                  <span className="rounded-lg bg-slate-800 px-2.5 py-1">ABA Bank</span>
                  <span className="rounded-lg bg-slate-800 px-2.5 py-1">ACLEDA</span>
                  <span className="rounded-lg bg-slate-800 px-2.5 py-1">Wing</span>
                  <span className="rounded-lg bg-slate-800 px-2.5 py-1">Canadia</span>
                  <span className="rounded-lg bg-slate-800 px-2.5 py-1">Bakong</span>
                  <span className="rounded-lg bg-slate-800 px-2.5 py-1">+ 50 ធនាគារផ្សេងទៀត</span>
                </div>
              </div>
            </div>

            {/* Right: Bakong KHQR Frame */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative rounded-3xl border-4 border-emerald-500/80 bg-white p-6 shadow-2xl shadow-emerald-500/20 text-center max-w-sm w-full">
                {/* Red KHQR Header Bar */}
                <div className="mb-4 rounded-xl bg-rose-600 py-1.5 px-4 text-white">
                  <span className="text-xs font-black tracking-widest uppercase">
                    BAKONG KHQR
                  </span>
                </div>

                {/* QR Display */}
                <div className="mx-auto flex aspect-square w-64 items-center justify-center overflow-hidden rounded-2xl bg-white p-2">
                  {qrData.startsWith('http') || qrData.startsWith('data:image') ? (
                    <img
                      src={qrData}
                      alt="Bakong KHQR"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(
                        qrData
                      )}`}
                      alt="Bakong KHQR"
                      className="h-full w-full object-contain"
                    />
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-slate-900">
                  <span className="text-xs font-bold">ទឹកប្រាក់សរុប</span>
                  <span className="text-base font-black text-emerald-600">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
              <p className="mt-4 text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>ការទូទាត់មានសុវត្ថិភាពខ្ពស់ និងទទួលប្រាក់ភ្លាមៗ</span>
              </p>
            </div>
          </div>
        )}

        {/* State 3: ACTIVE CART (Items scanning live) */}
        {status !== 'COMPLETED' && (!qrData || status !== 'CHECKOUT') && items.length > 0 && (
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] gap-6 p-6 overflow-hidden">
            {/* Left: Live Scanned Items List */}
            <div className="flex flex-col min-h-0 rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3.5 bg-slate-900/90">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={18} className="text-emerald-400" />
                  <span className="text-sm font-extrabold text-white">
                    បញ្ជីទំនិញដែលបានស្កេន (Scanned Items)
                  </span>
                </div>
                <span className="rounded-full bg-slate-800 px-3 py-0.5 text-xs font-bold text-emerald-400">
                  {totalItemCount} មុខ
                </span>
              </div>

              {/* Items scroll area */}
              <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-800/80 p-3 space-y-1">
                {items.map((item, index) => {
                  const unitPrice = Number(item.product?.price) || 0;
                  const qty = Number(item.quantity) || 1;
                  const lineTotal = unitPrice * qty;

                  return (
                    <div
                      key={item.product?.id || index}
                      className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-slate-900/40 hover:bg-slate-800/50 transition animate-fade-in"
                    >
                      {/* Product image & details */}
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-1">
                          {item.product?.imageUrl ? (
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="h-full w-full object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <Package size={22} className="text-slate-500" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-base font-bold text-white">
                            {item.product?.name}
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {formatCurrency(unitPrice)} ({formatKhr(unitPrice)}) ×{' '}
                            <span className="font-extrabold text-emerald-400 text-sm">
                              {qty}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Line Total */}
                      <div className="text-right shrink-0">
                        <span className="block text-lg font-black text-emerald-400">
                          {formatCurrency(lineTotal)}
                        </span>
                        <span className="block text-xs font-semibold text-slate-400">
                          {formatKhr(lineTotal)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Realtime Order Summary & Big Grand Total */}
            <div className="flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    សង្ខេបវិក្កយបត្រ (Summary)
                  </span>
                  {customer?.name && (
                    <div className="flex items-center gap-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-0.5 text-xs font-bold text-emerald-300">
                      <User size={12} />
                      <span className="max-w-[120px] truncate">{customer.name}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-400">
                    <span>សរុបរង (Subtotal)</span>
                    <span className="font-bold text-white">{formatCurrency(subtotal)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>បញ្ចុះតម្លៃ (Discount)</span>
                      <span className="font-bold">-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}

                  {taxAmount > 0 && (
                    <div className="flex justify-between text-slate-400">
                      <span>ពន្ធ (Tax)</span>
                      <span className="font-bold text-white">{formatCurrency(taxAmount)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Big Grand Total Box */}
              <div className="mt-6 rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-b from-emerald-950/30 to-slate-900/80 p-5 text-center">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                  សរុបត្រូវបង់ (GRAND TOTAL)
                </span>
                <div className="mt-2">
                  <span className="block text-4xl sm:text-5xl font-black text-white tracking-tight">
                    {formatCurrency(total)}
                  </span>
                  <span className="mt-1 block text-2xl sm:text-3xl font-extrabold text-emerald-400">
                    {formatKhr(total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* State 4: IDLE / WELCOME (Empty cart) */}
        {status !== 'COMPLETED' && items.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
            <div className="relative mb-6">
              <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-2xl shadow-emerald-500/30">
                <Store size={60} />
              </div>
              <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 shadow-md">
                <Sparkles size={20} />
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              សូមស្វាគមន៍មកកាន់ Mart System
            </h2>
            <p className="text-base text-slate-400 mt-2 max-w-md">
              ទំនិញស្រស់ៗ តម្លៃសមរម្យ និងទូទាត់ប្រាក់រហ័សទាន់ចិត្តជាមួយ Bakong KHQR
            </p>

            {/* In-Store Badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 max-w-lg">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-2 text-xs font-bold text-slate-300">
                <Coins size={16} className="text-amber-400" />
                <span>$1 = {KHR_RATE.toLocaleString()} ៛ (អត្រាថេរ)</span>
              </div>

              <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-2 text-xs font-bold text-slate-300">
                <QrCode size={16} className="text-emerald-400" />
                <span>ស្កេន Bakong KHQR បានគ្រប់ធនាគារ</span>
              </div>

              <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-2 text-xs font-bold text-slate-300">
                <ShieldCheck size={16} className="text-blue-400" />
                <span>ទំនិញសុទ្ធ ១០០%</span>
              </div>
            </div>

            <div className="mt-10 rounded-full border border-slate-800 bg-slate-900/40 px-5 py-2 text-xs text-slate-500 animate-pulse">
              សូមរង់ចាំបុគ្គលិកគិតលុយស្កេនទំនិញ...
            </div>
          </div>
        )}
      </div>

      {/* Footer / Store info */}
      <footer className="h-10 shrink-0 border-t border-slate-800/80 bg-slate-900/60 px-6 flex items-center justify-between text-[11px] text-slate-500">
        <span>Mart System · In-Store POS & Customer Display</span>
        <span>Pay via Bakong KHQR · Cash in USD & KHR</span>
      </footer>
    </div>
  );
}
