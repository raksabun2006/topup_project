/** USD បង្ហាញ ២ ខ្ទង់ទសភាគ, KHR គ្មានទសភាគ។ */
export function formatCurrency(amount, currency = 'USD') {
  if (amount == null) return '-';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'KHR' ? 0 : 2,
  }).format(amount);
}

/**
 * សម្រាប់តម្លៃដកចេញ/បន្ថែម (បញ្ចុះតម្លៃ, ពន្ធ) ដែលអាចជាភាគរយតូចលើ
 * subtotal តូច - ២ខ្ទង់ទសភាគធម្មតារាប់មូលទៅ $0.00 ធ្វើឲ្យមើលទៅដូចជា
 * គ្មានអ្វីកើតឡើងទាំងស្រុង ខណៈគណនាខាងក្នុងត្រឹមត្រូវរួចហើយ។ បង្ហាញ
 * ខ្ទង់ទសភាគបន្ថែមតែពេលចាំបាច់ ដើម្បីបញ្ជាក់ថាតម្លៃពិតជាមិនមែនសូន្យ។
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
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}