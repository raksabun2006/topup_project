/**
 * SEO Slug Helper Utility
 * Generates and parses clean, human-readable SEO slugs for Products and Categories.
 * Example: "Coca Cola Can 330ml" + UUID -> "coca-cola-can-330ml--263df9d1-64a8-47a4-bb1c-c271f1eb2249"
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Converts any arbitrary string (English, Khmer, numbers) into an SEO-friendly URL slug.
 */
export function slugify(text = '') {
  if (!text) return '';
  return String(text)
    .trim()
    .toLowerCase()
    // Replace accented characters
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Replace non-alphanumeric characters (except Khmer unicode range \u1780-\u17FF) with hyphens
    .replace(/[^\w\s\u1780-\u17FF-]/g, '')
    // Replace whitespace with hyphens
    .replace(/\s+/g, '-')
    // Replace multiple hyphens with single hyphen
    .replace(/-+/g, '-')
    // Trim leading and trailing hyphens
    .replace(/^-+|-+$/g, '');
}

/**
 * Creates an SEO-friendly URL slug for a product.
 * Returns: "product-name--id"
 */
export function getProductSlug(product) {
  if (!product) return '';
  const id = product.id || product.productId;
  if (!id) return '';
  
  const nameSlug = slugify(product.name || product.productName || 'product');
  if (!nameSlug) return String(id);
  
  return `${nameSlug}--${id}`;
}

/**
 * Extracts the real product ID from an SEO slug or raw ID param.
 * Handles:
 * - "coca-cola-can-330ml--263df9d1-64a8-47a4-bb1c-c271f1eb2249" -> "263df9d1-64a8-47a4-bb1c-c271f1eb2249"
 * - "product-name--42" -> "42"
 * - "263df9d1-64a8-47a4-bb1c-c271f1eb2249" -> "263df9d1-64a8-47a4-bb1c-c271f1eb2249"
 * - "42" -> "42"
 */
export function extractIdFromSlug(slugOrId = '') {
  if (!slugOrId) return '';
  const str = String(slugOrId).trim();

  // If already a clean UUID, return immediately
  if (UUID_REGEX.test(str)) {
    return str;
  }

  // If already a clean numeric ID
  if (/^\d+$/.test(str)) {
    return str;
  }

  // Check for "--" delimiter (e.g. "product-name--12345")
  const doubleDashIdx = str.lastIndexOf('--');
  if (doubleDashIdx !== -1) {
    const extracted = str.slice(doubleDashIdx + 2);
    if (extracted) return extracted;
  }

  // Fallback: check last hyphen if followed by UUID or number
  const lastHyphen = str.lastIndexOf('-');
  if (lastHyphen !== -1) {
    const trailing = str.slice(lastHyphen + 1);
    if (/^\d+$/.test(trailing)) {
      return trailing;
    }
  }

  return str;
}

/**
 * Generates the preferred canonical product URL path.
 * Example: "/products/coca-cola-can-330ml--263df9d1-64a8-47a4-bb1c-c271f1eb2249"
 */
export function getProductUrl(product) {
  if (!product) return '/shop';
  const slug = getProductSlug(product);
  return `/products/${slug}`;
}

/**
 * Generates category URL path.
 * Example: "/shop?category=Beverages%20%26%20Drinks"
 */
export function getCategoryUrl(categoryName) {
  if (!categoryName) return '/shop';
  return `/shop?category=${encodeURIComponent(categoryName)}`;
}
