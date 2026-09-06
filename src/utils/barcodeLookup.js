import { productApi } from '../api/productApi';

/**
 * Cache for catalog products fetched during barcode lookup to prevent redundant network calls
 */
let catalogCache = null;
let catalogCacheTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute

export function clearBarcodeLookupCache() {
  catalogCache = null;
  catalogCacheTime = 0;
}

/**
 * Pre-fetch catalog in background so lookups are instantaneous (0ms)
 */
export async function prefetchCatalogCache() {
  const now = Date.now();
  if (catalogCache && now - catalogCacheTime <= CACHE_TTL_MS) return;
  try {
    const res = await productApi.list({ page: 0, size: 150 });
    const items = Array.isArray(res)
      ? res
      : Array.isArray(res?.content)
      ? res.content
      : Array.isArray(res?.data?.content)
      ? res.data.content
      : [];
    if (items.length > 0) {
      catalogCache = items;
      catalogCacheTime = now;
    }
  } catch {
    // Non-blocking background warmup
  }
}

/**
 * Look up a product by barcode or SKU
 * 1. Checks the currently loaded local products first (instant)
 * 2. If not found, checks cached catalog or fetches from productApi.list({ size: 100 })
 *
 * @param {string} code - Barcode or SKU entered / scanned
 * @param {Array} localProducts - Products currently loaded in POS grid
 * @returns {Promise<{ status: 'found' | 'not_found' | 'error', product?: object, message?: string, code: string }>}
 */
export async function lookupProductByBarcode(code, localProducts = []) {
  const trimmed = String(code || '').trim().toLowerCase();
  if (!trimmed) {
    return { status: 'not_found', code: '', message: 'កូដទទេ (Empty barcode)' };
  }

  // Helper matcher
  const matchProduct = (p) => {
    if (!p) return false;
    const b = p.barcode ? String(p.barcode).trim().toLowerCase() : '';
    const s = p.sku ? String(p.sku).trim().toLowerCase() : '';
    const id = p.id ? String(p.id).trim().toLowerCase() : '';
    return b === trimmed || s === trimmed || id === trimmed;
  };

  // 1. Instant check in local products
  if (Array.isArray(localProducts)) {
    const localMatch = localProducts.find(matchProduct);
    if (localMatch) {
      return { status: 'found', product: localMatch, code: trimmed };
    }
  }

  // 2. Fetch from productApi if not in local page or cache expired
  const now = Date.now();
  if (!catalogCache || now - catalogCacheTime > CACHE_TTL_MS) {
    try {
      const res = await productApi.list({ page: 0, size: 100 });
      const items = Array.isArray(res)
        ? res
        : Array.isArray(res?.content)
        ? res.content
        : Array.isArray(res?.data?.content)
        ? res.data.content
        : [];
      catalogCache = items;
      catalogCacheTime = now;
    } catch (err) {
      console.warn('Barcode catalog fetch fallback failed:', err);
      // If network fails and it wasn't in localProducts, report error
      return {
        status: 'error',
        code: trimmed,
        message: 'មិនអាចតភ្ជាប់ទៅកាន់ម៉ាស៊ីនបម្រើបានទេ (Unable to connect to server)',
      };
    }
  }

  // 3. Search in cached catalog
  if (catalogCache && catalogCache.length > 0) {
    const catalogMatch = catalogCache.find(matchProduct);
    if (catalogMatch) {
      return { status: 'found', product: catalogMatch, code: trimmed };
    }
  }

  return {
    status: 'not_found',
    code: trimmed,
    message: `រកមិនឃើញទំនិញដែលមានបាកូដ "${code}" ទេ`,
  };
}
