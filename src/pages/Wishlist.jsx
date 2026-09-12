import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart, ShoppingBag, Trash2, ArrowRight, Package, AlertCircle,
  Plus, Check, ArrowLeft
} from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { productApi } from '../api/productApi';
import { DEFAULT_PRODUCTS } from '../constants/products';
import { formatCurrency } from '../utils/format';
import SEO from '../components/SEO';

export default function Wishlist() {
  const { wishlistIds, removeFromWishlist, clearWishlist, count } = useWishlist();
  const { addItem, items } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [allProducts, setAllProducts] = useState(DEFAULT_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [addedMap, setAddedMap] = useState({});

  useEffect(() => {
    let active = true;
    setLoading(true);
    productApi.list({ size: 100 })
      .then((res) => {
        if (active && res?.content && Array.isArray(res.content) && res.content.length > 0) {
          setAllProducts(res.content);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  const wishlistProducts = useMemo(() => {
    if (!wishlistIds || wishlistIds.length === 0) return [];
    const idSet = new Set(wishlistIds);
    return allProducts.filter((p) => idSet.has(p.id));
  }, [allProducts, wishlistIds]);

  const handleAddToCart = (product) => {
    const stock = product.stockQuantity ?? 0;
    if (stock <= 0) return;
    addItem(product, 1);
    setAddedMap((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  if (wishlistIds.length === 0) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center bg-white dark:bg-slate-950 px-4 py-16 text-center space-y-4">
        <SEO title="My Wishlist | Mart System" canonical="/wishlist" />
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#F7F7F8] dark:bg-slate-900 text-slate-400">
          <Heart size={38} className="text-slate-300 dark:text-slate-600" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Your Wishlist is Empty
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-sm">
            Save your favorite items here so you can easily find and purchase them later.
          </p>
        </div>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-7 py-3 text-xs sm:text-sm font-black hover:opacity-90 transition shadow-md active:scale-95 cursor-pointer"
        >
          <span>Explore Products</span>
          <ArrowRight size={15} />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-28 sm:pb-20 font-sans">
      <SEO title="My Wishlist | Mart System" canonical="/wishlist" />

      <div className="mx-auto max-w-6xl px-3 sm:px-6 py-6 sm:py-10 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-0.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('myWishlist')}
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              {wishlistIds.length} {wishlistIds.length === 1 ? 'item saved' : 'items saved'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={clearWishlist}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-800 px-3.5 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:border-rose-200 transition cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Clear Wishlist</span>
            </button>
          </div>
        </div>

        {/* Wishlist Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {wishlistProducts.map((product) => {
            const stock = product.stockQuantity ?? 0;
            const outOfStock = stock <= 0;
            const isLowStock = !outOfStock && stock <= 5;
            const added = addedMap[product.id];

            return (
              <div
                key={product.id}
                className="flex flex-col justify-between rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-900/60 p-4 space-y-4 hover:border-slate-300 transition-all shadow-2xs"
              >
                <div className="flex items-start gap-3.5">
                  <div className="relative h-20 w-20 shrink-0 rounded-2xl bg-white dark:bg-slate-800 p-2 border border-slate-100 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain" />
                    ) : (
                      <Package size={24} className="text-slate-300" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                      {product.category || 'General'}
                    </span>
                    <Link
                      to={`/product/${product.id}`}
                      className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white hover:text-emerald-600 transition line-clamp-2"
                    >
                      {product.name}
                    </Link>
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white block">
                      {formatCurrency(product.price)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromWishlist(product.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                    title="Remove from Wishlist"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Status & Add to Cart button */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800">
                  <span className="text-[11px] font-bold">
                    {outOfStock ? (
                      <span className="text-rose-500 font-extrabold">Out of Stock</span>
                    ) : isLowStock ? (
                      <span className="text-amber-600 font-bold">Only {stock} left</span>
                    ) : (
                      <span className="text-emerald-600 font-bold">In Stock</span>
                    )}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleAddToCart(product)}
                    disabled={outOfStock}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-black transition cursor-pointer shadow-xs active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                      added
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90'
                    }`}
                  >
                    {added ? (
                      <>
                        <Check size={13} />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={13} />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
