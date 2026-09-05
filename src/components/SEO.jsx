import { useEffect } from 'react';
import { env } from '../config/env';

/**
 * Reusable, lightweight SEO management component for ReactJS.
 * Dynamically synchronizes document <title>, <meta>, <link rel="canonical">,
 * Open Graph, Twitter cards, and Schema.org JSON-LD structured data.
 */
export default function SEO({
  title = 'Mart System | ប្រព័ន្ធគ្រប់គ្រងហាង និង POS ទំនើបសម្រាប់អាជីវកម្ម',
  description = 'Mart System — ប្រព័ន្ធគ្រប់គ្រងហាង និង POS ទំនើបសម្រាប់អាជីវកម្ម។ គ្រប់គ្រងការលក់ ទំនិញ ស្តុក និងទូទាត់ប្រាក់តាម Bakong KHQR បានយ៉ាងរហ័ស និងមានសុវត្ថិភាព ។ ចំណុចលក់ (POS) • ទំនិញ (Products)។ ទំនាក់ទំនង: 0968782196, Email: raksabun2006@gmail.com',
  keywords = 'Mart System, ប្រព័ន្ធគ្រប់គ្រងហាង និង POS ទំនើបសម្រាប់អាជីវកម្ម, ប្រព័ន្ធគ្រប់គ្រងហាង, ប្រព័ន្ធ POS, ចំណុចលក់ POS, ទំនិញ Products, គ្រប់គ្រងការលក់, គ្រប់គ្រងស្តុក, Bakong KHQR POS, POS System Cambodia',
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
  jsonLd,
}) {
  const baseSiteUrl = (env.siteUrl || 'https://www.martsystemkh.software').replace(/\/+$/, '');

  // Compute canonical URL strictly using production domain
  let cleanCanonical = canonical;
  if (!cleanCanonical) {
    cleanCanonical = `${baseSiteUrl}/`;
  } else if (cleanCanonical.startsWith('/')) {
    cleanCanonical = `${baseSiteUrl}${cleanCanonical === '/' ? '/' : cleanCanonical.replace(/\/+$/, '')}`;
  } else if (cleanCanonical.startsWith('http')) {
    // Ensure localhost is replaced if ever passed by mistake
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
    // 1. Update Title
    document.title = title;

    // Helper to get or create a meta tag
    const setMetaTag = (attrName, attrVal, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // 2. Standard Meta Tags
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'keywords', keywords);
    setMetaTag('name', 'robots', robots);

    // 3. Canonical Link Tag
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

    // 6. Dynamic JSON-LD Structured Data
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
      // Clean up dynamic JSON-LD on route change
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
    jsonLd,
  ]);

  return null;
}
