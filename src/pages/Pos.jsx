import { useEffect, useMemo, useState } from 'react';
import { XCircle, PauseCircle, ShoppingCart, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCategories } from '../hooks/useCategories';
import { getCategoryIcon, AllCategoriesIcon } from '../utils/categoryIcons';
import ProductGrid from '../components/pos/ProductGrid';
import CartPanel from '../components/pos/CartPanel';
import CheckoutModal from '../components/pos/CheckoutModal';
import SaleSuccessModal from '../components/pos/SaleSuccessModal';
import { formatCurrency } from '../utils/format';

const HELD_ORDERS_KEY = 'pos_held_orders';

function loadHeldOrders() {
  try {
    return JSON.parse(sessionStorage.getItem(HELD_ORDERS_KEY)) ?? [];
  } catch {
    return [];
  }
}

export default function Pos() {
  const { items, addItem, setQuantity, removeItem, subtotal, clear, itemCount } = useCart();
  const { categories } = useCategories();

  const [category, setCategory] = useState('');
  const [customer, setCustomer] = useState(null);
  const [discountPct, setDiscountPct] = useState('0');
  const [taxPct, setTaxPct] = useState('0');
  const [heldOrders, setHeldOrders] = useState(loadHeldOrders);
  const [showCheckout, setShowCheckout] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);
  const [stockReloadSignal, setStockReloadSignal] = useState(0);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  useEffect(() => {
    sessionStorage.setItem(HELD_ORDERS_KEY, JSON.stringify(heldOrders));
  }, [heldOrders]);

  const discountAmount = useMemo(() => subtotal * (Number(discountPct) || 0) / 100, [subtotal, discountPct]);
  const taxAmount = useMemo(
    () => Math.max(0, subtotal - discountAmount) * (Number(taxPct) || 0) / 100,
    [subtotal, discountAmount, taxPct]
  );
  const total = Math.max(0, subtotal - discountAmount + taxAmount);

  const resetActiveSale = () => {
    clear();
    setCustomer(null);
    setDiscountPct('0');
    setTaxPct('0');
    setMobileCartOpen(false);
  };

  const handleCancelOrder = () => {
    if (items.length === 0) return;
    if (!window.confirm('តើអ្នកពិតជាចង់បោះបង់ការលក់នេះមែនទេ? ទំនិញក្នុងរទេះនឹងត្រូវលុបចោល។')) return;
    resetActiveSale();
  };

  const handleHoldOrder = () => {
    if (items.length === 0) return;
    setHeldOrders((prev) => [
      ...prev,
      { id: crypto.randomUUID(), items, customer, discountPct, taxPct, subtotal },
    ]);
    resetActiveSale();
  };

  const handleResumeHeld = (id) => {
    const order = heldOrders.find((o) => o.id === id);
    if (!order) return;
    if (items.length > 0 && !window.confirm('រទេះបច្ចុប្បន្នមានទំនិញរួចហើយ - បន្តការលក់ដែលកំពុងរង់ចាំនឹងជំនួសរទេះបច្ចុប្បន្ន។ បន្ត?')) {
      return;
    }
    clear();
    order.items.forEach((item) => addItem(item.product, item.quantity));
    setCustomer(order.customer);
    setDiscountPct(order.discountPct);
    setTaxPct(order.taxPct);
    setHeldOrders((prev) => prev.filter((o) => o.id !== id));
  };

  const handleDiscardHeld = (id) => {
    if (!window.confirm('លុបការលក់ដែលកំពុងរង់ចាំនេះចោល?')) return;
    setHeldOrders((prev) => prev.filter((o) => o.id !== id));
  };

  const handleSaleSuccess = (sale) => {
    setShowCheckout(false);
    setCompletedSale(sale);
    resetActiveSale();
    setStockReloadSignal((n) => n + 1);
  };

  const handleNewSale = () => {
    setCompletedSale(null);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-slate-50/50 pb-20 lg:h-full lg:min-h-0 lg:pb-0">
      {/* Category Pills Header on Mobile */}
      <div className="border-b border-slate-200/80 bg-white px-3 py-2.5 lg:hidden">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setCategory('')}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              !category
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <AllCategoriesIcon size={14} />
            ទាំងអស់
          </button>
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.name);
            const active = category === cat.name;
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.name)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  active
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon size={14} />
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-3 sm:p-4 lg:grid lg:grid-cols-[1fr_380px] lg:gap-4 lg:overflow-hidden">
        {/* Product Grid Container */}
        <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs sm:p-4">
          <ProductGrid
            category={category}
            onAdd={(product) => addItem(product, 1)}
            reloadSignal={stockReloadSignal}
          />
        </div>

        {/* Desktop Cart Panel (Hidden on mobile, shown on lg+) */}
        <div className="hidden min-h-0 overflow-hidden lg:block">
          <CartPanel
            items={items}
            onSetQuantity={setQuantity}
            onRemove={removeItem}
            subtotal={subtotal}
            selectedCustomer={customer}
            onSelectCustomer={setCustomer}
            discountPct={discountPct}
            onDiscountPctChange={setDiscountPct}
            taxPct={taxPct}
            onTaxPctChange={setTaxPct}
            discountAmount={discountAmount}
            taxAmount={taxAmount}
            total={total}
            heldOrders={heldOrders}
            onResumeHeld={handleResumeHeld}
            onDiscardHeld={handleDiscardHeld}
          />
        </div>
      </div>

      {/* Desktop Bottom Action & Checkout Bar */}
      <div className="hidden px-4 pb-4 lg:grid lg:grid-cols-[1fr_380px] lg:gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setCategory('')}
            className={`flex shrink-0 flex-col items-center gap-1 rounded-xl border-2 px-4 py-2 text-xs font-semibold transition ${
              !category
                ? 'border-emerald-600 bg-white text-emerald-700 shadow-xs'
                : 'border-transparent bg-white/60 text-slate-400 hover:text-slate-600'
            }`}
          >
            <AllCategoriesIcon size={20} />
            ទាំងអស់
          </button>
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.name);
            const active = category === cat.name;
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.name)}
                className={`flex shrink-0 flex-col items-center gap-1 rounded-xl border-2 px-4 py-2 text-xs font-semibold transition ${
                  active
                    ? 'border-emerald-600 bg-white text-emerald-700 shadow-xs'
                    : 'border-transparent bg-white/60 text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon size={20} />
                {cat.name}
              </button>
            );
          })}

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <button
              onClick={handleCancelOrder}
              disabled={items.length === 0}
              className="flex items-center gap-1.5 rounded-xl border-2 border-rose-500 px-4 py-2.5 text-sm font-bold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-300"
            >
              <XCircle size={16} />
              បោះបង់
            </button>
            <button
              onClick={handleHoldOrder}
              disabled={items.length === 0}
              className="flex items-center gap-1.5 rounded-xl border-2 border-emerald-600 px-4 py-2.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-300"
            >
              <PauseCircle size={16} />
              រង់ចាំ
            </button>
          </div>
        </div>

        <button
          onClick={() => setShowCheckout(true)}
          disabled={items.length === 0}
          className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
        >
          បង់ប្រាក់ ({formatCurrency(total)})
        </button>
      </div>

      {/* Floating Mobile Cart & Checkout Bar (Sticky Bottom on Mobile) */}
      {items.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 p-3 shadow-2xl backdrop-blur-md lg:hidden animate-slide-up">
          <div className="mx-auto flex max-w-md items-center justify-between gap-3">
            {/* View Cart / Items trigger button */}
            <button
              type="button"
              onClick={() => setMobileCartOpen(!mobileCartOpen)}
              className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-left transition hover:bg-slate-100"
            >
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <ShoppingCart size={17} />
                <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shadow-xs">
                  {itemCount}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-500 leading-tight">សរុប {itemCount} មុខ</p>
                <p className="text-xs font-bold text-slate-900 leading-tight">{formatCurrency(total)}</p>
              </div>
              {mobileCartOpen ? <ChevronDown size={15} className="text-slate-400" /> : <ChevronUp size={15} className="text-slate-400" />}
            </button>

            {/* Direct Checkout Button */}
            <button
              type="button"
              onClick={() => {
                setMobileCartOpen(false);
                setShowCheckout(true);
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 px-4 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-500 active:scale-[0.98]"
            >
              <span>គិតលុយ (Checkout)</span>
              <span className="font-extrabold">{formatCurrency(total)}</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Slide-Up Cart Bottom Sheet / Drawer */}
      {mobileCartOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs lg:hidden animate-fade-in">
          <div className="fixed inset-0" onClick={() => setMobileCartOpen(false)} />
          <div className="relative z-10 max-h-[85vh] w-full overflow-hidden rounded-t-3xl border-t border-slate-200 bg-white shadow-2xl flex flex-col animate-slide-up">
            {/* Sheet Handle & Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <ShoppingCart size={18} className="text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">រទេះទំនិញរបស់អ្នក ({itemCount})</h3>
              </div>
              <button
                onClick={() => setMobileCartOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* Cart Panel Content */}
            <div className="flex-1 overflow-y-auto">
              <CartPanel
                items={items}
                onSetQuantity={setQuantity}
                onRemove={removeItem}
                subtotal={subtotal}
                selectedCustomer={customer}
                onSelectCustomer={setCustomer}
                discountPct={discountPct}
                onDiscountPctChange={setDiscountPct}
                taxPct={taxPct}
                onTaxPctChange={setTaxPct}
                discountAmount={discountAmount}
                taxAmount={taxAmount}
                total={total}
                heldOrders={heldOrders}
                onResumeHeld={handleResumeHeld}
                onDiscardHeld={handleDiscardHeld}
              />
            </div>

            {/* Sheet Footer Action */}
            <div className="border-t border-slate-100 bg-slate-50/90 p-4">
              <button
                onClick={() => {
                  setMobileCartOpen(false);
                  setShowCheckout(true);
                }}
                disabled={items.length === 0}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-50"
              >
                បន្តទៅការគិតលុយ ({formatCurrency(total)})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          items={items}
          customer={customer}
          subtotal={subtotal}
          discountAmount={discountAmount}
          taxAmount={taxAmount}
          total={total}
          onClose={() => setShowCheckout(false)}
          onSuccess={handleSaleSuccess}
        />
      )}

      {/* Sale Success / Receipt Modal */}
      {completedSale && <SaleSuccessModal sale={completedSale} onNewSale={handleNewSale} />}
    </div>
  );
}
