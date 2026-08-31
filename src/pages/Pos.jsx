import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ShoppingCart, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCategories } from '../hooks/useCategories';
import { getCategoryIcon, AllCategoriesIcon } from '../utils/categoryIcons';
import ProductGrid from '../components/pos/ProductGrid';
import CartPanel from '../components/pos/CartPanel';
import CheckoutModal from '../components/pos/CheckoutModal';
import SaleSuccessModal from '../components/pos/SaleSuccessModal';
import SEO from '../components/SEO';
import { env } from '../config/env';
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
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuth();
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

  // For unauthenticated customers, discount and tax are always 0.
  const activeDiscountPct = isAuthenticated ? discountPct : '0';
  const activeTaxPct = isAuthenticated ? taxPct : '0';

  const discountAmount = useMemo(
    () => (isAuthenticated ? subtotal * (Number(activeDiscountPct) || 0) / 100 : 0),
    [subtotal, activeDiscountPct, isAuthenticated]
  );
  const taxAmount = useMemo(
    () => (isAuthenticated ? Math.max(0, subtotal - discountAmount) * (Number(activeTaxPct) || 0) / 100 : 0),
    [subtotal, discountAmount, activeTaxPct, isAuthenticated]
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

  const isProductsPage = pathname === '/products';
  const isPosPage = pathname === '/pos';
  const isCheckoutFlow = pathname === '/cart' || pathname === '/checkout' || pathname.startsWith('/payment');

  let pageTitle = 'Mart System | ប្រព័ន្ធគ្រប់គ្រងហាង និង POS';
  let pageDescription = 'Mart System គឺជាប្រព័ន្ធគ្រប់គ្រងហាង និង POS សម្រាប់គ្រប់គ្រងការលក់ ទំនិញ ស្តុក ការបញ្ជាទិញ និងអាជីវកម្មបានយ៉ាងងាយស្រួល។';
  let pageCanonical = '/';
  let pageRobots = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

  if (isProductsPage) {
    pageTitle = 'Products | Mart System';
    pageDescription = 'ស្វែងរក និងគ្រប់គ្រងទំនិញសម្រាប់អាជីវកម្មរបស់អ្នកជាមួយ Mart System។';
    pageCanonical = '/products';
  } else if (isPosPage) {
    pageTitle = 'ចំណុចលក់ (POS) | Mart System';
    pageDescription = 'ប្រព័ន្ធចំណុចលក់ (POS) ទំនើប ងាយស្រួលប្រើប្រាស់ គិតលុយរហ័ស គាំទ្រការទូទាត់តាម KHQR សម្រាប់ Mart System។';
    pageCanonical = '/pos';
  } else if (isCheckoutFlow) {
    pageTitle = 'ទូទាត់ប្រាក់ (Checkout) | Mart System';
    pageRobots = 'noindex, nofollow';
    pageCanonical = pathname;
  }

  const homepageSchema = useMemo(() => {
    if (isCheckoutFlow) return null;
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': `${env.siteUrl}/#website`,
          'url': `${env.siteUrl}/`,
          'name': 'Mart System',
          'alternateName': 'ប្រព័ន្ធគ្រប់គ្រងហាង Mart System',
          'description': 'Mart System គឺជាប្រព័ន្ធគ្រប់គ្រងហាង និង POS សម្រាប់គ្រប់គ្រងការលក់ ទំនិញ ស្តុក ការបញ្ជាទិញ និងអាជីវកម្មបានយ៉ាងងាយស្រួល។',
          'inLanguage': 'km-KH',
        },
        {
          '@type': 'SoftwareApplication',
          '@id': `${env.siteUrl}/#pos-app`,
          'name': 'Mart System POS',
          'applicationCategory': 'BusinessApplication',
          'operatingSystem': 'Web',
          'description': 'ប្រព័ន្ធគ្រប់គ្រងការលក់ និង POS សម្រាប់អាជីវកម្មខ្នាតតូច និងមធ្យមនៅកម្ពុជា។',
          'offers': {
            '@type': 'Offer',
            'price': '0',
            'priceCurrency': 'USD',
          },
        },
      ],
    };
  }, [isCheckoutFlow]);

  return (
    <div className={`flex h-full min-h-0 flex-1 flex-col bg-slate-50/50 dark:bg-ink-950 transition-colors duration-200 ${items.length > 0 ? 'pb-20 sm:pb-24' : 'pb-2 sm:pb-3'} lg:pb-0`}>
      <SEO
        title={pageTitle}
        description={pageDescription}
        canonical={pageCanonical}
        robots={pageRobots}
        jsonLd={homepageSchema}
      />

      {/* Accessible semantic heading structure for SEO and screen readers */}
      <header className="sr-only">
        <h1>Mart System — ប្រព័ន្ធគ្រប់គ្រងហាង និង POS</h1>
        <h2>គ្រប់គ្រងការលក់បានងាយស្រួល</h2>
        <h2>គ្រប់គ្រងទំនិញ និងស្តុក</h2>
        <h2>ប្រព័ន្ធគ្រប់គ្រងសម្រាប់អាជីវកម្ម</h2>
      </header>

      {/* Category Pills Header on Mobile */}
      <div className="shrink-0 sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-2.5 py-1.5 sm:px-4 sm:py-2 lg:hidden">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setCategory('')}
            className={`flex shrink-0 items-center gap-1 sm:gap-1.5 rounded-full px-2.5 py-1 sm:px-3.5 sm:py-1.5 text-xs font-semibold transition ${
              !category
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
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
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 sm:px-3.5 sm:py-1.5 text-xs font-semibold transition ${
                  active
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
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
      <div className="flex-1 min-h-0 p-2.5 sm:p-4 lg:grid lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_390px] lg:gap-4 lg:overflow-hidden">
        {/* Product Grid Container */}
        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4 shadow-xs">
          <ProductGrid
            category={category}
            onAdd={(product) => addItem(product, 1)}
            reloadSignal={stockReloadSignal}
          />
        </div>

        {/* Desktop Cart Panel (Hidden on mobile, shown on lg+) */}
        <div className="hidden lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:overflow-hidden">
          <CartPanel
            items={items}
            onSetQuantity={setQuantity}
            onRemove={removeItem}
            onClear={resetActiveSale}
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
            onCheckout={() => setShowCheckout(true)}
            onHold={isAuthenticated ? handleHoldOrder : undefined}
            onCancel={isAuthenticated ? handleCancelOrder : undefined}
          />
        </div>
      </div>

      {/* Desktop Bottom Category Bar */}
      <div className="shrink-0 hidden px-4 pb-4 lg:block">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 pl-2 pr-1 shrink-0">ប្រភេទទំនិញ:</span>
          <button
            onClick={() => setCategory('')}
            className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
              !category
                ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                : 'border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <AllCategoriesIcon size={15} />
            <span>ទាំងអស់</span>
          </button>
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.name);
            const active = category === cat.name;
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.name)}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
                  active
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                    : 'border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon size={15} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Mobile Cart & Checkout Bar (Sticky Bottom on Mobile) */}
      {items.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-2.5 sm:p-3 shadow-2xl backdrop-blur-md lg:hidden animate-slide-up pb-[max(0.625rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto flex max-w-md items-center justify-between gap-2 sm:gap-3">
            {/* View Cart / Items trigger button */}
            <button
              type="button"
              onClick={() => setMobileCartOpen(!mobileCartOpen)}
              className="flex items-center gap-2 sm:gap-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 sm:px-3.5 py-2 text-left transition hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95"
            >
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shrink-0">
                <ShoppingCart size={16} />
                <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shadow-xs">
                  {itemCount}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight truncate">{itemCount} ចំនួន</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{formatCurrency(total)}</p>
              </div>
              {mobileCartOpen ? <ChevronDown size={14} className="text-slate-400 shrink-0" /> : <ChevronUp size={14} className="text-slate-400 shrink-0" />}
            </button>

            {/* Direct Checkout Button */}
            <button
              type="button"
              onClick={() => {
                setMobileCartOpen(false);
                setShowCheckout(true);
              }}
              className="flex flex-1 items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-emerald-600 py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-500 active:scale-[0.98]"
            >
              <span>បង់ប្រាក់ឥឡូវនេះ</span>
              <span className="font-extrabold">{formatCurrency(total)}</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Slide-Up Cart Bottom Sheet / Drawer */}
      {mobileCartOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs lg:hidden animate-fade-in">
          <div className="fixed inset-0" onClick={() => setMobileCartOpen(false)} />
          <div className="relative z-10 max-h-[90vh] w-full overflow-hidden rounded-t-3xl border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl flex flex-col animate-slide-up pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            {/* Sheet Handle & Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 sm:px-5 py-3 sm:py-3.5 bg-slate-50/70 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <ShoppingCart size={18} className="text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">រទេះទំនិញរបស់អ្នក ({itemCount} ចំនួន)</h3>
              </div>
              <button
                onClick={() => setMobileCartOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
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
                onClear={resetActiveSale}
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
                onCheckout={() => {
                  setMobileCartOpen(false);
                  setShowCheckout(true);
                }}
                onHold={isAuthenticated ? () => { handleHoldOrder(); setMobileCartOpen(false); } : undefined}
                onCancel={isAuthenticated ? () => { handleCancelOrder(); setMobileCartOpen(false); } : undefined}
              />
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
