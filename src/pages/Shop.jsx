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
import { getCategoryIcon, AllCategoriesIcon } from '../utils/categoryIcons';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';

  const [search, setSearch] = useState(searchParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'NEW', 'BEST_SELLER', 'DISCOUNT'
  const [sortBy, setSortBy] = useState('DEFAULT'); // 'DEFAULT', 'PRICE_ASC', 'PRICE_DESC', 'NAME'
  const [inStockOnly, setInStockOnly] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [emailSubscribe, setEmailSubscribe] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const recommendationsRef = useRef(null);
  const navigate = useNavigate();

  const { categories } = useCategories();
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

  const isFiltered = Boolean(search || selectedCategory || inStockOnly || filterType !== 'ALL' || sortBy !== 'DEFAULT');

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-20">
      <SEO
        title="Shop All Products | Mart System"
        description="Browse all products with clean design, filter by categories, and pay with Bakong KHQR."
        canonical="/shop"
      />

      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-8">
        {/* 1. Hero Header Banner with Giant 'Shop' Typography */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white min-h-[260px] sm:min-h-[320px] flex flex-col justify-between p-6 sm:p-10 shadow-lg border border-slate-800">
          {/* Background overlay with image */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=1600&auto=format&fit=crop')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent" />

          {/* Centered Giant Typography */}
          <div className="relative z-10 flex flex-1 items-center justify-center">
            <h1 className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tight text-white/95 select-none drop-shadow-md">
              Shop
            </h1>
          </div>

          {/* Bottom Attached Bar: [ Give All You Need ] + [ Floating Search Pill ] */}
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
            <div className="text-center md:text-left">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                Give All You Need
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                Premium retail products with instant Bakong KHQR checkout
              </p>
            </div>

            {/* Floating Capsule Search Bar */}
            <form onSubmit={handleSearchSubmit} className="w-full md:w-auto">
              <div className="flex items-center rounded-full bg-white dark:bg-slate-800 p-1 pl-4 shadow-xl border border-slate-200 dark:border-slate-700 w-full sm:w-80">
                <Search size={15} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search on Mart System..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent px-3 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-full bg-[#18181B] dark:bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-black transition cursor-pointer shrink-0"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* 2. Main Storefront Body (Sidebar Filter + Product Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
          {/* Left Category Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6 sticky top-20">
            <div>
              <div className="flex items-center justify-between pb-3">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Category
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

              {/* All Products Item with count pill badge */}
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => handleSelectCategory('')}
                  className={`flex w-full items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-bold transition cursor-pointer ${
                    !selectedCategory && filterType === 'ALL'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <AllCategoriesIcon size={16} className="text-slate-400" />
                    <span>All Product</span>
                  </span>
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-black text-white">
                    {productList.length}
                  </span>
                </button>

                {/* Subcategory List with clean outline icons */}
                {categories.map((cat) => {
                  const catName = typeof cat === 'string' ? cat : cat?.name;
                  const catId = typeof cat === 'string' ? cat : cat?.id || catName;
                  if (!catName) return null;
                  const Icon = getCategoryIcon(catName);
                  const active = selectedCategory === catName;

                  return (
                    <button
                      key={catId}
                      type="button"
                      onClick={() => handleSelectCategory(catName)}
                      className={`flex w-full items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-bold transition cursor-pointer ${
                        active
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
                      }`}
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        <Icon size={16} className={active ? 'text-slate-900 dark:text-white' : 'text-slate-400'} />
                        <span className="truncate">{catName}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Secondary Filter Sections: New Arrival, Best Seller, On Discount */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-1">
              <button
                type="button"
                onClick={() => setFilterType(filterType === 'NEW' ? 'ALL' : 'NEW')}
                className={`flex w-full items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-bold transition cursor-pointer ${
                  filterType === 'NEW'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Sparkles size={16} className="text-slate-400" />
                  <span>New Arrival</span>
                </span>
                <ChevronRight size={14} className="text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => setFilterType(filterType === 'BEST_SELLER' ? 'ALL' : 'BEST_SELLER')}
                className={`flex w-full items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-bold transition cursor-pointer ${
                  filterType === 'BEST_SELLER'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <TrendingUp size={16} className="text-slate-400" />
                  <span>Best Seller</span>
                </span>
                <ChevronRight size={14} className="text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => setFilterType(filterType === 'DISCOUNT' ? 'ALL' : 'DISCOUNT')}
                className={`flex w-full items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-bold transition cursor-pointer ${
                  filterType === 'DISCOUNT'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Percent size={16} className="text-slate-400" />
                  <span>On Discount</span>
                </span>
                <ChevronRight size={14} className="text-slate-400" />
              </button>
            </div>
          </aside>

          {/* Right Product Grid Area */}
          <div className="lg:col-span-9 space-y-6">
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
                  <span>Category</span>
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col rounded-3xl bg-slate-100 dark:bg-slate-800/50 p-4 animate-pulse h-72 justify-between"
                  >
                    <div className="aspect-square w-full rounded-2xl bg-slate-200 dark:bg-slate-700" />
                    <div className="space-y-2 mt-3">
                      <div className="h-4 w-3/4 rounded-md bg-slate-200 dark:bg-slate-700" />
                      <div className="h-4 w-1/3 rounded-md bg-slate-200 dark:bg-slate-700" />
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
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
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
                  className="w-full bg-transparent text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
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
        <div className="fixed inset-0 z-50 flex items-end bg-black/50 backdrop-blur-xs lg:hidden animate-fade-in">
          <div className="w-full max-h-[80vh] overflow-y-auto rounded-t-3xl bg-white dark:bg-slate-900 p-6 space-y-4 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Select Category
              </h3>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  handleSelectCategory('');
                  setMobileFilterOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-xs font-bold ${
                  !selectedCategory ? 'bg-slate-100 dark:bg-slate-800 text-slate-900' : 'text-slate-600'
                }`}
              >
                <span>All Products</span>
                <span className="rounded-full bg-rose-500 text-white px-2 py-0.5 text-[10px] font-bold">
                  {productList.length}
                </span>
              </button>

              {categories.map((cat) => {
                const catName = typeof cat === 'string' ? cat : cat?.name;
                if (!catName) return null;
                const active = selectedCategory === catName;
                return (
                  <button
                    key={catName}
                    type="button"
                    onClick={() => {
                      handleSelectCategory(catName);
                      setMobileFilterOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-xs font-bold ${
                      active ? 'bg-slate-100 dark:bg-slate-800 text-slate-900' : 'text-slate-600'
                    }`}
                  >
                    <span>{catName}</span>
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
