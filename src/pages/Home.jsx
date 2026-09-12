import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, ArrowRight, ChevronRight, Package, Truck,
  ShieldCheck, QrCode, Layers, Sparkles, Zap, Headphones, CheckCircle2,
  Star, Heart, RotateCcw, CreditCard, Award, Clock, Tag, Flame,
  Check, Plus, RefreshCw, Copy
} from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useActiveDiscounts } from '../hooks/useDiscounts';
import { useCart } from '../context/CartContext';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import { useLanguage } from '../context/LanguageContext';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';
import { formatCurrency } from '../utils/format';
import { getCategoryIcon, getCategoryTheme } from '../utils/categoryIcons';
import { getProductUrl } from '../utils/seoSlug';
import { env } from '../config/env';

export default function Home() {
  const { products, loading: loadingProducts } = useProducts({ page: 0, size: 40 });
  const { categories, loading: loadingCategories } = useCategories();
  const { discounts: activeDiscounts } = useActiveDiscounts();
  const { items, addItem, setQuantity, removeItem } = useCart();
  const { recentlyViewed } = useRecentlyViewed();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [copiedCode, setCopiedCode] = useState(null);

  // Flash Sale Countdown Timer (Calculates time until midnight)
  const [timeLeft, setTimeLeft] = useState({ hours: 7, minutes: 42, seconds: 19 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      if (diff > 0) {
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const cartQuantities = useMemo(() => {
    const map = new Map();
    (items || []).forEach((item) => {
      if (item?.product?.id) {
        map.set(item.product.id, item.quantity);
      }
    });
    return map;
  }, [items]);

  const productList = useMemo(
    () => (Array.isArray(products) ? products.filter(Boolean) : []),
    [products]
  );

  // Hero Slides
  const heroSlides = useMemo(() => {
    if (productList.length === 0) {
      return [
        {
          id: 'default-hero',
          tag: 'Official Store • Best Prices',
          title: 'Upgrade Your Everyday Shopping',
          subtitle: 'Shop authentic products, fresh groceries, drinks, and snacks with $1.50 express delivery.',
          productName: 'Mart System Official Catalog',
          price: 0,
          category: 'Mart System',
          badge: 'Featured',
          imageUrl: '/mart.jpg',
        },
      ];
    }

    return productList.slice(0, Math.min(4, productList.length)).map((prod, idx) => ({
      id: prod.id,
      product: prod,
      tag: prod.category ? `${prod.category} • Top Pick` : 'Official Selection',
      title: prod.name,
      subtitle: prod.description || `Discover authentic ${prod.name} with express delivery across Phnom Penh.`,
      productName: prod.name,
      price: prod.price || 0,
      category: prod.category || 'General',
      badge: idx === 0 ? 'Top Pick' : idx === 1 ? 'New Arrival' : 'Special Deal',
      imageUrl: prod.imageUrl || '/mart.jpg',
    }));
  }, [productList]);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const activeHeroSlide = heroSlides[currentSlide % heroSlides.length] || heroSlides[0];

  // Categories with Icons & Links
  const displayCategories = useMemo(() => {
    if (!Array.isArray(categories) || categories.length === 0) return [];
    return categories.slice(0, 10).map((cat, idx) => {
      const catName = typeof cat === 'string' ? cat : cat?.name || 'Category';
      const catId = typeof cat === 'string' ? cat : cat?.id || catName;
      const Icon = getCategoryIcon(catName);
      const theme = getCategoryTheme(catName, idx);
      return {
        id: catId,
        name: catName,
        Icon,
        theme,
        link: `/shop?category=${encodeURIComponent(catName)}`,
      };
    });
  }, [categories]);

  // Section 1: Featured Products (first 8 products)
  const featuredProducts = useMemo(() => {
    return productList.slice(0, 8).map((p, idx) => ({
      ...p,
      badge: idx === 0 ? 'FEATURED' : idx === 1 ? 'NEW' : p.badge,
      rating: 5,
      reviewsCount: 30 + ((idx + 1) * 11) % 80,
    }));
  }, [productList]);

  // Section 2: Best Sellers (next 8 products or sorted)
  const bestSellers = useMemo(() => {
    const list = productList.length >= 16 ? productList.slice(8, 16) : productList.slice(0, 8);
    return list.map((p, idx) => ({
      ...p,
      badge: 'BEST SELLER',
      rating: 5,
      reviewsCount: 50 + ((idx + 1) * 17) % 95,
    }));
  }, [productList]);

  // Section 3: Flash Sale Items (Top 4 curated discount deals with high conversion triggers)
  const flashSaleProducts = useMemo(() => {
    const pool = productList.length >= 8 ? productList.slice(4, 8) : productList.slice(0, 4);
    const discounts = [25, 20, 15, 20];
    const claimed = [82, 67, 94, 55];
    return pool.map((p, idx) => {
      const discountPercent = discounts[idx % discounts.length];
      const origPrice = Number(p.price) || 0;
      const discountedPrice = Math.max(0.5, origPrice * (1 - discountPercent / 100));
      return {
        ...p,
        originalPrice: origPrice,
        price: discountedPrice,
        discountPercent,
        claimedPercent: claimed[idx % claimed.length],
        badge: `-${discountPercent}%`,
        rating: 5,
        reviewsCount: 40 + ((idx + 1) * 14) % 70,
      };
    });
  }, [productList]);

  // Section 4: Recommended Products
  const recommendedProducts = useMemo(() => {
    const list = productList.length >= 24 ? productList.slice(16, 24) : productList.slice(0, 8);
    return list.map((p, idx) => ({
      ...p,
      badge: 'RECOMMENDED',
      rating: 5,
      reviewsCount: 25 + ((idx + 1) * 9) % 60,
    }));
  }, [productList]);

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard?.writeText?.(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const homeFaqs = useMemo(() => [
    {
      q: 'How fast is Mart System delivery in Phnom Penh?',
      a: 'Mart System provides express doorstep delivery across Phnom Penh for a flat fee of $1.50 within operating hours (06:00 AM – 11:00 PM).'
    },
    {
      q: 'How can I pay using Bakong KHQR?',
      a: 'During checkout, select Bakong KHQR to display a dynamic KHQR code. Scan with any Cambodian banking app (ABA, Wing, ACLEDA, Canadia, etc.) for instant automated confirmation.'
    },
    {
      q: 'What categories are available at Mart System?',
      a: 'We offer fresh groceries, beverages, snacks, dairy products, pantry essentials, and household goods from verified Cambodian and international brands.'
    },
    {
      q: 'What is the return and exchange policy?',
      a: 'Mart System provides a 7-day return and exchange policy for verified defective or incorrect items.'
    }
  ], []);

  const homeItemList = useMemo(() => {
    return productList.slice(0, 8).map((p) => ({
      name: p.name,
      url: getProductUrl(p),
      image: p.imageUrl,
      price: p.price,
      currency: 'USD',
    }));
  }, [productList]);

  return (
    <div className="min-h-screen bg-[#FDFDFE] dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors">
      <SEO
        title="Mart System | Official Online Store & Groceries Delivery Cambodia"
        description="Shop fresh everyday groceries, beverages, snacks, and products from top brands in Cambodia with $1.50 express delivery and seamless Bakong KHQR scan."
        keywords="Mart System Cambodia, Online Grocery Phnom Penh, Bakong KHQR Shopping, Buy Groceries Cambodia, Drink & Snacks Delivery, Express Delivery Mart"
        canonical="/"
        itemList={homeItemList}
        faq={homeFaqs}
      />

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#EFEBF9] via-[#F6F5FC] to-[#FDFDFE] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-6 pb-12 sm:py-16">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[200px] sm:h-[350px] bg-indigo-400/15 dark:bg-indigo-600/10 blur-3xl pointer-events-none rounded-full" />

        <div className="relative mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
            {/* Left Headline & CTAs */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-6 text-center lg:text-left z-10">
              <div className="space-y-2 sm:space-y-3">
                <span className="inline-block text-[11px] sm:text-xs font-black tracking-wider text-indigo-600 dark:text-indigo-400 uppercase">
                  {activeHeroSlide.tag}
                </span>
                
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-950 dark:text-white tracking-tight leading-tight line-clamp-2">
                  {activeHeroSlide.title}
                </h1>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto lg:mx-0 leading-relaxed line-clamp-2 sm:line-clamp-3">
                  {activeHeroSlide.subtitle}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center lg:justify-start gap-2.5 sm:gap-3.5 pt-1">
                <Link
                  to="/shop"
                  className="rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 px-6 sm:px-8 py-2.5 sm:py-3.5 text-xs sm:text-sm font-black shadow-md transition active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <span>{t('shopNow')}</span>
                  <ArrowRight size={15} />
                </Link>

                <Link
                  to="/categories"
                  className="rounded-full bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 px-5 sm:px-7 py-2.5 sm:py-3.5 text-xs sm:text-sm font-bold shadow-2xs transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <span>{t('exploreCategories')}</span>
                </Link>
              </div>

              {/* Slide Indicators */}
              {heroSlides.length > 1 && (
                <div className="flex items-center justify-center lg:justify-start gap-2 pt-2">
                  {heroSlides.map((slide, idx) => (
                    <button
                      key={slide.id}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        currentSlide === idx
                          ? 'w-7 bg-indigo-600 dark:bg-indigo-400'
                          : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Interactive Hero Card */}
            <div className="lg:col-span-6 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/60 dark:border-slate-800 p-5 sm:p-7 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-3 py-1 text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                    {activeHeroSlide.badge}
                  </span>
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {formatCurrency(activeHeroSlide.price)}
                  </span>
                </div>

                <div className="relative h-48 sm:h-56 w-full rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden p-3 border border-slate-100 dark:border-slate-700">
                  {activeHeroSlide.imageUrl ? (
                    <img
                      src={activeHeroSlide.imageUrl}
                      alt={activeHeroSlide.productName}
                      className="h-full w-full object-contain transition-transform duration-500 hover:scale-105"
                      onError={(e) => { e.target.src = '/mart.jpg'; }}
                    />
                  ) : (
                    <Package size={48} className="text-slate-300" />
                  )}
                </div>

                <div className="space-y-1">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white line-clamp-1">
                    {activeHeroSlide.productName}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {activeHeroSlide.subtitle}
                  </p>
                </div>

                <Link
                  to={activeHeroSlide.product ? `/product/${activeHeroSlide.product.id}` : '/shop'}
                  className="flex items-center justify-center gap-2 w-full rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white py-3 text-xs font-black transition shadow-md shadow-indigo-600/20 active:scale-98"
                >
                  <span>View Product Details</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES SECTION */}
      <section className="py-8 sm:py-12 border-y border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/30">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {t('exploreCategories')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Browse our wide selection of store items
              </p>
            </div>
            <Link
              to="/categories"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            {displayCategories.map((cat) => {
              const { Icon, theme } = cat;
              return (
                <Link
                  key={cat.id}
                  to={cat.link}
                  className="group flex flex-col items-center text-center p-4 rounded-2xl bg-[#F8FAFC] dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all hover:shadow-md"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${theme.bg} ${theme.text} mb-3 group-hover:scale-110 transition-transform shadow-xs`}>
                    <Icon size={22} />
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition truncate w-full">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS SECTION */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-950/80 px-2.5 py-0.5 text-[10px] font-black text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                <Sparkles size={12} />
                <span>Curated Picks</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {t('featuredHighlights')}
              </h2>
            </div>
            <Link
              to="/shop"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>{t('exploreShop')}</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {featuredProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                cartQuantity={cartQuantities.get(prod.id) || 0}
                onAdd={(p) => addItem(p, 1)}
                onSetQuantity={(id, q) => setQuantity(id, q)}
                onRemove={(id) => removeItem(id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. BEST SELLERS SECTION */}
      <section className="py-10 sm:py-14 bg-[#F8FAFC] dark:bg-slate-900/40 border-y border-slate-100 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 dark:bg-rose-950/80 px-2.5 py-0.5 text-[10px] font-black text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                <Flame size={12} />
                <span>Customer Favorites</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {t('bestSellers')}
              </h2>
            </div>
            <Link
              to="/shop"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {bestSellers.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                cartQuantity={cartQuantities.get(prod.id) || 0}
                onAdd={(p) => addItem(p, 1)}
                onSetQuantity={(id, q) => setQuantity(id, q)}
                onRemove={(id) => removeItem(id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 5. FLASH SALE SECTION (Contained Luxury Event Card) */}
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-rose-200/80 dark:border-rose-900/40 bg-gradient-to-br from-rose-50/70 via-amber-50/30 to-white dark:from-slate-900 dark:via-rose-950/20 dark:to-slate-900 p-5 sm:p-8 shadow-sm">
            {/* Ambient Lighting Accents */}
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-rose-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header Row: Title & Countdown */}
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 px-3 py-1 text-[11px] font-black uppercase tracking-wider">
                  <Flame size={13} className="fill-rose-500 text-rose-500 animate-pulse" />
                  <span>FLASH DEALS • ឱកាសពិសេស</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {t('flashSale')}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                  បញ្ចុះតម្លៃពិសេសរហូតដល់ 25% សម្រាប់ថ្ងៃនេះតែប៉ុណ្ណោះ! (Limited Daily Deals)
                </p>
              </div>

              {/* High-End Countdown Clock */}
              <div className="flex items-center gap-3 self-start md:self-auto">
                <div className="flex items-center gap-2 bg-white dark:bg-slate-850 border border-rose-200/70 dark:border-slate-800 rounded-2xl p-1.5 sm:p-2 px-3 sm:px-4 shadow-sm">
                  <Clock size={16} className="text-rose-500 mr-0.5 shrink-0" />
                  <span className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 mr-1 hidden sm:inline">
                    Ends In:
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-center font-black">
                    <div className="rounded-xl bg-slate-900 text-white dark:bg-slate-800 px-2.5 py-1 min-w-[34px] text-xs sm:text-sm shadow-xs">
                      {String(timeLeft.hours).padStart(2, '0')}
                      <span className="block text-[7px] font-sans font-bold text-slate-400">HRS</span>
                    </div>
                    <span className="text-xs font-black text-slate-400">:</span>
                    <div className="rounded-xl bg-slate-900 text-white dark:bg-slate-800 px-2.5 py-1 min-w-[34px] text-xs sm:text-sm shadow-xs">
                      {String(timeLeft.minutes).padStart(2, '0')}
                      <span className="block text-[7px] font-sans font-bold text-slate-400">MIN</span>
                    </div>
                    <span className="text-xs font-black text-slate-400">:</span>
                    <div className="rounded-xl bg-gradient-to-br from-rose-600 to-red-600 text-white px-2.5 py-1 min-w-[34px] text-xs sm:text-sm shadow-xs animate-pulse">
                      {String(timeLeft.seconds).padStart(2, '0')}
                      <span className="block text-[7px] font-sans font-bold text-rose-200">SEC</span>
                    </div>
                  </div>
                </div>

                <Link
                  to="/shop"
                  className="hidden lg:inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition"
                >
                  <span>{t('viewAll') || 'View All'}</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>

            {/* Grid of 4 Curated Flash Sale Cards */}
            <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {flashSaleProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  cartQuantity={cartQuantities.get(prod.id) || 0}
                  onAdd={(p) => addItem(p, 1)}
                  onSetQuantity={(id, q) => setQuantity(id, q)}
                  onRemove={(id) => removeItem(id)}
                />
              ))}
            </div>

            {/* Footer Trust Bar */}
            <div className="mt-6 pt-4 border-t border-rose-200/60 dark:border-rose-900/30 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-4 sm:gap-6">
                <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                  <Truck size={14} className="text-rose-500" />
                  Free Express Delivery
                </span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                  <ShieldCheck size={14} className="text-rose-500" />
                  100% Genuine Guaranteed
                </span>
              </div>
              <Link
                to="/shop"
                className="lg:hidden inline-flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400"
              >
                <span>{t('viewAll') || 'View All Deals'}</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. RECOMMENDED PRODUCTS */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 dark:bg-blue-950/80 px-2.5 py-0.5 text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                <Award size={12} />
                <span>Personalized</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Recommended For You
              </h2>
            </div>
            <Link
              to="/shop"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>{t('exploreShop')}</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {recommendedProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                cartQuantity={cartQuantities.get(prod.id) || 0}
                onAdd={(p) => addItem(p, 1)}
                onSetQuantity={(id, q) => setQuantity(id, q)}
                onRemove={(id) => removeItem(id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 7. RECENTLY VIEWED (Conditionally rendered when user has viewed items) */}
      {recentlyViewed && recentlyViewed.length > 0 && (
        <section className="py-10 sm:py-14 bg-[#F8FAFC] dark:bg-slate-900/40 border-y border-slate-100 dark:border-slate-800">
          <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {t('recentlyViewed')}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Products you checked out recently
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {recentlyViewed.slice(0, 4).map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  cartQuantity={cartQuantities.get(prod.id) || 0}
                  onAdd={(p) => addItem(p, 1)}
                  onSetQuantity={(id, q) => setQuantity(id, q)}
                  onRemove={(id) => removeItem(id)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. PROMOTION BANNER */}
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-10 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                <Tag size={12} />
                <span>Special Promo</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                {activeDiscounts[0]?.name || 'Enjoy 10% Off Your Next Order'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-medium">
                {activeDiscounts[0]?.description || 'Apply code at checkout for instant savings. Valid for online orders with Bakong KHQR.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <div className="flex items-center gap-2 rounded-2xl bg-white/10 border border-white/20 px-4 py-2.5 font-mono text-xs font-black tracking-wider">
                <span>{activeDiscounts[0]?.code || 'WELCOME10'}</span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(activeDiscounts[0]?.code || 'WELCOME10')}
                  className="p-1 rounded-lg hover:bg-white/20 transition cursor-pointer"
                  title="Copy coupon code"
                >
                  {copiedCode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>

              <Link
                to="/shop"
                className="rounded-2xl bg-white text-slate-950 hover:bg-slate-100 px-6 py-3 text-xs font-black transition active:scale-95 shadow-md"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 9. TRUST & SERVICE BENEFITS */}
      <section className="py-10 sm:py-14 border-t border-slate-100 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
                <Truck size={22} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  $1.50 Express Delivery
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Fast doorstep delivery across all districts in Phnom Penh.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
                <QrCode size={22} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  Bakong KHQR Scan & Pay
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Seamless payment using any Cambodian banking app.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
                <CheckCircle2 size={22} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  100% Authentic Quality
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Directly sourced and quality guaranteed for peace of mind.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
                <Headphones size={22} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  Dedicated Support
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Friendly assistance available everyday from 06:00 to 23:00.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
