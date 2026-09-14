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

    // Delivery & Courier Tracking
    delivery: 'Delivery',
    deliveries: 'Deliveries',
    courier: 'Courier',
    trackingNumber: 'Tracking Number',
    waybillNumber: 'Waybill Number',
    waybill: 'Waybill',
    shippingCost: 'Shipping Cost',
    deliveryFee: 'Delivery Fee',
    estimatedDelivery: 'Estimated Delivery',
    driver: 'Driver',
    outForDelivery: 'Out for Delivery',
    delivered: 'Delivered',
    failedAttempt: 'Failed Attempt',
    returning: 'Returning',
    returned: 'Returned',
    cancelled: 'Cancelled',
    readyForPickup: 'Ready for Pickup',
    inTransit: 'In Transit',
    assigned: 'Assigned',
    arrivedAtDestination: 'Arrived at Destination',
    pickedUp: 'Picked Up',
    deliveryProviders: 'Delivery Providers',
    deliveryZones: 'Delivery Zones',
    deliveryReports: 'Delivery Reports',
    packageSpecs: 'Package Details',
    weight: 'Weight',
    dimensions: 'Dimensions',
    packages: 'Packages',
    declaredValue: 'Declared Value',
    standard: 'Standard',
    note: 'Note',
    trackDelivery: 'Track Delivery',
    trackingTimeline: 'Tracking Timeline',
    trackingTimelineTitle: 'Shipment Tracking Timeline',
    trackingTimelineSub: 'Authoritative and immutable courier tracking event sequence.',
    syncWithCourier: 'Sync with Courier',
    auditLogs: 'Audit History',
    deliveryAuditTrail: 'Delivery Audit Trail',
    deliveryAuditTrailSub: 'Security log tracking all state mutations and staff operations.',
    actionAndActor: 'Action & Actor',
    statusMutation: 'Status Mutation',
    detailsReason: 'Details / Reason',
    timestamp: 'Timestamp',
    noAuditLogs: 'No audit trail logs recorded yet.',
    assignCourier: 'Assign Courier',
    assignDriver: 'Assign Driver',
    updateStatus: 'Update Status',
    cancel: 'Cancel',
    change: 'Change',
    assign: 'Assign',
    print: 'Print',
    refund: 'Refund',
    courierProvider: 'Courier Provider',
    internalDelivery: 'Internal Delivery',
    fullySynchronized: 'Fully Synchronized',
    syncRetries: 'Sync Retries',
    recipientDetails: 'Recipient Details',
    walkInCustomer: 'Walk-in Customer',
    noPhoneProvided: 'No Phone Provided',
    standardPickup: 'Standard In-Store Pickup',
    assignedDriver: 'Assigned Driver',
    notAssignedYet: 'Not assigned yet',
    awaitingDispatch: 'Awaiting dispatch confirmation',
    shippingFeeCollected: 'Shipping Fee Collected',
    associatedOrder: 'Associated Order',
    viewOrder: 'View Order',
    invoiceOrderNumber: 'Invoice / Order #',
    customerName: 'Customer Name',
    destinationProvince: 'Destination Province',
    deliveryStatus: 'Delivery Status',
    backToDeliveries: 'Back to Deliveries',
    backToSales: 'Back to Sales',
    saleNotFound: 'Sale not found',
    loadingInvoice: 'Loading invoice details...',
    latest: 'Latest',

    // Admin & Staff Navigation
    overview: 'Overview',
    operationsOverview: 'Operations Overview',
    ordersAndSales: 'Orders & Sales',
    ordersAndReceipts: 'Orders & Receipts',
    productCatalog: 'Product Catalog',
    customers: 'Customers',
    discountsAndPromo: 'Discounts & Promo',
    analytics: 'Analytics',
    storeExpenses: 'Store Expenses',
    mainMenu: 'Main Menu',
    salesChannel: 'Sales Channel',
    onlineStore: 'Online Store',
    posScreen: 'POS Screen',
    pointOfSale: 'Point of sale',
    apps: 'Apps',
    addApps: 'Add apps',
    profileAndAccount: 'Profile & Account',
    liveSystem: 'Live System',
    courierDeliveries: 'Courier Deliveries',
    adminPanel: 'Admin Panel',
    staffOperations: 'Staff Operations',
    dashboard: 'Dashboard',

    // Notifications
    notifications: 'Notifications',
    allNotifications: 'All Notifications',
    markAllAsRead: 'Mark all as read',
    markAsRead: 'Mark as read',
    noNotifications: 'No notifications',
    allCaughtUp: "You're all caught up.",
    paymentSuccessful: 'Payment successful',
    paymentFailed: 'Payment failed',
    orderDelivered: 'Order delivered',
    outForDelivery: 'Out for delivery',
    orderShipped: 'Order shipped',
    orderConfirmed: 'Order confirmed',
    orderCancelled: 'Order cancelled',
    newOrder: 'New order',
    realTimeUpdates: 'Real-time store updates',
    viewAllNotifications: 'View all notifications',

    // Authentication & Password Reset
    'auth.forgotPassword': 'Forgot your password?',
    'auth.resetPassword': 'Reset Password',
    'auth.email': 'Email Address',
    'auth.newPassword': 'New Password',
    'auth.confirmPassword': 'Confirm New Password',
    'auth.passwordMismatch': 'Passwords do not match.',
    'auth.invalidResetLink': 'This password reset link is invalid.',
    'auth.expiredResetLink': 'This password reset link has expired. Please request a new one.',
    'auth.alreadyUsedToken': 'This password reset link has already been used.',
    'auth.passwordResetSuccess': 'Password reset successful',
    'auth.checkYourInbox': 'Check your inbox',
    'auth.backToLogin': 'Back to Login',
    'auth.requestNewLink': 'Request a new reset link',
    'auth.tryAnotherEmail': 'Try Another Email',
    'auth.forgotPasswordDesc': "Enter your email address and we'll send you a link to reset your password.",
    'auth.resetPasswordDesc': 'Please enter and confirm your new password.',
    'auth.emailConfirmationNote': 'If an account exists with this email address, you will receive a password reset link shortly.',
    'auth.emailInstructions': "We've sent password reset instructions to your email address.",
    'auth.linkExpirationNote': "The reset link may expire after 30 minutes. Please check your spam or junk folder if you don't see the email.",
    'auth.resetSuccessDesc': 'Your password has been updated successfully. You can now sign in with your new password.',
    'auth.networkError': 'Unable to connect to the server. Please check your internet connection and try again.',
    'auth.sendResetLink': 'Send Reset Link',
    'auth.sendingLink': 'Sending Link...',
    'auth.resettingPassword': 'Resetting Password...',
    'auth.weak': 'Weak',
    'auth.fair': 'Fair',
    'auth.good': 'Good',
    'auth.strong': 'Strong',
    'auth.atLeast8Chars': 'At least 8 characters',
    'auth.passwordsMatchSuccess': 'Passwords match',
    'auth.redirectingIn': 'Redirecting to login in',
    'auth.seconds': 's',
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

    // Delivery & Courier Tracking
    delivery: 'ការដឹកជញ្ជូន',
    deliveries: 'ការដឹកជញ្ជូនទាំងអស់',
    courier: 'ក្រុមហ៊ុនដឹកជញ្ជូន',
    trackingNumber: 'លេខតាមដានកញ្ចប់',
    waybillNumber: 'លេខវិក្កយបត្រដឹក',
    waybill: 'វិក្កយបត្រដឹក',
    shippingCost: 'ថ្លៃដឹកជញ្ជូន',
    deliveryFee: 'ថ្លៃដឹកជញ្ជូន',
    estimatedDelivery: 'ការប៉ាន់ស្មានពេលដឹកដល់',
    driver: 'អ្នកដឹកជញ្ជូន',
    outForDelivery: 'កំពុងចេញដឹកជញ្ជូន',
    delivered: 'បានប្រគល់ជោគជ័យ',
    failedAttempt: 'ការដឹកជញ្ជូនមិនបានសម្រេច',
    returning: 'កំពុងត្រឡប់មកវិញ',
    returned: 'បានត្រឡប់មកវិញ',
    cancelled: 'បានបោះបង់',
    readyForPickup: 'រួចរាល់សម្រាប់ការទទួល',
    inTransit: 'កំពុងស្ថិតលើផ្លូវដឹក',
    assigned: 'បានចាត់ចែងរួចរាល់',
    arrivedAtDestination: 'បានមកដល់គោលដៅ',
    pickedUp: 'បានទទួលកញ្ចប់',
    deliveryProviders: 'ក្រុមហ៊ុនដឹកជញ្ជូន',
    deliveryZones: 'តំបន់ដឹកជញ្ជូន',
    deliveryReports: 'របាយការណ៍ដឹកជញ្ជូន',
    packageSpecs: 'លម្អិតកញ្ចប់ទំនិញ',
    weight: 'ទម្ងន់',
    dimensions: 'ទំហំកញ្ចប់',
    packages: 'ចំនួនកញ្ចប់',
    declaredValue: 'តម្លៃទំនិញប្រកាស',
    standard: 'ស្តង់ដារ',
    note: 'ចំណាំ',
    trackDelivery: 'តាមដានការដឹកជញ្ជូន',
    trackingTimeline: 'ដំណាក់កាលតាមដានការដឹកជញ្ជូន',
    trackingTimelineTitle: 'ដំណាក់កាលតាមដានការដឹកជញ្ជូន',
    trackingTimelineSub: 'កំណត់ត្រាតាមដានផ្លូវការពីប្រព័ន្ធដឹកជញ្ជូន (មិនអាចកែប្រែបាន)',
    syncWithCourier: 'ធ្វើសមកាលកម្មជាមួយក្រុមហ៊ុនដឹក',
    auditLogs: 'ប្រវត្តិកែប្រែស្ថានភាព',
    deliveryAuditTrail: 'ប្រវត្តិកែប្រែស្ថានភាព (Audit Trail)',
    deliveryAuditTrailSub: 'កំណត់ត្រាសុវត្ថិភាពសម្រាប់ការផ្លាស់ប្តូរស្ថានភាព និងសកម្មភាពបុគ្គលិក',
    actionAndActor: 'សកម្មភាព & អ្នកអនុវត្ត',
    statusMutation: 'បម្រែបម្រួលស្ថានភាព',
    detailsReason: 'ព័ត៌មានលម្អិត / មូលហេតុ',
    timestamp: 'កាលបរិច្ឆេទ & ម៉ោង',
    noAuditLogs: 'មិនទាន់មានកំណត់ត្រាប្រវត្តិនៅឡើយទេ',
    assignCourier: 'ចាត់ចែងក្រុមហ៊ុនដឹក',
    assignDriver: 'ចាត់ចែងអ្នកដឹក',
    updateStatus: 'កែប្រែស្ថានភាព',
    cancel: 'បោះបង់',
    change: 'ផ្លាស់ប្តូរ',
    assign: 'ចាត់ចែង',
    print: 'បោះពុម្ព',
    refund: 'សងប្រាក់វិញ',
    courierProvider: 'ក្រុមហ៊ុនដឹកជញ្ជូន',
    internalDelivery: 'ការដឹកជញ្ជូនផ្ទៃក្នុង',
    fullySynchronized: 'ធ្វើសមកាលកម្មពេញលេញ',
    syncRetries: 'ការព្យាយាមធ្វើសមកាលកម្ម',
    recipientDetails: 'អ្នកទទួលទំនិញ',
    walkInCustomer: 'អតិថិជនមកទិញផ្ទាល់',
    noPhoneProvided: 'មិនមានលេខទូរស័ព្ទ',
    standardPickup: 'ការទទួលទំនិញនៅហាងផ្ទាល់',
    assignedDriver: 'អ្នកដឹកជញ្ជូនផ្ទាល់',
    notAssignedYet: 'មិនទាន់បានចាត់ចែងនៅឡើយ',
    awaitingDispatch: 'រង់ចាំការបញ្ជាក់ការបញ្ជូន',
    shippingFeeCollected: 'ថ្លៃដឹកជញ្ជូនដែលបានគិត',
    associatedOrder: 'ការបញ្ជាទិញពាក់ព័ន្ធ',
    viewOrder: 'មើលការបញ្ជាទិញ',
    invoiceOrderNumber: 'លេខវិក្កយបត្រ / បញ្ជាទិញ',
    customerName: 'ឈ្មោះអតិថិជន',
    destinationProvince: 'ខេត្ត/ក្រុងគោលដៅ',
    deliveryStatus: 'ស្ថានភាពដឹកជញ្ជូន',
    backToDeliveries: 'ត្រឡប់ទៅការដឹកជញ្ជូន',
    backToSales: 'ត្រឡប់ទៅប្រវត្តិការលក់',
    saleNotFound: 'រកមិនឃើញការលក់នេះទេ',
    loadingInvoice: 'កំពុងទាញយកព័ត៌មានវិក្កយបត្រ...',
    latest: 'បច្ចុប្បន្ន',

    // Admin & Staff Navigation
    overview: 'ទិដ្ឋភាពទូទៅ',
    operationsOverview: 'ទិដ្ឋភាពទូទៅនៃប្រតិបត្តិការ',
    ordersAndSales: 'ការបញ្ជាទិញ & ការលក់',
    ordersAndReceipts: 'ការបញ្ជាទិញ & វិក្កយបត្រ',
    productCatalog: 'កាតាឡុកទំនិញ',
    customers: 'អតិថិជន',
    discountsAndPromo: 'ការបញ្ចុះតម្លៃ & ប្រូម៉ូសិន',
    analytics: 'ស្ថិតិ & របាយការណ៍',
    storeExpenses: 'ចំណាយក្នុងហាង',
    mainMenu: 'ម៉ឺនុយមេ',
    salesChannel: 'បណ្តាញលក់',
    onlineStore: 'ហាងអនឡាញ',
    posScreen: 'អេក្រង់ POS',
    pointOfSale: 'កន្លែងគិតលុយ (POS)',
    apps: 'កម្មវិធីភ្ជាប់',
    addApps: 'បន្ថែមកម្មវិធី',
    profileAndAccount: 'ប្រវត្តិរូប & គណនី',
    liveSystem: 'ប្រព័ន្ធដំណើរការផ្ទាល់',
    courierDeliveries: 'ការដឹកជញ្ជូនទំនិញ',
    adminPanel: 'ផ្ទាំងគ្រប់គ្រង Admin',
    staffOperations: 'ប្រតិបត្តិការបុគ្គលិក',
    dashboard: 'ផ្ទាំងគ្រប់គ្រង',

    // Notifications
    notifications: 'ការជូនដំណឹង',
    allNotifications: 'ការជូនដំណឹងទាំងអស់',
    markAllAsRead: 'សម្គាល់ថាបានអានទាំងអស់',
    markAsRead: 'សម្គាល់ថាបានអាន',
    noNotifications: 'មិនមានការជូនដំណឹង',
    allCaughtUp: 'លោកអ្នកបានអានការជូនដំណឹងទាំងអស់រួចរាល់ហើយ',
    paymentSuccessful: 'ការទូទាត់បានជោគជ័យ',
    paymentFailed: 'ការទូទាត់មិនបានសម្រេច',
    orderDelivered: 'ការបញ្ជាទិញបានដឹកជញ្ជូនរួចរាល់',
    outForDelivery: 'កំពុងដឹកជញ្ជូនទៅកាន់អ្នក',
    orderShipped: 'ការបញ្ជាទិញបានចេញដំណើរ',
    orderConfirmed: 'ការបញ្ជាទិញត្រូវបានបញ្ជាក់',
    orderCancelled: 'ការបញ្ជាទិញត្រូវបានបោះបង់',
    newOrder: 'ការបញ្ជាទិញថ្មី',
    realTimeUpdates: 'បច្ចុប្បន្នភាពទាន់ហេតុការណ៍',
    viewAllNotifications: 'មើលការជូនដំណឹងទាំងអស់',

    // Authentication & Password Reset
    'auth.forgotPassword': 'ភ្លេចពាក្យសម្ងាត់?',
    'auth.resetPassword': 'កំណត់ពាក្យសម្ងាត់ថ្មី',
    'auth.email': 'អាសយដ្ឋានអ៊ីមែល',
    'auth.newPassword': 'ពាក្យសម្ងាត់ថ្មី',
    'auth.confirmPassword': 'បញ្ជាក់ពាក្យសម្ងាត់ថ្មី',
    'auth.passwordMismatch': 'ពាក្យសម្ងាត់មិនត្រូវគ្នាទេ។',
    'auth.invalidResetLink': 'តំណកំណត់ពាក្យសម្ងាត់នេះមិនត្រឹមត្រូវទេ។',
    'auth.expiredResetLink': 'តំណកំណត់ពាក្យសម្ងាត់នេះបានផុតកំណត់។ សូមស្នើសុំតំណថ្មី។',
    'auth.alreadyUsedToken': 'តំណកំណត់ពាក្យសម្ងាត់នេះត្រូវបានប្រើរួចហើយ។',
    'auth.passwordResetSuccess': 'ការកំណត់ពាក្យសម្ងាត់ថ្មីបានជោគជ័យ',
    'auth.checkYourInbox': 'ពិនិត្យមើលប្រអប់សំបុត្ររបស់អ្នក',
    'auth.backToLogin': 'ត្រឡប់ទៅទំព័រចូល',
    'auth.requestNewLink': 'ស្នើសុំតំណកំណត់ពាក្យសម្ងាត់ថ្មី',
    'auth.tryAnotherEmail': 'សាកល្បងអ៊ីមែលផ្សេងទៀត',
    'auth.forgotPasswordDesc': 'សូមបញ្ចូលអាសយដ្ឋានអ៊ីមែលរបស់អ្នក ដើម្បីទទួលបានតំណសម្រាប់កំណត់ពាក្យសម្ងាត់ថ្មី។',
    'auth.resetPasswordDesc': 'សូមបញ្ចូល និងបញ្ជាក់ពាក្យសម្ងាត់ថ្មីរបស់អ្នក។',
    'auth.emailConfirmationNote': 'ប្រសិនបើមានគណនីដែលប្រើអ៊ីមែលនេះ អ្នកនឹងទទួលបានតំណសម្រាប់កំណត់ពាក្យសម្ងាត់ថ្មីក្នុងពេលឆាប់ៗនេះ។',
    'auth.emailInstructions': 'យើងបានផ្ញើការណែនាំអំពីការកំណត់ពាក្យសម្ងាត់ថ្មីទៅកាន់អ៊ីមែលរបស់អ្នក។',
    'auth.linkExpirationNote': 'តំណកំណត់ពាក្យសម្ងាត់អាចនឹងផុតកំណត់បន្ទាប់ពី 30 នាទី។ សូមពិនិត្យមើលប្រអប់ Spam ឬ Junk របស់អ្នក ប្រសិនបើអ្នកមិនឃើញអ៊ីមែល។',
    'auth.resetSuccessDesc': 'ពាក្យសម្ងាត់របស់អ្នកត្រូវបានផ្លាស់ប្តូរដោយជោគជ័យ។ ឥឡូវនេះ អ្នកអាចចូលប្រើគណនីរបស់អ្នកដោយប្រើពាក្យសម្ងាត់ថ្មី។',
    'auth.networkError': 'មិនអាចភ្ជាប់ទៅកាន់ម៉ាស៊ីនមេបានទេ។ សូមពិនិត្យការតភ្ជាប់អ៊ីនធឺណិតរបស់អ្នក ហើយព្យាយាមម្តងទៀត។',
    'auth.sendResetLink': 'ផ្ញើតំណកំណត់ពាក្យសម្ងាត់',
    'auth.sendingLink': 'កំពុងផ្ញើតំណ...',
    'auth.resettingPassword': 'កំពុងកំណត់ពាក្យសម្ងាត់...',
    'auth.weak': 'ខ្សោយ',
    'auth.fair': 'មធ្យម',
    'auth.good': 'ល្អ',
    'auth.strong': 'រឹងមាំ',
    'auth.atLeast8Chars': 'យ៉ាងតិច 8 តួអក្សរ',
    'auth.passwordsMatchSuccess': 'ពាក្យសម្ងាត់ត្រូវគ្នា',
    'auth.redirectingIn': 'នឹងបញ្ជូនទៅកាន់ទំព័រចូលក្នុងរយៈពេល',
    'auth.seconds': 'វិនាទី',
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
      // Support dot-notation (e.g. auth.forgotPassword)
      if (key && key.includes('.')) {
        const parts = key.split('.');
        let current = dict;
        for (const part of parts) {
          if (current && typeof current === 'object' && part in current) {
            current = current[part];
          } else {
            current = undefined;
            break;
          }
        }
        if (typeof current !== 'undefined') {
          return current;
        }

        // Fallback to English translation for the same key if in Khmer
        if (language !== 'en' && translations.en) {
          if (typeof translations.en[key] !== 'undefined') {
            return translations.en[key];
          }
          let enCurrent = translations.en;
          for (const part of parts) {
            if (enCurrent && typeof enCurrent === 'object' && part in enCurrent) {
              enCurrent = enCurrent[part];
            } else {
              enCurrent = undefined;
              break;
            }
          }
          if (typeof enCurrent !== 'undefined') {
            return enCurrent;
          }
        }
      }

      // Fallback to English dictionary
      if (language !== 'en' && translations.en && typeof translations.en[key] !== 'undefined') {
        return translations.en[key];
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
