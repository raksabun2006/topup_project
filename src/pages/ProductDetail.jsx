import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, Check, Heart, ArrowLeft, Package, Truck, ShieldCheck,
  RotateCcw, Plus, Minus, Share2, Tag, ChevronRight, AlertCircle, Star,
  Award, Headphones
} from 'lucide-react';
import { productApi } from '../api/productApi';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';
import { env } from '../config/env';

const WISHLIST_STORAGE_KEY = 'mart_customer_wishlist';

function isProductWishlisted(id) {
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    const set = raw ? JSON.parse(raw) : [];
    return Array.isArray(set) && set.includes(id);
  } catch {
    return false;
  }
}

function toggleWishlist(id) {
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    let set = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(set)) set = [];
    if (set.includes(id)) {
      set = set.filter((x) => x !== id);
    } else {
      set.push(id);
    }
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(set));
    return set.includes(id);
  } catch {
    return false;
  }
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items, addItem, setQuantity, removeItem } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);
  const [imageBroken, setImageBroken] = useState(false);
  const [addedToast, setAddedToast] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

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
          if (res?.id) {
            setWishlisted(isProductWishlisted(res.id));
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

    return () => { active = false; };
  }, [id]);

  const { products: relatedPool } = useProducts({
    category: product?.category || undefined,
  });

  const relatedProducts = useMemo(() => {
    if (!Array.isArray(relatedPool) || !product) return [];
    return relatedPool.filter((p) => p?.id !== product.id).slice(0, 4);
  }, [relatedPool, product]);

  const cartItem = useMemo(
    () => (items || []).find((i) => i.product?.id === product?.id),
    [items, product?.id]
  );
  const inCartQty = cartItem?.quantity || 0;

  const stock = product?.stockQuantity ?? 0;
  const outOfStock = stock <= 0;
  const isLowStock = !outOfStock && stock <= 5;
  const available = Math.max(0, stock - inCartQty);

  const pseudoRating = ((Math.abs(Number(product?.id || 1) * 17) % 5) * 0.1 + 4.6).toFixed(1);
  const pseudoReviews = (Math.abs(Number(product?.id || 1) * 31) % 800) + 120;

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

  const handleWishlistToggle = () => {
    if (product?.id) {
      const next = toggleWishlist(product.id);
      setWishlisted(next);
    }
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
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 rounded-full bg-[#18181B] text-white px-6 py-2.5 text-xs font-bold hover:bg-black"
        >
          <ArrowLeft size={14} />
          <span>Back to Shop</span>
        </Link>
      </div>
    );
  }

    const baseSiteUrl = (env.siteUrl || 'https://martsystemkh.software').replace(/\/+$/, '');
    const inStock = (product.stockQuantity ?? 1) > 0;
    const formattedPrice = product.price != null ? Number(product.price).toFixed(2) : '0.00';
    const productImageUrl = product.imageUrl && product.imageUrl.startsWith('http')
      ? product.imageUrl
      : product.imageUrl
        ? `${baseSiteUrl}${product.imageUrl.startsWith('/') ? '' : '/'}${product.imageUrl}`
        : `${baseSiteUrl}/mart.jpg`;

    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 pb-20">
        <SEO
          title={`${product.name} - $${formattedPrice} | Mart System Cambodia`}
          description={
            product.description
              ? `${product.description} — Buy ${product.name} online for $${formattedPrice} with $1.50 express delivery in Phnom Penh & Bakong KHQR scan.`
              : `Buy ${product.name} ($${formattedPrice}) online at Mart System. Enjoy $1.50 express delivery in Phnom Penh and instant Bakong KHQR checkout.`
          }
          keywords={`${product.name}, ${product.category || 'Grocery'}, Buy ${product.name} Cambodia, Mart System, Groceries Phnom Penh`}
          canonical={`/product/${product.id}`}
          ogImage={productImageUrl}
          ogType="product"
          productData={{
            price: product.price || 0,
            currency: 'USD',
            availability: inStock ? 'in stock' : 'out of stock',
            sku: product.sku || String(product.id),
            category: product.category || 'Grocery',
            brand: 'Mart System',
          }}
          jsonLd={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Product",
                "@id": `${baseSiteUrl}/product/${product.id}#product`,
                "name": product.name,
                "image": [productImageUrl],
                "description": product.description || `Authentic ${product.name} available at Mart System with $1.50 express delivery and Bakong KHQR checkout.`,
                "sku": product.sku || String(product.id),
                "mpn": String(product.id),
                "brand": {
                  "@type": "Brand",
                  "name": "Mart System"
                },
                "category": product.category || "Grocery",
                "offers": {
                  "@type": "Offer",
                  "price": formattedPrice,
                  "priceCurrency": "USD",
                  "priceValidUntil": "2027-12-31",
                  "itemCondition": "https://schema.org/NewCondition",
                  "availability": inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                  "url": `${baseSiteUrl}/product/${product.id}`,
                  "seller": {
                    "@type": "Organization",
                    "name": "Mart System"
                  },
                  "shippingDetails": {
                    "@type": "OfferShippingDetails",
                    "shippingRate": {
                      "@type": "MonetaryAmount",
                      "value": "1.50",
                      "currency": "USD"
                    },
                    "shippingDestination": {
                      "@type": "DefinedRegion",
                      "addressCountry": "KH"
                    }
                  }
                }
              },
              {
                "@type": "BreadcrumbList",
                "@id": `${baseSiteUrl}/product/${product.id}#breadcrumb`,
                "itemListElement": [
                  {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": `${baseSiteUrl}/`
                  },
                  {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Shop",
                    "item": `${baseSiteUrl}/shop`
                  },
                  ...(product.category ? [{
                    "@type": "ListItem",
                    "position": 3,
                    "name": product.category,
                    "item": `${baseSiteUrl}/shop?category=${encodeURIComponent(product.category)}`
                  }] : []),
                  {
                    "@type": "ListItem",
                    "position": product.category ? 4 : 3,
                    "name": product.name,
                    "item": `${baseSiteUrl}/product/${product.id}`
                  }
                ]
              }
            ]
          }}
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
          {/* Left: Product Image Canvas */}
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
              className={`absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full transition-transform active:scale-75 shadow-xs ${
                wishlisted
                  ? 'bg-rose-50 text-rose-500'
                  : 'bg-white text-slate-400 hover:text-rose-500'
              }`}
              aria-label="Wishlist"
            >
              <Heart size={18} className={wishlisted ? 'fill-rose-500' : ''} />
            </button>
          </div>

          {/* Right: Product Info & Actions */}
          <div className="space-y-6">
            <div className="space-y-3">
              {product.category && (
                <span className="inline-block rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-600 dark:text-slate-300">
                  {product.category}
                </span>
              )}

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {product.name}
              </h1>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">{pseudoRating}</span>
                </div>
                <span>•</span>
                <span>{pseudoReviews} Customer Reviews</span>
                {product.sku && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-slate-400">SKU: {product.sku}</span>
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

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {product.description || 'Authentic quality product available for fast delivery across Phnom Penh. Order now with Bakong KHQR instant payment.'}
            </p>

            {/* Quantity Stepper & Stock status */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Quantity:</span>
                <span className="text-xs font-semibold text-slate-400">
                  {outOfStock ? (
                    <span className="text-rose-500 font-bold">Out of Stock</span>
                  ) : (
                    <span className="text-emerald-600 font-bold">In Stock</span>
                  )}
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
                    <span className="w-12 text-center font-black text-sm text-slate-900 dark:text-white">
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
                disabled={outOfStock}
                className={`flex h-12 w-full sm:flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-bold transition active:scale-95 cursor-pointer shadow-xs ${
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
                className="flex h-12 w-full sm:flex-1 items-center justify-center rounded-full bg-[#18181B] text-white text-xs sm:text-sm font-bold hover:bg-black transition active:scale-95 disabled:opacity-40 cursor-pointer shadow-md"
              >
                Buy Now
              </button>
            </div>

            {/* Trust Badges Container */}
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

        {/* Related Products Carousel */}
        {relatedProducts.length > 0 && (
          <section className="pt-12 border-t border-slate-100 dark:border-slate-800 space-y-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Related Products
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
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
