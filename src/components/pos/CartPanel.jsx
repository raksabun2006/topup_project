import { useState } from 'react';
import { ShoppingCart, ChevronDown, History, RotateCcw, X } from 'lucide-react';
import CartItem from './CartItem';
import CustomerSelector from './CustomerSelector';
import { formatCurrency, formatCurrencyPrecise } from '../../utils/format';

function HeldOrders({ heldOrders, onResume, onDiscard }) {
  const [open, setOpen] = useState(false);
  if (heldOrders.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full border border-amber-400/50 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700"
      >
        <History size={13} />
        កំពុងរង់ចាំ ({heldOrders.length})
        <ChevronDown size={13} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg shadow-black/10">
            {heldOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between gap-2 border-b border-slate-100 px-3.5 py-2.5 last:border-0">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-slate-700">
                    {order.customer?.name ?? 'អតិថិជនទូទៅ'} · {order.items.length} ធាតុ
                  </p>
                  <p className="text-[11px] text-slate-400">{formatCurrency(order.subtotal)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => { onResume(order.id); setOpen(false); }}
                    title="បន្ត"
                    className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50"
                  >
                    <RotateCcw size={14} />
                  </button>
                  <button
                    onClick={() => onDiscard(order.id)}
                    title="លុប"
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function CartPanel({
  items,
  onSetQuantity,
  onRemove,
  subtotal,
  selectedCustomer,
  onSelectCustomer,
  discountPct,
  onDiscountPctChange,
  taxPct,
  onTaxPctChange,
  discountAmount,
  taxAmount,
  total,
  heldOrders,
  onResumeHeld,
  onDiscardHeld,
}) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
        <h2 className="text-base font-bold text-slate-900">សរុបគិតលុយ</h2>
        <HeldOrders heldOrders={heldOrders} onResume={onResumeHeld} onDiscard={onDiscardHeld} />
      </div>

      <div className="border-b border-slate-100 p-3">
        <CustomerSelector selectedCustomer={selectedCustomer} onSelect={onSelectCustomer} />
      </div>

      {items.length > 0 && (
        <div className="flex items-center gap-3 px-4 pt-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          <span className="w-4" />
          <span className="flex-1">ទំនិញ</span>
          <span className="shrink-0">ចំនួន</span>
          <span className="w-16 shrink-0 text-right">តម្លៃ</span>
        </div>
      )}

      <div className="flex-1 divide-y divide-slate-100 overflow-y-auto px-4">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-16 text-center">
            <ShoppingCart size={32} className="mb-3 text-slate-300" />
            <p className="text-sm text-slate-500">រទេះទទេ</p>
            <p className="mt-1 text-xs text-slate-400">ជ្រើសរើសទំនិញដើម្បីចាប់ផ្តើម</p>
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

      <div className="border-t border-slate-100 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">បញ្ចុះតម្លៃ (%)</span>
          <input
            type="number" min="0" max="100" step="0.1"
            value={discountPct}
            onChange={(e) => onDiscountPctChange(e.target.value)}
            className="w-16 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-right text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        {discountAmount > 0 && (
          <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
            <span>ចំនួនបញ្ចុះ</span>
            <span>-{formatCurrencyPrecise(discountAmount)}</span>
          </div>
        )}

        <div className="mt-2.5 flex items-center justify-between text-sm">
          <span className="text-slate-500">សរុបរង</span>
          <span className="font-medium text-slate-700">{formatCurrency(subtotal)}</span>
        </div>

        <div className="mt-1.5 flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-slate-500">
            ពន្ធ
            <input
              type="number" min="0" max="100" step="0.1"
              value={taxPct}
              onChange={(e) => onTaxPctChange(e.target.value)}
              className="w-12 rounded border-b border-dashed border-slate-300 bg-transparent text-center text-xs text-emerald-700 focus:border-emerald-500 focus:outline-none"
            />
            %
          </span>
          <span className="font-medium text-slate-700">{formatCurrencyPrecise(taxAmount)}</span>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-dashed border-slate-200 pt-3">
          <span className="text-base font-bold text-slate-900">សរុប</span>
          <span className="text-xl font-black text-emerald-600">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
