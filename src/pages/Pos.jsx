import { useEffect, useMemo, useState } from 'react';
import { XCircle, PauseCircle } from 'lucide-react';
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
  const { items, addItem, setQuantity, removeItem, subtotal, clear } = useCart();
  const { categories } = useCategories();

  const [category, setCategory] = useState('');
  const [customer, setCustomer] = useState(null);
  const [discountPct, setDiscountPct] = useState('0');
  const [taxPct, setTaxPct] = useState('0');
  const [heldOrders, setHeldOrders] = useState(loadHeldOrders);
  const [showCheckout, setShowCheckout] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);
  const [stockReloadSignal, setStockReloadSignal] = useState(0);

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
    <div className="flex h-full flex-col bg-emerald-50/50">
      <div className="grid flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)_minmax(0,1fr)] gap-4 overflow-hidden p-4 lg:grid-cols-[1fr_380px] lg:grid-rows-1">
        <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl bg-white p-4 shadow-sm">
          <ProductGrid
            category={category}
            onAdd={(product) => addItem(product, 1)}
            reloadSignal={stockReloadSignal}
          />
        </div>

        <div className="min-h-0 overflow-hidden">
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

      <div className="grid grid-cols-1 gap-4 px-4 pb-4 lg:grid-cols-[1fr_380px]">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setCategory('')}
            className={`flex shrink-0 flex-col items-center gap-1 rounded-xl border-2 px-4 py-2 text-xs font-semibold transition ${
              !category
                ? 'border-emerald-600 bg-white text-emerald-700 shadow-sm'
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
                    ? 'border-emerald-600 bg-white text-emerald-700 shadow-sm'
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
          className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
        >
          បង់ប្រាក់ ({formatCurrency(total)})
        </button>
      </div>

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

      {completedSale && <SaleSuccessModal sale={completedSale} onNewSale={handleNewSale} />}
    </div>
  );
}
