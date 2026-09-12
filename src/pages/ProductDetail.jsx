import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, Check, Heart, ArrowLeft, Package, Truck, ShieldCheck,
  RotateCcw, Plus, Minus, Share2, Tag, ChevronRight, AlertCircle, Star,
  Award, Headphones, CheckCircle2, MessageSquare, ThumbsUp, Send, Layers,
  Barcode, QrCode
} from 'lucide-react';
import { productApi } from '../api/productApi';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../hooks/useWishlist';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/format';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';
import { env } from '../config/env';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { items, addItem, setQuantity, removeItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addRecentlyViewed } = useRecentlyViewed();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);
  const [imageBroken, setImageBroken] = useState(false);
  const [addedToast, setAddedToast] = useState(false);
  const [activeTab, setActiveTab] = useState('description'); // 'description', 'specifications', 'reviews'

  // Review Form State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Local storage review feedback cache (per product)
  const [customerReviewsList, setCustomerReviewsList] = useState([]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setImageBroken(false);
    setQty(1);

    (async () => {
      try {
        const res = await productApi.getById(id);
        if (active) {
          setProduct(res);
          if (res) {
            addRecentlyViewed(res);
          }
        }
      } catch (err) {
        if (active) {
          setError('Product not found or unavailable.');
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    // Load customer submitted reviews from localStorage for this product
    try {
      const stored = localStorage.getItem(`mart_reviews_${id}`);
      if (stored) {
        setCustomerReviewsList(JSON.parse(stored));
      } else {
        setCustomerReviewsList([]);
      }
    } catch {
      setCustomerReviewsList([]);
    }

    return () => { active = false; };
  }, [id, addRecentlyViewed]);

  const { products: relatedPool } = useProducts({
    category: product?.category || undefined,
  });

  const relatedProducts = useMemo(() => {
    if (!Array.isArray(relatedPool) || !product) return [];
    return relatedPool.filter((p) => p?.id !== product.id).slice(0, 4);
  }, [relatedPool, product]);

  // Frequently bought together product
  const bundleProduct = relatedProducts[0] || null;

  const cartItem = useMemo(
    () => (items || []).find((i) => i.product?.id === product?.id),
    [items, product?.id]
  );
  const inCartQty = cartItem?.quantity || 0;

  const stock = product?.stockQuantity ?? 0;
  const outOfStock = stock <= 0;
  const isLowStock = !outOfStock && stock <= 5;
  const available = Math.max(0, stock - inCartQty);
  const wishlisted = isInWishlist(product?.id);

  const pseudoRating = ((Math.abs(Number(product?.id || 1) * 17) % 5) * 0.1 + 4.6).toFixed(1);
  const pseudoReviewsCount = (Math.abs(Number(product?.id || 1) * 31) % 800) + 120 + customerReviewsList.length;

  const handleAddToCart = () => {
    if (outOfStock || !product) return;
    addItem(product, qty);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const handleBuyNow = () => {
    if (outOfStock || !product) return;
    addItem(product, qty);
    navigate('/checkout');
  };

  const handleAddBundle = () => {
    if (!product || outOfStock) return;
    addItem(product, 1);
    if (bundleProduct && (bundleProduct.stockQuantity ?? 1) > 0) {
      addItem(bundleProduct, 1);
    }
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const handleWishlistToggle = () => {
    if (product?.id) {
      toggleWishlist(product.id);
    }
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      setReviewError('Please enter your review feedback.');
      return;
    }

    const newReview = {
      id: Date.now(),
      author: user?.displayName || user?.name || user?.username || 'Verified Customer',
      rating: reviewRating,
      comment: reviewComment.trim(),
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      verified: true,
    };

    const nextList = [newReview, ...customerReviewsList];
    setCustomerReviewsList(nextList);
    try {
      localStorage.setItem(`mart_reviews_${id}`, JSON.stringify(nextList));
    } catch {
      // ignore
    }

    setReviewComment('');
    setReviewSubmitted(true);
    setReviewError('');
    setTimeout(() => setReviewSubmitted(false), 4000);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
          <div className="aspect-square w-full rounded-3xl bg-slate-100 dark:bg-slate-800" />
          <div className="space-y-4">
            <div className="h-4 w-28 rounded-full bg-slate-100 dark:bg-slate-800" />
            <div className="h-8 w-3/4 rounded-2xl bg-slate-100 dark:bg-slate-800" />
            <div className="h-6 w-24 rounded-full bg-slate-100 dark:bg-slate-800" />
            <div className="h-24 w-full rounded-2xl bg-slate-100 dark:bg-slate-800" />
            <div className="h-12 w-full rounded-full bg-slate-100 dark:bg-slate-800" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center space-y-4">
        <AlertCircle size={44} className="mx-auto text-rose-500" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{error || 'Product Not Found'}</h2>
        <p className="text-xs text-slate-500">The product you are looking for might have been moved or removed.</p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 text-xs font-bold"
        >
          <ArrowLeft size={14} />
          <span>Back to Shop</span>
        </Link>
      </div>
    );
  }

  // Stock status message
  let stockBadgeClass = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400';
  let stockMessage = 'In stock';
  if (outOfStock) {
    stockBadgeClass = 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400';
    stockMessage = 'Out of stock';
  } else if (isLowStock) {
    stockBadgeClass = 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-400';
    stockMessage = `Only ${stock} left in stock - order soon`;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-20 font-sans">
      <SEO
        title={`${product.name} | Mart System`}
        description={product.description || `Buy authentic ${product.name} at Mart System. Fast delivery & Bakong KHQR checkout.`}
        canonical={`/product/${product.id}`}
        ogImage={product.imageUrl || '/mart.jpg'}
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-10 space-y-12">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link to="/" className="hover:text-black dark:hover:text-white transition">Home</Link>
          <ChevronRight size={12} />
          <Link to="/shop" className="hover:text-black dark:hover:text-white transition">Shop</Link>
          {product.category && (
            <>
              <ChevronRight size={12} />
              <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-black dark:hover:text-white transition">
                {product.category}
              </Link>
            </>
          )}
          <ChevronRight size={12} />
          <span className="text-slate-900 dark:text-white truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Main Product Presentation (2 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left: Product Image Canvas & Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full rounded-3xl bg-[#F7F7F8] dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-8 flex items-center justify-center overflow-hidden">
              {product.imageUrl && !imageBroken ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain drop-shadow-sm transition-transform duration-300 hover:scale-105"
                  onError={() => setImageBroken(true)}
                />
              ) : (
                <Package size={80} className="text-slate-300 dark:text-slate-600" />
              )}

              {/* Wishlist Floating Button */}
              <button
                type="button"
                onClick={handleWishlistToggle}
                className={`absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full transition-transform active:scale-75 shadow-xs cursor-pointer ${
                  wishlisted
                    ? 'bg-rose-50 dark:bg-slate-800 text-rose-500'
                    : 'bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-500'
                }`}
                aria-label="Wishlist"
              >
                <Heart size={18} className={wishlisted ? 'fill-rose-500 text-rose-500' : ''} />
              </button>
            </div>

            {/* Thumbnail preview strip */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <div className="h-16 w-16 rounded-2xl border-2 border-emerald-600 p-1 bg-[#F7F7F8] dark:bg-slate-900 shrink-0 flex items-center justify-center">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain" />
                ) : (
                  <Package size={20} className="text-slate-400" />
                )}
              </div>
            </div>
          </div>

          {/* Right: Product Info & Actions */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                {product.category && (
                  <span className="inline-block rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-600 dark:text-slate-300">
                    {product.category}
                  </span>
                )}
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${stockBadgeClass}`}>
                  {stockMessage}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {product.name}
              </h1>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                <div className="flex items-center gap-1">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">{pseudoRating}</span>
                </div>
                <span>•</span>
                <span>{pseudoReviewsCount} Reviews</span>
                {product.sku && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-slate-400">SKU: {product.sku}</span>
                  </>
                )}
                {product.barcode && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-slate-400">Barcode: {product.barcode}</span>
                  </>
                )}
              </div>

              {/* Price */}
              <div className="pt-2">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                  {formatCurrency(product.price)}
                </span>
              </div>
            </div>

            {/* Description brief */}
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {product.description || 'Authentic quality product available for fast delivery across Phnom Penh. Order now with Bakong KHQR instant payment.'}
            </p>

            {/* Quantity Stepper & Stock limit guard */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Quantity:</span>
                <span className="text-xs font-semibold text-slate-400">
                  {available > 0 ? `${available} available` : 'None available'}
                </span>
              </div>

              {!outOfStock && (
                <div className="flex items-center gap-3">
                  <div className="flex h-11 items-center rounded-full bg-[#F7F7F8] dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1">
                    <button
                      type="button"
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      disabled={qty <= 1}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-12 text-center font-black text-sm text-slate-900 dark:text-white select-none">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty(qty + 1)}
                      disabled={available > 0 && qty >= available}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Dual Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={outOfStock || (available > 0 && inCartQty >= stock)}
                className={`flex h-12 w-full sm:flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-bold transition active:scale-95 cursor-pointer shadow-xs disabled:opacity-50 ${
                  addedToast
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {addedToast ? (
                  <>
                    <Check size={16} />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={outOfStock}
                className="flex h-12 w-full sm:flex-1 items-center justify-center rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs sm:text-sm font-black hover:opacity-90 transition active:scale-95 disabled:opacity-40 cursor-pointer shadow-md"
              >
                Buy Now
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Truck size={17} className="text-emerald-600" />
                <span>$1.50 Express Delivery</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                <ShieldCheck size={17} className="text-emerald-600" />
                <span>Bakong KHQR Payment</span>
              </div>
            </div>
          </div>
        </div>

        {/* Frequently Bought Together (Bundle section) */}
        {bundleProduct && (
          <section className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-900/50 p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Frequently Bought Together
            </h3>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="h-20 w-20 rounded-2xl bg-white dark:bg-slate-800 p-2 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                  <img src={product.imageUrl || '/mart.jpg'} alt={product.name} className="h-full w-full object-contain" />
                </div>
                <span className="text-xl font-bold text-slate-400">+</span>
                <div className="h-20 w-20 rounded-2xl bg-white dark:bg-slate-800 p-2 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                  <img src={bundleProduct.imageUrl || '/mart.jpg'} alt={bundleProduct.name} className="h-full w-full object-contain" />
                </div>
              </div>

              <div className="flex-1 space-y-1 text-center md:text-left">
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {product.name} + {bundleProduct.name}
                </p>
                <p className="text-xs text-slate-500">
                  Combined price: <strong className="text-slate-900 dark:text-white font-black">{formatCurrency((Number(product.price) || 0) + (Number(bundleProduct.price) || 0))}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddBundle}
                className="rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 px-6 py-2.5 text-xs font-black transition active:scale-95 shadow-md cursor-pointer shrink-0"
              >
                Add Both to Cart
              </button>
            </div>
          </section>
        )}

        {/* Tabbed Below Section: Description, Specifications, Reviews */}
        <section className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
            <button
              type="button"
              onClick={() => setActiveTab('description')}
              className={`px-4 py-2.5 text-xs sm:text-sm font-black transition-colors cursor-pointer border-b-2 -mb-1 ${
                activeTab === 'description'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Description
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('specifications')}
              className={`px-4 py-2.5 text-xs sm:text-sm font-black transition-colors cursor-pointer border-b-2 -mb-1 ${
                activeTab === 'specifications'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Specifications
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-2.5 text-xs sm:text-sm font-black transition-colors cursor-pointer border-b-2 -mb-1 flex items-center gap-1.5 ${
                activeTab === 'reviews'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Reviews</span>
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold">
                {pseudoReviewsCount}
              </span>
            </button>
          </div>

          {/* Tab 1: Description */}
          {activeTab === 'description' && (
            <div className="space-y-4 max-w-3xl text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium animate-fade-in">
              <p>
                {product.description || 'Enjoy premium quality selection from Mart System. All items are authenticated, inspected for freshness, and stored in standard temperature environments before delivery.'}
              </p>
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 p-4 border border-slate-100 dark:border-slate-800 space-y-2">
                <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-wider">Product Highlights</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                  <li>Genuine and quality guaranteed from verified distribution channels.</li>
                  <li>Fast delivery $1.50 across Phnom Penh within standard business hours.</li>
                  <li>Instant payment confirmation via National Bank of Cambodia Bakong KHQR.</li>
                  <li>Eligible for customer return or exchange within 7 days if defective.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Tab 2: Specifications */}
          {activeTab === 'specifications' && (
            <div className="max-w-2xl animate-fade-in">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden text-xs">
                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/50">
                  <span className="font-bold text-slate-500">Product Name</span>
                  <span className="font-black text-slate-900 dark:text-white">{product.name}</span>
                </div>
                <div className="flex items-center justify-between p-3.5">
                  <span className="font-bold text-slate-500">Category</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{product.category || 'General'}</span>
                </div>
                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/50">
                  <span className="font-bold text-slate-500">SKU</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{product.sku || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between p-3.5">
                  <span className="font-bold text-slate-500">Barcode</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{product.barcode || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/50">
                  <span className="font-bold text-slate-500">Stock Availability</span>
                  <span className="font-bold text-emerald-600">{stock} units in stock</span>
                </div>
                <div className="flex items-center justify-between p-3.5">
                  <span className="font-bold text-slate-500">Payment Methods</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">Bakong KHQR, Cash on Delivery</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-8 animate-fade-in">
              {/* Rating Summary & Distribution */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 rounded-3xl bg-[#F8FAFC] dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 items-center">
                <div className="md:col-span-4 text-center md:text-left space-y-1">
                  <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">{pseudoRating}</span>
                  <div className="flex items-center justify-center md:justify-start gap-1 text-amber-400">
                    <Star size={16} className="fill-amber-400" />
                    <Star size={16} className="fill-amber-400" />
                    <Star size={16} className="fill-amber-400" />
                    <Star size={16} className="fill-amber-400" />
                    <Star size={16} className="fill-amber-400" />
                  </div>
                  <p className="text-xs text-slate-400 font-medium">Based on {pseudoReviewsCount} ratings</p>
                </div>

                {/* Rating Distribution Bars */}
                <div className="md:col-span-8 space-y-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">
                  {[
                    { stars: '5★', pct: '82%' },
                    { stars: '4★', pct: '12%' },
                    { stars: '3★', pct: '4%' },
                    { stars: '2★', pct: '1%' },
                    { stars: '1★', pct: '1%' },
                  ].map((bar) => (
                    <div key={bar.stars} className="flex items-center gap-2">
                      <span className="w-6 text-right font-mono">{bar.stars}</span>
                      <div className="h-2 flex-1 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full bg-amber-400" style={{ width: bar.pct }} />
                      </div>
                      <span className="w-8 text-right font-mono text-[10px] text-slate-400">{bar.pct}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Write a Review Form */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Write a Customer Review
                </h4>

                {reviewSubmitted ? (
                  <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 p-4 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 size={16} className="shrink-0" />
                    <span>Thank you! Your review has been recorded.</span>
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    {reviewError && (
                      <p className="text-xs font-bold text-rose-500">{reviewError}</p>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Rating:</label>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setReviewRating(s)}
                            className="p-1 text-amber-400 hover:scale-110 transition cursor-pointer"
                          >
                            <Star size={20} className={s <= reviewRating ? 'fill-amber-400' : 'text-slate-300'} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Your Review / Comment:</label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Share your experience with this item..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-6 py-2.5 text-xs font-black transition active:scale-95 shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <Send size={13} />
                      <span>Submit Review</span>
                    </button>
                  </form>
                )}
              </div>

              {/* Customer Reviews List */}
              <div className="space-y-3">
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Recent Feedback
                </h4>

                {customerReviewsList.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{rev.author}</span>
                        <span className="rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.2 text-[9px] font-black">Verified Purchase</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{rev.date}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} size={12} className="fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{rev.comment}</p>
                  </div>
                ))}

                {/* Default Sample Verified Reviews */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">Sokchea M.</span>
                      <span className="rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.2 text-[9px] font-black">Verified Purchase</span>
                    </div>
                    <span className="text-[10px] text-slate-400">2 days ago</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star size={12} className="fill-amber-400" />
                    <Star size={12} className="fill-amber-400" />
                    <Star size={12} className="fill-amber-400" />
                    <Star size={12} className="fill-amber-400" />
                    <Star size={12} className="fill-amber-400" />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Fast delivery in Phnom Penh and the KHQR scan was instantaneous! Product arrived fresh and well packed.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Related Products Carousel */}
        {relatedProducts.length > 0 && (
          <section className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Related Products
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  cartQuantity={(items || []).find((i) => i.product?.id === p.id)?.quantity || 0}
                  onAdd={(prod) => addItem(prod, 1)}
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
