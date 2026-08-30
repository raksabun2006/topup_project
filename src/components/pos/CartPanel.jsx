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
        className="flex items-center gap-1.5 rounded-full border border-amber-400/60 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 shadow-2xs hover:bg-amber-100/80 transition active:scale-95"
      >
        <History size={13} className="text-amber-600" />
        <span>រង់ចាំ ({heldOrders.length})</span>
        <ChevronDown size={12} className="text-amber-600" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 animate-scale-in">
            <div className="border-b border-slate-100 bg-slate-50/80 px-3.5 py-2.5 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <History size={14} className="text-amber-600" />
                បញ្ជីការលក់កំពុងរង់ចាំ
              </span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                {heldOrders.length}
              </span>
            </div>
            <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
              {heldOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between gap-2 px-3.5 py-3 hover:bg-slate-50/80 transition"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-800">
                      {order.customer?.name ?? 'អតិថិជនទូទៅ'}
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <span>{order.items.length} មុខ</span>
                      <span>·</span>
                      <span className="font-semibold text-emerald-600">{formatCurrency(order.subtotal)}</span>
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => {
                        onResume(order.id);
                        setOpen(false);
                      }}
                      title="បន្តការលក់នេះ"
                      className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 active:scale-95 transition"
                    >
                      <RotateCcw size={12} />
                      បន្ត
                    </button>
                    <button
                      onClick={() => onDiscard(order.id)}
                      title="លុបចោល"
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 active:scale-95 transition"
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
    <div className="flex flex-col rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden transition-all duration-200 lg:h-full lg:min-h-0">
      {/* Top Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-2xs">
            <ShoppingBag size={14} />
          </div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-bold text-slate-900">
              {isAuthenticated ? 'សរុបគិតលុយ (POS)' : 'រទេះទំនិញរបស់អ្នក'}
            </h2>
            {items.length > 0 && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
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
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition active:scale-95"
            >
              <Trash2 size={13} />
              <span>សម្អាត</span>
            </button>
          )}
        </div>
      </div>

      {/* Customer Selector (for Staff) */}
      {isAuthenticated && (
        <div className="shrink-0 border-b border-slate-100 bg-slate-50/50 p-2.5 sm:p-3">
          <CustomerSelector selectedCustomer={selectedCustomer} onSelect={onSelectCustomer} />
        </div>
      )}

      {/* Items Table Header */}
      {items.length > 0 && (
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <span className="flex-1">ទំនិញ</span>
          <span className="w-20 text-center">ចំនួន</span>
          <span className="w-16 text-right">តម្លៃ</span>
        </div>
      )}

      {/* Cart Items List or Welcoming Empty State (Dynamic Hug-Content Area) */}
      <div className={`${items.length === 0 ? 'py-10 lg:flex-1 lg:flex lg:flex-col lg:justify-center' : 'flex-1 min-h-0 overflow-y-auto px-4 py-1 divide-y divide-slate-100'}`}>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <ShoppingCart size={28} />
            </div>

            <h3 className="text-sm font-bold text-slate-800">រទេះទំនិញនៅទំនេរ</h3>
            <p className="mt-1 max-w-[220px] text-xs text-slate-400 leading-relaxed">
              សូមជ្រើសរើសទំនិញពីបញ្ជី ដើម្បីបន្ថែមទៅក្នុងរទេះ
            </p>

            {/* If there are held orders, show quick resume prompt */}
            {isAuthenticated && heldOrders && heldOrders.length > 0 && (
              <div className="mt-4 w-full max-w-[260px] rounded-xl border border-amber-300 bg-amber-50/80 p-3 text-left">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
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

      {/* Cart Summary & Direct Dynamic Action Area */}
      {items.length > 0 && (
        <div className="shrink-0 border-t border-slate-200/90 bg-slate-50/70 p-3 sm:p-3.5 space-y-2.5 animate-fade-in">
          {isAuthenticated ? (
            /* Staff/Admin Pricing Controls & Quick Discounts */
            <div className="space-y-2">
              {/* Quick Discount Presets */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="flex items-center gap-1 text-[11px] font-bold text-slate-600">
                    <Percent size={11} className="text-emerald-600" />
                    បញ្ចុះតម្លៃ
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCustomDiscount(!showCustomDiscount)}
                    className="text-[10px] font-semibold text-emerald-600 hover:underline"
                  >
                    {showCustomDiscount ? 'ជម្រើសលឿន' : 'ភាគរយផ្ទាល់'}
                  </button>
                </div>

                {showCustomDiscount ? (
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        placeholder="0"
                        value={discountPct}
                        onChange={(e) => onDiscountPctChange(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-right text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        %
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDiscountPctChange('0')}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-500 hover:bg-slate-100"
                    >
                      កំណត់ឡើងវិញ
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-5 gap-1">
                    {DISCOUNT_PRESETS.map((preset) => {
                      const active = Number(discountPct) === preset;
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => onDiscountPctChange(String(preset))}
                          className={`rounded-md py-0.5 text-xs font-bold transition active:scale-95 ${
                            active
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-100/80'
                          }`}
                        >
                          {preset}%
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Calculations Breakdown */}
              <div className="space-y-1 rounded-xl border border-slate-200/80 bg-white p-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span>សរុបរង</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 font-medium">
                    <span>បញ្ចុះតម្លៃ ({discountPct}%)</span>
                    <span>-{formatCurrencyPrecise(discountAmount)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-slate-500">
                  <span className="flex items-center gap-1">
                    ពន្ធ
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={taxPct}
                      onChange={(e) => onTaxPctChange(e.target.value)}
                      className="w-9 rounded border-b border-dashed border-slate-300 bg-transparent text-center text-xs font-semibold text-emerald-700 focus:border-emerald-500 focus:outline-none"
                    />
                    %
                  </span>
                  <span className="font-semibold text-slate-800">{formatCurrencyPrecise(taxAmount)}</span>
                </div>

                <div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-1.5 text-sm font-bold text-slate-900">
                  <span>សរុបត្រូវបង់</span>
                  <span className="text-base font-black text-emerald-600">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Main Action Buttons for Staff */}
              {onCheckout && (
                <div className="space-y-1.5 pt-0.5">
                  <button
                    type="button"
                    onClick={onCheckout}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 px-4 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-600/25 transition hover:bg-emerald-500 active:scale-[0.98]"
                  >
                    <span>បង់ប្រាក់ ({formatCurrency(total)})</span>
                    <ArrowRight size={15} />
                  </button>

                  {(onHold || onCancel) && (
                    <div className="grid grid-cols-2 gap-1.5">
                      {onHold && (
                        <button
                          type="button"
                          onClick={onHold}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100/80 active:scale-95 transition"
                        >
                          <PauseCircle size={13} className="text-amber-600" />
                          <span>រង់ចាំ</span>
                        </button>
                      )}
                      {onCancel && (
                        <button
                          type="button"
                          onClick={onCancel}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 active:scale-95 transition"
                        >
                          <XCircle size={13} />
                          <span>បោះបង់</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Customer / Guest Checkout Summary & Direct Button */
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 shadow-2xs">
                <div>
                  <span className="text-xs font-bold text-slate-800">សរុបត្រូវបង់</span>
                  <p className="text-[10px] text-slate-400">រួមបញ្ចូលទាំងស្រុង ({totalItemCount} មុខ)</p>
                </div>
                <span className="text-xl font-black text-emerald-600">{formatCurrency(total)}</span>
              </div>

              {onCheckout && (
                <button
                  type="button"
                  onClick={onCheckout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-600/30 transition hover:bg-emerald-500 active:scale-[0.98]"
                >
                  <span>បង់ប្រាក់ ({formatCurrency(total)})</span>
                  <ArrowRight size={15} />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


