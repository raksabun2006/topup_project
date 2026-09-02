import { useState } from 'react';
import {
  ShoppingCart,
  ChevronDown,
  History,
  RotateCcw,
  X,
  Trash2,
  ArrowRight,
  PauseCircle,
  XCircle,
  Percent,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import CartItem from './CartItem';
import CustomerSelector from './CustomerSelector';
import { formatCurrency, formatCurrencyPrecise } from '../../utils/format';

function HeldOrders({ heldOrders, onResume, onDiscard }) {
  const [open, setOpen] = useState(false);
  if (!heldOrders || heldOrders.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full border border-amber-400/60 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-500/40 px-2.5 py-1 text-xs font-bold text-amber-800 dark:text-amber-400 shadow-2xs hover:bg-amber-100/80 dark:hover:bg-amber-900/40 transition active:scale-95"
      >
        <History size={13} className="text-amber-600 dark:text-amber-400" />
        <span>រង់ចាំ ({heldOrders.length})</span>
        <ChevronDown size={12} className="text-amber-600 dark:text-amber-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/20 animate-scale-in">
            <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 px-3.5 py-2.5 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <History size={14} className="text-amber-600 dark:text-amber-400" />
                បញ្ជីការលក់កំពុងរង់ចាំ
              </span>
              <span className="rounded-full bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-400">
                {heldOrders.length}
              </span>
            </div>
            <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {heldOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between gap-2 px-3.5 py-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-200">
                      {order.customer?.name ?? 'អតិថិជនទូទៅ'}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <span>{order.items.length} មុខ</span>
                      <span>·</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(order.subtotal)}</span>
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => {
                        onResume(order.id);
                        setOpen(false);
                      }}
                      title="បន្តការលក់នេះ"
                      className="flex items-center gap-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 px-2 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 active:scale-95 transition"
                    >
                      <RotateCcw size={12} />
                      បន្ត
                    </button>
                    <button
                      onClick={() => onDiscard(order.id)}
                      title="លុបចោល"
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 active:scale-95 transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const DISCOUNT_PRESETS = [0, 5, 10, 15, 20];

export default function CartPanel({
  items = [],
  onSetQuantity,
  onRemove,
  onClear,
  subtotal = 0,
  selectedCustomer,
  onSelectCustomer,
  discountPct = '0',
  onDiscountPctChange,
  taxPct = '0',
  onTaxPctChange,
  discountAmount = 0,
  taxAmount = 0,
  total = 0,
  heldOrders = [],
  onResumeHeld,
  onDiscardHeld,
  onCheckout,
  onHold,
  onCancel,
}) {
  const { isAuthenticated } = useAuth();
  const [showCustomDiscount, setShowCustomDiscount] = useState(false);
  const totalItemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const handleClearCart = () => {
    if (items.length === 0) return;
    if (window.confirm('តើអ្នកពិតជាចង់សម្អាតទំនិញទាំងអស់ចេញពីរទេះមែនទេ?')) {
      if (onClear) onClear();
      else if (onCancel) onCancel();
    }
  };

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-all duration-200 lg:h-full lg:min-h-0">
      {/* Top Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-2xs">
            <ShoppingBag size={14} />
          </div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {isAuthenticated ? 'សរុបគិតលុយ (POS)' : 'រទេះទំនិញរបស់អ្នក'}
            </h2>
            {items.length > 0 && (
              <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                {totalItemCount}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {isAuthenticated && (
            <HeldOrders heldOrders={heldOrders} onResume={onResumeHeld} onDiscard={onDiscardHeld} />
          )}

          {items.length > 0 && (
            <button
              onClick={handleClearCart}
              title="សម្អាតរទេះ"
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 transition active:scale-95"
            >
              <Trash2 size={13} />
              <span>សម្អាត</span>
            </button>
          )}
        </div>
      </div>

      {/* Customer Selector (for Staff) */}
      {isAuthenticated && (
        <div className="shrink-0 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-2.5 sm:p-3">
          <CustomerSelector selectedCustomer={selectedCustomer} onSelect={onSelectCustomer} />
        </div>
      )}

      {/* Items Table Header */}
      {items.length > 0 && (
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
          <span className="flex-1">ទំនិញ</span>
          <span className="w-20 text-center">ចំនួន</span>
          <span className="w-16 text-right">តម្លៃ</span>
        </div>
      )}

      {/* Cart Items List or Welcoming Empty State (Dynamic Hug-Content Area) */}
      <div className={`${items.length === 0 ? 'py-10 lg:flex-1 lg:flex lg:flex-col lg:justify-center' : 'flex-1 min-h-0 overflow-y-auto px-4 py-1 divide-y divide-slate-100 dark:divide-slate-800'}`}>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <ShoppingCart size={28} />
            </div>

            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">រទេះទំនិញនៅទំនេរ</h3>
            <p className="mt-1 max-w-[220px] text-xs text-slate-400 leading-relaxed">
              សូមជ្រើសរើសទំនិញពីបញ្ជី ដើម្បីបន្ថែមទៅក្នុងរទេះ
            </p>

            {/* If there are held orders, show quick resume prompt */}
            {isAuthenticated && heldOrders && heldOrders.length > 0 && (
              <div className="mt-4 w-full max-w-[260px] rounded-xl border border-amber-300 dark:border-amber-500/40 bg-amber-50/80 dark:bg-amber-950/40 p-3 text-left">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-400">
                  <History size={14} />
                  <span>អ្នកមានការលក់កំពុងរង់ចាំ ({heldOrders.length})</span>
                </div>
                <button
                  type="button"
                  onClick={() => onResumeHeld && onResumeHeld(heldOrders[0].id)}
                  className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-amber-600 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-amber-500 transition active:scale-95"
                >
                  <RotateCcw size={12} />
                  បន្តការលក់ចុងក្រោយ
                </button>
              </div>
            )}
          </div>
        ) : (
          items.map((item) => (
            <CartItem
              key={item.product.id}
              item={item}
              onSetQuantity={onSetQuantity}
              onRemove={onRemove}
            />
          ))
        )}
      </div>

      {/* Cart Summary & Direct Sticky Action Area */}
      <div className="shrink-0 border-t border-slate-200/90 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900 p-3 sm:p-3.5 space-y-2.5">
        {isAuthenticated ? (
          /* Staff/Admin Pricing Controls & Quick Discounts */
          <div className="space-y-2">
            {/* Quick Discount Presets */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1 text-[11px] font-bold text-[#172033] dark:text-slate-200">
                  <Percent size={12} className="text-[#009F6B] dark:text-emerald-400" />
                  <span>បញ្ចុះតម្លៃ</span>
                  <kbd className="hidden sm:inline-block rounded bg-slate-200/70 dark:bg-slate-800 px-1 text-[9px] font-bold text-slate-500">
                    F8
                  </kbd>
                </span>
                <button
                  type="button"
                  onClick={() => setShowCustomDiscount(!showCustomDiscount)}
                  className="text-[10px] font-bold text-[#009F6B] dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  {showCustomDiscount ? 'ជម្រើសលឿន' : 'ភាគរយផ្ទាល់ %'}
                </button>
              </div>

              {showCustomDiscount ? (
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      id="pos-discount-input"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="0"
                      value={discountPct}
                      onChange={(e) => onDiscountPctChange(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-right text-xs sm:text-sm font-bold text-[#172033] dark:text-white focus:border-[#009F6B] focus:outline-none focus:ring-1 focus:ring-[#009F6B]"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      %
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDiscountPctChange('0')}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs text-[#667085] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    កំណត់ឡើងវិញ
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-5 gap-1.5">
                  {DISCOUNT_PRESETS.map((preset) => {
                    const active = Number(discountPct) === preset;
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => onDiscountPctChange(String(preset))}
                        className={`rounded-lg py-1 text-xs font-bold transition active:scale-95 cursor-pointer ${
                          active
                            ? 'bg-[#009F6B] text-white shadow-2xs'
                            : 'border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#172033] dark:text-slate-300 hover:bg-slate-100/90 dark:hover:bg-slate-700'
                        }`}
                      >
                        {preset}%
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Calculations Breakdown (Receipt Summary) */}
            <div className="space-y-1.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-3 text-xs">
              <div className="flex items-center justify-between text-[#667085] dark:text-slate-400">
                <span>សរុបរង</span>
                <span className="font-semibold text-[#172033] dark:text-slate-200">{formatCurrency(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-[#009F6B] dark:text-emerald-400 font-medium">
                  <span>បញ្ចុះតម្លៃ ({discountPct}%)</span>
                  <span>-{formatCurrencyPrecise(discountAmount)}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-[#667085] dark:text-slate-400">
                <span className="flex items-center gap-1">
                  ពន្ធ (Tax)
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={taxPct}
                    onChange={(e) => onTaxPctChange(e.target.value)}
                    className="w-10 rounded border-b border-dashed border-slate-300 dark:border-slate-600 bg-transparent text-center text-xs font-semibold text-[#009F6B] dark:text-emerald-400 focus:border-[#009F6B] focus:outline-none"
                  />
                  %
                </span>
                <span className="font-semibold text-[#172033] dark:text-slate-200">{formatCurrencyPrecise(taxAmount)}</span>
              </div>

              {/* Grand Total Row */}
              <div className="flex items-baseline justify-between border-t border-dashed border-slate-200 dark:border-slate-700 pt-2 text-sm font-bold text-[#172033] dark:text-white">
                <span className="text-sm font-bold">សរុបត្រូវបង់</span>
                <span className="text-xl sm:text-2xl font-black text-[#009F6B] dark:text-emerald-400 tracking-tight">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            {/* Quick Hold & Cancel Actions for Staff */}
            {(onHold || onCancel) && items.length > 0 && (
              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                {onHold && (
                  <button
                    type="button"
                    onClick={onHold}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100/90 dark:hover:bg-slate-700 active:scale-95 transition cursor-pointer"
                  >
                    <PauseCircle size={13} className="text-amber-600 dark:text-amber-400" />
                    <span>រង់ចាំ (Hold)</span>
                  </button>
                )}
                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 active:scale-95 transition cursor-pointer"
                  >
                    <XCircle size={13} />
                    <span>បោះបង់</span>
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Customer / Guest Checkout Summary */
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800 p-3 shadow-2xs">
              <div>
                <span className="text-xs font-bold text-[#172033] dark:text-slate-200">សរុបត្រូវបង់</span>
                <p className="text-[10px] text-[#667085] dark:text-slate-400">({totalItemCount} មុខទំនិញ)</p>
              </div>
              <span className="text-xl sm:text-2xl font-black text-[#009F6B] dark:text-emerald-400">{formatCurrency(total)}</span>
            </div>
          </div>
        )}

        {/* Large Prominent Sticky Checkout Button (52-56px height) */}
        {onCheckout && (
          <div className="pt-1">
            <button
              id="pos-checkout-button"
              type="button"
              onClick={onCheckout}
              disabled={items.length === 0}
              className="group flex h-13 sm:h-14 w-full items-center justify-between rounded-2xl bg-[#009F6B] px-5 text-sm sm:text-base font-extrabold text-white shadow-lg shadow-[#009F6B]/25 hover:bg-[#00845A] hover:shadow-xl hover:shadow-[#009F6B]/30 transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:shadow-none cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span>បង់ប្រាក់</span>
                <kbd className="hidden sm:inline-block rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-bold text-white/90">
                  F9
                </kbd>
              </div>

              <div className="flex items-center gap-2 text-base sm:text-lg font-black">
                <span>{formatCurrency(total)}</span>
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


