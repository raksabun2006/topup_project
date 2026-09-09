import DOMPurify from 'dompurify';

/**
 * Enterprise Frontend Security Utilities for Mart System
 * Protects against XSS, DOM XSS, Open Redirects, URL Injections, CSV Injections,
 * and Prototype Pollution.
 */

// Safe protocol allowlist for external links, deep links, and media
const ALLOWED_URL_SCHEMES = ['https:', 'http:', 'mailto:', 'tel:', 'bakong:', 'khqr:', 'intent:', 'abamobile:'];

/**
 * 1. XSS HTML Sanitization using DOMPurify
 * Cleans any untrusted HTML string using strict sanitization policies.
 */
export function sanitizeHtml(dirty, options = {}) {
  if (!dirty || typeof dirty !== 'string') return '';
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: options.allowedTags || ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'span', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: options.allowedAttr || ['href', 'target', 'rel', 'class', 'title'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'svg', 'math'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'style'],
    ...options,
  });
}

/**
 * 2. Plain Text Escaping
 * Safely escapes characters that could trigger HTML parsing.
 */
export function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * 3. URL & Scheme Sanitization
 * Rejects dangerous URI schemes (javascript:, data:, vbscript:, etc.)
 * Returns a sanitized URL string or a fallback URL.
 */
export function sanitizeUrl(url, fallback = '') {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  if (!trimmed) return fallback;

  // Relative paths are generally safe unless they are protocol-relative (//)
  if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.startsWith('/\\')) {
    return trimmed;
  }

  // Fragment identifiers (#section)
  if (trimmed.startsWith('#')) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed, window.location.origin);
    const protocol = parsed.protocol.toLowerCase();

    if (ALLOWED_URL_SCHEMES.includes(protocol)) {
      return trimmed;
    }
  } catch {
    // If it's a custom mobile scheme (e.g. bakong://...)
    for (const scheme of ALLOWED_URL_SCHEMES) {
      if (trimmed.toLowerCase().startsWith(scheme)) {
        return trimmed;
      }
    }
  }

  return fallback;
}

/**
 * 4. Open Redirect Guard
 * Ensures redirect targets are restricted to safe, internal application routes.
 * Rejects external URLs, protocol-relative paths (//evil.com), and dangerous schemes.
 */
export function getSafeRedirectUrl(target, fallback = '/customer/dashboard') {
  if (!target) return fallback;

  let candidate = '';
  if (typeof target === 'string') {
    candidate = target.trim();
  } else if (typeof target === 'object' && target !== null) {
    candidate = (target.pathname || '') + (target.search || '') + (target.hash || '');
  }

  if (!candidate) return fallback;

  // Reject protocol-relative URLs (e.g. //attacker.com) or backslash variants (/\attacker.com)
  if (candidate.startsWith('//') || candidate.startsWith('/\\') || candidate.startsWith('\\')) {
    return fallback;
  }

  // Must strictly start with a single slash '/' for internal SPA routing
  if (!candidate.startsWith('/')) {
    return fallback;
  }

  // Reject URL containing a scheme like javascript: or https:
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(candidate)) {
    return fallback;
  }

  // Reject newlines / carriage returns that could manipulate HTTP headers
  if (/[\r\n]/.test(candidate)) {
    return fallback;
  }

  return candidate;
}

/**
 * 5. Safe JSON-LD Serializer
 * Prevents HTML breakout vulnerabilities when rendering JSON inside <script> tags.
 */
export function safeJsonStringify(data) {
  if (!data) return '{}';
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

/**
 * 6. CSV Formula Injection Defense
 * Neutralizes spreadsheet formula execution characters (=, +, -, @, \t, \r)
 * when exporting CSV or Excel files.
 */
export function sanitizeCsvField(val) {
  if (val == null) return '""';
  let str = String(val);

  // If value starts with a formula trigger character, prepend a single quote
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Standard RFC 4180 double-quote escaping
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

/**
 * 7. Prototype Pollution Guard
 * Recursively deep-clones an object while blocking dangerous keys (__proto__, constructor, prototype).
 */
export function safeDeepClone(source) {
  if (source === null || typeof source !== 'object') {
    return source;
  }

  if (Array.isArray(source)) {
    return source.map(safeDeepClone);
  }

  const cleanObj = {};
  for (const [key, value] of Object.entries(source)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }
    cleanObj[key] = safeDeepClone(value);
  }

  return cleanObj;
}
