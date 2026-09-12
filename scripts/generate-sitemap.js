/**
 * Dynamic Sitemap Generator for Mart System
 * Builds high-ranking XML sitemap with XML namespaces, hreflang, image tags,
 * and dynamically discovered product URLs from the backend API.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://martsystemkh.software';
const BACKEND_API = 'https://gametopup-backend-production-3423.up.railway.app/api/v1/products';
const OUTPUT_PATH = path.resolve(__dirname, '../public/sitemap.xml');

function slugify(text = '') {
  if (!text) return '';
  return String(text)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s\u1780-\u17FF-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getProductSlug(product) {
  if (!product) return '';
  const id = product.id || product.productId;
  if (!id) return '';
  const nameSlug = slugify(product.name || product.productName || 'product');
  return nameSlug ? `${nameSlug}--${id}` : String(id);
}

function escapeXml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function fetchProducts() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(BACKEND_API, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[sitemap] Backend API returned status ${res.status}`);
      return [];
    }
    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.content)) return data.content;
    if (data && Array.isArray(data.data)) return data.data;
    return [];
  } catch (err) {
    console.warn('[sitemap] Failed to fetch products from backend API (offline or timeout):', err.message);
    return [];
  }
}

async function generateSitemap() {
  console.log('[sitemap] Generating SEO sitemap.xml...');
  const today = new Date().toISOString().split('T')[0];
  const products = await fetchProducts();
  console.log(`[sitemap] Discovered ${products.length} products for dynamic sitemap indexing.`);

  // Core static pages
  const staticPages = [
    {
      loc: `${BASE_URL}/`,
      priority: '1.0',
      changefreq: 'daily',
      image: {
        loc: `${BASE_URL}/mart.jpg`,
        title: 'Mart System — Online Store & E-Commerce Cambodia',
        caption: 'Shop everyday groceries, drinks, and snacks with $1.50 express delivery and Bakong KHQR checkout.',
      },
    },
    {
      loc: `${BASE_URL}/shop`,
      priority: '0.95',
      changefreq: 'daily',
      image: {
        loc: `${BASE_URL}/mart.jpg`,
        title: 'Shop All Products | Mart System',
        caption: 'Browse full collection of groceries, drinks, snacks and lifestyle products in Phnom Penh.',
      },
    },
    {
      loc: `${BASE_URL}/categories`,
      priority: '0.90',
      changefreq: 'weekly',
    },
    {
      loc: `${BASE_URL}/about`,
      priority: '0.85',
      changefreq: 'monthly',
      image: {
        loc: `${BASE_URL}/developer.jpg`,
        title: 'Bun Raksa — Creator of Mart System',
        caption: 'Full-Stack Developer specialized in Spring Boot, React, and Bakong KHQR Payment Systems.',
      },
    },
    {
      loc: `${BASE_URL}/help`,
      priority: '0.80',
      changefreq: 'monthly',
    },
    {
      loc: `${BASE_URL}/guide`,
      priority: '0.80',
      changefreq: 'monthly',
    },
  ];

  // Discover categories from products
  const categorySet = new Set();
  products.forEach((p) => {
    if (p.category && typeof p.category === 'string') {
      categorySet.add(p.category.trim());
    }
  });

  const categoryPages = Array.from(categorySet).map((cat) => ({
    loc: `${BASE_URL}/category/${encodeURIComponent(cat)}`,
    priority: '0.85',
    changefreq: 'weekly',
  }));

  // Dynamic product pages
  const productPages = products.map((p) => {
    const slug = getProductSlug(p);
    const item = {
      loc: `${BASE_URL}/products/${slug}`,
      priority: '0.80',
      changefreq: 'weekly',
      lastmod: today,
    };
    if (p.imageUrl) {
      item.image = {
        loc: p.imageUrl,
        title: p.name || 'Product',
        caption: p.description ? p.description.slice(0, 150) : `Buy ${p.name} online in Cambodia from Mart System.`,
      };
    }
    return item;
  });

  const allUrls = [...staticPages, ...categoryPages, ...productPages];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:xhtml="http://www.w3.org/1999/xhtml"\n`;
  xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n\n`;

  for (const page of allUrls) {
    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(page.loc)}</loc>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="km" href="${escapeXml(page.loc)}" />\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(page.loc)}" />\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(page.loc)}" />\n`;
    xml += `    <lastmod>${page.lastmod || today}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq || 'weekly'}</changefreq>\n`;
    xml += `    <priority>${page.priority || '0.7'}</priority>\n`;

    if (page.image) {
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${escapeXml(page.image.loc)}</image:loc>\n`;
      if (page.image.title) {
        xml += `      <image:title>${escapeXml(page.image.title)}</image:title>\n`;
      }
      if (page.image.caption) {
        xml += `      <image:caption>${escapeXml(page.image.caption)}</image:caption>\n`;
      }
      xml += `    </image:image>\n`;
    }

    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;

  fs.writeFileSync(OUTPUT_PATH, xml, 'utf-8');
  console.log(`[sitemap] Successfully wrote ${allUrls.length} URLs to ${OUTPUT_PATH}`);
}

generateSitemap();
