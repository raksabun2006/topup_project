import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, useParams, Link, useNavigate } from 'react-router-dom';
import {
  Search, SlidersHorizontal, ArrowUpDown, X, PackageX, ChevronLeft,
  ChevronRight, ChevronDown, Tag, Check, Filter, RotateCcw, Sparkles, TrendingUp,
  Percent, ArrowRight, ArrowLeft, Send, Home as HomeIcon, Smartphone,
  Headphones, HardDrive, ShoppingBag, Star
} from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';
import { env } from '../config/env';
import { getCategoryIcon, AllCategoriesIcon, getCategoryTheme } from '../utils/categoryIcons';
import { useActiveDiscounts } from '../hooks/useDiscounts';

const SORT_OPTIONS = [
  { value: 'DEFAULT', label: 'Recommended' },
  { value: 'NEWEST', label: 'Newest' },
  { value: 'PRICE_ASC', label: 'Price: Low to High' },
  { value: 'PRICE_DESC', label: 'Price: High to Low' },
  { value: 'BEST_SELLER', label: 'Best Selling' },
  { value: 'RATING_DESC', label: 'Highest Rated' },
  { value: 'NAME', label: 'Name: A to Z' },
];

const SEARCH_HISTORY_KEY = 'mart_search_history';

function getStoredSearchHistory() {
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function addStoredSearchHistory(term) {
  if (!term || !term.trim()) return;
  try {
    const clean = term.trim();
    const current = getStoredSearchHistory().filter((t) => t.toLowerCase() !== clean.toLowerCase());
    const next = [clean, ...current].slice(0, 6);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export default function Shop() {
  const { categoryName: routeCategory } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const sortParam = searchParams.get('sort') || 'DEFAULT';
  const inStockParam = searchParams.get('inStock') === 'true';
  const ratingParam = Number(searchParams.get('rating')) || 0;

  const [search, setSearch] = useState(searchParam);
  const [selectedCategory, setSelectedCategory] = useState(() => (
    routeCategory ? decodeURIComponent(routeCategory) : categoryParam
  ));
  const [minPrice, setMinPrice] = useState(minPriceParam);
  const [maxPrice, setMaxPrice] = useState(maxPriceParam);
  const [categorySearch, setCategorySearch] = useState('');
  const [heroSlide, setHeroSlide] = useState(0);
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'NEW', 'BEST_SELLER', 'DISCOUNT'
  const [sortBy, setSortBy] = useState(sortParam);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(inStockParam);
  const [minRating, setMinRating] = useState(ratingParam);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState(getStoredSearchHistory);
  const [emailSubscribe, setEmailSubscribe] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const recommendationsRef = useRef(null);
  const sortContainerRef = useRef(null);
  const navigate = useNavigate();

  const { categories } = useCategories();
  const { discounts: activeDiscounts } = useActiveDiscounts();
  const { products, loading, error, page, setPage, totalPages, reload } = useProducts({
    category: selectedCategory || undefined,
  });
  const { items, addItem, setQuantity, removeItem } = useCart();

  // Close custom sort dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortContainerRef.current && !sortContainerRef.current.contains(e.target)) {
        setSortMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (routeCategory) {
      setSelectedCategory(decodeURIComponent(routeCategory));
    } else {
      setSelectedCategory(categoryParam);
    }
  }, [routeCategory, categoryParam]);

  useEffect(() => {
    setSearch(searchParam);
  }, [searchParam]);

  useEffect(() => {
    setMinPrice(minPriceParam);
    setMaxPrice(maxPriceParam);
    setInStockOnly(inStockParam);
    setMinRating(ratingParam);
    setSortBy(sortParam);
  }, [minPriceParam, maxPriceParam, inStockParam, ratingParam, sortParam]);

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

  const recommendations = useMemo(() => {
    return productList.slice(0, 10);
  }, [productList]);

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

  // Client-side multi-facet filtering & sorting
  const filteredProducts = useMemo(() => {
    let list = [...productList];
    const q = search.trim().toLowerCase();

    // Multi-attribute search (Name, SKU, Barcode, Category, Description)
    if (q) {
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.barcode?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    // Availability Filter
    if (inStockOnly) {
      list = list.filter((p) => (p.stockQuantity ?? 0) > 0);
    }

    // Price Range Filter
    const minVal = Number(minPrice);
    if (!isNaN(minVal) && minVal > 0) {
      list = list.filter((p) => (Number(p.price) || 0) >= minVal);
    }
    const maxVal = Number(maxPrice);
    if (!isNaN(maxVal) && maxVal > 0) {
      list = list.filter((p) => (Number(p.price) || 0) <= maxVal);
    }

    // Rating Filter
    if (minRating > 0) {
      list = list.filter((p) => (p.rating || 5) >= minRating);
    }

    // Secondary Filter Tabs
    if (filterType === 'DISCOUNT') {
      list = list.filter((p) => Number(p.price) < 10 || p.discount || p.discountPercent);
    } else if (filterType === 'NEW') {
      list = list.filter((p) => p.badge === 'NEW' || p.badge === 'NEW ARRIVAL');
    } else if (filterType === 'BEST_SELLER') {
      list = list.filter((p) => p.badge === 'BEST SELLER' || p.badge === 'POPULAR');
    }

    // Sorting
    if (sortBy === 'PRICE_ASC') {
      list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (sortBy === 'PRICE_DESC') {
      list.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    } else if (sortBy === 'NAME') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'NEWEST') {
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sortBy === 'BEST_SELLER') {
      list.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
    } else if (sortBy === 'RATING_DESC') {
      list.sort((a, b) => (b.rating || 5) - (a.rating || 5));
    }

    return list;
  }, [productList, search, inStockOnly, minPrice, maxPrice, minRating, filterType, sortBy]);

  const updateUrlFilters = (updates = {}) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val !== null && val !== undefined && val !== '' && val !== false && val !== 0 && val !== 'DEFAULT') {
        next.set(key, String(val));
      } else {
        next.delete(key);
      }
    });
    setSearchParams(next, { replace: true });
  };

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setFilterType('ALL');
    updateUrlFilters({ category: cat });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      addStoredSearchHistory(search.trim());
      setSearchHistory(getStoredSearchHistory());
    }
    updateUrlFilters({ search: search.trim() });
  };

  const handleApplyPriceFilter = (min, max) => {
    setMinPrice(min);
    setMaxPrice(max);
    updateUrlFilters({ minPrice: min, maxPrice: max });
  };

  const handleToggleInStock = (checked) => {
    setInStockOnly(checked);
    updateUrlFilters({ inStock: checked });
  };

  const handleSelectRating = (rating) => {
    const next = minRating === rating ? 0 : rating;
    setMinRating(next);
    updateUrlFilters({ rating: next });
  };

  const handleSelectSort = (sortVal) => {
    setSortBy(sortVal);
    setSortMenuOpen(false);
    updateUrlFilters({ sort: sortVal });
  };

  const handleClearAllFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setMinRating(0);
    setFilterType('ALL');
    setSortBy('DEFAULT');
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
  const baseSiteUrl = (env.siteUrl || 'https://martsystemkh.software').replace(/\/+$/, '');
  const dynamicTitle = selectedCategory
    ? `${selectedCategory} - Buy Online | Mart System Cambodia`
    : search
      ? `Search results for "${search}" | Mart System`
      : 'Shop All Groceries & Products | Mart System Online Store';

  const dynamicDescription = selectedCategory
    ? `Explore our wide selection of ${selectedCategory} products at Mart System with $1.50 express delivery in Phnom Penh and seamless Bakong KHQR checkout.`
    : search
      ? `Found ${filteredProducts.length} results for "${search}". Buy online at Mart System with instant KHQR payment.`
      : 'Browse all grocery essentials, beverages, snacks, fresh food and home items in Mart System. Filter by category, enjoy $1.50 express delivery, and pay with Bakong KHQR.';

  const dynamicCanonical = selectedCategory
    ? `/shop?category=${encodeURIComponent(selectedCategory)}`
    : '/shop';

  const dynamicJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": dynamicTitle,
    "description": dynamicDescription,
    "url": `${baseSiteUrl}${dynamicCanonical}`,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": filteredProducts.length,
      "itemListElement": filteredProducts.slice(0, 12).map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `${baseSiteUrl}/product/${item.id}`,
        "name": item.name,
        "image": item.imageUrl || `${baseSiteUrl}/mart.jpg`
      }))
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-12">
      <SEO
        title={dynamicTitle}
        description={dynamicDescription}
        keywords={
          selectedCategory
            ? `${selectedCategory}, Buy ${selectedCategory} Online, Mart System, Cambodia Grocery, Bakong KHQR`
            : "Shop Groceries, Buy Drinks Online, Mart System Shop, Cambodia E-Commerce, Bakong KHQR Online Mart, Fast Delivery Groceries Phnom Penh"
        }
        canonical={dynamicCanonical}
        ogImage="/mart.jpg"
        robots={search ? 'noindex, follow' : 'index, follow'}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Shop', url: '/shop' },
          ...(selectedCategory ? [{ name: selectedCategory, url: `/shop?category=${encodeURIComponent(selectedCategory)}` }] : []),
        ]}
        jsonLd={dynamicJsonLd}
      />

      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6">
        {/* Semantic SEO Header & Breadcrumbs */}
        <header className="space-y-1.5 pb-1">
          <nav aria-label="Breadcrumb Navigation" className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <Link to="/" className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors">Shop</Link>
            {selectedCategory && (
              <>
                <span>/</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">{selectedCategory}</span>
              </>
            )}
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {selectedCategory
                ? selectedCategory
                : search
                ? `Results for "${search}"`
                : 'Shop All Products & Groceries'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {selectedCategory
                ? `Explore quality ${selectedCategory} products with $1.50 express delivery in Phnom Penh.`
                : 'Fresh groceries, drinks, snacks, and daily items delivered fast across Cambodia.'}
            </p>
          </div>
        </header>

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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 select-none">
          {/* Left Column: 2 Stacked Cards (Desktop only ≥ lg) */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-3.5 sm:gap-4 order-2 lg:order-1">
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

          {/* Center Column: Main Featured Showcase Slider (Full width on mobile/tablet, 6 cols on lg) */}
          <div className="col-span-1 lg:col-span-6 order-1 lg:order-2">
            <div className={`relative min-h-[160px] sm:min-h-[200px] lg:min-h-[350px] h-full rounded-2xl sm:rounded-3xl ${activeCenterSlide.theme.cardBg} border ${activeCenterSlide.theme.border} p-3.5 sm:p-6 lg:p-8 flex flex-col justify-between overflow-hidden shadow-xs`}>
              {/* Decorative subtle background circle */}
              <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-44 h-44 sm:w-80 sm:h-80 rounded-full ${activeCenterSlide.theme.glow} blur-2xl pointer-events-none`} />

              <div className="relative z-10 flex flex-row items-center justify-between gap-3 sm:gap-6 h-full">
                {/* Left text content */}
                <div className="space-y-1.5 sm:space-y-3 max-w-[62%] sm:max-w-sm text-left">
                  <span className={`inline-block text-[9px] sm:text-[11px] font-extrabold uppercase tracking-widest ${activeCenterSlide.theme.badgeText}`}>
                    {activeCenterSlide.tag}
                  </span>
                  <h2 className="text-xs sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight line-clamp-2">
                    {activeCenterSlide.title}
                  </h2>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-1 sm:line-clamp-2">
                    {activeCenterSlide.subtitle}
                  </p>
                  <div className="pt-1 sm:pt-2 flex items-center gap-2 sm:gap-3 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleBentoClick(activeCenterSlide)}
                      className={`inline-flex items-center gap-1.5 rounded-xl ${activeCenterSlide.theme.buttonBg} px-3 sm:px-5 py-1.5 sm:py-2.5 text-[10px] sm:text-xs font-black shadow-md transition active:scale-95 cursor-pointer`}
                    >
                      <span>Shop Now</span>
                      <ArrowRight size={12} />
                    </button>
                    {activeCenterSlide.price > 0 && (
                      <div className="text-left">
                        <span className="text-[8px] sm:text-[10px] text-slate-400 block font-bold">Price</span>
                        <span className={`text-xs sm:text-base font-black ${activeCenterSlide.theme.priceColor}`}>
                          ${Number(activeCenterSlide.price).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right product hero image */}
                <div
                  onClick={() => handleBentoClick(activeCenterSlide)}
                  className="relative h-24 w-24 sm:h-36 sm:w-36 lg:h-56 lg:w-56 shrink-0 bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-2 sm:p-4 shadow-xs border border-white/60 dark:border-slate-700/50 flex items-center justify-center cursor-pointer group"
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
                <div className="relative z-10 flex items-center gap-1 sm:gap-1.5 pt-2 sm:pt-4">
                  {bentoPromos.centerSlides.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setHeroSlide(idx)}
                      className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        (heroSlide % bentoPromos.centerSlides.length) === idx
                          ? 'w-4 sm:w-6 bg-slate-900 dark:bg-white'
                          : 'w-1.5 sm:w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: 2 Stacked Cards (Desktop only ≥ lg) */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-3.5 sm:gap-4 order-3">
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

            {/* Price Range Filter Panel */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-1">
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Price Range
                </h3>
                {(minPrice || maxPrice) && (
                  <button
                    type="button"
                    onClick={() => handleApplyPriceFilter('', '')}
                    className="text-[11px] text-rose-500 hover:underline font-bold cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Price Preset Chips */}
              <div className="grid grid-cols-2 gap-1.5 text-[11px] font-bold">
                {[
                  { label: 'Under $10', min: '', max: '10' },
                  { label: '$10 - $25', min: '10', max: '25' },
                  { label: '$25 - $50', min: '25', max: '50' },
                  { label: '$50+', min: '50', max: '' },
                ].map((preset) => {
                  const active = minPrice === preset.min && maxPrice === preset.max;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleApplyPriceFilter(preset.min, preset.max)}
                      className={`py-1.5 px-2 rounded-xl text-center transition cursor-pointer ${
                        active
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              {/* Custom Min / Max Inputs */}
              <div className="flex items-center gap-2 pt-1">
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-2 text-[11px] font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 py-1.5 pl-6 pr-2 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <span className="text-slate-400 font-bold text-xs">-</span>
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-2 text-[11px] font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 py-1.5 pl-6 pr-2 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleApplyPriceFilter(minPrice, maxPrice)}
                  className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-1.5 text-xs font-bold hover:opacity-90 transition cursor-pointer shrink-0"
                >
                  Go
                </button>
              </div>
            </div>

            {/* Availability & Rating Filter Panel */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-4 shadow-2xs space-y-3">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider pb-1">
                Availability & Rating
              </h3>

              {/* In Stock Only Checkbox */}
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => handleToggleInStock(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span>In Stock Only</span>
              </label>

              {/* Rating Filters */}
              <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handleSelectRating(4)}
                  className={`flex w-full items-center justify-between py-1.5 px-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    minRating === 4
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-extrabold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <span className="flex items-center gap-1.5 text-amber-500">
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    <span className="text-slate-700 dark:text-slate-300 text-[11px] font-semibold ml-1">& Up</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectRating(3)}
                  className={`flex w-full items-center justify-between py-1.5 px-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    minRating === 3
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-extrabold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <span className="flex items-center gap-1.5 text-amber-500">
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    <span className="text-slate-700 dark:text-slate-300 text-[11px] font-semibold ml-1">& Up</span>
                  </span>
                </button>
              </div>
            </div>
          </aside>

          {/* Right Product Grid Area */}
          <div className="lg:col-span-9 space-y-5">
            {/* Quick Category Chip Carousel on Top */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 scrollbar-none -mx-1 px-1">
              <button
                type="button"
                onClick={() => handleSelectCategory('')}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition shrink-0 cursor-pointer ${
                  !selectedCategory && filterType === 'ALL'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs font-extrabold'
                    : 'border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <AllCategoriesIcon size={13} />
                <span>All ({productList.length})</span>
              </button>
              {categories.slice(0, 15).map((cat) => {
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
                        ? 'bg-emerald-600 text-white shadow-xs font-extrabold'
                        : 'border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <Icon size={13} />
                    <span>{catName}</span>
                    {count !== undefined && count > 0 && (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${active ? 'bg-white/25 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Top Toolbar (Sort & Mobile filter trigger) */}
            <div className="flex items-center justify-between gap-2 pt-0.5 pb-1">
              <div className="flex items-baseline gap-1 text-xs text-slate-500">
                <span className="text-[11px] text-slate-400 hidden xs:inline">Showing</span>
                <strong className="text-slate-900 dark:text-white font-extrabold text-xs sm:text-sm">{filteredProducts.length}</strong>
                <span className="text-slate-500 text-xs font-semibold">products</span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Mobile Filter trigger */}
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-1 rounded-full border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-200 shadow-2xs"
                >
                  <SlidersHorizontal size={12} className="text-emerald-500" />
                  <span className="max-w-[80px] truncate">{selectedCategory || 'All'}</span>
                </button>

                {/* Custom Sort Dropdown (Replaces native select) */}
                <div ref={sortContainerRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setSortMenuOpen(!sortMenuOpen)}
                    aria-expanded={sortMenuOpen}
                    aria-haspopup="listbox"
                    className="flex items-center gap-1.5 rounded-full border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800 transition active:scale-95 cursor-pointer"
                  >
                    <span>{SORT_OPTIONS.find((o) => o.value === sortBy)?.label || 'Recommended'}</span>
                    <ChevronDown size={12} className={`text-slate-400 transition-transform duration-200 ${sortMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {sortMenuOpen && (
                    <div
                      role="listbox"
                      className="absolute right-0 top-full mt-1.5 z-40 w-48 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1.5 shadow-xl animate-scale-in space-y-0.5"
                    >
                      {SORT_OPTIONS.map((opt) => {
                        const active = sortBy === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            role="option"
                            aria-selected={active}
                            onClick={() => {
                              setSortBy(opt.value);
                              setSortMenuOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition cursor-pointer ${
                              active
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-extrabold'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                            }`}
                          >
                            <span>{opt.label}</span>
                            {active && <Check size={13} className="text-emerald-600 dark:text-emerald-400" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
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

      {/* Mobile Multi-Facet Filter Bottom Sheet */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-xs lg:hidden animate-fade-in" onClick={() => setMobileFilterOpen(false)}>
          <div
            className="w-full max-h-[85vh] flex flex-col overflow-hidden rounded-t-3xl bg-white dark:bg-slate-900 p-5 space-y-4 shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile drag handle bar */}
            <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700 mx-auto -mt-1 mb-1 shrink-0" />

            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Filter Products
                </h3>
                <p className="text-xs text-slate-400">
                  {filteredProducts.length} items matching
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isFiltered && (
                  <button
                    type="button"
                    onClick={handleClearAllFilters}
                    className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Scrollable Filter Content */}
            <div className="flex-1 overflow-y-auto space-y-5 pr-1 pb-4">
              {/* 1. Price Range Section */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Price Range
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  {[
                    { label: 'Under $10', min: '', max: '10' },
                    { label: '$10 - $25', min: '10', max: '25' },
                    { label: '$25 - $50', min: '25', max: '50' },
                    { label: '$50+', min: '50', max: '' },
                  ].map((preset) => {
                    const active = minPrice === preset.min && maxPrice === preset.max;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handleApplyPriceFilter(preset.min, preset.max)}
                        className={`py-2 px-2.5 rounded-xl text-center transition cursor-pointer ${
                          active
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min $"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 py-2 px-3 text-xs font-bold text-slate-900 dark:text-white"
                  />
                  <span className="text-slate-400 font-bold">-</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max $"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 py-2 px-3 text-xs font-bold text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyPriceFilter(minPrice, maxPrice)}
                    className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 text-xs font-bold shrink-0 cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* 2. In Stock & Rating */}
              <div className="space-y-2.5 border-t border-slate-100 dark:border-slate-800 pt-3">
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Availability & Rating
                </h4>
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => handleToggleInStock(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span>In Stock Only</span>
                </label>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleSelectRating(4)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      minRating === 4
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    <span>4★ & Up</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectRating(3)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      minRating === 3
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    <span>3★ & Up</span>
                  </button>
                </div>
              </div>

              {/* 3. Categories List */}
              <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Categories
                </h4>
                <div className="space-y-1">
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

            {/* Bottom Apply Bar */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 shrink-0">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white py-3 text-xs font-black shadow-md transition active:scale-98 cursor-pointer"
              >
                View {filteredProducts.length} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
