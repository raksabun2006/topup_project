/**
 * Mart System — Automated SEO & Google Indexing Verification Test Suite
 * Tests production crawler readiness, robots.txt, sitemap.xml, canonical rules,
 * noindex boundaries, structured data, and security invariants.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const BASE_URL = 'https://martsystemkh.software';
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('\n==================================================');
console.log('MART SYSTEM — AUTOMATED SEO VERIFICATION AUDIT');
console.log('==================================================\n');

// ----------------------------------------------------
// 1. ROBOTS.TXT AUDIT
// ----------------------------------------------------
console.log('--- 1. Testing robots.txt Configuration ---');
const robotsPath = path.join(ROOT_DIR, 'public', 'robots.txt');
assert(fs.existsSync(robotsPath), 'public/robots.txt exists on disk');

const robotsContent = fs.readFileSync(robotsPath, 'utf-8');

assert(!robotsContent.match(/^Disallow:\s*\/$/m), 'robots.txt does NOT contain accidental global "Disallow: /"');
assert(robotsContent.includes(`Sitemap: ${BASE_URL}/sitemap.xml`), 'robots.txt contains official HTTPS sitemap directive');
assert(robotsContent.includes(`Host: ${BASE_URL}`), 'robots.txt contains official HTTPS Host directive');

// Allowed public routes
const requiredAllows = ['Allow: /', 'Allow: /shop', 'Allow: /categories', 'Allow: /category/*', 'Allow: /products/*'];
requiredAllows.forEach((directive) => {
  assert(robotsContent.includes(directive), `robots.txt allows public route: "${directive}"`);
});

// Allowed rendering assets
assert(robotsContent.includes('Allow: /assets/'), 'robots.txt allows all assets directory resources for full JS rendering');
assert(robotsContent.includes('Allow: /*.js$'), 'robots.txt allows JavaScript files for headless Googlebot execution');
assert(robotsContent.includes('Allow: /*.css$'), 'robots.txt allows CSS styling resources');

// Disallowed private paths
const requiredDisallows = [
  'Disallow: /admin',
  'Disallow: /dashboard',
  'Disallow: /pos',
  'Disallow: /cart',
  'Disallow: /checkout',
  'Disallow: /order-success',
  'Disallow: /orders',
  'Disallow: /account',
  'Disallow: /login',
  'Disallow: /register',
  'Disallow: /forgot-password',
  'Disallow: /reset-password',
  'Disallow: /api/',
  'Disallow: /*?*search=',
  'Disallow: /*?*sort=',
];
requiredDisallows.forEach((directive) => {
  assert(robotsContent.includes(directive), `robots.txt disallows private/crawl-waste route: "${directive}"`);
});

// ----------------------------------------------------
// 2. XML SITEMAP AUDIT
// ----------------------------------------------------
console.log('\n--- 2. Testing sitemap.xml Compliance & Integrity ---');
const sitemapPath = path.join(ROOT_DIR, 'public', 'sitemap.xml');
assert(fs.existsSync(sitemapPath), 'public/sitemap.xml exists on disk');

const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
assert(sitemapContent.startsWith('<?xml version="1.0" encoding="UTF-8"?>'), 'sitemap.xml has valid XML declaration');
assert(sitemapContent.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'), 'sitemap.xml declares valid sitemap schema namespace');

// Fake hreflang check
assert(!sitemapContent.includes('xhtml:link'), 'sitemap.xml has NO fake hreflang tags (Requirement 18)');

// Extract all <loc> URLs
const locRegex = /<loc>(.*?)<\/loc>/g;
const sitemapUrls = [];
let match;
while ((match = locRegex.exec(sitemapContent)) !== null) {
  sitemapUrls.push(match[1]);
}

assert(sitemapUrls.length >= 6, `sitemap.xml has at least 6 URLs (found ${sitemapUrls.length})`);
assert(sitemapUrls.every((url) => url.startsWith('https://martsystemkh.software/')), 'All sitemap URLs strictly use production HTTPS domain');

// Required core pages
const corePages = [
  `${BASE_URL}/`,
  `${BASE_URL}/shop`,
  `${BASE_URL}/categories`,
  `${BASE_URL}/about`,
  `${BASE_URL}/help`,
  `${BASE_URL}/guide`,
];
corePages.forEach((url) => {
  assert(sitemapUrls.includes(url), `sitemap.xml includes core public page: ${url}`);
});

// Prohibited pages that MUST NOT appear in sitemap
const prohibitedPatterns = [
  '/login', '/register', '/cart', '/checkout', '/order-success',
  '/admin', '/dashboard', '/pos', '/orders', '/account', '/profile',
  '/forgot-password', '/reset-password', '/payment', 'search='
];
let foundProhibited = false;
for (const url of sitemapUrls) {
  for (const prob of prohibitedPatterns) {
    if (url.includes(prob)) {
      foundProhibited = true;
      console.error(`  ✗ PROHIBITED URL in sitemap: ${url} matches "${prob}"`);
    }
  }
}
assert(!foundProhibited, 'sitemap.xml excludes all private, admin, checkout, account, and query parameter URLs');

// Dynamic products check
const productUrls = sitemapUrls.filter((u) => u.includes('/products/'));
assert(productUrls.length > 0, `sitemap.xml dynamically indexes products (found ${productUrls.length} product URLs)`);

// ----------------------------------------------------
// 3. CANONICAL & HREFLANG INTEGRITY IN INDEX.HTML
// ----------------------------------------------------
console.log('\n--- 3. Testing index.html Root HTML & Head Metadata ---');
const indexPath = path.join(ROOT_DIR, 'index.html');
const indexContent = fs.readFileSync(indexPath, 'utf-8');

assert(indexContent.includes('<link rel="canonical" href="https://martsystemkh.software/" />'), 'index.html has production HTTPS homepage canonical tag');
assert(!indexContent.includes('<link rel="alternate" hreflang="km"'), 'index.html contains NO fake hreflang tags');
assert(indexContent.includes('google-site-verification'), 'index.html provides Google Search Console verification hook');

// ----------------------------------------------------
// 4. SEO COMPONENT TESTS (NOINDEX & SOFT-404 GUARDS)
// ----------------------------------------------------
console.log('\n--- 4. Testing SEO.jsx Component Logic & Invariants ---');
const seoCompPath = path.join(ROOT_DIR, 'src', 'components', 'SEO.jsx');
const seoCompContent = fs.readFileSync(seoCompPath, 'utf-8');

assert(seoCompContent.includes('noindex = false'), 'SEO.jsx accepts noindex boolean prop');
assert(seoCompContent.includes('isNoIndex') && seoCompContent.includes("'noindex, nofollow'"), 'SEO.jsx enforces noindex, nofollow when noindex is true');
assert(seoCompContent.includes('if (isNoIndex) {') && seoCompContent.includes('canonicalLink.remove()'), 'SEO.jsx suppresses/removes canonical link on noindex pages to prevent Soft 404s');
assert(seoCompContent.includes('googleSiteVerification'), 'SEO.jsx supports dynamic Google Search Console site verification meta tag');

// ----------------------------------------------------
// 5. PRIVATE & SENSITIVE PAGE AUDIT
// ----------------------------------------------------
console.log('\n--- 5. Testing Private Route Noindex Directives ---');
const privatePages = [
  { file: 'src/pages/Cart.jsx', name: 'Cart' },
  { file: 'src/pages/Checkout.jsx', name: 'Checkout' },
  { file: 'src/pages/OrderSuccess.jsx', name: 'OrderSuccess' },
  { file: 'src/pages/Orders.jsx', name: 'Orders' },
  { file: 'src/pages/OrderDetail.jsx', name: 'OrderDetail' },
  { file: 'src/pages/Account.jsx', name: 'Account' },
  { file: 'src/pages/Wishlist.jsx', name: 'Wishlist' },
  { file: 'src/pages/CustomerDashboard.jsx', name: 'CustomerDashboard' },
  { file: 'src/pages/Discounts.jsx', name: 'Discounts' },
  { file: 'src/pages/Pos.jsx', name: 'Pos' },
  { file: 'src/pages/PosCustomerDisplayPage.jsx', name: 'PosCustomerDisplayPage' },
  { file: 'src/pages/AddressManagement.jsx', name: 'AddressManagement' },
  { file: 'src/pages/LoyaltyPoints.jsx', name: 'LoyaltyPoints' },
  { file: 'src/pages/CustomerSupport.jsx', name: 'CustomerSupport' },
  { file: 'src/pages/Notifications.jsx', name: 'Notifications' },
  { file: 'src/pages/NotFound.jsx', name: 'NotFound' },
];

privatePages.forEach(({ file, name }) => {
  const fullPath = path.join(ROOT_DIR, file);
  const content = fs.readFileSync(fullPath, 'utf-8');
  const hasNoindex = content.includes('noindex={true}') || content.includes('robots="noindex, nofollow"');
  assert(hasNoindex, `Private page ${name} sets noindex / robots="noindex, nofollow"`);
});

// ----------------------------------------------------
// 6. PRODUCT DETAILS & CATEGORIES SEO AUDIT
// ----------------------------------------------------
console.log('\n--- 6. Testing Product & Category Architecture ---');
const productDetailPath = path.join(ROOT_DIR, 'src', 'pages', 'ProductDetail.jsx');
const productDetailContent = fs.readFileSync(productDetailPath, 'utf-8');

assert(!productDetailContent.includes('pseudoRating'), 'ProductDetail.jsx has NO fake pseudoRating (Requirement 8 & 9)');
assert(!productDetailContent.includes('pseudoReviewsCount'), 'ProductDetail.jsx has NO fake pseudoReviewsCount');
assert(productDetailContent.includes("title=\"404 Product Not Found | Mart System Cambodia\""), 'ProductDetail.jsx renders 404 title on missing product');
assert(productDetailContent.includes("noindex={true}"), 'ProductDetail.jsx sets noindex on missing product');

const shopPath = path.join(ROOT_DIR, 'src', 'pages', 'Shop.jsx');
const shopContent = fs.readFileSync(shopPath, 'utf-8');
assert(shopContent.includes('getCategoryUrl'), 'Shop.jsx uses clean getCategoryUrl canonicals');
assert(shopContent.includes("hasFacetFilters ? 'noindex, follow' : 'index, follow'"), 'Shop.jsx avoids indexing facet/search bloat with noindex, follow');
assert(shopContent.includes('const isFiltered ='), 'Shop.jsx defines isFiltered state for UI reset buttons');

const appRoutesPath = path.join(ROOT_DIR, 'src', 'routes', 'AppRoutes.jsx');
const appRoutesContent = fs.readFileSync(appRoutesPath, 'utf-8');
assert(appRoutesContent.includes('path="/categories/:categoryName"'), 'AppRoutes.jsx supports both /category/:categoryName and /categories/:categoryName');

// ----------------------------------------------------
// FINAL SUMMARY
// ----------------------------------------------------
console.log('\n==================================================');
console.log(`AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('==================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL SEO REQUIREMENTS AND AUDIT CHECKS PASSED!\n');
  process.exit(0);
}
