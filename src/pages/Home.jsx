import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, ArrowRight, ChevronRight, Package, Truck,
  ShieldCheck, QrCode, Layers, Sparkles, Zap, Headphones, CheckCircle2
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
  const { products, loading } = useProducts({ page: 0, size: 16 });
  const { categories } = useCategories();
  const { items, addItem, setQuantity, removeItem } = useCart();
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

  // Dynamic products from API for hero section
  const heroMain = productList[0] || null;
  const heroMini1 = productList[1] || null;
  const heroMini2 = productList[2] || null;
  const heroPromo1 = productList[3] || null;
  const heroPromo2 = productList[4] || null;

  // Curated featured picks (6-8 items max)
  const featuredPicks = useMemo(() => {
    return productList.slice(0, 8);
  }, [productList]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-16">
      <SEO
        title={`${env.appName || 'Mart System'} | Official Online Store & Everyday Groceries Delivery`}
        description="Shop everyday groceries, beverages, snacks, and fresh products with $1.50 express delivery in Phnom Penh and seamless Bakong KHQR checkout."
        keywords="Mart System, Online Grocery Cambodia, Phnom Penh Delivery Mart, Bakong KHQR Store, Fresh Food & Drinks Online"
        canonical="/"
        ogImage="/mart.jpg"
      />

      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-10">
        {/* 1. Hero Mega Grid Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left Real Categories List */}
          <aside className="hidden lg:block lg:col-span-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-2xs sticky top-24">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 px-2 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span>Categories</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{categories.length}</span>
            </h3>
            <ul className="space-y-1 pt-2 max-h-[380px] overflow-y-auto pr-1">
              <li>
                <Link
                  to="/shop"
                  className="flex items-center justify-between rounded-xl px-2.5 py-2 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  <span className="flex items-center gap-2">
                    <AllCategoriesIcon size={15} className="text-emerald-600 dark:text-emerald-400" />
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
                      className="flex items-center justify-between rounded-xl px-2.5 py-2 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition text-xs font-bold text-slate-700 dark:text-slate-300"
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

          {/* Center Main Featured Product */}
          <div className="lg:col-span-6 space-y-3 sm:space-y-4">
            {heroMain ? (
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white p-4 sm:p-7 min-h-[190px] sm:min-h-[260px] flex items-center justify-between shadow-md border border-slate-850">
                <div className="relative z-10 max-w-[58%] sm:max-w-[55%] space-y-1 sm:space-y-2">
                  {heroMain.category && (
                    <span className="inline-block rounded-md bg-emerald-600 px-2 py-0.5 text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-white">
                      {heroMain.category}
                    </span>
                  )}
                  <h2 className="text-sm sm:text-2xl font-black tracking-tight leading-snug line-clamp-2 text-white">
                    {heroMain.name}
                  </h2>
                  <p className="text-xs sm:text-base font-black text-emerald-300">
                    {formatCurrency(heroMain.price)}
                  </p>
                  <p className="hidden md:block text-[11px] text-slate-300 line-clamp-2">
                    {heroMain.description || 'Authentic quality product available for fast delivery.'}
                  </p>
                  <div className="pt-1 sm:pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        addItem(heroMain, 1);
                        navigate(`/product/${heroMain.id}`);
                      }}
                      className="inline-block rounded-xl bg-emerald-600 px-3.5 sm:px-5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold text-white hover:bg-emerald-700 active:scale-95 transition shadow-md cursor-pointer"
                    >
                      BUY NOW
                    </button>
                  </div>
                </div>

                {heroMain.imageUrl && (
                  <div className="relative w-[38%] sm:w-[42%] flex items-center justify-center shrink-0">
                    <img
                      src={heroMain.imageUrl}
                      alt={heroMain.name}
                      className="max-h-28 sm:max-h-48 w-auto object-contain drop-shadow-2xl rounded-xl"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-3xl bg-slate-100 dark:bg-slate-800 p-8 text-center text-slate-400">
                Loading Featured Product...
              </div>
            )}

            {/* Bottom 2 Mini Real Products */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
              {heroMini1 && (
                <Link
                  to={`/product/${heroMini1.id}`}
                  className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-3 sm:p-4 flex items-center justify-between border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition shadow-2xs"
                >
                  <div className="space-y-0.5 min-w-0 pr-2">
                    {heroMini1.category && (
                      <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase truncate block">{heroMini1.category}</span>
                    )}
                    <p className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white truncate">{heroMini1.name}</p>
                    <p className="text-[11px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(heroMini1.price)}</p>
                  </div>
                  {heroMini1.imageUrl && (
                    <img
                      src={heroMini1.imageUrl}
                      alt={heroMini1.name}
                      className="h-10 w-10 sm:h-14 sm:w-14 object-contain rounded-lg shrink-0 group-hover:scale-105 transition-transform"
                    />
                  )}
                </Link>
              )}

              {heroMini2 && (
                <Link
                  to={`/product/${heroMini2.id}`}
                  className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-3 sm:p-4 flex items-center justify-between border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition shadow-2xs"
                >
                  <div className="space-y-0.5 min-w-0 pr-2">
                    {heroMini2.category && (
                      <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase truncate block">{heroMini2.category}</span>
                    )}
                    <p className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white truncate">{heroMini2.name}</p>
                    <p className="text-[11px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(heroMini2.price)}</p>
                  </div>
                  {heroMini2.imageUrl && (
                    <img
                      src={heroMini2.imageUrl}
                      alt={heroMini2.name}
                      className="h-10 w-10 sm:h-14 sm:w-14 object-contain rounded-lg shrink-0 group-hover:scale-105 transition-transform"
                    />
                  )}
                </Link>
              )}
            </div>
          </div>

          {/* Right Column: 2 Real Products */}
          <div className="lg:col-span-3 grid grid-cols-2 lg:grid-cols-1 gap-2.5 sm:gap-4">
            {heroPromo1 && (
              <Link
                to={`/product/${heroPromo1.id}`}
                className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 p-3 sm:p-5 border border-slate-200 dark:border-slate-800 flex flex-col justify-between h-[150px] sm:h-[180px] hover:border-emerald-500 transition shadow-2xs"
              >
                <div className="space-y-0.5 sm:space-y-1 min-w-0 pr-10 sm:pr-16">
                  {heroPromo1.category && (
                    <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase truncate block">{heroPromo1.category}</span>
                  )}
                  <h3 className="text-[11px] sm:text-sm font-black text-slate-900 dark:text-white line-clamp-2">
                    {heroPromo1.name}
                  </h3>
                  <p className="text-[11px] sm:text-xs font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(heroPromo1.price)}</p>
                </div>
                {heroPromo1.imageUrl && (
                  <img
                    src={heroPromo1.imageUrl}
                    alt={heroPromo1.name}
                    className="absolute right-2 bottom-2 h-14 w-14 sm:h-20 sm:w-20 object-contain group-hover:scale-105 transition-transform"
                  />
                )}
              </Link>
            )}

            {heroPromo2 && (
              <Link
                to={`/product/${heroPromo2.id}`}
                className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-900 text-white p-3 sm:p-5 border border-slate-800 flex flex-col justify-between h-[150px] sm:h-[180px] hover:border-emerald-500 transition shadow-2xs"
              >
                <div className="space-y-0.5 sm:space-y-1 min-w-0 pr-10 sm:pr-16">
                  {heroPromo2.category && (
                    <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase truncate block">{heroPromo2.category}</span>
                  )}
                  <h3 className="text-[11px] sm:text-sm font-black text-white line-clamp-2">
                    {heroPromo2.name}
                  </h3>
                  <p className="text-[11px] sm:text-xs font-black text-emerald-400">{formatCurrency(heroPromo2.price)}</p>
                </div>
                {heroPromo2.imageUrl && (
                  <img
                    src={heroPromo2.imageUrl}
                    alt={heroPromo2.name}
                    className="absolute right-2 bottom-2 h-14 w-14 sm:h-20 sm:w-20 object-contain opacity-90 group-hover:scale-105 transition-transform"
                  />
                )}
              </Link>
            )}
          </div>
        </section>

        {/* 2. Popular Categories Grid (Direct Click to Shop) */}
        {categories.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Explore Categories
                </h2>
                <p className="text-xs text-slate-400">
                  Select a category to view all matching products in shop
                </p>
              </div>
              <Link
                to="/categories"
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>All Categories</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {categories.slice(0, 6).map((cat) => {
                const catName = typeof cat === 'string' ? cat : cat?.name;
                if (!catName) return null;
                const Icon = getCategoryIcon(catName);

                return (
                  <Link
                    key={catName}
                    to={`/shop?category=${encodeURIComponent(catName)}`}
                    className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col items-center justify-center text-center gap-2 hover:border-emerald-500 hover:shadow-md transition-all active:scale-95 shadow-2xs"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Icon size={22} />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                      {catName}
                    </span>
                    <span className="text-[10px] text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      Shop Now →
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* 3. Featured Picks (Only top 8 curated items, not full catalog dump) */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-amber-500" />
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Featured Highlights
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                Handpicked top selections from our store
              </p>
            </div>

            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-3.5 py-1.5 text-xs font-bold hover:bg-emerald-100 transition"
            >
              <span>Explore Shop</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3.5 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-56 rounded-xl bg-slate-200 dark:bg-slate-800" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3.5">
              {featuredPicks.map((prod) => (
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

        {/* 4. Big CTA Banner to Shop Full Catalog */}
        <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white p-6 sm:p-10 shadow-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-300 border border-emerald-400/30">
              <ShoppingBag size={12} />
              Full Store Collection
            </span>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              Looking for our complete catalogue?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Browse all items, filter by price & category, search by keywords, and enjoy quick checkout in the dedicated Shop.
            </p>
          </div>

          <Link
            to="/shop"
            className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white px-7 py-3.5 text-xs sm:text-sm font-black transition shadow-lg shrink-0 flex items-center gap-2 active:scale-95 cursor-pointer"
          >
            <span>GO TO SHOP</span>
            <ArrowRight size={16} />
          </Link>
        </section>

        {/* 5. Trust & Service Highlights */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-2xs">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white">$1.50 Express Delivery</h4>
              <p className="text-[11px] text-slate-400">Fast doorstep drop-off across Phnom Penh city</p>
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-2xs">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600">
              <QrCode size={24} />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white">Bakong KHQR Payments</h4>
              <p className="text-[11px] text-slate-400">Scan & pay seamlessly with any banking app in Cambodia</p>
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-2xs">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white">100% Quality Guaranteed</h4>
              <p className="text-[11px] text-slate-400">Authentic fresh store items carefully packed</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
