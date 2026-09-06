import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Search, SlidersHorizontal, ArrowUpDown, X, PackageX, ChevronLeft,
  ChevronRight, Tag, Check, Filter, RotateCcw, Sparkles, TrendingUp,
  Percent, ArrowRight, ArrowLeft, Send, Home as HomeIcon, Smartphone,
  Headphones, HardDrive, ShoppingBag
} from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';
import { getCategoryIcon, AllCategoriesIcon, getCategoryTheme } from '../utils/categoryIcons';
import { useActiveDiscounts } from '../hooks/useDiscounts';
export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';

  const [search, setSearch] = useState(searchParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [categorySearch, setCategorySearch] = useState('');
  const [heroSlide, setHeroSlide] = useState(0);
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'NEW', 'BEST_SELLER', 'DISCOUNT'
  const [sortBy, setSortBy] = useState('DEFAULT'); // 'DEFAULT', 'PRICE_ASC', 'PRICE_DESC', 'NAME'
  const [inStockOnly, setInStockOnly] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [emailSubscribe, setEmailSubscribe] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const recommendationsRef = useRef(null);
  const navigate = useNavigate();

  const { categories } = useCategories();
  const { discounts: activeDiscounts } = useActiveDiscounts();
  const { products, loading, error, page, setPage, totalPages, reload } = useProducts({
    category: selectedCategory || undefined,
  });
  const { items, addItem, setQuantity, removeItem } = useCart();

  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    setSearch(searchParam);
  }, [searchParam]);

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

  // Filtered Category List based on category search input
  const filteredCategoryList = useMemo(() => {
    if (!categorySearch.trim()) return categories;
    const term = categorySearch.toLowerCase().trim();
    return categories.filter((c) => {
      const name = typeof c === 'string' ? c : c?.name || '';
      return name.toLowerCase().includes(term);
    });
  }, [categories, categorySearch]);

  // Dynamic Product Counts per Category
  const categoryCounts = useMemo(() => {
    const map = {};
    (productList || []).forEach((p) => {
      if (p?.category) {
        const cat = String(p.category).trim();
        map[cat] = (map[cat] || 0) + 1;
      }
    });
    return map;
  }, [productList]);

  // Client-side filtering & sorting
  const filteredProducts = useMemo(() => {
    let list = [...productList];
    const q = search.trim().toLowerCase();

    if (q) {
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.barcode?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    if (inStockOnly) {
      list = list.filter((p) => (p.stockQuantity ?? 0) > 0);
    }

    if (filterType === 'DISCOUNT') {
      list = list.filter((p) => Number(p.price) < 10 || p.discount);
    }

    if (sortBy === 'PRICE_ASC') {
      list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (sortBy === 'PRICE_DESC') {
      list.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    } else if (sortBy === 'NAME') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    return list;
  }, [productList, search, inStockOnly, filterType, sortBy]);

  const recommendations = useMemo(() => {
    return [...productList].slice(0, 8);
  }, [productList]);

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setFilterType('ALL');
    if (cat) {
      setSearchParams({ category: cat, ...(search ? { search } : {}) });
    } else {
      const p = {};
      if (search) p.search = search;
      setSearchParams(p);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      setSearchParams({
        ...(selectedCategory ? { category: selectedCategory } : {}),
        search: search.trim(),
      });
    } else {
      const p = {};
      if (selectedCategory) p.category = selectedCategory;
      setSearchParams(p);
    }
  };

  const handleClearAllFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setFilterType('ALL');
    setSortBy('DEFAULT');
    setInStockOnly(false);
    setSearchParams({});
  };

  const scrollRecommendations = (direction) => {
    if (recommendationsRef.current) {
      const offset = direction === 'left' ? -320 : 320;
      recommendationsRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (emailSubscribe.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmailSubscribe('');
      }, 3000);
    }
  };

  // Dynamic Bento Hero Promos derived from API Products (Category-related Colors & Themes)
  const bentoPromos = useMemo(() => {
    const list = productList;
    const fallbackImage = 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=700&auto=format&fit=crop&q=85';

    // Center Slider (Up to 3-4 real products)
    const centerList = list.length > 0 ? list.slice(0, Math.min(3, list.length)) : [];
    const centerSlides = centerList.length > 0
      ? centerList.map((p, idx) => ({
          id: p.id,
          tag: idx === 0 ? 'WEEKEND PROMOTIONS' : idx === 1 ? 'NEW ARRIVAL 2026' : 'FEATURED DEAL',
          title: p.name || 'Featured Product',
          subtitle: p.description || `Special discount on ${p.name || 'store products'}. Order online with fast express delivery.`,
          category: p.category || '',
          price: Number(p.price || 0),
          image: p.imageUrl || p.image || fallbackImage,
          theme: getCategoryTheme(p.category, idx),
        }))
      : [
          {
            id: null,
            tag: 'WEEKEND PROMOTIONS',
            title: 'Find The Best Products For You',
            subtitle: 'Get $50 – $100 off when buying online with fast express delivery.',
            category: 'Mobile Phones',
            price: 99.99,
            image: fallbackImage,
            theme: getCategoryTheme('Mobile Phones', 0),
          },
        ];

    // Surrounding Bento Cards (Cards 1 to 4)
    const c1 = list[1] || list[0] || null;
    const c2 = list[2] || list[0] || null;
    const c3 = list[3] || list[1] || null;
    const c4 = list[4] || list[2] || null;

    return {
      centerSlides,
      card1: c1
        ? {
            id: c1.id,
            badge: 'Best 2026',
            title: c1.name,
            subtitle: c1.category || 'High Quality',
            price: Number(c1.price || 0),
            originalPrice: (Number(c1.price || 0) * 1.35).toFixed(2),
            discount: '25% Off',
            image: c1.imageUrl || c1.image || fallbackImage,
            category: c1.category,
            theme: getCategoryTheme(c1.category, 1),
          }
        : {
            id: null,
            badge: 'Best 2026',
            title: 'Smart Tech Device',
            subtitle: 'High Quality',
            price: 39.99,
            originalPrice: '54.99',
            discount: '25% Off',
            image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&auto=format&fit=crop&q=80',
            category: 'Electronics',
            theme: getCategoryTheme('Electronics', 1),
          },
      card2: c2
        ? {
            id: c2.id,
            badge: 'End Season',
            title: c2.name,
            subtitle: c2.category || 'Hottest',
            price: Number(c2.price || 0),
            originalPrice: (Number(c2.price || 0) * 1.3).toFixed(2),
            discount: '30% Off',
            image: c2.imageUrl || c2.image || fallbackImage,
            category: c2.category,
            theme: getCategoryTheme(c2.category, 2),
          }
        : {
            id: null,
            badge: 'End Season',
            title: 'Retro Essentials',
            subtitle: 'Hottest',
            price: 29.99,
            originalPrice: '42.99',
            discount: '30% Off',
            image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&auto=format&fit=crop&q=80',
            category: 'Kitchen & Dining',
            theme: getCategoryTheme('Kitchen & Dining', 2),
          },
      card3: c3
        ? {
            id: c3.id,
            badge: 'Trending Pick',
            title: c3.name,
            subtitle: c3.category || 'Gaming',
            price: Number(c3.price || 0),
            originalPrice: (Number(c3.price || 0) * 1.2).toFixed(2),
            discount: '15% Off',
            image: c3.imageUrl || c3.image || fallbackImage,
            category: c3.category,
            theme: getCategoryTheme(c3.category, 3),
          }
        : {
            id: null,
            badge: 'Trending Pick',
            title: 'Wireless Pro Controller',
            subtitle: 'Gaming',
            price: 99.99,
            originalPrice: '119.99',
            discount: '15% Off',
            image: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=400&auto=format&fit=crop&q=80',
            category: 'Toys & Games',
            theme: getCategoryTheme('Toys & Games', 3),
          },
      card4: c4
        ? {
            id: c4.id,
            badge: 'Popular Choice',
            title: c4.name,
            subtitle: c4.category || 'Wireless',
            price: Number(c4.price || 0),
            originalPrice: (Number(c4.price || 0) * 1.25).toFixed(2),
            discount: '20% Off',
            image: c4.imageUrl || c4.image || fallbackImage,
            category: c4.category,
            theme: getCategoryTheme(c4.category, 4),
          }
        : {
            id: null,
            badge: 'Popular Choice',
            title: 'Bluetooth Headphones',
            subtitle: 'Wireless',
            price: 59.99,
            originalPrice: '74.99',
            discount: '20% Off',
            image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&auto=format&fit=crop&q=80',
            category: 'Electronics',
            theme: getCategoryTheme('Electronics', 4),
          },
    };
  }, [productList]);

  const activeCenterSlide = bentoPromos.centerSlides[heroSlide % bentoPromos.centerSlides.length] || bentoPromos.centerSlides[0];

  const handleBentoClick = (item) => {
    if (item?.id) {
      navigate(`/product/${item.id}`);
    } else if (item?.category) {
      handleSelectCategory(item.category);
    }
  };

  const isFiltered = Boolean(search || selectedCategory || inStockOnly || filterType !== 'ALL' || sortBy !== 'DEFAULT');

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-12">
      <SEO
        title="Shop All Groceries &amp; Products | Mart System Online Store"
        description="Browse all grocery essentials, beverages, snacks, fresh food and home items in Mart System. Filter by category, enjoy $1.50 express delivery, and pay with Bakong KHQR."
        keywords="Shop Groceries, Buy Drinks Online, Mart System Shop, Cambodia E-Commerce, Bakong KHQR Online Mart, Fast Delivery Groceries Phnom Penh"
        canonical="/shop"
        ogImage="/mart.jpg"
      />

      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6">
        {/* Active Backend Promotions Alert / Banner */}
        {activeDiscounts.length > 0 && (
          <div className="rounded-2xl border border-rose-200/80 dark:border-rose-900/50 bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-rose-500/10 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-rose-500 text-white shadow-xs shrink-0">
                <Tag size={14} />
              </span>
              <span>
                <strong className="text-rose-600 dark:text-rose-400 uppercase tracking-wide mr-1.5">
                  {activeDiscounts[0].name || 'Active Promotion'}
                </strong>
                {activeDiscounts[0].description || 'Automatic discounts applied during checkout from backend.'}
              </span>
            </div>

            {activeDiscounts[0].code && (
              <div className="flex items-center gap-2 shrink-0 bg-white dark:bg-slate-800 rounded-xl px-3 py-1.5 border border-slate-200 dark:border-slate-700 shadow-2xs">
                <span className="text-[10px] text-slate-400 uppercase font-black">Code:</span>
                <span className="font-mono text-xs font-black text-rose-600 dark:text-rose-400 uppercase">
                  {activeDiscounts[0].code}
                </span>
              </div>
            )}
          </div>
        )}

        {/* 1. Multi-Card Promotional Hero Showcase Grid (Bento Hero Dynamic with Category-Related Theme Colors) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-4 select-none">
          {/* Left Column: 2 Stacked Cards (3 cols on lg, 6 cols on md) */}
          <div className="md:col-span-6 lg:col-span-3 flex flex-col gap-3.5 sm:gap-4 order-2 lg:order-1">
            {/* Card 1 */}
            <div
              onClick={() => handleBentoClick(bentoPromos.card1)}
              className={`group relative flex-1 min-h-[155px] sm:min-h-[165px] rounded-3xl ${bentoPromos.card1.theme.cardBg} border ${bentoPromos.card1.theme.border} p-4 sm:p-5 flex items-center justify-between gap-3 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-0.5`}
            >
              <div className="relative z-10 max-w-[58%] space-y-1">
                <span className={`text-[10px] sm:text-[11px] font-extrabold ${bentoPromos.card1.theme.badgeText} block tracking-wide uppercase`}>
                  {bentoPromos.card1.badge}
                </span>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight line-clamp-2">
                  {bentoPromos.card1.title}
                </h3>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                  {bentoPromos.card1.subtitle}
                </p>
                <div className="pt-2 flex items-baseline gap-1.5 flex-wrap">
                  {bentoPromos.card1.originalPrice && (
                    <span className="text-[10px] text-slate-400 line-through font-medium">
                      ${bentoPromos.card1.originalPrice}
                    </span>
                  )}
                  <span className={`text-xs sm:text-sm font-black ${bentoPromos.card1.theme.priceColor}`}>
                    ${Number(bentoPromos.card1.price || 0).toFixed(2)}
                  </span>
                  {bentoPromos.card1.discount && (
                    <span className={`inline-block text-[9px] font-black ${bentoPromos.card1.theme.discountBg} px-1.5 py-0.5 rounded-md`}>
                      {bentoPromos.card1.discount}
                    </span>
                  )}
                </div>
              </div>
              <div className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 bg-white dark:bg-slate-800 rounded-2xl shadow-xs p-2 flex items-center justify-center border border-white/60 dark:border-slate-700/50 group-hover:scale-105 transition-transform duration-300">
                <img
                  src={bentoPromos.card1.image}
                  alt={bentoPromos.card1.title}
                  className="h-full w-full object-contain drop-shadow-xs rounded-xl"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&auto=format&fit=crop&q=80'; }}
                />
              </div>
            </div>

            {/* Card 2 */}
            <div
              onClick={() => handleBentoClick(bentoPromos.card2)}
              className={`group relative flex-1 min-h-[155px] sm:min-h-[165px] rounded-3xl ${bentoPromos.card2.theme.cardBg} border ${bentoPromos.card2.theme.border} p-4 sm:p-5 flex items-center justify-between gap-3 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-0.5`}
            >
              <div className="relative z-10 max-w-[58%] space-y-1">
                <span className={`text-[10px] sm:text-[11px] font-extrabold ${bentoPromos.card2.theme.badgeText} block tracking-wide uppercase`}>
                  {bentoPromos.card2.badge}
                </span>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight line-clamp-2">
                  {bentoPromos.card2.title}
                </h3>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                  {bentoPromos.card2.subtitle}
                </p>
                <div className="pt-2 flex items-baseline gap-1.5 flex-wrap">
                  {bentoPromos.card2.originalPrice && (
                    <span className="text-[10px] text-slate-400 line-through font-medium">
                      ${bentoPromos.card2.originalPrice}
                    </span>
                  )}
                  <span className={`text-xs sm:text-sm font-black ${bentoPromos.card2.theme.priceColor}`}>
                    ${Number(bentoPromos.card2.price || 0).toFixed(2)}
                  </span>
                  {bentoPromos.card2.discount && (
                    <span className={`inline-block text-[9px] font-black ${bentoPromos.card2.theme.discountBg} px-1.5 py-0.5 rounded-md`}>
                      {bentoPromos.card2.discount}
                    </span>
                  )}
                </div>
              </div>
              <div className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 bg-white dark:bg-slate-800 rounded-2xl shadow-xs p-2 flex items-center justify-center border border-white/60 dark:border-slate-700/50 group-hover:scale-105 transition-transform duration-300">
                <img
                  src={bentoPromos.card2.image}
                  alt={bentoPromos.card2.title}
                  className="h-full w-full object-contain drop-shadow-xs rounded-xl"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&auto=format&fit=crop&q=80'; }}
                />
              </div>
            </div>
          </div>

          {/* Center Column: Main Featured Showcase Slider (6 cols on lg, 12 cols on md) */}
          <div className="md:col-span-12 lg:col-span-6 order-1 lg:order-2">
            <div className={`relative min-h-[310px] sm:min-h-[350px] h-full rounded-3xl ${activeCenterSlide.theme.cardBg} border ${activeCenterSlide.theme.border} p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-xs`}>
              {/* Decorative subtle background circle */}
              <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 sm:w-80 sm:h-80 rounded-full ${activeCenterSlide.theme.glow} blur-2xl pointer-events-none`} />

              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 h-full">
                {/* Left text content */}
                <div className="space-y-3 sm:space-y-4 max-w-sm text-center sm:text-left">
                  <span className={`inline-block text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest ${activeCenterSlide.theme.badgeText}`}>
                    {activeCenterSlide.tag}
                  </span>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight line-clamp-2">
                    {activeCenterSlide.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-2">
                    {activeCenterSlide.subtitle}
                  </p>
                  <div className="pt-2 flex items-center justify-center sm:justify-start gap-3">
                    <button
                      type="button"
                      onClick={() => handleBentoClick(activeCenterSlide)}
                      className={`inline-flex items-center gap-2 rounded-xl ${activeCenterSlide.theme.buttonBg} px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-black shadow-md transition active:scale-95 cursor-pointer`}
                    >
                      <span>Shop Now</span>
                      <ArrowRight size={14} />
                    </button>
                    {activeCenterSlide.price > 0 && (
                      <div className="text-left">
                        <span className="text-[10px] text-slate-400 block font-bold">Price</span>
                        <span className={`text-base sm:text-lg font-black ${activeCenterSlide.theme.priceColor}`}>
                          ${Number(activeCenterSlide.price).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right product hero image */}
                <div
                  onClick={() => handleBentoClick(activeCenterSlide)}
                  className="relative h-48 w-48 sm:h-56 sm:w-56 lg:h-60 lg:w-60 shrink-0 bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs border border-white/60 dark:border-slate-700/50 flex items-center justify-center cursor-pointer group"
                >
                  <img
                    src={activeCenterSlide.image}
                    alt={activeCenterSlide.title}
                    className="h-full w-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300 rounded-xl animate-fade-in"
                    key={activeCenterSlide.id || heroSlide}
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=700&auto=format&fit=crop&q=85'; }}
                  />
                </div>
              </div>

              {/* Slider Pagination Dots */}
              {bentoPromos.centerSlides.length > 1 && (
                <div className="relative z-10 flex items-center gap-1.5 pt-4">
                  {bentoPromos.centerSlides.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setHeroSlide(idx)}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        (heroSlide % bentoPromos.centerSlides.length) === idx
                          ? 'w-6 bg-slate-900 dark:bg-white'
                          : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: 2 Stacked Cards (3 cols on lg, 6 cols on md) */}
          <div className="md:col-span-6 lg:col-span-3 flex flex-col gap-3.5 sm:gap-4 order-3">
            {/* Card 3 */}
            <div
              onClick={() => handleBentoClick(bentoPromos.card3)}
              className={`group relative flex-1 min-h-[155px] sm:min-h-[165px] rounded-3xl ${bentoPromos.card3.theme.cardBg} border ${bentoPromos.card3.theme.border} p-4 sm:p-5 flex items-center justify-between gap-3 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-0.5`}
            >
              <div className="relative z-10 max-w-[58%] space-y-1">
                <span className={`text-[10px] sm:text-[11px] font-extrabold ${bentoPromos.card3.theme.badgeText} block tracking-wide uppercase`}>
                  {bentoPromos.card3.badge}
                </span>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight line-clamp-2">
                  {bentoPromos.card3.title}
                </h3>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                  {bentoPromos.card3.subtitle}
                </p>
                <div className="pt-2 flex items-baseline gap-1.5 flex-wrap">
                  {bentoPromos.card3.originalPrice && (
                    <span className="text-[10px] text-slate-400 line-through font-medium">
                      ${bentoPromos.card3.originalPrice}
                    </span>
                  )}
                  <span className={`text-xs sm:text-sm font-black ${bentoPromos.card3.theme.priceColor}`}>
                    ${Number(bentoPromos.card3.price || 0).toFixed(2)}
                  </span>
                  {bentoPromos.card3.discount && (
                    <span className={`inline-block text-[9px] font-black ${bentoPromos.card3.theme.discountBg} px-1.5 py-0.5 rounded-md`}>
                      {bentoPromos.card3.discount}
                    </span>
                  )}
                </div>
              </div>
              <div className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 bg-white dark:bg-slate-800 rounded-2xl shadow-xs p-2 flex items-center justify-center border border-white/60 dark:border-slate-700/50 group-hover:scale-105 transition-transform duration-300">
                <img
                  src={bentoPromos.card3.image}
                  alt={bentoPromos.card3.title}
                  className="h-full w-full object-contain drop-shadow-xs rounded-xl"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=400&auto=format&fit=crop&q=80'; }}
                />
              </div>
            </div>

            {/* Card 4 */}
            <div
              onClick={() => handleBentoClick(bentoPromos.card4)}
              className={`group relative flex-1 min-h-[155px] sm:min-h-[165px] rounded-3xl ${bentoPromos.card4.theme.cardBg} border ${bentoPromos.card4.theme.border} p-4 sm:p-5 flex items-center justify-between gap-3 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-0.5`}
            >
              <div className="relative z-10 max-w-[58%] space-y-1">
                <span className={`text-[10px] sm:text-[11px] font-extrabold ${bentoPromos.card4.theme.badgeText} block tracking-wide uppercase`}>
                  {bentoPromos.card4.badge}
                </span>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight line-clamp-2">
                  {bentoPromos.card4.title}
                </h3>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                  {bentoPromos.card4.subtitle}
                </p>
                <div className="pt-2 flex items-baseline gap-1.5 flex-wrap">
                  {bentoPromos.card4.originalPrice && (
                    <span className="text-[10px] text-slate-400 line-through font-medium">
                      ${bentoPromos.card4.originalPrice}
                    </span>
                  )}
                  <span className={`text-xs sm:text-sm font-black ${bentoPromos.card4.theme.priceColor}`}>
                    ${Number(bentoPromos.card4.price || 0).toFixed(2)}
                  </span>
                  {bentoPromos.card4.discount && (
                    <span className={`inline-block text-[9px] font-black ${bentoPromos.card4.theme.discountBg} px-1.5 py-0.5 rounded-md`}>
                      {bentoPromos.card4.discount}
                    </span>
                  )}
                </div>
              </div>
              <div className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 bg-white dark:bg-slate-800 rounded-2xl shadow-xs p-2 flex items-center justify-center border border-white/60 dark:border-slate-700/50 group-hover:scale-105 transition-transform duration-300">
                <img
                  src={bentoPromos.card4.image}
                  alt={bentoPromos.card4.title}
                  className="h-full w-full object-contain drop-shadow-xs rounded-xl"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&auto=format&fit=crop&q=80'; }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Main Storefront Body (Sidebar Filter + Product Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
          {/* Left Category Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6 sticky top-20">
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-1">
                <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                  Categories ({categories.length})
                </h3>
                {isFiltered && (
                  <button
                    type="button"
                    onClick={handleClearAllFilters}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw size={11} />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* Mini Search inside Categories */}
              {categories.length > 6 && (
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search category..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 py-1.5 pl-8 pr-3 text-base md:text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                  {categorySearch && (
                    <button
                      type="button"
                      onClick={() => setCategorySearch('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              )}

              {/* All Products Item with count pill badge */}
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => handleSelectCategory('')}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
                    !selectedCategory && filterType === 'ALL'
                      ? 'bg-emerald-600 text-white shadow-xs font-extrabold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <AllCategoriesIcon size={15} className={!selectedCategory && filterType === 'ALL' ? 'text-white' : 'text-slate-400'} />
                    <span>All Products</span>
                  </span>
                  <span className={`flex h-4 min-w-[18px] items-center justify-center rounded-full px-1.5 text-[9px] font-black ${
                    !selectedCategory && filterType === 'ALL'
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}>
                    {productList.length}
                  </span>
                </button>

                {/* Subcategory Scrollable List with custom icons and product counts */}
                <div className="space-y-0.5 max-h-[46vh] overflow-y-auto pr-1 scrollbar-thin">
                  {filteredCategoryList.map((cat) => {
                    const catName = typeof cat === 'string' ? cat : cat?.name;
                    const catId = typeof cat === 'string' ? cat : cat?.id || catName;
                    if (!catName) return null;
                    const Icon = getCategoryIcon(catName);
                    const active = selectedCategory === catName;
                    const count = categoryCounts[catName];

                    return (
                      <button
                        key={catId}
                        type="button"
                        onClick={() => handleSelectCategory(catName)}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer group ${
                          active
                            ? 'bg-emerald-600 text-white shadow-xs font-extrabold'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <span className="flex items-center gap-2.5 min-w-0 truncate">
                          <Icon
                            size={15}
                            className={`shrink-0 transition-transform group-hover:scale-110 ${
                              active ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                            }`}
                          />
                          <span className="truncate">{catName}</span>
                        </span>
                        {count !== undefined && count > 0 && (
                          <span className={`ml-1 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-black shrink-0 ${
                            active
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}>
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Secondary Filter Sections: New Arrival, Best Seller, On Discount */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-3 shadow-2xs space-y-1">
              <button
                type="button"
                onClick={() => setFilterType(filterType === 'NEW' ? 'ALL' : 'NEW')}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition cursor-pointer ${
                  filterType === 'NEW'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Sparkles size={15} className="text-emerald-500" />
                  <span>New Arrival</span>
                </span>
                <ChevronRight size={13} className="text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => setFilterType(filterType === 'BEST_SELLER' ? 'ALL' : 'BEST_SELLER')}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition cursor-pointer ${
                  filterType === 'BEST_SELLER'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <TrendingUp size={15} className="text-blue-500" />
                  <span>Best Seller</span>
                </span>
                <ChevronRight size={13} className="text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => setFilterType(filterType === 'DISCOUNT' ? 'ALL' : 'DISCOUNT')}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition cursor-pointer ${
                  filterType === 'DISCOUNT'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Percent size={15} className="text-rose-500" />
                  <span>On Discount</span>
                </span>
                <ChevronRight size={13} className="text-slate-400" />
              </button>
            </div>
          </aside>

          {/* Right Product Grid Area */}
          <div className="lg:col-span-9 space-y-5">
            {/* Quick Category Chip Carousel on Top */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
              <button
                type="button"
                onClick={() => handleSelectCategory('')}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition shrink-0 cursor-pointer ${
                  !selectedCategory && filterType === 'ALL'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                    : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <AllCategoriesIcon size={13} />
                <span>All ({productList.length})</span>
              </button>
              {categories.slice(0, 12).map((cat) => {
                const catName = typeof cat === 'string' ? cat : cat?.name;
                if (!catName) return null;
                const Icon = getCategoryIcon(catName);
                const active = selectedCategory === catName;
                const count = categoryCounts[catName];

                return (
                  <button
                    key={catName}
                    type="button"
                    onClick={() => handleSelectCategory(catName)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition shrink-0 cursor-pointer ${
                      active
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <Icon size={13} />
                    <span>{catName}</span>
                    {count !== undefined && count > 0 && (
                      <span className={`text-[10px] px-1 rounded-full font-bold ${active ? 'bg-white/20 text-white' : 'text-slate-400'}`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Top Toolbar (Sort & Mobile filter trigger) */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-500">
                Showing <strong className="text-slate-900 dark:text-white">{filteredProducts.length}</strong> products
              </span>

              <div className="flex items-center gap-2">
                {/* Mobile Filter trigger */}
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  <SlidersHorizontal size={14} />
                  <span>Category ({selectedCategory || 'All'})</span>
                </button>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="DEFAULT">Recommended</option>
                  <option value="PRICE_ASC">Price: Low to High</option>
                  <option value="PRICE_DESC">Price: High to Low</option>
                  <option value="NAME">Name: A to Z</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col rounded-xl bg-slate-100 dark:bg-slate-800/50 p-3 animate-pulse h-56 justify-between"
                  >
                    <div className="aspect-[4/3] w-full rounded-lg bg-slate-200 dark:bg-slate-700" />
                    <div className="space-y-2 mt-2">
                      <div className="h-3.5 w-3/4 rounded-md bg-slate-200 dark:bg-slate-700" />
                      <div className="h-3.5 w-1/3 rounded-md bg-slate-200 dark:bg-slate-700" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center">
                <PackageX size={44} className="text-slate-300 mb-3" />
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">No products found</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  We could not find any products matching your selected category or search filter.
                </p>
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="mt-4 rounded-full bg-[#18181B] text-white px-5 py-2 text-xs font-bold hover:bg-black transition"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    cartQuantity={cartQuantities.get(product.id) || 0}
                    onAdd={(p) => addItem(p, 1)}
                    onSetQuantity={(pid, q) => setQuantity(pid, q)}
                    onRemove={(pid) => removeItem(pid)}
                  />
                ))}
              </div>
            )}

            {/* 3. Clean Numbered Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 sm:gap-2 pt-6">
                <button
                  type="button"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                >
                  <ArrowLeft size={13} />
                  <span>Previous</span>
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((pNum) => (
                  <button
                    key={pNum}
                    type="button"
                    onClick={() => setPage(pNum)}
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition cursor-pointer ${
                      page === pNum
                        ? 'bg-[#18181B] text-white'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    {pNum}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                >
                  <span>Next</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 4. Section: Explore our recomendations (Horizontal Slider with Left/Right Arrows) */}
        {recommendations.length > 0 && (
          <section className="pt-10 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Explore our recomendations
              </h2>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollRecommendations('left')}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-90 cursor-pointer"
                  aria-label="Scroll left"
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollRecommendations('right')}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-90 cursor-pointer"
                  aria-label="Scroll right"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            <div
              ref={recommendationsRef}
              className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory"
            >
              {recommendations.map((prod) => (
                <div key={prod.id} className="w-64 sm:w-72 shrink-0 snap-start">
                  <ProductCard
                    product={prod}
                    cartQuantity={cartQuantities.get(prod.id) || 0}
                    onAdd={(p) => addItem(p, 1)}
                    onSetQuantity={(pid, q) => setQuantity(pid, q)}
                    onRemove={(pid) => removeItem(pid)}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. CTA Newsletter Banner: "Ready to Get Our New Stuff?" */}
        <section className="rounded-3xl bg-[#18181B] text-white p-6 sm:p-10 shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-4 max-w-md text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Ready to Get<br />Our New Stuff?
              </h2>

              <form onSubmit={handleSubscribe} className="flex items-center rounded-full bg-white p-1 pl-4 shadow-md w-full sm:w-80">
                <input
                  type="email"
                  required
                  placeholder="Your Email"
                  value={emailSubscribe}
                  onChange={(e) => setEmailSubscribe(e.target.value)}
                  className="w-full bg-transparent text-base sm:text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-full bg-[#18181B] px-5 py-2 text-xs font-bold text-white hover:bg-black transition cursor-pointer shrink-0"
                >
                  {subscribed ? 'Sent!' : 'Send'}
                </button>
              </form>
            </div>

            <div className="text-center md:text-right max-w-xs text-xs text-slate-400 space-y-2">
              <p className="font-bold text-slate-200">
                Mart System for Homes and Needs
              </p>
              <p>
                We provide high quality retail goods, grocery supplies, and drinks with instant Bakong KHQR QR payment.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Mobile Category Bottom Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-xs lg:hidden animate-fade-in" onClick={() => setMobileFilterOpen(false)}>
          <div
            className="w-full max-h-[85vh] flex flex-col overflow-hidden rounded-t-3xl bg-white dark:bg-slate-900 p-5 space-y-3 shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile drag handle bar */}
            <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700 mx-auto -mt-1 mb-1 shrink-0" />

            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Categories
                </h3>
                <p className="text-xs text-slate-400">
                  Select a category to filter products
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Mobile Category Search */}
            <div className="relative shrink-0">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search category..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 py-2 pl-9 pr-3 text-base sm:text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Scrollable category list */}
            <div className="flex-1 overflow-y-auto space-y-1 pr-1 pb-4">
              <button
                type="button"
                onClick={() => {
                  handleSelectCategory('');
                  setMobileFilterOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition cursor-pointer ${
                  !selectedCategory
                    ? 'bg-emerald-600 text-white shadow-xs font-extrabold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <AllCategoriesIcon size={16} className={!selectedCategory ? 'text-white' : 'text-slate-400'} />
                  <span>All Products</span>
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                  !selectedCategory ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {productList.length}
                </span>
              </button>

              {filteredCategoryList.map((cat) => {
                const catName = typeof cat === 'string' ? cat : cat?.name;
                if (!catName) return null;
                const Icon = getCategoryIcon(catName);
                const active = selectedCategory === catName;
                const count = categoryCounts[catName];

                return (
                  <button
                    key={catName}
                    type="button"
                    onClick={() => {
                      handleSelectCategory(catName);
                      setMobileFilterOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition cursor-pointer ${
                      active
                        ? 'bg-emerald-600 text-white shadow-xs font-extrabold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      <Icon size={16} className={active ? 'text-white' : 'text-slate-400'} />
                      <span className="truncate">{catName}</span>
                    </span>
                    {count !== undefined && count > 0 && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                        active ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
