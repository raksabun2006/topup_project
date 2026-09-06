import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, ArrowRight, ChevronRight, Package, Truck,
  ShieldCheck, QrCode, Layers, Sparkles, AlertCircle
} from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';
import { formatCurrency } from '../utils/format';
import { getCategoryIcon, AllCategoriesIcon } from '../utils/categoryIcons';
import { env } from '../config/env';

export default function Home() {
  const { products, loading, error } = useProducts({ page: 0, size: 40 });
  const { categories } = useCategories();
  const { items, addItem, setQuantity, removeItem } = useCart();
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('');
  const navigate = useNavigate();

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

  // Dynamic products from API for hero grid
  const heroMain = productList[0] || null;
  const heroPromo1 = productList[1] || null;
  const heroPromo2 = productList[2] || null;
  const heroMini1 = productList[3] || null;
  const heroMini2 = productList[4] || null;

  // Filter products by selected category tab
  const filteredBestSellers = useMemo(() => {
    if (!selectedCategoryTab) return productList.slice(0, 10);
    return productList.filter((p) => p.category === selectedCategoryTab);
  }, [productList, selectedCategoryTab]);

  const remainingProducts = useMemo(() => {
    return productList.slice(10, 20);
  }, [productList]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-20">
      <SEO
        title={`${env.appName || 'Mart System'} | Official Online Store`}
        description="Shop fresh everyday groceries, drinks, and products with $1.50 delivery and Bakong KHQR checkout."
        canonical="/"
      />

      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-8">
        {/* 1. Hero Mega Grid Section (100% Real API Data) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left Real Categories List */}
          <aside className="hidden lg:block lg:col-span-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-2xs sticky top-24">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 px-2 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span>Categories</span>
              <span className="text-[10px] text-blue-600 font-bold">{categories.length}</span>
            </h3>
            <ul className="space-y-1 pt-2 max-h-[380px] overflow-y-auto pr-1">
              <li>
                <Link
                  to="/shop"
                  className="flex items-center justify-between rounded-xl px-2.5 py-2 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 transition text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  <span className="flex items-center gap-2">
                    <AllCategoriesIcon size={15} className="text-blue-600" />
                    <span>All Products</span>
                  </span>
                  <ChevronRight size={13} className="text-slate-300" />
                </Link>
              </li>

              {categories.map((cat) => {
                const catName = typeof cat === 'string' ? cat : cat?.name;
                const catId = typeof cat === 'string' ? cat : cat?.id || catName;
                if (!catName) return null;
                const Icon = getCategoryIcon(catName);

                return (
                  <li key={catId}>
                    <Link
                      to={`/shop?category=${encodeURIComponent(catName)}`}
                      className="flex items-center justify-between rounded-xl px-2.5 py-2 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 transition text-xs font-bold text-slate-700 dark:text-slate-300"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Icon size={15} className="text-slate-400 shrink-0" />
                        <span className="truncate">{catName}</span>
                      </span>
                      <ChevronRight size={13} className="text-slate-300 shrink-0" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* Center Main Featured Product from API */}
          <div className="lg:col-span-6 space-y-4">
            {heroMain ? (
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white p-6 sm:p-8 min-h-[260px] flex flex-col justify-between shadow-md">
                <div className="relative z-10 max-w-xs space-y-2">
                  {heroMain.category && (
                    <span className="inline-block rounded-md bg-blue-600 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                      {heroMain.category}
                    </span>
                  )}
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug line-clamp-2 text-white">
                    {heroMain.name}
                  </h2>
                  <p className="text-xs sm:text-sm font-black text-blue-300">
                    {formatCurrency(heroMain.price)}
                  </p>
                  <p className="text-[11px] text-slate-300 line-clamp-2">
                    {heroMain.description || 'Authentic quality product available for fast delivery.'}
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        addItem(heroMain, 1);
                        navigate(`/product/${heroMain.id}`);
                      }}
                      className="inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition shadow-md cursor-pointer"
                    >
                      BUY NOW
                    </button>
                  </div>
                </div>

                {heroMain.imageUrl && (
                  <div className="absolute right-2 bottom-2 top-2 flex items-center justify-center pointer-events-none opacity-90">
                    <img
                      src={heroMain.imageUrl}
                      alt={heroMain.name}
                      className="max-h-44 sm:max-h-52 object-contain drop-shadow-2xl rounded-2xl"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-3xl bg-slate-100 dark:bg-slate-800 p-8 text-center text-slate-400">
                Loading Featured Product...
              </div>
            )}

            {/* Bottom 2 Mini Real Products from API */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {heroMini1 && (
                <Link
                  to={`/product/${heroMini1.id}`}
                  className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-4 flex items-center justify-between border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition shadow-2xs"
                >
                  <div className="space-y-1 min-w-0 pr-2">
                    {heroMini1.category && (
                      <span className="text-[9px] font-bold text-slate-400 uppercase">{heroMini1.category}</span>
                    )}
                    <p className="text-xs font-black text-slate-900 dark:text-white truncate">{heroMini1.name}</p>
                    <p className="text-xs font-bold text-blue-600">{formatCurrency(heroMini1.price)}</p>
                  </div>
                  {heroMini1.imageUrl && (
                    <img
                      src={heroMini1.imageUrl}
                      alt={heroMini1.name}
                      className="h-14 w-14 object-contain rounded-xl shrink-0"
                    />
                  )}
                </Link>
              )}

              {heroMini2 && (
                <Link
                  to={`/product/${heroMini2.id}`}
                  className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-4 flex items-center justify-between border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition shadow-2xs"
                >
                  <div className="space-y-1 min-w-0 pr-2">
                    {heroMini2.category && (
                      <span className="text-[9px] font-bold text-slate-400 uppercase">{heroMini2.category}</span>
                    )}
                    <p className="text-xs font-black text-slate-900 dark:text-white truncate">{heroMini2.name}</p>
                    <p className="text-xs font-bold text-blue-600">{formatCurrency(heroMini2.price)}</p>
                  </div>
                  {heroMini2.imageUrl && (
                    <img
                      src={heroMini2.imageUrl}
                      alt={heroMini2.name}
                      className="h-14 w-14 object-contain rounded-xl shrink-0"
                    />
                  )}
                </Link>
              )}
            </div>
          </div>

          {/* Right Column: 2 Real Products from API */}
          <div className="lg:col-span-3 space-y-4">
            {heroPromo1 && (
              <Link
                to={`/product/${heroPromo1.id}`}
                className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 flex flex-col justify-between h-[180px] hover:border-blue-500 transition shadow-2xs"
              >
                <div className="space-y-1 min-w-0 pr-16">
                  {heroPromo1.category && (
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{heroPromo1.category}</span>
                  )}
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white line-clamp-2">
                    {heroPromo1.name}
                  </h3>
                  <p className="text-xs font-black text-blue-600">{formatCurrency(heroPromo1.price)}</p>
                </div>
                {heroPromo1.imageUrl && (
                  <img
                    src={heroPromo1.imageUrl}
                    alt={heroPromo1.name}
                    className="absolute right-2 bottom-2 h-20 w-20 object-contain"
                  />
                )}
              </Link>
            )}

            {heroPromo2 && (
              <Link
                to={`/product/${heroPromo2.id}`}
                className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-5 border border-slate-800 flex flex-col justify-between h-[180px] hover:border-blue-500 transition shadow-2xs"
              >
                <div className="space-y-1 min-w-0 pr-16">
                  {heroPromo2.category && (
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{heroPromo2.category}</span>
                  )}
                  <h3 className="text-xs sm:text-sm font-black text-white line-clamp-2">
                    {heroPromo2.name}
                  </h3>
                  <p className="text-xs font-black text-blue-400">{formatCurrency(heroPromo2.price)}</p>
                </div>
                {heroPromo2.imageUrl && (
                  <img
                    src={heroPromo2.imageUrl}
                    alt={heroPromo2.name}
                    className="absolute right-2 bottom-2 h-20 w-20 object-contain opacity-90"
                  />
                )}
              </Link>
            )}
          </div>
        </section>

        {/* 2. Real Store Categories Strip */}
        {categories.length > 0 && (
          <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-2xs">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              POPULAR CATEGORIES
            </h4>
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => {
                const catName = typeof cat === 'string' ? cat : cat?.name;
                if (!catName) return null;
                return (
                  <Link
                    key={catName}
                    to={`/shop?category=${encodeURIComponent(catName)}`}
                    className="rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition"
                  >
                    {catName}
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* 3. Products Catalog with Real Category Filter Tabs */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Store Products
              </h2>
              <p className="text-xs text-slate-400">
                {productList.length} products available in store
              </p>
            </div>

            {/* Filter Tabs using Real Categories */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedCategoryTab('')}
                className={`rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedCategoryTab === ''
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                All
              </button>

              {categories.map((cat) => {
                const catName = typeof cat === 'string' ? cat : cat?.name;
                if (!catName) return null;
                const active = selectedCategoryTab === catName;
                return (
                  <button
                    key={catName}
                    type="button"
                    onClick={() => setSelectedCategoryTab(catName)}
                    className={`rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                      active
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {catName}
                  </button>
                );
              })}

              <Link to="/shop" className="text-xs font-bold text-blue-600 hover:underline pl-2 shrink-0">
                VIEW ALL
              </Link>
            </div>
          </div>

          {/* Real Product Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 animate-pulse">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800" />
              ))}
            </div>
          ) : filteredBestSellers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
              No products found in this category.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {filteredBestSellers.map((prod) => (
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

        {/* 4. Real Products Grid - More Items */}
        {remainingProducts.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                More From Store
              </h2>
              <Link to="/shop" className="text-xs font-bold text-blue-600 hover:underline">
                Explore All Products →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {remainingProducts.map((prod) => (
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
          </section>
        )}
      </div>
    </div>
  );
}
