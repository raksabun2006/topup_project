/** USD បង្ហាញ ២ ខ្ទង់ទសភាគ, KHR គ្មានទសភាគ។ */
export function formatCurrency(amount, currency = 'USD') {
  if (amount == null) return '-';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'KHR' ? 0 : 2,
  }).format(amount);
}

export function formatDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}