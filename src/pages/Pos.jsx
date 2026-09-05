import { useEffect, useMemo, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ShoppingCart, ChevronUp, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCategories } from '../hooks/useCategories';
import ProductGrid from '../components/pos/ProductGrid';
import CartPanel from '../components/pos/CartPanel';
import CheckoutModal from '../components/pos/CheckoutModal';
import BakongPaymentModal from '../components/pos/BakongPaymentModal';
import SaleSuccessModal from '../components/pos/SaleSuccessModal';
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
  const [resumedPaymentSale, setResumedPaymentSale] = useState(loadActiveBakongPayment);
  const [completedSale, setCompletedSale] = useState(null);
  const [stockReloadSignal, setStockReloadSignal] = useState(0);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const searchInputRef = useRef(null);

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

      // F4: Focus/open Customer selector
      if (e.key === 'F4') {
        e.preventDefault();
        document.getElementById('pos-customer-button')?.click();
        return;
      }

      // F8: Focus discount input
      if (e.key === 'F8') {
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
        } else if (completedSale) {
          e.preventDefault();
          setCompletedSale(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items.length, showCheckout, completedSale]);

  // For unauthenticated customers, discount and tax are always 0.
  const activeDiscountPct = isAuthenticated ? discountPct : '0';
  const activeTaxPct = isAuthenticated ? taxPct : '0';

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

  let pageTitle = 'Mart System | ប្រព័ន្ធគ្រប់គ្រងហាង និង POS ទំនើបសម្រាប់អាជីវកម្ម';
  let pageDescription =
    'Mart System - ប្រព័ន្ធគ្រប់គ្រងហាង និង POS ទំនើបសម្រាប់អាជីវកម្ម។ គ្រប់គ្រងការលក់ ទំនិញ ស្តុក និងទូទាត់ប្រាក់តាម Bakong KHQR បានយ៉ាងរហ័ស និងមានសុវត្ថិភាព ។ ចំណុចលក់ (POS) • ទំនិញ (Products)។ ទំនាក់ទំនង: 0968782196, Email: raksabun2006@gmail.com';
  let pageKeywords =
    'Mart System, ប្រព័ន្ធគ្រប់គ្រងហាង និង POS ទំនើបសម្រាប់អាជីវកម្ម, ចំណុចលក់ POS, ទំនិញ Products, គ្រប់គ្រងការលក់, គ្រប់គ្រងស្តុក, Bakong KHQR POS, POS System Cambodia';
  let pageCanonical = '/';
  let pageRobots = 'index, follow';

  if (isProductsPage) {
    pageTitle = 'ទំនិញ (Products) | Mart System POS';
    pageDescription =
      'មើលបញ្ជីទំនិញទាំងអស់នៅក្នុង Mart System — ប្រព័ន្ធគ្រប់គ្រងហាង និង POS ទំនើបសម្រាប់អាជីវកម្ម រួមមានតម្លៃ ស្តុក និងប្រភេទផ្សេងៗ។';
    pageKeywords = 'ទំនិញ, Products, ស្តុក, Mart System Products, Catalog Cambodia';
    pageCanonical = '/products';
  } else if (isPosPage) {
    pageTitle = 'ចំណុចលក់ (POS) | Mart System';
    pageDescription =
      'ចំណុចលក់ (POS) ទំនើប គ្រប់គ្រងការលក់ ទំនិញ ស្តុក និងទូទាត់ប្រាក់តាម Bakong KHQR បានយ៉ាងរហ័ស និងមានសុវត្ថិភាព ។';
    pageKeywords = 'ចំណុចលក់, POS, POS Screen, Cashier Register, គិតលុយ, Bakong KHQR';
    pageCanonical = '/pos';
    pageRobots = 'index, follow';
  } else if (isCheckoutFlow) {
    pageTitle = 'ការទូទាត់ប្រាក់ (Checkout) | Mart System';
    pageDescription = 'ទូទាត់ប្រាក់ទំនិញរបស់អ្នកដោយសុវត្ថិភាពតាមរយៈ Bakong KHQR ឬសាច់ប្រាក់។';
    pageKeywords = 'Bakong KHQR, Checkout, ទូទាត់ប្រាក់';
    pageCanonical = pathname;
    pageRobots = 'noindex, nofollow';
  }

  const homepageSchema = useMemo(() => {
    const baseSchemaGraph = [
      {
        '@type': 'WebSite',
        '@id': `${env.siteUrl}/#website`,
        'url': env.siteUrl,
        'name': 'Mart System',
        'alternateName': [
          'ប្រព័ន្ធគ្រប់គ្រងហាង និង POS ទំនើបសម្រាប់អាជីវកម្ម',
          'Mart POS Cambodia'
        ],
        'description': pageDescription,
        'inLanguage': 'km-KH',
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${env.siteUrl}/#software`,
        'name': 'Mart System',
        'alternateName': 'ប្រព័ន្ធគ្រប់គ្រងហាង និង POS ទំនើបសម្រាប់អាជីវកម្ម',
        'applicationCategory': 'BusinessApplication',
        'applicationSubCategory': 'Point of Sale & Inventory Management',
        'operatingSystem': 'Web, iOS, Android, Windows, macOS',
        'description':
          'ប្រព័ន្ធគ្រប់គ្រងហាង និង POS ទំនើបសម្រាប់អាជីវកម្ម។ គ្រប់គ្រងការលក់ ទំនិញ ស្តុក និងទូទាត់ប្រាក់តាម Bakong KHQR បានយ៉ាងរហ័ស និងមានសុវត្ថិភាព ។',
        'inLanguage': 'km-KH',
        'featureList': [
          'ចំណុចលក់ (POS)',
          'ទំនិញ (Products)',
          'គ្រប់គ្រងការលក់ និងស្តុកទំនិញ',
          'ទូទាត់ប្រាក់តាម Bakong KHQR ស្វ័យប្រវត្តិ'
        ],
        'author': {
          '@type': 'Person',
          'name': 'Bun Raksa',
          'email': 'raksabun2006@gmail.com',
          'telephone': '0968782196'
        }
      },
      {
        '@type': 'LocalBusiness',
        '@id': `${env.siteUrl}/#localbusiness`,
        'name': 'Mart System',
        'headline': 'ប្រព័ន្ធគ្រប់គ្រងហាង និង POS ទំនើបសម្រាប់អាជីវកម្ម',
        'description':
          'ប្រព័ន្ធគ្រប់គ្រងហាង និង POS ទំនើបសម្រាប់អាជីវកម្ម។ គ្រប់គ្រងការលក់ ទំនិញ ស្តុក និងទូទាត់ប្រាក់តាម Bakong KHQR បានយ៉ាងរហ័ស និងមានសុវត្ថិភាព ។',
        'telephone': '0968782196',
        'email': 'raksabun2006@gmail.com',
        'url': env.siteUrl,
        'currenciesAccepted': 'USD, KHR',
        'paymentAccepted': 'Cash, Bakong KHQR'
      }
    ];

    if (isProductsPage || isPosPage) {
      baseSchemaGraph.push({
        '@type': 'BreadcrumbList',
        '@id': `${env.siteUrl}/#breadcrumb`,
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'ទំព័រដើម',
            'item': env.siteUrl,
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': isProductsPage ? 'ទំនិញ (Products)' : 'ចំណុចលក់ (POS)',
            'item': `${env.siteUrl}${isProductsPage ? '/products' : '/pos'}`,
          },
        ],
      });
    }

    return {
      '@context': 'https://schema.org',
      '@graph': baseSchemaGraph,
    };
  }, [isProductsPage, isPosPage, pageDescription]);

  return (
    <div
      className={`flex h-full min-h-0 flex-1 flex-col bg-[#F7F9FA] dark:bg-slate-950 transition-colors duration-200 ${
        items.length > 0 ? 'pb-20 sm:pb-24' : 'pb-2 sm:pb-3'
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
        <h1>Mart System — ប្រព័ន្ធគ្រប់គ្រងហាង និង POS ទំនើបសម្រាប់អាជីវកម្ម</h1>
        <p>គ្រប់គ្រងការលក់ ទំនិញ ស្តុក និងទូទាត់ប្រាក់តាម Bakong KHQR បានយ៉ាងរហ័ស និងមានសុវត្ថិភាព ។</p>
        <h2>ចំណុចលក់ (POS)</h2>
        <h2>ទំនិញ (Products)</h2>
        <p>ទំនាក់ទំនងទូរស័ព្ទ: 0968782196 | អ៊ីមែល: raksabun2006@gmail.com</p>
      </header>

      {/* Main Responsive 2-Column POS Layout */}
      <div className="flex-1 min-h-0 p-2.5 sm:p-3 lg:grid lg:grid-cols-[1fr_390px] xl:grid-cols-[1fr_420px] lg:gap-3.5 lg:overflow-hidden">
        {/* Left Side: Product Catalog Area */}
        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-3.5 shadow-xs">
          <ProductGrid
            category={category}
            onSelectCategory={setCategory}
            categories={categories}
            onAdd={(product) => addItem(product, 1)}
            onSetQuantity={setQuantity}
            onRemove={removeItem}
            reloadSignal={stockReloadSignal}
            searchInputRef={searchInputRef}
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
            {/* Grab Handle for touch drawer UX */}
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

      {/* Resumed Bakong Payment Modal (Preserves active payment session on page refresh) */}
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
