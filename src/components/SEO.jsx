import { useEffect } from 'react';
import { env } from '../config/env';

/**
 * Enterprise-grade, Dynamic SEO & Social Graph Component.
 * Supports:
 * - Dynamic Title, Description, Keywords, Canonical URLs, Robots
 * - Open Graph & Twitter Card rich metadata
 * - E-commerce Product Graph (price, availability, SKU, brand, category)
 * - Breadcrumbs Schema generator
 * - FAQ Schema generator
 * - ItemList / Catalog Schema generator
 * - Custom Schema.org JSON-LD structured data injection & clean teardown
 */
export default function SEO({
  title = 'Mart System | Official Online Store & Groceries Delivery Cambodia',
  description = 'Mart System — Official Online Store in Phnom Penh, Cambodia. Shop fresh everyday groceries, drinks, snacks, and lifestyle products with $1.50 express delivery and Bakong KHQR checkout.',
  keywords = 'Mart System, Mart Store Cambodia, Online Shopping Phnom Penh, Groceries Delivery Cambodia, Bakong KHQR Payment, Online Mart, Fresh Food Delivery',
  canonical,
  author = 'Bun Raksa',
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
  breadcrumbs = null, // Array of { name: string, url: string }
  faq = null, // Array of { q: string, a: string }
  itemList = null, // Array of { name: string, url: string, image?: string, price?: number, currency?: string }
  jsonLd = null,
}) {
  const baseSiteUrl = (env.siteUrl || 'https://martsystemkh.software').replace(/\/+$/, '');

  // Compute clean canonical URL
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
    : `${baseSiteUrl}/mart.jpg`;
  const effectiveOgUrl = ogUrl || cleanCanonical;

  const effectiveTwitterTitle = twitterTitle || effectiveOgTitle;
  const effectiveTwitterDescription = twitterDescription || effectiveOgDescription;
  const effectiveTwitterImage = twitterImage
    ? twitterImage.startsWith('http')
      ? twitterImage
      : `${baseSiteUrl}${twitterImage.startsWith('/') ? '' : '/'}${twitterImage}`
    : effectiveOgImage;

  useEffect(() => {
    // 1. Page Title
    document.title = title;

    // Helper for managing dynamic meta tags
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

    // 2. Standard Search Meta Tags
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'keywords', keywords);
    setMetaTag('name', 'author', author);
    setMetaTag('name', 'robots', robots);
    setMetaTag('name', 'googlebot', robots);
    setMetaTag('name', 'bingbot', robots);

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
    setMetaTag('property', 'og:image:type', 'image/jpeg');
    setMetaTag('property', 'og:image:width', '1200');
    setMetaTag('property', 'og:image:height', '630');
    setMetaTag('property', 'og:image:alt', effectiveOgTitle);
    setMetaTag('property', 'og:locale', 'km_KH');
    setMetaTag('property', 'og:locale:alternate', 'en_US');

    // 5. Twitter / X Meta Tags
    setMetaTag('name', 'twitter:card', twitterCard);
    setMetaTag('name', 'twitter:site', '@martsystemkh');
    setMetaTag('name', 'twitter:creator', '@martsystemkh');
    setMetaTag('name', 'twitter:title', effectiveTwitterTitle);
    setMetaTag('name', 'twitter:description', effectiveTwitterDescription);
    setMetaTag('name', 'twitter:image', effectiveTwitterImage);
    setMetaTag('name', 'twitter:image:alt', effectiveTwitterTitle);
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

    // 7. Dynamic JSON-LD Structured Data Builder
    const scriptId = 'dynamic-seo-jsonld';
    let scriptEl = document.getElementById(scriptId);

    // Assemble unified JSON-LD graph
    const graphItems = [];

    if (jsonLd) {
      if (Array.isArray(jsonLd)) {
        graphItems.push(...jsonLd);
      } else if (jsonLd['@graph'] && Array.isArray(jsonLd['@graph'])) {
        graphItems.push(...jsonLd['@graph']);
      } else {
        graphItems.push(jsonLd);
      }
    }

    // Breadcrumbs Schema
    if (Array.isArray(breadcrumbs) && breadcrumbs.length > 0) {
      graphItems.push({
        '@type': 'BreadcrumbList',
        '@id': `${cleanCanonical}#breadcrumb`,
        'itemListElement': breadcrumbs.map((crumb, idx) => ({
          '@type': 'ListItem',
          'position': idx + 1,
          'name': crumb.name,
          'item': crumb.url.startsWith('http')
            ? crumb.url
            : `${baseSiteUrl}${crumb.url.startsWith('/') ? '' : '/'}${crumb.url}`,
        })),
      });
    }

    // FAQ Schema
    if (Array.isArray(faq) && faq.length > 0) {
      graphItems.push({
        '@type': 'FAQPage',
        '@id': `${cleanCanonical}#faq`,
        'mainEntity': faq.map((item) => ({
          '@type': 'Question',
          'name': item.q,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': item.a,
          },
        })),
      });
    }

    // ItemList Catalog Schema
    if (Array.isArray(itemList) && itemList.length > 0) {
      graphItems.push({
        '@type': 'ItemList',
        '@id': `${cleanCanonical}#itemlist`,
        'itemListElement': itemList.map((item, idx) => {
          const itemUrl = item.url
            ? (item.url.startsWith('http') ? item.url : `${baseSiteUrl}${item.url.startsWith('/') ? '' : '/'}${item.url}`)
            : cleanCanonical;
          return {
            '@type': 'ListItem',
            'position': idx + 1,
            'name': item.name,
            'url': itemUrl,
            ...(item.image ? { 'image': item.image.startsWith('http') ? item.image : `${baseSiteUrl}/${item.image.replace(/^\//, '')}` } : {}),
            ...(item.price != null ? {
              'offers': {
                '@type': 'Offer',
                'price': Number(item.price).toFixed(2),
                'priceCurrency': item.currency || 'USD',
                'availability': 'https://schema.org/InStock',
              }
            } : {})
          };
        }),
      });
    }

    if (graphItems.length > 0) {
      const payload = {
        '@context': 'https://schema.org',
        '@graph': graphItems,
      };

      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = scriptId;
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(payload);
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
    author,
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
    breadcrumbs,
    faq,
    itemList,
    jsonLd,
  ]);

  return null;
}
