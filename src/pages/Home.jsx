import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, ArrowRight, ChevronRight, Package, Truck,
  ShieldCheck, QrCode, Layers, Sparkles, Zap, Headphones, CheckCircle2,
  Star, Heart, RotateCcw, CreditCard, Award, Smartphone, Watch,
  Tablet, Check, Plus, Minus, Tag
} from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useActiveDiscounts } from '../hooks/useDiscounts';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';
import { formatCurrency } from '../utils/format';
import { getCategoryIcon, getCategoryTheme } from '../utils/categoryIcons';
import { env } from '../config/env';

export default function Home() {
  const { products, loading: loadingProducts } = useProducts({ page: 0, size: 24 });
  const { categories, loading: loadingCategories } = useCategories();
  const { discounts: activeDiscounts } = useActiveDiscounts();
  const { items, addItem, setQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  const [currentSlide, setCurrentSlide] = useState(0);

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

  // 1. Real dynamic hero slides from live API products
  const heroSlides = useMemo(() => {
    if (productList.length === 0) {
      return [
        {
          id: 'default-hero',
          tag: 'Official Store • Best Prices',
          title: 'Upgrade Your Everyday Shopping',
          subtitle: 'Shop authentic products, fresh groceries, drinks, and snacks with $1.50 express delivery.',
          productName: 'Mart System Official Catalog',
          productDesc: 'Fast doorstep delivery with Bakong KHQR checkout.',
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
      tag: prod.category ? `${prod.category} • Best Price` : 'Featured Product',
      title: prod.name,
      subtitle: prod.description || `Discover authentic ${prod.name} with express delivery across Phnom Penh.`,
      productName: prod.name,
      productDesc: prod.category ? `Category: ${prod.category}` : 'Authentic quality guaranteed.',
      price: prod.price || 0,
      category: prod.category || 'General',
      badge: idx === 0 ? 'Top Pick' : idx === 1 ? 'New Arrival' : 'Special Deal',
      imageUrl: prod.imageUrl || '/mart.jpg',
    }));
  }, [productList]);

  // Auto cycle hero slides every 6s
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const activeHeroSlide = heroSlides[currentSlide % heroSlides.length] || heroSlides[0];

  // 2. Real dynamic categories from live API
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

  // 3. Real dynamic featured products (6 to 12 items from live API)
  const displayFeaturedProducts = useMemo(() => {
    if (productList.length === 0) return [];
    return productList.slice(0, 12).map((prod, idx) => {
      let badge = 'POPULAR';
      if (idx === 0) badge = 'NEW';
      else if (idx === 1) badge = 'HOT';
      else if (idx === 2) badge = 'BEST SELLER';
      else if (prod.stockQuantity != null && prod.stockQuantity <= 5 && prod.stockQuantity > 0) {
        badge = `LOW STOCK (${prod.stockQuantity})`;
      }

      return {
        ...prod,
        badge,
        rating: 5,
        reviewsCount: 30 + ((idx + 1) * 13) % 90,
      };
    });
  }, [productList]);

  // 4. Real promotional bento cards from API products & discounts
  const promoBento = useMemo(() => {
    const promo1Product = productList[3] || productList[0] || null;
    const promo2Product = productList[4] || productList[1] || null;
    const promo3Product = productList[5] || productList[2] || null;

    return {
      card1: {
        title: activeDiscounts[0]?.name || (promo1Product ? `Special: ${promo1Product.name}` : 'Big Savings on Store Items'),
        subtitle: activeDiscounts[0]?.description || 'Enjoy exclusive offers and instant Bakong KHQR checkout.',
        product: promo1Product,
        link: promo1Product ? `/product/${promo1Product.id}` : '/shop',
        buttonText: 'EXPLORE OFFERS',
      },
      card2: {
        title: promo2Product ? promo2Product.name : 'Popular Store Selections',
        subtitle: promo2Product?.category ? `Explore ${promo2Product.category} collection & essentials.` : 'Fresh beverages, snacks & accessories.',
        product: promo2Product,
        link: promo2Product ? `/product/${promo2Product.id}` : '/shop',
        buttonText: 'SHOP NOW',
      },
      card3: {
        title: promo3Product ? `Featured: ${promo3Product.name}` : 'Fast Express Delivery',
        subtitle: 'Doorstep drop-off in Phnom Penh for just $1.50 per order.',
        product: promo3Product,
        link: promo3Product ? `/product/${promo3Product.id}` : '/shop',
        buttonText: 'DISCOVER',
      },
    };
  }, [productList, activeDiscounts]);

  const handleQuickAdd = (prod, e) => {
    e?.stopPropagation?.();
    addItem(prod, 1);
    setAddedItemMap((prev) => ({ ...prev, [prod.id]: true }));
    setTimeout(() => {
      setAddedItemMap((prev) => ({ ...prev, [prod.id]: false }));
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFE] dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors">
      <SEO
        title={`${env.appName || 'Mart System'} | Official Online Store & Everyday Delivery`}
        description="Shop fresh everyday groceries, beverages, snacks, and products from top brands with $1.50 express delivery and seamless Bakong KHQR scan."
        canonical="/"
        ogImage="/mart.jpg"
      />

      {/* 1. TOP MINI TRUST BAR */}
      <section className="border-b border-slate-200/60 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-900/50 py-1.5 sm:py-2.5 px-3 sm:px-6">
        <div className="mx-auto max-w-7xl">
          {/* Mobile view: Clean single-line highlight pills */}
          <div className="flex sm:hidden items-center justify-between text-[10px] font-bold text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <Truck size={12} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>$1.50 Delivery</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <div className="flex items-center gap-1">
              <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>100% Genuine</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <div className="flex items-center gap-1">
              <QrCode size={12} className="text-amber-500 shrink-0" />
              <span>Bakong KHQR</span>
            </div>
          </div>

          {/* Tablet & Desktop view: Full detailed trust items */}
          <div className="hidden sm:flex flex-wrap items-center justify-between gap-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <Truck size={14} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>$1.50 Express Delivery Across Phnom Penh</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>100% Original Products Guaranteed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <QrCode size={14} className="text-amber-500 shrink-0" />
              <span>Instant Bakong KHQR Payment</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Headphones size={14} className="text-blue-500 shrink-0" />
              <span>24/7 Customer Support: 0968782196</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. REAL DYNAMIC HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#EFEBF9] via-[#F6F5FC] to-[#FDFDFE] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-5 pb-10 sm:py-16">
        {/* Ambient Decorative Lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[200px] sm:h-[350px] bg-indigo-400/15 dark:bg-indigo-600/10 blur-3xl pointer-events-none rounded-full" />

        <div className="relative mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
            
            {/* Left Column: Headlines & Call to Action */}
            <div className="lg:col-span-5 space-y-4 sm:space-y-6 text-center lg:text-left z-10">
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
              <div className="flex items-center justify-center lg:justify-start gap-2.5 sm:gap-3.5 pt-0.5 sm:pt-1">
                <Link
                  to="/shop"
                  className="rounded-full bg-[#635BFF] hover:bg-[#5249EC] text-white px-5 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm font-black shadow-md shadow-indigo-500/25 transition active:scale-95 flex items-center gap-1.5 sm:gap-2 cursor-pointer"
                >
                  <span>SHOP NOW</span>
                  <ArrowRight size={14} />
                </Link>

                <Link
                  to="/shop"
                  className="rounded-full bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold shadow-2xs transition active:scale-95 cursor-pointer"
                >
                  EXPLORE CATALOG
                </Link>
              </div>

              {/* 3 Trust Badges underneath buttons */}
              <div className="pt-3 sm:pt-4 grid grid-cols-3 gap-1.5 sm:gap-2 border-t border-slate-200/60 dark:border-slate-800 max-w-md mx-auto lg:mx-0">
                <div className="flex items-center gap-1.5 sm:gap-2 text-left justify-center lg:justify-start">
                  <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Truck size={13} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs font-black text-slate-900 dark:text-white truncate">Express $1.50</p>
                    <p className="text-[9px] text-slate-400 hidden sm:block">Phnom Penh</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 text-left justify-center lg:justify-start">
                  <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
                    <ShieldCheck size={13} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs font-black text-slate-900 dark:text-white truncate">100% Genuine</p>
                    <p className="text-[9px] text-slate-400 hidden sm:block">Authentic Quality</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 text-left justify-center lg:justify-start">
                  <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
                    <QrCode size={13} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs font-black text-slate-900 dark:text-white truncate">Bakong KHQR</p>
                    <p className="text-[9px] text-slate-400 hidden sm:block">Instant Scan</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Center & Right: Real Product 3D Podium & Floating Card */}
            <div className="lg:col-span-7 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 lg:gap-8 pt-2 sm:pt-0">
              
              {/* Central Product Podium */}
              <div
                onClick={() => activeHeroSlide.id !== 'default-hero' && navigate(`/product/${activeHeroSlide.id}`)}
                className="relative flex flex-col items-center justify-center group cursor-pointer"
              >
                <div className="relative w-52 sm:w-80 aspect-[4/3] sm:aspect-[4/5] flex items-center justify-center">
                  <img
                    src={activeHeroSlide.imageUrl}
                    alt={activeHeroSlide.productName}
                    className="relative z-10 max-h-[170px] sm:max-h-[320px] w-auto object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Soft 3D Oval Pedestal at bottom */}
                  <div className="absolute bottom-1 sm:bottom-2 w-40 sm:w-64 h-5 sm:h-8 bg-indigo-300/40 dark:bg-indigo-950/80 rounded-full blur-md" />
                  <div className="absolute bottom-2 sm:bottom-4 w-36 sm:w-56 h-4 sm:h-6 bg-gradient-to-r from-indigo-200 via-indigo-100 to-indigo-200 dark:from-slate-800 dark:to-slate-700 rounded-full shadow-inner" />
                </div>
              </div>

              {/* Floating Product Summary Card */}
              <div className="w-full max-w-[280px] sm:max-w-[260px] rounded-2xl sm:rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 p-3.5 sm:p-5 shadow-xl space-y-2.5 sm:space-y-3.5 text-left">
                <div className="flex items-center justify-between">
                  <span className="inline-block rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 text-[9px] sm:text-[10px] font-extrabold px-2.5 py-0.5 sm:py-1">
                    {activeHeroSlide.badge}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {activeHeroSlide.category}
                  </span>
                </div>

                <div>
                  <h3 className="text-xs sm:text-base font-black text-slate-950 dark:text-white tracking-tight line-clamp-1">
                    {activeHeroSlide.productName}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 sm:line-clamp-2 leading-snug">
                    {activeHeroSlide.productDesc}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[9px] text-slate-400 block font-semibold">Price</span>
                    <p className="text-base sm:text-xl font-black text-indigo-600 dark:text-indigo-400 leading-none">
                      {formatCurrency(activeHeroSlide.price)}
                    </p>
                  </div>

                  {activeHeroSlide.product ? (
                    <button
                      type="button"
                      onClick={() => {
                        addItem(activeHeroSlide.product, 1);
                        navigate(`/product/${activeHeroSlide.product.id}`);
                      }}
                      className="flex items-center justify-center gap-1.5 rounded-xl sm:rounded-2xl bg-slate-950 hover:bg-black text-white px-3 sm:px-4 py-2 text-[11px] sm:text-xs font-bold transition active:scale-95 shadow-xs cursor-pointer"
                    >
                      <span>BUY NOW</span>
                      <ArrowRight size={12} />
                    </button>
                  ) : (
                    <Link
                      to="/shop"
                      className="flex items-center justify-center gap-1.5 rounded-xl sm:rounded-2xl bg-slate-950 hover:bg-black text-white px-3 sm:px-4 py-2 text-[11px] sm:text-xs font-bold transition active:scale-95 shadow-xs cursor-pointer"
                    >
                      <span>SHOP</span>
                      <ArrowRight size={12} />
                    </Link>
                  )}
                </div>
              </div>

            </div>

          </div>

          {/* Slide Indicator Dots */}
          {heroSlides.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 pt-6 sm:pt-10">
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    currentSlide % heroSlides.length === idx ? 'w-6 sm:w-8 bg-[#635BFF]' : 'w-1.5 sm:w-2 bg-slate-300 dark:bg-slate-700'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. REAL LIVE CATEGORIES FROM API */}
      {displayCategories.length > 0 && (
        <section className="py-6 sm:py-12 mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-800 pb-2.5 sm:pb-3">
            <h2 className="text-sm sm:text-lg font-black uppercase tracking-wider text-slate-950 dark:text-white">
              Shop by Category
            </h2>
            <Link
              to="/categories"
              className="text-[11px] sm:text-xs font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 group"
            >
              <span>ALL CATEGORIES ({categories.length})</span>
              <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
            {displayCategories.map((cat) => {
              const Icon = cat.Icon;
              return (
                <Link
                  key={cat.id}
                  to={cat.link}
                  className="group rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3 sm:p-5 flex items-center gap-2.5 sm:gap-3.5 hover:shadow-lg hover:border-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300 shadow-2xs cursor-pointer"
                >
                  <div className="h-10 w-10 sm:h-14 sm:w-14 shrink-0 rounded-xl sm:rounded-2xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center p-2 sm:p-2.5 group-hover:bg-[#635BFF] group-hover:text-white transition-colors">
                    <Icon size={20} className="sm:w-6 sm:h-6" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-[9px] sm:text-[10px] text-slate-400 truncate hidden xs:block">
                      Explore {cat.name}
                    </p>
                    <p className="text-[9px] sm:text-[10px] font-black text-indigo-600 dark:text-indigo-400 mt-0.5 sm:mt-1 flex items-center gap-0.5">
                      <span>SHOP NOW</span>
                      <ChevronRight size={10} className="group-hover:translate-x-1 transition-transform" />
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. REAL LIVE FEATURED PRODUCTS FROM API */}
      <section className="py-6 sm:py-12 mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-800 pb-2.5 sm:pb-3">
          <div>
            <h2 className="text-sm sm:text-lg font-black uppercase tracking-wider text-slate-950 dark:text-white">
              Featured Products
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400">
              Live catalogue from Mart System
            </p>
          </div>
          <Link
            to="/shop"
            className="text-[11px] sm:text-xs font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 group"
          >
            <span>VIEW ALL</span>
            <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loadingProducts ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-4 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800" />
            ))}
          </div>
        ) : displayFeaturedProducts.length === 0 ? (
          <div className="rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-400 text-xs">
            No products available at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-4">
            {displayFeaturedProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                cartQuantity={cartQuantities.get(prod.id) || 0}
                onAdd={(p) => addItem(p, 1)}
                onSetQuantity={(pid, q) => setQuantity(pid, q)}
                onRemove={(pid) => removeItem(pid)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 5. 3 PROMOTIONAL BENTO BANNER CARDS (Using real products & active discounts) */}
      <section className="py-6 sm:py-12 mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-6">
          
          {/* Banner 1: Special Offers / Discount */}
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#EFEBF9] to-[#E5E0F6] dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-200/60 dark:border-indigo-900/40 p-4 sm:p-6 flex flex-col justify-between min-h-[180px] sm:min-h-[220px] shadow-xs">
            <div className="space-y-1.5 max-w-[65%] z-10">
              <h3 className="text-sm sm:text-lg font-black text-slate-950 dark:text-white tracking-tight line-clamp-2">
                {promoBento.card1.title}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-snug line-clamp-2">
                {promoBento.card1.subtitle}
              </p>
              <div className="pt-2 sm:pt-3">
                <Link
                  to={promoBento.card1.link}
                  className="inline-flex items-center gap-1 rounded-full bg-[#635BFF] hover:bg-[#5249EC] text-white px-3.5 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-[11px] font-black shadow-md transition active:scale-95"
                >
                  <span>{promoBento.card1.buttonText}</span>
                  <ArrowRight size={11} />
                </Link>
              </div>
            </div>

            {/* Visual Real Product Image */}
            <div className="absolute right-2 bottom-2 w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center opacity-95">
              <img
                src={promoBento.card1.product?.imageUrl || '/mart.jpg'}
                alt={promoBento.card1.title}
                className="max-h-24 sm:max-h-28 w-auto object-contain drop-shadow-xl rounded-xl"
              />
            </div>
          </div>

          {/* Banner 2: Category Spotlight */}
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#F1F5F9] to-[#E2E8F0] dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700 p-4 sm:p-6 flex flex-col justify-between min-h-[180px] sm:min-h-[220px] shadow-xs">
            <div className="space-y-1.5 max-w-[65%] z-10">
              <h3 className="text-sm sm:text-lg font-black text-slate-950 dark:text-white tracking-tight line-clamp-2">
                {promoBento.card2.title}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-snug line-clamp-2">
                {promoBento.card2.subtitle}
              </p>
              <div className="pt-2 sm:pt-3">
                <Link
                  to={promoBento.card2.link}
                  className="inline-flex items-center gap-1 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white px-3.5 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-[11px] font-bold shadow-2xs hover:bg-slate-50 transition active:scale-95"
                >
                  <span>{promoBento.card2.buttonText}</span>
                  <ArrowRight size={11} />
                </Link>
              </div>
            </div>

            {/* Visual Real Product Image */}
            <div className="absolute right-2 bottom-2 w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center opacity-95">
              <img
                src={promoBento.card2.product?.imageUrl || '/mart.jpg'}
                alt={promoBento.card2.title}
                className="max-h-24 sm:max-h-28 w-auto object-contain drop-shadow-xl rounded-xl"
              />
            </div>
          </div>

          {/* Banner 3: Delivery & Convenience */}
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#E6F4EA] to-[#D1E7DD] dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200/70 dark:border-emerald-900/40 p-4 sm:p-6 flex flex-col justify-between min-h-[180px] sm:min-h-[220px] shadow-xs">
            <div className="space-y-1.5 max-w-[65%] z-10">
              <h3 className="text-sm sm:text-lg font-black text-slate-950 dark:text-white tracking-tight line-clamp-2">
                {promoBento.card3.title}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-snug line-clamp-2">
                {promoBento.card3.subtitle}
              </p>
              <div className="pt-2 sm:pt-3">
                <Link
                  to={promoBento.card3.link}
                  className="inline-flex items-center gap-1 rounded-full bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-800 text-slate-900 dark:text-white px-3.5 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-[11px] font-bold shadow-2xs hover:bg-emerald-50 transition active:scale-95"
                >
                  <span>{promoBento.card3.buttonText}</span>
                  <ArrowRight size={11} />
                </Link>
              </div>
            </div>

            {/* Visual Real Product Image */}
            <div className="absolute right-2 bottom-2 w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center opacity-95">
              <img
                src={promoBento.card3.product?.imageUrl || '/mart.jpg'}
                alt={promoBento.card3.title}
                className="max-h-24 sm:max-h-28 w-auto object-contain drop-shadow-xl rounded-xl"
              />
            </div>
          </div>

        </div>
      </section>

      {/* 6. BOTTOM TRUST BADGES BAR */}
      <section className="border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/40 py-6 sm:py-8 px-3 sm:px-6">
        <div className="mx-auto max-w-7xl grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-6 text-left">
          
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck size={17} />
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white truncate">100% Original</h4>
              <p className="text-[9px] sm:text-[10px] text-slate-400 truncate">Genuine Products</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <CreditCard size={17} />
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white truncate">Bakong KHQR</h4>
              <p className="text-[9px] sm:text-[10px] text-slate-400 truncate">Instant &amp; Secure</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Truck size={17} />
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white truncate">$1.50 Delivery</h4>
              <p className="text-[9px] sm:text-[10px] text-slate-400 truncate">Phnom Penh Drop-off</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <RotateCcw size={17} />
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white truncate">Quality Guarantee</h4>
              <p className="text-[9px] sm:text-[10px] text-slate-400 truncate">Carefully Packed</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 col-span-2 sm:col-span-1">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Headphones size={17} />
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white truncate">24/7 Support</h4>
              <p className="text-[9px] sm:text-[10px] text-slate-400 truncate">0968782196</p>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
