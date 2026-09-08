import { useEffect } from 'react';
import { env } from '../config/env';

/**
 * Enterprise-grade, dynamic SEO & Social Graph Component.
 * Supports dynamic product metadata, pricing, in-stock status,
 * Open Graph, Twitter cards, and Schema.org JSON-LD structured data.
 */
export default function SEO({
  title = 'Mart System | Official Online Store & Groceries Delivery',
  description = 'Mart System — Official Online Store in Phnom Penh, Cambodia. Shop fresh everyday groceries, drinks, snacks, and lifestyle products with $1.50 express delivery and Bakong KHQR checkout.',
  keywords = 'Mart System, Online Shopping Cambodia, Groceries Delivery Phnom Penh, Bakong KHQR Payment, Online Mart, Fresh Food',
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = 'website',
  ogUrl,
  twitterCard = 'summary_large_image',
  twitterTitle,
  twitterDescription,
  twitterImage,
  robots = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  productData = null, // { price, currency, availability, sku, brand, category }
  jsonLd,
}) {
  const baseSiteUrl = (env.siteUrl || 'https://martsystemkh.software').replace(/\/+$/, '');

  // Compute canonical URL strictly using production domain
  let cleanCanonical = canonical;
  if (!cleanCanonical) {
    cleanCanonical = `${baseSiteUrl}/`;
  } else if (cleanCanonical.startsWith('/')) {
    cleanCanonical = `${baseSiteUrl}${cleanCanonical === '/' ? '/' : cleanCanonical.replace(/\/+$/, '')}`;
  } else if (cleanCanonical.startsWith('http')) {
    cleanCanonical = cleanCanonical.replace(/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, baseSiteUrl);
  }

  const effectiveOgTitle = ogTitle || title;
  const effectiveOgDescription = ogDescription || description;
  const effectiveOgImage = ogImage
    ? ogImage.startsWith('http')
      ? ogImage
      : `${baseSiteUrl}${ogImage.startsWith('/') ? '' : '/'}${ogImage}`
    : `${baseSiteUrl}/og-image.png`;
  const effectiveOgUrl = ogUrl || cleanCanonical;

  const effectiveTwitterTitle = twitterTitle || effectiveOgTitle;
  const effectiveTwitterDescription = twitterDescription || effectiveOgDescription;
  const effectiveTwitterImage = twitterImage
    ? twitterImage.startsWith('http')
      ? twitterImage
      : `${baseSiteUrl}${twitterImage.startsWith('/') ? '' : '/'}${twitterImage}`
    : effectiveOgImage;

  useEffect(() => {
    // 1. Title
    document.title = title;

    // Helper to get or create a meta tag
    const setMetaTag = (attrName, attrVal, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrVal);
        el.setAttribute('data-dynamic-seo', 'true');
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const removeDynamicMeta = (attrName, attrVal) => {
      const el = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (el && el.getAttribute('data-dynamic-seo') === 'true') {
        el.remove();
      }
    };

    // 2. Standard Meta Tags
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'keywords', keywords);
    setMetaTag('name', 'robots', robots);

    // 3. Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', cleanCanonical);

    // 4. Open Graph Meta Tags
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:site_name', 'Mart System');
    setMetaTag('property', 'og:title', effectiveOgTitle);
    setMetaTag('property', 'og:description', effectiveOgDescription);
    setMetaTag('property', 'og:url', effectiveOgUrl);
    setMetaTag('property', 'og:image', effectiveOgImage);
    setMetaTag('property', 'og:image:secure_url', effectiveOgImage);
    setMetaTag('property', 'og:locale', 'km_KH');

    // 5. Twitter Meta Tags
    setMetaTag('name', 'twitter:card', twitterCard);
    setMetaTag('name', 'twitter:title', effectiveTwitterTitle);
    setMetaTag('name', 'twitter:description', effectiveTwitterDescription);
    setMetaTag('name', 'twitter:image', effectiveTwitterImage);
    setMetaTag('name', 'twitter:url', effectiveOgUrl);

    // 6. Dynamic E-Commerce Product Graph Meta Tags
    if (ogType === 'product' && productData) {
      if (productData.price != null) {
        setMetaTag('property', 'product:price:amount', String(productData.price));
        setMetaTag('property', 'product:price:currency', productData.currency || 'USD');
        setMetaTag('name', 'twitter:label1', 'Price');
        setMetaTag('name', 'twitter:data1', `$${Number(productData.price).toFixed(2)} USD`);
      }
      if (productData.availability) {
        setMetaTag('property', 'product:availability', productData.availability);
        setMetaTag('name', 'twitter:label2', 'Availability');
        setMetaTag('name', 'twitter:data2', productData.availability === 'in stock' ? 'In Stock' : 'Out of Stock');
      }
      if (productData.sku) {
        setMetaTag('property', 'product:retailer_item_id', String(productData.sku));
      }
      if (productData.brand) {
        setMetaTag('property', 'product:brand', productData.brand);
      }
      if (productData.category) {
        setMetaTag('property', 'product:category', productData.category);
      }
    } else {
      // Clean up product-specific tags if navigating to non-product page
      removeDynamicMeta('property', 'product:price:amount');
      removeDynamicMeta('property', 'product:price:currency');
      removeDynamicMeta('property', 'product:availability');
      removeDynamicMeta('property', 'product:retailer_item_id');
      removeDynamicMeta('property', 'product:brand');
      removeDynamicMeta('property', 'product:category');
      removeDynamicMeta('name', 'twitter:label1');
      removeDynamicMeta('name', 'twitter:data1');
      removeDynamicMeta('name', 'twitter:label2');
      removeDynamicMeta('name', 'twitter:data2');
    }

    // 7. Dynamic JSON-LD Structured Data
    const scriptId = 'dynamic-seo-jsonld';
    let scriptEl = document.getElementById(scriptId);

    if (jsonLd) {
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = scriptId;
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(jsonLd);
    } else if (scriptEl) {
      scriptEl.remove();
    }

    return () => {
      const dynamicScript = document.getElementById(scriptId);
      if (dynamicScript) {
        dynamicScript.remove();
      }
    };
  }, [
    title,
    description,
    keywords,
    cleanCanonical,
    effectiveOgTitle,
    effectiveOgDescription,
    effectiveOgImage,
    ogType,
    effectiveOgUrl,
    twitterCard,
    effectiveTwitterTitle,
    effectiveTwitterDescription,
    effectiveTwitterImage,
    robots,
    productData,
    jsonLd,
  ]);

  return null;
}
