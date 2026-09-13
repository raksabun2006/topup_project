export const KHR_RATE = 4100;

/** USD បង្ហាញ ២ ខ្ទង់ទសភាគ, KHR គ្មានទសភាគ។ */
export function formatCurrency(amount, currency = 'USD') {
  if (amount == null) return '-';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'KHR' ? 0 : 2,
  }).format(amount);
}

/** Convert USD amount to Khmer Riel integer */
export function toKhr(usdAmount) {
  if (usdAmount == null || isNaN(usdAmount)) return 0;
  return Math.round(Number(usdAmount) * KHR_RATE);
}

/** Format USD amount as Khmer Riel (៛) */
export function formatKhr(usdAmount) {
  if (usdAmount == null || isNaN(usdAmount)) return '0 ៛';
  const khr = toKhr(usdAmount);
  return `${new Intl.NumberFormat('km-KH').format(khr)} ៛`;
}

/** Format as Dual Currency object and string ($X.XX (XX,XXX ៛)) */
export function formatDual(usdAmount) {
  const usd = formatCurrency(usdAmount, 'USD');
  const khr = formatKhr(usdAmount);
  return {
    usd,
    khr,
    label: `${usd} (${khr})`,
  };
}

/**
 * សម្រាប់តម្លៃដកចេញ/បន្ថែម (បញ្ចុះតម្លៃ, ពន្ធ) ដែលអាចជាភាគរយតូចលើ
 * subtotal តូច - ២ខ្ទង់ទសភាគធម្មតារាប់មូលទៅ $0.00 ធ្វើឲ្យមើលទៅដូចជា
 * គ្មានអ្វីកើតឡើងទាំងស្រុង ខណៈគណនាខាងក្នុងត្រឹមត្រូវរួចហើយ។
 */
export function formatCurrencyPrecise(amount, currency = 'USD') {
  if (amount == null) return '-';
  if (amount > 0 && amount < 0.01) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(amount);
  }
  return formatCurrency(amount, currency);
}

export function formatDate(iso) {
  if (!iso) return '-';
  const d = parseBackendDate(iso);
  if (!d || isNaN(d.getTime())) return '-';
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Parse backend ISO timestamp seamlessly ensuring UTC/timezone safety.
 */
export function parseBackendDate(dateStr) {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return dateStr;
  let str = String(dateStr).trim();
  if (str.includes('T') && !str.endsWith('Z') && !/[+-]\d{2}(:\d{2})?$/.test(str)) {
    str = `${str}Z`;
  }
  const date = new Date(str);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Format total remaining seconds as MM:SS (e.g. 14:59, 00:01, 00:00).
 */
export function formatCountdown(totalSeconds) {
  if (totalSeconds == null || isNaN(totalSeconds)) return null;
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, '0');
  const s = Math.floor(safeSeconds % 60)
    .toString()
    .padStart(2, '0');
  return `${m}:${s}`;
}