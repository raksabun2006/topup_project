import { useState, useEffect, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
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
  Smartphone,
  Check,
} from 'lucide-react';
import { formatCurrency, formatKhr, KHR_RATE } from '../../utils/format';

export const POS_SYNC_CHANNEL = 'mart_pos_sync_channel';
export const POS_SYNC_STORAGE_KEY = 'mart_pos_sync_state';

/** Helper to broadcast POS cashier state to any active customer displays */
export function broadcastPosState(state) {
  try {
    let existing = {};
    try {
      const raw = localStorage.getItem(POS_SYNC_STORAGE_KEY);
      if (raw) existing = JSON.parse(raw);
    } catch {
      // ignore
    }

    const payload = {
      ...existing,
      ...state,
      timestamp: Date.now(),
    };

    // 1. BroadcastChannel (instant in same browser context)
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel(POS_SYNC_CHANNEL);
      bc.postMessage(payload);
      bc.close();
    }
    // 2. localStorage fallback (cross-window/tab sync)
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

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Listen for live broadcasts from POS cashier window
  useEffect(() => {
    if (initialState) {
      setSyncedState((prev) => ({ ...prev, ...initialState }));
      return;
    }

    let bc;
    if (typeof BroadcastChannel !== 'undefined') {
      bc = new BroadcastChannel(POS_SYNC_CHANNEL);
      bc.onmessage = (event) => {
        if (event?.data) {
          setSyncedState((prev) => ({ ...prev, ...event.data }));
        }
      };
    }

    const handleStorage = (e) => {
      if (e.key === POS_SYNC_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setSyncedState((prev) => ({ ...prev, ...parsed }));
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
  const billNumber = syncedState?.billNumber || syncedState?.completedSale?.billNumber || 'INV';
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

  const dateFormatted = time.toLocaleDateString('km-KH', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const isCheckoutQr = Boolean(qrData && (status === 'CHECKOUT' || status === 'PENDING'));

  return (
    <div
      className={`flex flex-col bg-[#F8FAFC] text-slate-900 select-none ${
        isEmbeddedPreview ? 'h-full w-full' : 'h-screen w-screen'
      } overflow-hidden font-sans`}
    >
      {/* Top Customer Display Header - Crisp White */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/90 bg-white px-6 shadow-xs z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-600/20">
            <Store size={22} />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <span>Mart System</span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-[#009F6B] border border-emerald-200">
                Customer Screen
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              សូមស្វាគមន៍ / Welcome to our store
            </p>
          </div>
        </div>

        {/* Center/Right: Live Rate & Time Pills */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-mono font-bold text-emerald-800 shadow-2xs">
            <Coins size={14} className="text-[#009F6B]" />
            <span>$1 = {KHR_RATE.toLocaleString()} ៛</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-mono font-bold text-slate-700 shadow-2xs">
            <Clock size={13} className="text-slate-400" />
            <span>{timeFormatted}</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500 text-[11px] font-medium">{dateFormatted}</span>
          </div>

          {isEmbeddedPreview && onClosePreview && (
            <button
              type="button"
              onClick={onClosePreview}
              className="ml-2 rounded-xl border border-slate-300 bg-white px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer"
            >
              បិទផ្ទាំង
            </button>
          )}
        </div>
      </header>

      {/* Main Body Canvas */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden p-4 sm:p-6 lg:p-8">
        {/* ============================================================
            STATE 1: COMPLETED SALE (Success banner & Change Due)
        ============================================================ */}
        {status === 'COMPLETED' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-scale-in">
            <div className="flex h-22 w-22 items-center justify-center rounded-3xl bg-emerald-100 border-2 border-emerald-500 text-[#009F6B] shadow-xl shadow-emerald-500/20 mb-5">
              <CheckCircle2 size={54} className="animate-bounce" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              ការទូទាត់ជោគជ័យ!
            </h2>
            <p className="text-base text-slate-600 mt-1 font-medium">
              Payment Completed! Thank you for shopping with us!
            </p>

            {billNumber && (
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-4 py-1 text-xs font-mono font-bold text-slate-800">
                វិក្កយបត្រ #{billNumber}
              </span>
            )}

            {/* Change Due Callout Card */}
            {changeDue > 0 && (
              <div className="mt-6 max-w-md w-full rounded-3xl border-2 border-emerald-300 bg-emerald-50/80 p-6 shadow-lg">
                <p className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">
                  ប្រាក់អាប់ជូនអតិថិជន (Change Due)
                </p>
                <div className="mt-2 flex items-baseline justify-center gap-3">
                  <span className="text-4xl font-black text-slate-900 tracking-tight">
                    {formatCurrency(changeDue)}
                  </span>
                  <span className="text-2xl font-extrabold text-[#009F6B]">
                    ({formatKhr(changeDue)})
                  </span>
                </div>
                {cashTendered > 0 && (
                  <p className="mt-2 text-xs text-slate-500 font-semibold">
                    បានទទួល: {formatCurrency(cashTendered)} ({formatKhr(cashTendered)})
                  </p>
                )}
              </div>
            )}

            <div className="mt-8 flex items-center gap-2 text-xs text-slate-500 font-semibold">
              <Sparkles size={15} className="text-amber-500" />
              <span>សូមពិនិត្យវិក្កយបត្រ និងទំនិញរបស់លោកអ្នក</span>
            </div>
          </div>
        )}

        {/* ============================================================
            STATE 2: CHECKOUT WITH BAKONG KHQR (Scan to Pay Mode)
        ============================================================ */}
        {status !== 'COMPLETED' && isCheckoutQr && (
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center max-w-5xl mx-auto w-full animate-fade-in">
            {/* Left: Summary & Instructions */}
            <div className="space-y-5">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-300 px-3.5 py-1 text-xs font-black text-emerald-800 shadow-2xs">
                  <QrCode size={14} className="text-[#009F6B]" />
                  <span>Bakong KHQR Payment</span>
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2.5">
                  ស្កេនដើម្បីបង់ប្រាក់
                </h2>
                <p className="text-sm text-slate-600 mt-1 font-medium">
                  Scan QR with any Cambodian Banking App (ABA, ACLEDA, Wing, etc.)
                </p>
              </div>

              {/* Total Card - High Contrast White */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                  <span>ចំនួនទំនិញសរុប (Total Items)</span>
                  <span className="font-extrabold text-slate-900 text-sm">
                    {totalItemCount > 0 ? `${totalItemCount} មុខ` : `${items.length || 1} មុខ`}
                  </span>
                </div>
                {billNumber && (
                  <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                    <span>លេខវិក្កយបត្រ (Invoice No.)</span>
                    <span className="font-mono font-bold text-slate-800">{billNumber}</span>
                  </div>
                )}
                <div className="h-px bg-slate-100" />
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                    ទឹកប្រាក់ត្រូវទូទាត់ (Amount to Pay)
                  </span>
                  <div className="mt-1 flex flex-col">
                    <span className="text-4xl sm:text-5xl font-black text-[#009F6B] tracking-tight">
                      {formatCurrency(total)}
                    </span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-700 mt-0.5">
                      {formatKhr(total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Supported Banks Cards */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
                <p className="text-xs font-extrabold text-slate-700 mb-2.5 flex items-center gap-1.5">
                  <Smartphone size={14} className="text-[#009F6B]" />
                  <span>គាំទ្រគ្រប់កម្មវិធីធនាគារក្នុងប្រទេសកម្ពុជា៖</span>
                </p>
                <div className="flex flex-wrap gap-2 text-xs font-bold">
                  <span className="rounded-xl bg-slate-100 text-slate-800 px-3 py-1 border border-slate-200">
                    ABA Bank
                  </span>
                  <span className="rounded-xl bg-slate-100 text-slate-800 px-3 py-1 border border-slate-200">
                    ACLEDA
                  </span>
                  <span className="rounded-xl bg-slate-100 text-slate-800 px-3 py-1 border border-slate-200">
                    Wing Bank
                  </span>
                  <span className="rounded-xl bg-slate-100 text-slate-800 px-3 py-1 border border-slate-200">
                    Canadia
                  </span>
                  <span className="rounded-xl bg-slate-100 text-slate-800 px-3 py-1 border border-slate-200">
                    Bakong App
                  </span>
                  <span className="rounded-xl bg-emerald-50 text-[#009F6B] px-3 py-1 border border-emerald-200 font-extrabold">
                    + 50 ធនាគារផ្សេងទៀត
                  </span>
                </div>
              </div>
            </div>

            {/* Right: The Official KHQR Red Ticket */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[320px] overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200 animate-scale-in">
                {/* KHQR Header Banner */}
                <div
                  className="bg-[#E61924] px-5 py-3 text-right text-white font-bold tracking-wider"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 93% 100%, 0 100%)' }}
                >
                  <span className="text-xl sm:text-2xl font-black italic tracking-tight">
                    KHQR
                  </span>
                </div>

                {/* Merchant & Amount Details */}
                <div className="px-5 pt-3 pb-2 text-left">
                  <p className="truncate text-xs font-black uppercase tracking-wider text-slate-500">
                    MART SYSTEM
                  </p>
                  <p className="mt-0.5 text-2xl sm:text-3xl font-black text-slate-900">
                    {formatCurrency(total)}
                  </p>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">
                    {formatKhr(total)}
                  </p>
                </div>

                {/* Dashed Separator */}
                <div className="mx-5 border-t-2 border-dashed border-slate-200 my-1" />

                {/* Real High-Resolution KHQR QR Code */}
                <div className="flex items-center justify-center p-5 bg-white">
                  <QRCodeSVG
                    value={qrData}
                    size={220}
                    level="M"
                    marginSize={0}
                    className="max-w-full h-auto rounded-lg"
                  />
                </div>

                {/* Acceptance Networks Footer */}
                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-2.5 text-[10px] text-slate-500">
                  <div className="flex flex-col text-left">
                    <span className="text-[8px] uppercase tracking-wider text-slate-400">
                      Member of
                    </span>
                    <span className="font-extrabold italic text-slate-700">KHQR</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded bg-[#00427A] px-2 py-0.5 text-[8px] font-bold text-white">
                      UnionPay
                    </span>
                    <span className="rounded bg-[#E60012] px-2 py-0.5 text-[8px] font-bold text-white">
                      云闪付
                    </span>
                    <span className="rounded bg-[#1677FF] px-2 py-0.5 text-[8px] font-bold text-white">
                      Alipay+
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-4 py-1.5 rounded-full">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span>សូមបើកកម្មវិធីធនាគាររបស់លោកអ្នកដើម្បីស្កេនទូទាត់</span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            STATE 3: ACTIVE CART (Cashier scanning items)
        ============================================================ */}
        {status !== 'COMPLETED' && !isCheckoutQr && items.length > 0 && (
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] gap-6 overflow-hidden">
            {/* Left: Scanned Items List - Crisp White Card */}
            <div className="flex flex-col min-h-0 rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/70">
                <div className="flex items-center gap-2.5">
                  <ShoppingBag size={18} className="text-[#009F6B]" />
                  <span className="text-sm font-extrabold text-slate-900">
                    បញ្ជីទំនិញដែលបានស្កេន (Scanned Items)
                  </span>
                </div>
                <span className="rounded-full bg-emerald-50 text-[#009F6B] border border-emerald-200 px-3 py-0.5 text-xs font-extrabold">
                  {totalItemCount} មុខ
                </span>
              </div>

              {/* Items scroll area */}
              <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100 p-3 space-y-1">
                {items.map((item, index) => {
                  const unitPrice = Number(item.product?.price) || 0;
                  const qty = Number(item.quantity) || 1;
                  const lineTotal = unitPrice * qty;

                  return (
                    <div
                      key={item.product?.id || index}
                      className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-white hover:bg-slate-50/80 transition animate-fade-in"
                    >
                      {/* Product image & details */}
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-1">
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
                            <Package size={22} className="text-slate-400" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-base font-extrabold text-slate-900 leading-tight">
                            {item.product?.name}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-1">
                            <span>{formatCurrency(unitPrice)}</span>
                            <span>({formatKhr(unitPrice)})</span>
                            <span>×</span>
                            <span className="rounded-full bg-emerald-100 text-emerald-800 font-black px-2 py-0.2 text-xs">
                              {qty}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Line Total */}
                      <div className="text-right shrink-0">
                        <span className="block text-lg font-black text-[#009F6B]">
                          {formatCurrency(lineTotal)}
                        </span>
                        <span className="block text-xs font-bold text-slate-500">
                          {formatKhr(lineTotal)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Realtime Summary & Big Grand Total */}
            <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                    សង្ខេបវិក្កយបត្រ (SUMMARY)
                  </span>
                  {customer?.name && (
                    <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
                      <User size={13} className="text-[#009F6B]" />
                      <span className="max-w-[130px] truncate">{customer.name}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-slate-600 font-semibold">
                    <span>សរុបរង (Subtotal)</span>
                    <span className="font-extrabold text-slate-900">{formatCurrency(subtotal)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-[#009F6B] font-semibold">
                      <span>បញ្ចុះតម្លៃ (Discount)</span>
                      <span className="font-extrabold">-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}

                  {taxAmount > 0 && (
                    <div className="flex justify-between text-slate-600 font-semibold">
                      <span>ពន្ធ (Tax)</span>
                      <span className="font-extrabold text-slate-900">{formatCurrency(taxAmount)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Big Grand Total Container - Crisp Emerald on Light */}
              <div className="mt-6 rounded-3xl border-2 border-emerald-400 bg-gradient-to-b from-emerald-50/90 to-emerald-100/50 p-6 text-center shadow-xs">
                <span className="text-xs font-black uppercase tracking-widest text-emerald-800">
                  សរុបត្រូវបង់ (GRAND TOTAL)
                </span>
                <div className="mt-2">
                  <span className="block text-4xl sm:text-5xl font-black text-slate-950 tracking-tight">
                    {formatCurrency(total)}
                  </span>
                  <span className="mt-1 block text-2xl sm:text-3xl font-black text-[#009F6B]">
                    {formatKhr(total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            STATE 4: IDLE / WELCOME (Empty cart on white canvas)
        ============================================================ */}
        {status !== 'COMPLETED' && !isCheckoutQr && items.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
            <div className="relative mb-6">
              <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-xl shadow-emerald-500/20">
                <Store size={60} />
              </div>
              <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 shadow-md">
                <Sparkles size={20} />
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              សូមស្វាគមន៍មកកាន់ Mart System
            </h2>
            <p className="text-base text-slate-600 mt-2 max-w-md font-medium">
              ទំនិញស្រស់ៗ តម្លៃសមរម្យ និងទូទាត់ប្រាក់រហ័សទាន់ចិត្តជាមួយ Bakong KHQR
            </p>

            {/* In-Store Badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 max-w-lg">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs">
                <Coins size={16} className="text-amber-500" />
                <span>$1 = {KHR_RATE.toLocaleString()} ៛ (អត្រាថេរ)</span>
              </div>

              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs">
                <QrCode size={16} className="text-[#009F6B]" />
                <span>ស្កេន Bakong KHQR បានគ្រប់ធនាគារ</span>
              </div>

              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs">
                <ShieldCheck size={16} className="text-blue-500" />
                <span>ទំនិញសុទ្ធ ១០០%</span>
              </div>
            </div>

            <div className="mt-10 rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2 text-xs font-bold text-emerald-800 animate-pulse shadow-2xs">
              សូមរង់ចាំបុគ្គលិកគិតលុយស្កេនទំនិញ...
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="h-10 shrink-0 border-t border-slate-200 bg-white px-6 flex items-center justify-between text-[11px] text-slate-500 font-medium">
        <span>Mart System · In-Store POS & Customer Display</span>
        <span>Pay via Bakong KHQR · Cash in USD & KHR</span>
      </footer>
    </div>
  );
}
