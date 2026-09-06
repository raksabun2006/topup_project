import { useEffect, useMemo, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ShoppingCart, ChevronUp, ChevronDown, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCategories } from '../hooks/useCategories';
import ProductGrid from '../components/pos/ProductGrid';
import CartPanel from '../components/pos/CartPanel';
import CheckoutModal from '../components/pos/CheckoutModal';
import BakongPaymentModal from '../components/pos/BakongPaymentModal';
import SaleSuccessModal from '../components/pos/SaleSuccessModal';
import CustomerOrdersModal, { saveCustomerOrder } from '../components/pos/CustomerOrdersModal';
import SEO from '../components/SEO';
import { env } from '../config/env';
import { formatCurrency, parseBackendDate } from '../utils/format';

const HELD_ORDERS_KEY = 'pos_held_orders';
const ACTIVE_BAKONG_PAYMENT_KEY = 'pos_active_bakong_payment';

function loadHeldOrders() {
  try {
    const raw = sessionStorage.getItem(HELD_ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((o) => o && Array.isArray(o.items));
    }
  } catch {
    return [];
  }
  return [];
}

function loadActiveBakongPayment() {
  try {
    const raw = sessionStorage.getItem(ACTIVE_BAKONG_PAYMENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.saleId) return null;

    // Validate expiration
    if (parsed.expiresAt) {
      const exp = parseBackendDate(parsed.expiresAt);
      if (exp && exp.getTime() <= Date.now()) {
        sessionStorage.removeItem(ACTIVE_BAKONG_PAYMENT_KEY);
        return null;
      }
    } else if (parsed.createdAt) {
      const created = parseBackendDate(parsed.createdAt);
      if (created && Date.now() - created.getTime() > 15 * 60 * 1000) {
        sessionStorage.removeItem(ACTIVE_BAKONG_PAYMENT_KEY);
        return null;
      }
    }

    return (
      parsed.sale || {
        saleId: parsed.saleId,
        paymentId: parsed.paymentId,
        qr: parsed.qr || parsed.qrString,
        qrString: parsed.qrString || parsed.qr,
        amount: parsed.amount,
        currency: parsed.currency,
        expiresAt: parsed.expiresAt,
        billNumber: parsed.billNumber,
        isGuest: parsed.isGuest,
      }
    );
  } catch {
    return null;
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
  const [showOrdersModal, setShowOrdersModal] = useState(pathname === '/orders');
  const [resumedPaymentSale, setResumedPaymentSale] = useState(loadActiveBakongPayment);
  const [completedSale, setCompletedSale] = useState(null);
  const [stockReloadSignal, setStockReloadSignal] = useState(0);
  const [mobileCartOpen, setMobileCartOpen] = useState(pathname === '/cart');

  const searchInputRef = useRef(null);
  const categoryContainerRef = useRef(null);

  useEffect(() => {
    const handleOpenOrders = () => setShowOrdersModal(true);
    const handleOpenCart = () => setMobileCartOpen(true);
    window.addEventListener('mart:open-orders', handleOpenOrders);
    window.addEventListener('mart:open-cart', handleOpenCart);
    return () => {
      window.removeEventListener('mart:open-orders', handleOpenOrders);
      window.removeEventListener('mart:open-cart', handleOpenCart);
    };
  }, []);

  useEffect(() => {
    if (pathname === '/orders') {
      setShowOrdersModal(true);
    } else if (pathname === '/cart') {
      setMobileCartOpen(true);
    } else if (pathname === '/checkout') {
      setShowCheckout(true);
    }
  }, [pathname]);

  useEffect(() => {
    sessionStorage.setItem(HELD_ORDERS_KEY, JSON.stringify(heldOrders));
  }, [heldOrders]);

  // Global Keyboard Shortcuts (F2 / Ctrl+K, F4, F8, F9, ESC)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // F2 or Ctrl+K: Focus search input
      if (e.key === 'F2' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        return;
      }

      // F4: Focus/open Customer selector (Staff only)
      if (e.key === 'F4' && isAuthenticated) {
        e.preventDefault();
        document.getElementById('pos-customer-button')?.click();
        return;
      }

      // F8: Focus discount input (Staff only)
      if (e.key === 'F8' && isAuthenticated) {
        e.preventDefault();
        const discountInput = document.getElementById('pos-discount-input');
        if (discountInput) {
          discountInput.focus();
          discountInput.select();
        }
        return;
      }

      // F9: Open Checkout modal
      if (e.key === 'F9') {
        e.preventDefault();
        if (items.length > 0 && !showCheckout && !completedSale) {
          setShowCheckout(true);
        }
        return;
      }

      // Escape: Close modals
      if (e.key === 'Escape') {
        if (showCheckout) {
          e.preventDefault();
          setShowCheckout(false);
        } else if (showOrdersModal) {
          e.preventDefault();
          setShowOrdersModal(false);
        } else if (completedSale) {
          e.preventDefault();
          setCompletedSale(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items.length, showCheckout, showOrdersModal, completedSale, isAuthenticated]);

  // For unauthenticated customers, discount and tax are calculated cleanly
  const activeDiscountPct = isAuthenticated ? discountPct : '0';
  const activeTaxPct = isAuthenticated ? taxPct : '0';
  const deliveryFee = useMemo(
    () => (!isAuthenticated && items.length > 0 ? 1.5 : 0),
    [isAuthenticated, items.length]
  );

  const discountAmount = useMemo(
    () => (isAuthenticated ? (subtotal * (Number(activeDiscountPct) || 0)) / 100 : 0),
    [subtotal, activeDiscountPct, isAuthenticated]
  );
  const taxAmount = useMemo(
    () =>
      isAuthenticated
        ? ((Math.max(0, subtotal - discountAmount) * (Number(activeTaxPct) || 0)) / 100)
        : 0,
    [subtotal, discountAmount, activeTaxPct, isAuthenticated]
  );
  const total = Math.max(0, subtotal - discountAmount + taxAmount + deliveryFee);

  const resetActiveSale = () => {
    clear();
    setCustomer(null);
    setDiscountPct('0');
    setTaxPct('0');
    setMobileCartOpen(false);
  };

  const handleCancelOrder = () => {
    if (items.length === 0) return;
    if (!window.confirm('តើអ្នកពិតជាចង់បោះបង់ការលក់នេះមែនទេ?')) return;
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
    if (
      items.length > 0 &&
      !window.confirm('រទេះបច្ចុប្បន្នមានទំនិញរួចហើយ - បន្តការលក់ដែលកំពុងរង់ចាំនឹងជំនួសរទេះបច្ចុប្បន្ន។ បន្ត?')
    ) {
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
    saveCustomerOrder(sale);
    setCompletedSale(sale);
    resetActiveSale();
    setStockReloadSignal((n) => n + 1);
  };

  const handleNewSale = () => {
    setCompletedSale(null);
  };

  const handleFocusCategories = () => {
    categoryContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const isProductsPage = pathname === '/products';
  const isPosPage = pathname === '/pos' || pathname === '/';
  const isCheckoutFlow = pathname === '/cart' || pathname === '/checkout' || pathname.startsWith('/payment');

  let pageTitle = 'Mart System | ប្រព័ន្ធគ្រប់គ្រងហាង និង Online Store POS';
  let pageDescription =
    'Mart System - Customer POS និងប្រព័ន្ធគ្រប់គ្រងហាងទំនើប។ ស្វែងរកទំនិញ កុម្ម៉ង់ទិញ និងទូទាត់ប្រាក់តាម Bakong KHQR បានយ៉ាងរហ័ស និងមានសុវត្ថិភាព។';
  let pageKeywords =
    'Mart System, Customer POS, Online Shopping POS, Mart Shopping, Bakong KHQR POS, Cambodia';
  let pageCanonical = '/';
  let pageRobots = 'index, follow';

  if (isProductsPage) {
    pageTitle = 'ទំនិញ (Products) | Mart System';
    pageDescription = 'មើលបញ្ជីទំនិញទាំងអស់នៅក្នុង Mart System រួមមានតម្លៃ ស្តុក និងប្រភេទផ្សេងៗ។';
    pageCanonical = '/products';
  } else if (isPosPage) {
    pageTitle = 'Mart System | Online Shopping POS';
    pageDescription = 'ជ្រើសរើសទំនិញ និងទូទាត់ប្រាក់តាម Bakong KHQR យ៉ាងរហ័ស។';
    pageCanonical = '/pos';
  } else if (isCheckoutFlow) {
    pageTitle = 'ការទូទាត់ប្រាក់ (Checkout) | Mart System';
    pageCanonical = pathname;
    pageRobots = 'noindex, nofollow';
  }

  const homepageSchema = useMemo(() => {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'url': env.siteUrl,
      'name': 'Mart System',
      'alternateName': ['Mart Online Shopping POS', 'Mart POS Cambodia'],
      'description': pageDescription,
      'inLanguage': 'km-KH',
    };
  }, [pageDescription]);

  return (
    <div
      className={`flex h-full min-h-0 flex-1 flex-col bg-[#F7F9FA] dark:bg-slate-950 transition-colors duration-200 ${
        items.length > 0 ? 'pb-24 sm:pb-28' : 'pb-16 sm:pb-20'
      } lg:pb-0`}
    >
      <SEO
        title={pageTitle}
        description={pageDescription}
        keywords={pageKeywords}
        canonical={pageCanonical}
        robots={pageRobots}
        jsonLd={homepageSchema}
      />

      <header className="sr-only">
        <h1>Mart System — Customer Shopping POS</h1>
        <p>ស្វែងរកទំនិញ បន្ថែមក្នុងរទេះ និងទូទាត់ប្រាក់តាម Bakong KHQR</p>
      </header>

      {/* Main Responsive 2-Column POS Layout */}
      <div className="flex-1 min-h-0 p-2.5 sm:p-3 lg:grid lg:grid-cols-[1fr_390px] xl:grid-cols-[1fr_420px] lg:gap-3.5 lg:overflow-hidden">
        {/* Left Side: Product Catalog Area */}
        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-3.5 shadow-xs">
          <ProductGrid
            category={category}
            onSelectCategory={setCategory}
            categories={categories}
            onAdd={(product, qty = 1) => addItem(product, qty)}
            onSetQuantity={setQuantity}
            onRemove={removeItem}
            reloadSignal={stockReloadSignal}
            searchInputRef={searchInputRef}
            categoryContainerRef={categoryContainerRef}
          />
        </div>

        {/* Right Side: Fixed Sticky Cart Sidebar (Desktop) */}
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

      {/* Floating Mobile Cart & Checkout Bar (Sticky Bottom on Mobile when cart has items) */}
      {items.length > 0 && (
        <div className="fixed inset-x-0 bottom-14 sm:bottom-16 z-30 border-t border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-2 sm:p-2.5 shadow-2xl backdrop-blur-md lg:hidden animate-slide-up">
          <div className="mx-auto flex max-w-md items-center justify-between gap-2">
            {/* View Cart / Items trigger button */}
            <button
              type="button"
              onClick={() => setMobileCartOpen(!mobileCartOpen)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-left transition hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 cursor-pointer"
            >
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-[#009F6B] text-white shrink-0">
                <ShoppingCart size={16} />
                <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shadow-xs">
                  {itemCount}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight truncate">{itemCount} មុខ</p>
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
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#009F6B] py-2.5 px-4 text-xs sm:text-sm font-bold text-white shadow-lg shadow-[#009F6B]/30 hover:bg-[#00845A] active:scale-[0.98] transition cursor-pointer"
            >
              <span>{isAuthenticated ? 'បង់ប្រាក់ឥឡូវនេះ' : 'ទូទាត់ប្រាក់ (Checkout)'}</span>
              <span className="font-extrabold">{formatCurrency(total)}</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Slide-Up Cart Bottom Sheet / Drawer */}
      {mobileCartOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs lg:hidden animate-fade-in">
          <div className="fixed inset-0" onClick={() => setMobileCartOpen(false)} />
          <div className="relative z-10 max-h-[85vh] w-full overflow-hidden rounded-t-3xl border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl flex flex-col animate-slide-up pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            {/* Grab Handle */}
            <div className="flex justify-center pt-2 pb-0.5" onClick={() => setMobileCartOpen(false)}>
              <div className="h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-700" />
            </div>

            {/* Unified Cart Panel Content */}
            <div className="flex-1 min-h-0 overflow-y-auto">
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
                onClose={() => setMobileCartOpen(false)}
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

      {/* Customer Orders / History Modal */}
      {showOrdersModal && (
        <CustomerOrdersModal
          onClose={() => setShowOrdersModal(false)}
          onViewReceipt={(sale) => {
            setShowOrdersModal(false);
            setCompletedSale(sale);
          }}
        />
      )}

      {/* Resumed Bakong Payment Modal */}
      {!showCheckout && resumedPaymentSale && (
        <BakongPaymentModal
          sale={resumedPaymentSale}
          onPaid={(completed) => {
            setResumedPaymentSale(null);
            handleSaleSuccess(completed);
          }}
          onClose={() => {
            try {
              sessionStorage.removeItem(ACTIVE_BAKONG_PAYMENT_KEY);
            } catch {
              // ignore
            }
            setResumedPaymentSale(null);
          }}
        />
      )}

      {/* Sale Success / Receipt Modal */}
      {completedSale && <SaleSuccessModal sale={completedSale} onNewSale={handleNewSale} />}
    </div>
  );
}
