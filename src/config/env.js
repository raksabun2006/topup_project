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

  appName: import.meta.env.VITE_APP_NAME ?? 'POS',

  keycloak: {
    url: required('VITE_KEYCLOAK_URL', import.meta.env.VITE_KEYCLOAK_URL),
    realm: required('VITE_KEYCLOAK_REALM', import.meta.env.VITE_KEYCLOAK_REALM),
    clientId: required('VITE_KEYCLOAK_CLIENT_ID', import.meta.env.VITE_KEYCLOAK_CLIENT_ID),
  },

  // ប្រើសម្រាប់ Bakong QR polling ក្នុង POS checkout ប៉ុណ្ណោះ (មើល
  // src/api/salePaymentApi.js) - 15s x 10min = 40 សំណើ/ការទូទាត់
  // ព្រោះ Bakong អនុញ្ញាតតែ 100 សំណើ/ថ្ងៃលើ token developer។
  paymentPollIntervalMs: Number(
    import.meta.env.VITE_PAYMENT_POLL_INTERVAL_MS ?? 15000
  ),

  paymentTimeoutMs: Number(
    import.meta.env.VITE_PAYMENT_TIMEOUT_MS ?? 600000
  ),

  qrExpirationMinutes: Number(
    import.meta.env.VITE_QR_EXPIRATION_MINUTES ?? 10
  ),
};