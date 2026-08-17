/**
 * ចំណុចតែមួយគត់ដែលអាន import.meta.env។
 *
 * ការហៅ import.meta.env ដោយផ្ទាល់ក្នុងឯកសារនានាមានន័យថា
 * ការសរសេរឈ្មោះខុសមួយ (VITE_API_URL ជំនួស VITE_API_BASE_URL)
 * បរាជ័យស្ងាត់ៗជា undefined ហើយ Axios ហៅទៅ URL ទទេ។
 *
 * ការបោះ error នៅពេលចាប់ផ្តើមប្រសើរជាងការ debug សំណើ 404។
 */

function required(key, value) {
  if (!value) {
    throw new Error(
      `បាត់ environment variable: ${key}\n` +
      `សូមចម្លង .env.example ទៅ .env.local នៅ root របស់ project។`
    );
  }
  return value;
}

export const env = {
  apiBaseUrl: required('VITE_API_BASE_URL', import.meta.env.VITE_API_BASE_URL),

  appName: import.meta.env.VITE_APP_NAME ?? 'GameTopUp',

  // Number(undefined) ផ្តល់ NaN ដូច្នេះត្រូវមានតម្លៃបម្រុង។
  //
  // 15s - Bakong អនុញ្ញាតតែ 100 សំណើ/ថ្ងៃលើ token developer (សូមមើល
  // client.js)។ 5s x 10min = 120 សំណើក្នុងការទូទាត់តែមួយ - លើសកូតា
  // ទាំងអស់ក្នុងការសាកល្បងតែម្តង។ 15s x 10min = 40 សំណើ។
  paymentPollIntervalMs: Number(
    import.meta.env.VITE_PAYMENT_POLL_INTERVAL_MS ?? 15000
  ),

  paymentTimeoutMs: Number(
    import.meta.env.VITE_PAYMENT_TIMEOUT_MS ?? 600000
  ),

  // Bakong KHQR ជាទូទៅផុតកំណត់ក្នុងចន្លោះ ៥-១៥ នាទី។ តម្លៃនេះផ្ញើទៅ
  // backend ជា expirationMinutes ពេលបង្កើត QR ថ្មី ហើយក៏ត្រូវប្រើ
  // ជា fallback គណនា countdown នៅ client-side បើ backend មិនបានផ្ញើ
  // payment.expiresAt មកវិញ។
  qrExpirationMinutes: Number(
    import.meta.env.VITE_QR_EXPIRATION_MINUTES ?? 10
  ),
};