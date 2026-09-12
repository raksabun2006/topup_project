import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const LANGUAGE_STORAGE_KEY = 'mart_app_language';

const translations = {
  en: {
    // Navigation & General
    home: 'Home',
    shop: 'Shop',
    categories: 'Categories',
    about: 'About',
    aboutDev: 'About Developer',
    userGuide: 'User Guide',
    guide: 'Guide',
    orders: 'Orders',
    myOrders: 'My Orders',
    cart: 'Cart',
    myCart: 'My Cart',
    signIn: 'Sign In',
    register: 'Register',
    signOut: 'Sign Out',
    account: 'Account',
    myAccount: 'My Account',
    adminDashboard: 'Admin Dashboard',
    staffDashboard: 'Staff Operations',
    customerDashboard: 'Customer Dashboard',
    appearance: 'Appearance',
    language: 'Language',
    light: 'Light',
    dark: 'Dark',
    allCategories: 'All Categories',
    allProducts: 'All Products',
    searchPlaceholder: 'Search products, drinks, groceries...',
    clearSearch: 'Clear search',
    viewAllResults: 'View all matching products in Shop',
    matching: 'matching',
    liveSuggestions: 'Live Product Suggestions',
    noProductsFound: 'No products found for',
    welcomeMart: 'Welcome to Mart Store',
    signInDescription: 'Sign in to track orders, save cart & checkout faster',

    // Top Bar Announcement
    announcement: 'Fast delivery $1.50 across Phnom Penh | Scan & Pay with Bakong KHQR | Guaranteed Authentic Quality',

    // Product & Shopping
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    lowStock: 'Low Stock',
    add: 'Add',
    added: 'Added',
    buyNow: 'BUY NOW',
    exploreShop: 'Explore Shop',
    featuredHighlights: 'Featured Highlights',
    exploreCategories: 'Explore Categories',
    shopNow: 'Shop Now',
    total: 'Total',
    subtotal: 'Subtotal',
    items: 'items',
    price: 'Price',
    viewReceipt: 'View Receipt',
    clearAll: 'Clear all filters',
    recommended: 'Recommended',
    priceLowHigh: 'Price: Low to High',
    priceHighLow: 'Price: High to Low',
    nameAZ: 'Name: A to Z',
    showing: 'Showing',
    products: 'products',
    previous: 'Previous',
    next: 'Next',
    
    // Sections & E-Commerce
    wishlist: 'Wishlist',
    myWishlist: 'My Wishlist',
    bestSellers: 'Best Sellers',
    flashSale: 'Flash Sale',
    recentlyViewed: 'Recently Viewed',
    reviews: 'Reviews',
    writeReview: 'Write a Review',
    customerReviews: 'Customer Reviews',
    support: 'Support',
    addresses: 'Addresses',
    loyaltyPoints: 'Loyalty Points',
    coupons: 'Coupons',
    apply: 'Apply',
    enterCoupon: 'Enter coupon code',
    orderTimeline: 'Order Timeline',
    helpCenter: 'Help Center',
    
    // Status
    completed: 'Completed',
    pending: 'Pending',
    active: 'Active',
    canceled: 'Canceled',
  },
  km: {
    // Navigation & General
    home: 'ទំព័រដើម',
    shop: 'ហាងទំនិញ',
    categories: 'ប្រភេទទំនិញ',
    about: 'អំពីយើង',
    aboutDev: 'អំពីអ្នកអភិវឌ្ឍន៍',
    userGuide: 'របៀបប្រើប្រាស់',
    guide: 'របៀបប្រើប្រាស់',
    orders: 'ការបញ្ជាទិញ',
    myOrders: 'ការបញ្ជាទិញរបស់ខ្ញុំ',
    cart: 'កន្ត្រកទំនិញ',
    myCart: 'កន្ត្រករបស់ខ្ញុំ',
    signIn: 'ចូលគណនី',
    register: 'ចុះឈ្មោះ',
    signOut: 'ចាកចេញ',
    account: 'គណនី',
    myAccount: 'គណនីរបស់ខ្ញុំ',
    adminDashboard: 'ផ្ទាំងគ្រប់គ្រង Admin',
    staffDashboard: 'ផ្ទាំងប្រតិបត្តិការ Staff',
    customerDashboard: 'ផ្ទាំងគ្រប់គ្រងអតិថិជន',
    appearance: 'រចនាប័ទ្ម',
    language: 'ភាសា',
    light: 'ពន្លឺ',
    dark: 'ងងឹត',
    allCategories: 'គ្រប់ប្រភេទទាំងអស់',
    allProducts: 'ទំនិញទាំងអស់',
    searchPlaceholder: 'ស្វែងរកទំនិញ ភេសជ្ជៈ គ្រឿងទេស...',
    clearSearch: 'សម្អាតការស្វែងរក',
    viewAllResults: 'មើលទំនិញដែលត្រូវគ្នាក្នុងហាង',
    matching: 'ដែលត្រូវគ្នា',
    liveSuggestions: 'ការផ្ដល់យោបល់ទំនិញ',
    noProductsFound: 'រកមិនឃើញទំនិញសម្រាប់',
    welcomeMart: 'សូមស្វាគមន៍មកកាន់ Mart Store',
    signInDescription: 'ចូលគណនីដើម្បីតាមដានការបញ្ជាទិញ រក្សាទុកកន្ត្រក និងទូទាត់រហ័ស',

    // Top Bar Announcement
    announcement: 'ដឹកជញ្ជូនរហ័សត្រឹមតែ $1.50 ទូទាំងក្រុងភ្នំពេញ | ស្កេនទូទាត់តាម Bakong KHQR | សេវាកម្មទំនិញរហ័សទាន់ចិត្ត',

    // Product & Shopping
    inStock: 'មានក្នុងស្តុក',
    outOfStock: 'អស់ស្តុក',
    lowStock: 'ស្តុកមានកំណត់',
    add: 'បន្ថែម',
    added: 'បានបន្ថែម',
    buyNow: 'ទិញឥឡូវនេះ',
    exploreShop: 'មើលទំនិញទាំងអស់',
    featuredHighlights: 'ទំនិញលេចធ្លោប្រចាំហាង',
    exploreCategories: 'ស្វែងរកតាមប្រភេទទំនិញ',
    shopNow: 'ទិញឥឡូវ →',
    total: 'សរុប',
    subtotal: 'សរុបរង',
    items: 'មុខទំនិញ',
    price: 'តម្លៃ',
    viewReceipt: 'មើលវិក្កយបត្រ',
    clearAll: 'សម្អាតតម្រងទាំងអស់',
    recommended: 'ការណែនាំ',
    priceLowHigh: 'តម្លៃ: ពីទាបទៅខ្ពស់',
    priceHighLow: 'តម្លៃ: ពីខ្ពស់ទៅទាប',
    nameAZ: 'ឈ្មោះ: ពី A ទៅ Z',
    showing: 'កំពុងបង្ហាញ',
    products: 'មុខទំនិញ',
    previous: 'ថយក្រោយ',
    next: 'បន្ទាប់',

    // Sections & E-Commerce
    wishlist: 'ទំនិញពេញចិត្ត',
    myWishlist: 'ទំនិញពេញចិត្តរបស់ខ្ញុំ',
    bestSellers: 'ទំនិញលក់ដាច់បំផុត',
    flashSale: 'ការបញ្ចុះតម្លៃពិសេស (Flash Sale)',
    recentlyViewed: 'ទំនិញដែលបានមើលថ្មីៗ',
    reviews: 'ការវាយតម្លៃ',
    writeReview: 'សរសេរការវាយតម្លៃ',
    customerReviews: 'ការវាយតម្លៃរបស់អតិថិជន',
    support: 'ជំនួយ និងសេវាកម្ម',
    addresses: 'អាសយដ្ឋានដឹកជញ្ជូន',
    loyaltyPoints: 'ពិន្ទុភក្ដីភាព',
    coupons: 'ប័ណ្ណបញ្ចុះតម្លៃ',
    apply: 'ប្រើប្រាស់',
    enterCoupon: 'បញ្ចូលកូដបញ្ចុះតម្លៃ',
    orderTimeline: 'ដំណាក់កាលបញ្ជាទិញ',
    helpCenter: 'មជ្ឈមណ្ឌលជំនួយ',

    // Status
    completed: 'ជោគជ័យ',
    pending: 'កំពុងដំណើរការ',
    active: 'សកម្ម',
    canceled: 'បានបោះបង់',
  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      return saved === 'km' || saved === 'en' ? saved : 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = useCallback((lang) => {
    const valid = lang === 'km' ? 'km' : 'en';
    setLanguageState(valid);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, valid);
      document.documentElement.lang = valid === 'km' ? 'km' : 'en';
    } catch {
      // ignore
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'km' : 'en');
  }, [language, setLanguage]);

  useEffect(() => {
    try {
      document.documentElement.lang = language === 'km' ? 'km' : 'en';
    } catch {
      // ignore
    }
  }, [language]);

  const t = useCallback(
    (key, fallback = '') => {
      const dict = translations[language] || translations.en;
      if (dict && typeof dict[key] !== 'undefined') {
        return dict[key];
      }
      return fallback || key;
    },
    [language]
  );

  const isKhmer = language === 'km';
  const isEnglish = language === 'en';

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      isKhmer,
      isEnglish,
      t,
      translations: translations[language] || translations.en,
    }),
    [language, setLanguage, toggleLanguage, isKhmer, isEnglish, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
