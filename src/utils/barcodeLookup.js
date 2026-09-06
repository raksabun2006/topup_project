import { productApi } from '../api/productApi';

/**
 * Cache for catalog products fetched during barcode lookup to prevent redundant network calls
 */
let catalogCache = [];
let catalogCacheTime = 0;
let isCacheComplete = false;
const CACHE_TTL_MS = 60 * 1000; // 1 minute TTL

export function clearBarcodeLookupCache() {
  catalogCache = [];
  catalogCacheTime = 0;
  isCacheComplete = false;
}

/**
 * Helper to extract items array from various Spring response formats
 */
function extractProductsFromResponse(res) {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.content)) return res.content;
  if (Array.isArray(res?.data?.content)) return res.data.content;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res?.data)) return res.data;
  return [];
}

/**
 * Extract totalPages safely from various response wrapper formats
 */
function extractTotalPages(res) {
  if (typeof res?.totalPages === 'number') return res.totalPages;
  if (typeof res?.data?.totalPages === 'number') return res.data.totalPages;
  return 1;
}

/**
 * Helper matcher for exact Barcode or SKU match (case-insensitive string comparison)
 */
function matchProductExact(p, normalizedCode) {
  if (!p) return false;
  const b = p.barcode ? String(p.barcode).trim().toLowerCase() : '';
  const s = p.sku ? String(p.sku).trim().toLowerCase() : '';
  const id = p.id ? String(p.id).trim().toLowerCase() : '';
  return b === normalizedCode || s === normalizedCode || id === normalizedCode;
}

/**
 * Pre-fetch initial catalog page in background for zero-latency lookups
 */
export async function prefetchCatalogCache() {
  const now = Date.now();
  if (catalogCache.length > 0 && now - catalogCacheTime <= CACHE_TTL_MS) return;

  try {
    console.log('[SCANNER 4] API page requested (prefetch): page 0, size 50');
    const res = await productApi.list({ page: 0, size: 50 });
    const items = extractProductsFromResponse(res);
    const totalPages = extractTotalPages(res);

    if (items.length > 0) {
      catalogCache = [...items];
      catalogCacheTime = now;
      if (totalPages <= 1) {
        isCacheComplete = true;
      }
      console.log('[SCANNER] catalog prefetch cache ready, products:', items.length);
    }
  } catch (err) {
    console.warn('[SCANNER ERROR] prefetch catalog notice:', err?.message);
  }
}

/**
 * Look up a product by exact barcode or SKU with multi-page search
 * 1. Checks currently loaded localProducts (instant 0ms)
 * 2. Checks cached catalog items (instant 0ms)
 * 3. If not found, pages through productApi.list() until found or end of catalog
 *
 * @param {string} code - Barcode or SKU entered / scanned
 * @param {Array} localProducts - Products currently loaded in POS grid
 * @returns {Promise<{ status: 'found' | 'not_found' | 'error', product?: object, message?: string, code: string }>}
 */
export async function lookupProductByBarcode(code, localProducts = []) {
  const trimmed = String(code || '').trim();
  if (!trimmed) {
    return { status: 'not_found', code: '', message: 'កូដទទេ (Empty barcode)' };
  }

  const normalized = trimmed.toLowerCase();
  console.log('[SCANNER 3] lookup started for barcode/SKU:', trimmed);

  // 1. Instant check in local products
  if (Array.isArray(localProducts) && localProducts.length > 0) {
    const localMatch = localProducts.find((p) => matchProductExact(p, normalized));
    if (localMatch) {
      console.log('[SCANNER 5] product found (local):', localMatch.name);
      return { status: 'found', product: localMatch, code: trimmed };
    }
  }

  // 2. Search in cached catalog
  const now = Date.now();
  const isCacheFresh = now - catalogCacheTime <= CACHE_TTL_MS;

  if (catalogCache.length > 0 && isCacheFresh) {
    const cachedMatch = catalogCache.find((p) => matchProductExact(p, normalized));
    if (cachedMatch) {
      console.log('[SCANNER 5] product found (cache):', cachedMatch.name);
      return { status: 'found', product: cachedMatch, code: trimmed };
    }

    // If cache is complete and verified fresh, the item genuinely doesn't exist
    if (isCacheComplete) {
      console.log('[SCANNER 3] lookup result: not found in complete cache');
      return {
        status: 'not_found',
        code: trimmed,
        message: `រកមិនឃើញទំនិញដែលមានបាកូដ "${trimmed}" ទេ`,
      };
    }
  } else {
    // Expired or empty cache
    catalogCache = [];
    isCacheComplete = false;
  }

  // 3. Search page-by-page through productApi.list()
  const PAGE_SIZE = 50;
  const MAX_PAGES_SAFETY_LIMIT = 50;
  let currentPage = 0;
  let totalPages = 1;
  const accumulated = new Map();

  // Populate map with existing cache to avoid duplicates
  catalogCache.forEach((p) => {
    if (p?.id) accumulated.set(p.id, p);
  });

  try {
    while (currentPage < totalPages && currentPage < MAX_PAGES_SAFETY_LIMIT) {
      console.log(`[SCANNER 4] API page requested: page ${currentPage}, size ${PAGE_SIZE}`);
      const pageRes = await productApi.list({ page: currentPage, size: PAGE_SIZE });
      const pageItems = extractProductsFromResponse(pageRes);
      totalPages = extractTotalPages(pageRes);

      if (!Array.isArray(pageItems) || pageItems.length === 0) {
        break;
      }

      // Add to accumulated cache
      for (const item of pageItems) {
        if (item?.id) {
          accumulated.set(item.id, item);
        }
      }

      // Check if product is in this page
      const foundItem = pageItems.find((p) => matchProductExact(p, normalized));
      if (foundItem) {
        catalogCache = Array.from(accumulated.values());
        catalogCacheTime = Date.now();
        console.log('[SCANNER 5] product found (API):', foundItem.name);
        return { status: 'found', product: foundItem, code: trimmed };
      }

      currentPage++;
    }

    // Checked all pages and not found
    catalogCache = Array.from(accumulated.values());
    catalogCacheTime = Date.now();
    isCacheComplete = true;

    console.log('[SCANNER 3] lookup result: not found after checking all pages');
    return {
      status: 'not_found',
      code: trimmed,
      message: `រកមិនឃើញទំនិញដែលមានបាកូដ "${trimmed}" ទេ`,
    };
  } catch (err) {
    console.error('[SCANNER ERROR] lookupProductByBarcode API error:', err);
    return {
      status: 'error',
      code: trimmed,
      message: err?.message || 'មិនអាចតភ្ជាប់ទៅកាន់ម៉ាស៊ីនបម្រើបានទេ (Connection error)',
    };
  }
}

