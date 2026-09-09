import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  ShoppingBag,
  ShoppingCart,
  CheckCircle2,
  QrCode,
  Truck,
  ShieldCheck,
  User,
  Lock,
  ArrowRight,
  Phone,
  ChevronDown,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  Clock,
  XCircle,
  Check,
  Search,
  KeyRound
} from 'lucide-react';
import SEO from '../components/SEO';
import { useLanguage } from '../context/LanguageContext';

export default function UserGuide() {
  const { isKhmer } = useLanguage();
  const [activeStep, setActiveStep] = useState(1);
  const [openFaq, setOpenFaq] = useState(null);

  // Quick helper for bilingual text
  const tx = (en, km) => (isKhmer ? km : en);

  // FAQ Schema definition for search engines
  const faqData = [
    {
      q: tx('What should I do if my KHQR payment is still pending?', 'តើខ្ញុំគួរធ្វើដូចម្តេចប្រសិនបើការទូទាត់ KHQR នៅតែបង្ហាញថាកំពុងរង់ចាំ?'),
      a: tx(
        'Please wait a moment while the system verifies your transaction with the National Bank of Cambodia Bakong network. Usually this completes within 5-15 seconds. Do not close your browser tab until confirmation appears.',
        'សូមរង់ចាំបន្តិច ខណៈពេលប្រព័ន្ធកំពុងផ្ទៀងផ្ទាត់ការទូទាត់របស់អ្នកជាមួយប្រព័ន្ធបាគង។ ជាធម្មតាវាបញ្ចប់ក្នុងរយៈពេល 5-15 វិនាទី។ សូមកុំបិទទំព័រទូទាត់លឿនពេក។'
      )
    },
    {
      q: tx('My money was deducted from my bank app, but the order is not completed. What should I do?', 'ប្រាក់ត្រូវបានកាត់ចេញពីគណនីធនាគារ ប៉ុន្តែការបញ្ជាទិញមិនទាន់ជោគជ័យ តើត្រូវធ្វើដូចម្តេច?'),
      a: tx(
        'Keep your banking transaction reference/screenshot and contact our 24/7 customer support via Telegram or phone (+855 96 878 2196). Our team will verify the Bakong hash and manually approve your order immediately.',
        'សូមរក្សាទុកវិក្កយបត្រ ឬរូបថតប្រតិបត្តិការធនាគាររបស់អ្នក រួចទាក់ទងមកកាន់ផ្នែកបម្រើអតិថិជនតាមរយៈ Telegram ឬទូរស័ព្ទ (096 878 2196)។ ក្រុមការងារយើងនឹងផ្ទៀងផ្ទាត់ និងបញ្ជាក់ការបញ្ជាទិញជូនភ្លាមៗ។'
      )
    },
    {
      q: tx('The KHQR code cannot be scanned by my banking app. How can I fix this?', 'កម្មវិធីធនាគារមិនអាចស្កេន QR Code KHQR បាន តើត្រូវដោះស្រាយដូចម្តេច?'),
      a: tx(
        'Make sure your phone camera lens is clean and the QR code is fully visible on your screen. You can also increase your screen brightness or click the "Refresh QR" button if the 15-minute countdown expired.',
        'សូមប្រាកដថាកាមេរ៉ាទូរស័ព្ទរបស់អ្នកស្អាតច្បាស់ ហើយកូដ QR បង្ហាញពេញលេញលើអេក្រង់។ អ្នកក៏អាចបង្កើនពន្លឺអេក្រង់ ឬចុចប៊ូតុង "Refresh QR" ប្រសិនបើពេលវេលា 15 នាទីផុតកំណត់។'
      )
    },
    {
      q: tx('I forgot my password. How do I recover my account?', 'ខ្ញុំភ្លេចពាក្យសម្ងាត់ តើខ្ញុំអាចកំណត់ឡើងវិញដោយរបៀបណា?'),
      a: tx(
        'Click "Forgot Password" on the login screen, enter your registered email address, and open the secure recovery link sent to your inbox. You can then set a brand new password and sign in instantly.',
        'ចុចលើពាក្យ "Forgot Password" នៅលើទំព័រចូលគណនី បញ្ចូលអ៊ីមែលដែលបានចុះឈ្មោះ ហើយបើកតំណភ្ជាប់បញ្ជាក់ក្នុងប្រអប់សំបុត្ររបស់អ្នក ដើម្បីកំណត់ពាក្យសម្ងាត់ថ្មី។'
      )
    }
  ];

  const steps = [
    {
      id: 1,
      number: '01',
      titleEn: 'Open the Platform',
      titleKm: 'ចូលទៅកាន់គេហទំព័រ Mart System',
      badgeEn: 'Step 1 • Storefront',
      badgeKm: 'ជំហានទី ១ • ទំព័រដើម',
      summaryEn: 'Visit the Mart System website and browse the available products.',
      summaryKm: 'ចូលទៅកាន់គេហទំព័រ Mart System ហើយស្វែងរកផលិតផលដែលមាននៅក្នុងប្រព័ន្ធ។',
      detailsEn: [
        'Users can browse products without creating an account.',
        'Users do not need to log in just to view available products, prices, or store inventory.',
        'Use the top search bar or category filters to explore groceries, beverages, electronics, and daily essentials.'
      ],
      detailsKm: [
        'លោកអ្នកអាចស្វែងរក និងទស្សនាទំនិញទាំងអស់ដោយសេរី ដោយមិនចាំបាច់មានគណនីជាមុនឡើយ។',
        'មិនចាំបាច់ចូលគណនី (Sign in) គ្រាន់តែដើម្បីពិនិត្យមើលមុខទំនិញ តម្លៃ ឬស្តុកទំនិញនោះទេ។',
        'អាចប្រើប្រាស់ប្រអប់ស្វែងរក (Search bar) ខាងលើ ឬតម្រងតាមប្រភេទទំនិញ (Categories) ដើម្បីស្វែងរកទំនិញដែលត្រូវការ។'
      ]
    },
    {
      id: 2,
      number: '02',
      titleEn: 'Browse Products',
      titleKm: 'ស្វែងរក និងជ្រើសរើសផលិតផល',
      badgeEn: 'Step 2 • Product Discovery',
      badgeKm: 'ជំហានទី ២ • ព័ត៌មានទំនិញ',
      summaryEn: 'Browse products and select the product you want to purchase.',
      summaryKm: 'ស្វែងរកផលិតផល ហើយជ្រើសរើសផលិតផលដែលអ្នកចង់ទិញ។',
      detailsEn: [
        'High-resolution product imagery and clear real-time pricing in USD ($).',
        'Live stock availability indicator ("In Stock" or "Low Stock").',
        'Detailed specifications, descriptions, and authentic quality guarantees.',
        'Direct "Add to Cart" button on product cards or click into the product page for in-depth specs.'
      ],
      detailsKm: [
        'រូបភាពទំនិញច្បាស់ត្រជាក់ភ្នែក រួមជាមួយតម្លៃពិតជាក់ស្តែងគិតជាដុល្លារ ($)។',
        'បង្ហាញស្ថានភាពស្តុកច្បាស់លាស់ ("មានក្នុងស្តុក" ឬ "ស្តុកមានកំណត់")។',
        'ព័ត៌មានលម្អិតអំពីផលិតផល លក្ខណៈបច្ចេកទេស និងការធានាគុណភាពពិតប្រាកដ។',
        'អាចចុចប៊ូតុង "បន្ថែម" (Add to Cart) ផ្ទាល់ ឬចុចលើរូបដើម្បីមើលព័ត៌មានលម្អិត។'
      ]
    },
    {
      id: 3,
      number: '03',
      titleEn: 'Add Products to Cart',
      titleKm: 'ជ្រើសរើសចំនួន និងបន្ថែមចូលកន្ត្រក',
      badgeEn: 'Step 3 • Cart Selection',
      badgeKm: 'ជំហានទី ៣ • ជ្រើសរើសទំនិញ',
      summaryEn: 'Select the quantity and add the product to your cart.',
      summaryKm: 'ជ្រើសរើសចំនួនផលិតផល ហើយបន្ថែមផលិតផលទៅក្នុងកន្ត្រកទិញទំនិញ។',
      detailsEn: [
        '1. Select the desired product from the shop or featured list.',
        '2. Choose your quantity using the intuitive plus (+) and minus (-) stepper.',
        '3. Click the "Add to Cart" button to immediately queue the item.',
        '4. Review your cart counter bump in the header bar and the slide-out preview drawer.'
      ],
      detailsKm: [
        '១. ជ្រើសរើសមុខទំនិញដែលអ្នកចង់ទិញពីហាង ឬទំព័រមុខទំនិញលេចធ្លោ។',
        '២. កំណត់ចំនួនទំនិញតាមរយៈប៊ូតុងបូក (+) និងដក (-) យ៉ាងងាយស្រួល។',
        '៣. ចុចប៊ូតុង "បន្ថែមទៅក្នុងកន្ត្រក" (Add to Cart)។',
        '៤. ពិនិត្យមើលចំនួនទំនិញដែលកើនឡើងនៅលើរូបកន្ត្រកនៅផ្នែកខាងលើនៃអេក្រង់។'
      ]
    },
    {
      id: 4,
      number: '04',
      titleEn: 'Review Your Cart',
      titleKm: 'ពិនិត្យកន្ត្រកទំនិញរបស់អ្នក',
      badgeEn: 'Step 4 • Order Verification',
      badgeKm: 'ជំហានទី ៤ • ពិនិត្យការបញ្ជាទិញ',
      summaryEn: 'Review your selected products before checkout.',
      summaryKm: 'ពិនិត្យផលិតផលដែលអ្នកបានជ្រើសរើស មុនពេលបន្តទៅការទូទាត់។',
      detailsEn: [
        'Verify item names, quantities, and individual unit prices.',
        'Automatic subtotal calculation with zero hidden charges.',
        'Transparent delivery fee calculation ($1.50 express doorstep delivery across Phnom Penh, or free store pickup).',
        'Clear "Proceed to Checkout" button to initiate your secure order submission.'
      ],
      detailsKm: [
        'ពិនិត្យឈ្មោះមុខទំនិញ ចំនួន និងតម្លៃរាយនៃទំនិញនីមួយៗ។',
        'ប្រព័ន្ធគណនាតម្លៃសរុបរង (Subtotal) ដោយស្វ័យប្រវត្ត គ្មានការគិតថ្លៃលាក់កំបាំងឡើយ។',
        'បង្ហាញតម្លៃដឹកជញ្ជូនច្បាស់លាស់ ($1.50 ដឹកជញ្ជូនរហ័សទូទាំងភ្នំពេញ ឬឥតគិតថ្លៃមកយកផ្ទាល់)។',
        'ចុចប៊ូតុង "ទៅ Checkout" (Proceed to Checkout) ដើម្បីបន្តទៅកាន់ជំហានបន្ទាប់។'
      ]
    },
    {
      id: 5,
      number: '05',
      titleEn: 'Checkout Process',
      titleKm: 'ដំណើរការបញ្ជាក់ Checkout',
      badgeEn: 'Step 5 • Delivery & Info',
      badgeKm: 'ជំហានទី ៥ • ព័ត៌មានដឹកជញ្ជូន',
      summaryEn: 'Confirm your order information and continue to payment.',
      summaryKm: 'បញ្ជាក់ព័ត៌មានការបញ្ជាទិញរបស់អ្នក ហើយបន្តទៅការទូទាត់។',
      detailsEn: [
        'Select Delivery Method: Express Delivery ($1.50) or Store Pickup at Mart ($0.00).',
        'Provide Recipient Full Name and active Phone Number for delivery dispatcher contact.',
        'Enter delivery address (House/Street, Sangkat, Khan, Phnom Penh) and optional notes.',
        'Review the sticky order summary and click "Place Order & Pay" to proceed to payment.'
      ],
      detailsKm: [
        'ជ្រើសរើសវិធីទទួលទំនិញ៖ សេវាដឹកជញ្ជូនដល់ផ្ទះ ($1.50) ឬមកយកផ្ទាល់នៅហាង ($0.00)។',
        'បញ្ចូលឈ្មោះអ្នកទទួល និងលេខទូរស័ព្ទជាក់ស្តែង ដើម្បីងាយស្រួលអ្នកដឹកជញ្ជូនទាក់ទង។',
        'បញ្ចូលអាសយដ្ឋានដឹកជញ្ជូន (ផ្ទះ/ផ្លូវ, សង្កាត់, ខណ្ឌ, រាជធានីភ្នំពេញ) និងចំណាំបន្ថែម (បើមាន)។',
        'ពិនិត្យសង្ខេបការបញ្ជាទិញ រួចចុច "បញ្ជាទិញ និងបង់ប្រាក់" ដើម្បីទៅកាន់ផ្ទាំង KHQR។'
      ]
    },
    {
      id: 6,
      number: '06',
      titleEn: 'Bakong KHQR Payment',
      titleKm: 'ការទូទាត់តាម Bakong KHQR',
      badgeEn: 'Step 6 • Secure QR Scan',
      badgeKm: 'ជំហានទី ៦ • ស្កេនទូទាត់ KHQR',
      summaryEn: 'Scan the KHQR code using your supported banking application and complete the payment.',
      summaryKm: 'ស្កេន QR Code KHQR ដោយប្រើកម្មវិធីធនាគារដែលគាំទ្រ ហើយបញ្ចប់ការទូទាត់។',
      detailsEn: [
        'Universal Standard: Supports all member banks of the National Bank of Cambodia (ABA Bank, ACLEDA Bank, Canadia, Wing, Sathapana, Bakong App, etc.).',
        'Check the exact payment amount in USD displayed inside the KHQR modal.',
        'Open your mobile banking app, choose "Scan QR", and scan the on-screen KHQR code.',
        'Authorize payment in your bank app and return to the Mart System browser tab.',
        'Active countdown timer (15 minutes) ensures real-time session protection.'
      ],
      detailsKm: [
        'ស្តង់ដាររួមជាតិ៖ គាំទ្រគ្រប់កម្មវិធីធនាគារសមាជិកបាគង (ABA, ACLEDA, Canadia, Wing, ស្ថាបនា, កម្មវិធី Bakong និងធនាគារដទៃទៀត)។',
        'ពិនិត្យចំនួនទឹកប្រាក់គិតជាដុល្លារ ($) ជាក់ស្តែងដែលបង្ហាញលើផ្ទាំង KHQR។',
        'បើកកម្មវិធីធនាគារក្នុងទូរស័ព្ទរបស់អ្នក ជ្រើសរើសមុខងារ "Scan QR" រួចស្កេនកូដលើអេក្រង់។',
        'បញ្ជាក់ការទូទាត់ក្នុងកម្មវិធីធនាគារ ហើយត្រឡប់មកកាន់គេហទំព័រ Mart System វិញ។',
        'មាននាឡិការាប់ថយក្រោយ (១៥ នាទី) ធានាសុវត្ថិភាពប្រតិបត្តិការជាក់ស្តែង។'
      ]
    },
    {
      id: 7,
      number: '07',
      titleEn: 'Payment Confirmation',
      titleKm: 'ការផ្ទៀងផ្ទាត់ និងបញ្ជាក់ការទូទាត់',
      badgeEn: 'Step 7 • Instant Verification',
      badgeKm: 'ជំហានទី ៧ • ផ្ទៀងផ្ទាត់ស្ថានភាព',
      summaryEn: 'After payment, the system verifies your transaction and updates the payment status.',
      summaryKm: 'បន្ទាប់ពីបង់ប្រាក់ ប្រព័ន្ធនឹងផ្ទៀងផ្ទាត់ប្រតិបត្តិការ និងធ្វើបច្ចុប្បន្នភាពស្ថានភាពការទូទាត់។',
      detailsEn: [
        'The system automatically polls and verifies the Bakong payment network in real time.',
        'Pending: Waiting for bank webhook confirmation (takes 5-15 seconds).',
        'Paid: Transaction matched and authorized; order transitions to confirmed state.',
        'Failed: Shown if the payment timed out or was cancelled by user; you can refresh and retry.'
      ],
      detailsKm: [
        'ប្រព័ន្ធនឹងធ្វើការផ្ទៀងផ្ទាត់ដោយស្វ័យប្រវត្តជាមួយបណ្តាញបាគងភ្លាមៗតាមពេលវេលាជាក់ស្តែង។',
        'កំពុងរង់ចាំ (Pending)៖ កំពុងរង់ចាំការឆ្លើយតបពីធនាគារ (ចំណាយពេលត្រឹម 5-15 វិនាទី)។',
        'ជោគជ័យ (Paid)៖ ប្រតិបត្តិការទូទាត់ត្រឹមត្រូវ ការបញ្ជាទិញត្រូវបានបញ្ជាក់ភ្លាមៗ។',
        'មិនជោគជ័យ (Failed)៖ បង្ហាញនៅពេលផុតកំណត់ ឬមានបញ្ហាបោះបង់ អ្នកអាចចុចព្យាយាមម្តងទៀត។'
      ]
    },
    {
      id: 8,
      number: '08',
      titleEn: 'Order Completed',
      titleKm: 'ការបញ្ជាទិញបានបញ្ចប់ដោយជោគជ័យ',
      badgeEn: 'Step 8 • Order Receipt',
      badgeKm: 'ជំហានទី ៨ • វិក្កយបត្របញ្ជាទិញ',
      summaryEn: 'Your order has been successfully completed.',
      summaryKm: 'ការបញ្ជាទិញរបស់អ្នកបានបញ្ចប់ដោយជោគជ័យ។',
      detailsEn: [
        'Official Order Number (e.g. ORD-XXXX) and Invoice / Bill Number generated.',
        'Full printable and downloadable electronic receipt detailing purchased items and delivery address.',
        'Customer order tracking available in "My Orders" tab with real-time status updates.',
        'Quick "Back to Shop" button to continue discovering more products.'
      ],
      detailsKm: [
        'ទទួលបានលេខកូដបញ្ជាទិញផ្លូវការ (ឧ. ORD-XXXX) និងលេខវិក្កយបត្រជាក់លាក់។',
        'មានបង្កាន់ដៃទូទាត់ (Receipt) ផ្លូវការដែលអាចបោះពុម្ព (Print) ឬរក្សាទុកបាន។',
        'អាចតាមដានស្ថានភាពទំនិញគ្រប់ពេលវេលាតាមរយៈទំព័រ "ការបញ្ជាទិញរបស់ខ្ញុំ" (My Orders)។',
        'ប៊ូតុង "បន្តទិញទំនិញ" (Back to Shop) សម្រាប់បន្តស្វែងរកទំនិញផ្សេងទៀត។'
      ]
    }
  ];

  const currentStepData = steps.find((s) => s.id === activeStep) || steps[0];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-200 font-sans pb-24 sm:pb-32">
      {/* Dynamic Bilingual SEO */}
      <SEO
        title={tx('How to Use Mart System | User Guide', 'របៀបប្រើប្រាស់ Mart System | មគ្គុទ្ទេសក៍អ្នកប្រើប្រាស់')}
        description={tx(
          'Complete step-by-step direction and user guide for Mart System. Learn how to browse products, add to cart, checkout with Bakong KHQR, and track orders easily.',
          'ការណែនាំលម្អិតជាជំហានៗអំពីរបៀបប្រើប្រាស់ Mart System ចាប់ពីការស្វែងរកទំនិញ បញ្ចូលកន្ត្រក រហូតដល់ការស្កេនទូទាត់តាម Bakong KHQR និងតាមដានការបញ្ជាទិញ។'
        )}
        canonical="/guide"
        breadcrumbs={[
          { name: tx('Home', 'ទំព័រដើម'), url: '/' },
          { name: tx('User Guide', 'របៀបប្រើប្រាស់'), url: '/guide' }
        ]}
        faq={faqData}
      />

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden border-b border-slate-200/80 dark:border-slate-850 bg-gradient-to-b from-white via-slate-50 to-slate-100/70 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 pt-12 sm:pt-16 pb-14 sm:pb-20">
        {/* Glow ambient decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-64 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-4 sm:space-y-6">
          {/* Top Category Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-50/80 dark:bg-emerald-950/50 px-3.5 py-1 text-xs font-black tracking-wide text-emerald-700 dark:text-emerald-300 shadow-2xs">
            <Sparkles size={14} className="text-emerald-600 dark:text-emerald-400" />
            <span>{tx('PLATFORM DIRECTION & USER GUIDE', 'ការណែនាំអំពីការប្រើប្រាស់ប្រព័ន្ធ')}</span>
          </div>

          {/* Main Title & Subtitle */}
          <div className="space-y-3 max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {tx('How to Use the Platform', 'របៀបប្រើប្រាស់ប្រព័ន្ធ')}
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              {tx(
                'Follow these simple steps to browse products, place your order, and complete your payment.',
                'អនុវត្តតាមជំហានងាយៗទាំងនេះ ដើម្បីស្វែងរកផលិតផល បញ្ជាទិញ និងបង់ប្រាក់។'
              )}
            </p>
          </div>

          {/* Quick Jump Navigation Strip */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-2">
            {[
              { id: 'steps', labelEn: 'Shopping Steps', labelKm: 'ជំហានទិញទំនិញ', icon: Compass },
              { id: 'khqr', labelEn: 'KHQR Payment', labelKm: 'ការទូទាត់ KHQR', icon: QrCode },
              { id: 'account', labelEn: 'Account Guide', labelKm: 'គណនី និងការចូល', icon: User },
              { id: 'rules', labelEn: 'Important Tips', labelKm: 'ចំណុចសំខាន់ៗ', icon: AlertTriangle },
              { id: 'faq', labelEn: 'FAQ & Help', labelKm: 'សំណួរញឹកញាប់', icon: HelpCircle }
            ].map((jump) => {
              const Icon = jump.icon;
              return (
                <a
                  key={jump.id}
                  href={`#${jump.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 shadow-2xs hover:shadow-xs transition"
                >
                  <Icon size={13} className="text-emerald-600 dark:text-emerald-400" />
                  <span>{tx(jump.labelEn, jump.labelKm)}</span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. MAIN STEP-BY-STEP CUSTOMER JOURNEY */}
      <section id="steps" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 dark:border-slate-850 pb-6">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              {tx('STEP-BY-STEP JOURNEY', 'ដំណើរការជាជំហានៗ')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {tx('From Browse to Doorstep Delivery', 'ចាប់ពីការស្វែងរកទំនិញ រហូតដល់ការដឹកជញ្ជូនដល់ផ្ទះ')}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md font-medium">
            {tx(
              'Follow the 8 illustrated phases below to complete any order smoothly and securely.',
              'អនុវត្តតាម ៨ ជំហានខាងក្រោម ដើម្បីបញ្ចប់ការបញ្ជាទិញបានយ៉ាងរហ័ស និងមានសុវត្ថិភាព។'
            )}
          </p>
        </div>

        {/* Interactive Step Selector Pill Strip (Desktop & Tablet) */}
        <div className="grid grid-cols-2 xs:grid-cols-4 lg:grid-cols-8 gap-2">
          {steps.map((step) => {
            const isCurrent = activeStep === step.id;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStep(step.id)}
                className={`group flex flex-col items-start p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  isCurrent
                    ? 'border-emerald-500 bg-emerald-500/10 dark:bg-emerald-950/40 ring-2 ring-emerald-500/50 shadow-sm'
                    : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span
                    className={`font-mono text-xs font-black px-1.5 py-0.5 rounded-md ${
                      isCurrent
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {step.number}
                  </span>
                  {isCurrent && (
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate w-full">
                  {tx(step.titleEn, step.titleKm)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Highlighted Step Feature Showcase Card */}
        <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 lg:p-10 shadow-lg relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left: Step Explanations & Details */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-1 font-mono text-xs font-black text-emerald-600 dark:text-emerald-400">
                  <span>{tx(currentStepData.badgeEn, currentStepData.badgeKm)}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {tx(currentStepData.titleEn, currentStepData.titleKm)}
                </h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  {tx(currentStepData.summaryEn, currentStepData.summaryKm)}
                </p>
              </div>

              {/* Bulleted Points */}
              <div className="space-y-2.5">
                {(isKhmer ? currentStepData.detailsKm : currentStepData.detailsEn).map((point, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 mt-0.5">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span>{point}</span>
                  </div>
                ))}
              </div>

              {/* Navigation buttons to step through */}
              <div className="pt-2 flex items-center gap-3">
                {activeStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setActiveStep((s) => Math.max(1, s - 1))}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    <span>{tx('← Previous Step', '← ជំហានមុន')}</span>
                  </button>
                )}
                {activeStep < 8 && (
                  <button
                    type="button"
                    onClick={() => setActiveStep((s) => Math.min(8, s + 1))}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#18181B] dark:bg-white text-white dark:text-slate-900 px-5 py-2 text-xs font-black shadow-xs hover:opacity-90 active:scale-95 transition cursor-pointer"
                  >
                    <span>{tx('Next Step →', 'ជំហានបន្ទាប់ →')}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right: Realistic Mock UI Representation matching Mart System */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 sm:p-5 shadow-inner">
                {/* Visual Representation by Step */}
                {activeStep === 1 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400">
                      <span>{tx('Storefront Header Mockup', 'ទម្រង់គំរូទំព័រដើម')}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono">martsystemkh.software</span>
                    </div>
                    <div className="rounded-xl bg-white dark:bg-slate-900 p-3 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-xs">
                          M
                        </div>
                        <span className="text-xs font-black text-slate-900 dark:text-white">Mart System</span>
                        <span className="ml-auto text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                          Online
                        </span>
                      </div>
                      <div className="flex items-center rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-400">
                        <Search size={13} className="mr-2 text-slate-400" />
                        <span>{tx('Search products, drinks, groceries...', 'ស្វែងរកទំនិញ ភេសជ្ជៈ គ្រឿងទេស...')}</span>
                      </div>
                      <div className="flex items-center gap-1.5 pt-1 overflow-x-auto text-[10px] font-bold">
                        <span className="px-2.5 py-1 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                          {tx('All', 'ទាំងអស់')}
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          Electronics
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          Groceries
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          Beverages
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeStep === 2 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400">
                      <span>{tx('Product Card Mockup', 'ទម្រង់គំរូកាតទំនិញ')}</span>
                      <span className="text-emerald-600 font-mono">In Stock</span>
                    </div>
                    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
                      <div className="h-32 bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-4 relative">
                        <img
                          src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80"
                          alt="Headphones"
                          className="h-full object-contain"
                        />
                        <span className="absolute top-2 right-2 rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[9px] font-black tracking-wide">
                          IN STOCK
                        </span>
                      </div>
                      <div className="p-3.5 space-y-2">
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            Sony WH-1000XM5 Wireless Headphones
                          </p>
                          <p className="text-[10px] text-slate-400">SKU: ELEC-001 • Electronics</p>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-sm font-black text-slate-900 dark:text-white">$349.00</span>
                          <button
                            type="button"
                            className="rounded-full bg-[#18181B] dark:bg-white text-white dark:text-slate-900 px-3 py-1 text-[11px] font-black"
                          >
                            + {tx('Add to Cart', 'បន្ថែម')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeStep === 3 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400">
                      <span>{tx('Quantity Selector & Cart Update', 'ការជ្រើសរើសចំនួន និងកន្ត្រក')}</span>
                      <span className="text-emerald-600 font-mono">1 item added</span>
                    </div>
                    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {tx('Choose Quantity:', 'ជ្រើសរើសចំនួន៖')}
                        </span>
                        <div className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1">
                          <button type="button" className="h-6 w-6 rounded-full bg-white dark:bg-slate-700 text-xs font-black shadow-xs flex items-center justify-center">
                            -
                          </button>
                          <span className="font-mono text-xs font-black px-2 text-slate-900 dark:text-white">2</span>
                          <button type="button" className="h-6 w-6 rounded-full bg-white dark:bg-slate-700 text-xs font-black shadow-xs flex items-center justify-center">
                            +
                          </button>
                        </div>
                      </div>
                      <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/40 p-3 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                          <ShoppingCart size={15} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 truncate">
                            {tx('Added to Cart Successfully', 'បានបន្ថែមទៅក្នុងកន្ត្រកជោគជ័យ')}
                          </p>
                          <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
                            {tx('Total: $698.00 (2 items)', 'សរុប៖ $698.00 (២ មុខ)')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeStep === 4 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400">
                      <span>{tx('Cart Summary Breakdown', 'សង្ខេបកន្ត្រកទំនិញ')}</span>
                      <span className="text-emerald-600 font-mono">Subtotal + Delivery</span>
                    </div>
                    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 space-y-3 text-xs">
                      <div className="flex justify-between text-slate-500 font-medium">
                        <span>{tx('Subtotal', 'សរុបទំនិញ')}</span>
                        <span className="font-bold text-slate-900 dark:text-white">$349.00</span>
                      </div>
                      <div className="flex justify-between text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Truck size={12} className="text-emerald-600" />
                          <span>{tx('Delivery Fee (Express)', 'ថ្លៃដឹកជញ្ជូនរហ័ស')}</span>
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">$1.50</span>
                      </div>
                      <div className="flex justify-between items-baseline border-t border-slate-200 dark:border-slate-800 pt-2 font-bold text-sm text-slate-900 dark:text-white">
                        <span>{tx('Total Amount', 'ចំនួនសរុប')}</span>
                        <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">$350.50</span>
                      </div>
                      <button
                        type="button"
                        className="w-full rounded-full bg-[#18181B] dark:bg-white text-white dark:text-slate-900 py-2.5 text-xs font-black flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <span>{tx('Proceed to Checkout', 'ទៅ Checkout')}</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                )}

                {activeStep === 5 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400">
                      <span>{tx('Delivery Choice & Customer Form', 'ការជ្រើសរើសវិធីដឹកជញ្ជូន')}</span>
                      <span className="text-emerald-600 font-mono">Checkout Step</span>
                    </div>
                    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2.5 rounded-xl border border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 text-left">
                          <p className="font-black text-emerald-800 dark:text-emerald-300">
                            {tx('1. Delivery ($1.50)', '១. ដឹកដល់ផ្ទះ ($1.50)')}
                          </p>
                          <p className="text-[10px] text-slate-500">Phnom Penh Express</p>
                        </div>
                        <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-850 text-left">
                          <p className="font-bold text-slate-700 dark:text-slate-300">
                            {tx('2. Store Pickup ($0)', '២. យកផ្ទាល់ ($0)')}
                          </p>
                          <p className="text-[10px] text-slate-400">Mart Store Counter</p>
                        </div>
                      </div>
                      <div className="space-y-1.5 text-left">
                        <span className="text-[10px] font-bold text-slate-400">Receiver Name & Phone</span>
                        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-slate-700 dark:text-slate-200 font-semibold">
                          Bun Raksa • 096 878 2196
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeStep === 6 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400">
                      <span>{tx('Bakong KHQR Modal Preview', 'ផ្ទាំងស្កេន Bakong KHQR')}</span>
                      <span className="text-rose-600 font-mono font-bold">14:59</span>
                    </div>
                    {/* KHQR Modal Mockup with Red Brand Banner */}
                    <div className="rounded-2xl bg-white dark:bg-slate-900 border-2 border-rose-500/80 p-4 text-center space-y-2.5 shadow-md">
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 text-white px-3 py-0.5 text-[10px] font-black uppercase tracking-wider">
                        <span>KHQR • Bakong</span>
                      </div>
                      <div className="mx-auto h-32 w-32 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 flex items-center justify-center">
                        <QrCode size={100} className="text-slate-900 dark:text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Total Payable</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white">$350.50 USD</p>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        {tx('Scan with ABA, ACLEDA, Canadia, Wing, or Bakong', 'ស្កេនជាមួយ ABA, ACLEDA, Canadia, Wing ឬបាគង')}
                      </p>
                    </div>
                  </div>
                )}

                {activeStep === 7 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400">
                      <span>{tx('Real-Time Payment Statuses', 'ស្ថានភាពផ្ទៀងផ្ទាត់ទូទាត់')}</span>
                      <span className="text-emerald-600 font-mono">Live Polling</span>
                    </div>
                    <div className="space-y-2 text-left text-xs">
                      <div className="rounded-xl border border-amber-300 bg-amber-50/70 dark:bg-amber-950/30 p-2.5 flex items-center gap-2.5">
                        <Clock size={16} className="text-amber-600 animate-spin" />
                        <div>
                          <span className="font-black text-amber-900 dark:text-amber-200">
                            {tx('Pending', 'កំពុងរង់ចាំ')}
                          </span>
                          <p className="text-[10px] text-amber-700 dark:text-amber-400">
                            {tx('Waiting for payment confirmation...', 'កំពុងរង់ចាំការបញ្ជាក់ការទូទាត់...')}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-xl border border-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/30 p-2.5 flex items-center gap-2.5">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                        <div>
                          <span className="font-black text-emerald-900 dark:text-emerald-200">
                            {tx('Paid', 'ជោគជ័យ')}
                          </span>
                          <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
                            {tx('Payment completed successfully!', 'ការទូទាត់បានបញ្ចប់ដោយជោគជ័យ!')}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-xl border border-rose-300 bg-rose-50/70 dark:bg-rose-950/30 p-2.5 flex items-center gap-2.5">
                        <XCircle size={16} className="text-rose-600" />
                        <div>
                          <span className="font-black text-rose-900 dark:text-rose-200">
                            {tx('Failed', 'មិនជោគជ័យ')}
                          </span>
                          <p className="text-[10px] text-rose-700 dark:text-rose-400">
                            {tx('Payment could not be completed. Please retry.', 'ការទូទាត់មិនអាចបញ្ចប់បានទេ។ សូមព្យាយាមម្តងទៀត។')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeStep === 8 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400">
                      <span>{tx('Order Completed Receipt', 'បង្កាន់ដៃជោគជ័យ')}</span>
                      <span className="text-emerald-600 font-mono">ORD-78A9C2B1</span>
                    </div>
                    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 text-center space-y-3">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                        <CheckCircle2 size={22} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white">
                          {tx('Order Placed Successfully!', 'ការបញ្ជាទិញបានជោគជ័យ!')}
                        </p>
                        <p className="text-[10px] text-slate-400">Order ID: ORD-78A9C2B1 • Bill #10429</p>
                      </div>
                      <div className="flex items-center justify-center gap-2 pt-1">
                        <Link
                          to="/shop"
                          className="rounded-full bg-[#18181B] dark:bg-white text-white dark:text-slate-900 px-4 py-1.5 text-xs font-black shadow-xs hover:opacity-90 transition"
                        >
                          {tx('Back to Shop', 'បន្តទិញទំនិញ')}
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. KHQR PAYMENT SECTION (DETAILED BAKONG FOCUS) */}
      <section id="khqr" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 space-y-8">
        <div className="rounded-3xl border border-rose-200/80 dark:border-rose-950/60 bg-gradient-to-br from-rose-50/50 via-white to-rose-50/30 dark:from-rose-950/20 dark:via-slate-900 dark:to-slate-900 p-6 sm:p-10 shadow-lg space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rose-200/50 dark:border-slate-800 pb-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 rounded-full bg-rose-600 text-white px-3 py-0.5 text-[10px] font-black uppercase tracking-wider">
                <QrCode size={13} />
                <span>BAKONG KHQR SYSTEM</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {tx('How to Pay with Bakong KHQR', 'របៀបស្កេនទូទាត់តាមប្រព័ន្ធ Bakong KHQR')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium max-w-2xl">
                {tx(
                  'Scan the KHQR code using your supported banking application and complete the payment without handling cash.',
                  'ស្កេន QR Code KHQR ដោយប្រើកម្មវិធីធនាគារដែលគាំទ្រ ហើយបញ្ចប់ការទូទាត់ប្រាក់ដោយមិនចាំបាច់ប្រើសាច់ប្រាក់សុទ្ធ។'
                )}
              </p>
            </div>
          </div>

          {/* Payment Lifecycle Diagram */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-center">
            {[
              { num: '01', titleEn: 'Confirm Order', titleKm: 'បញ្ជាក់ការកុម្ម៉ង់', descEn: 'Click Place Order', descKm: 'ចុចបញ្ជាទិញ' },
              { num: '02', titleEn: 'Generate KHQR', titleKm: 'បង្កើត KHQR', descEn: 'Dynamic KHQR displays', descKm: 'កូដ KHQR បង្ហាញលើអេក្រង់' },
              { num: '03', titleEn: 'Scan with App', titleKm: 'ស្កេនជាមួយ App', descEn: 'ABA, ACLEDA, Wing, etc.', descKm: 'កម្មវិធីធនាគារនានា' },
              { num: '04', titleEn: 'Approve Payment', titleKm: 'អនុម័តការទូទាត់', descEn: 'Authorize in Bank App', descKm: 'បញ្ជាក់ក្នុងទូរស័ព្ទ' },
              { num: '05', titleEn: 'Instant Verify', titleKm: 'ផ្ទៀងផ្ទាត់ស្វ័យប្រវត្ត', descEn: 'Order completes live', descKm: 'ការបញ្ជាទិញជោគជ័យ' }
            ].map((flow, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-1.5 shadow-2xs relative"
              >
                <span className="font-mono text-xs font-black text-rose-600 dark:text-rose-400 block">
                  {flow.num}
                </span>
                <p className="text-xs font-black text-slate-900 dark:text-white">
                  {tx(flow.titleEn, flow.titleKm)}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  {tx(flow.descEn, flow.descKm)}
                </p>
              </div>
            ))}
          </div>

          {/* Important KHQR Reminders List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 space-y-3">
              <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span>{tx('Key Instructions Before Scanning', 'ការណែនាំសំខាន់មុនពេលស្កេន')}</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-black">•</span>
                  <span>{tx('Always check the payment amount before confirming in your banking application.', 'ពិនិត្យចំនួនទឹកប្រាក់មុនពេលបញ្ជាក់ការទូទាត់ក្នុងកម្មវិធីធនាគារជានិច្ច។')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-black">•</span>
                  <span>{tx('Scan the displayed KHQR code directly from the screen.', 'ស្កេន QR Code ដែលបង្ហាញលើអេក្រង់ដោយផ្ទាល់។')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-black">•</span>
                  <span>{tx('Complete the transaction via your own authorized banking app.', 'បញ្ចប់ការទូទាត់តាមរយៈកម្មវិធីធនាគារផ្ទាល់ខ្លួនរបស់អ្នក។')}</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 space-y-3">
              <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Clock size={16} className="text-amber-500" />
                <span>{tx('After Payment Completion', 'បន្ទាប់ពីបញ្ចប់ការទូទាត់')}</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-black">•</span>
                  <span>{tx('Return to the platform browser tab right after payment.', 'ត្រឡប់មកកាន់ផ្ទាំងគេហទំព័រភ្លាមៗបន្ទាប់ពីបានបង់ប្រាក់ក្នុងទូរស័ព្ទ។')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-black">•</span>
                  <span>{tx('Wait 5-15 seconds for automated Bakong transaction verification.', 'រង់ចាំប្រហែល 5-15 វិនាទី ដើម្បីឱ្យប្រព័ន្ធបាគងបញ្ជាក់ប្រតិបត្តិការ។')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-black">•</span>
                  <span>{tx('Do not close the payment window until the green "Paid" screen shows.', 'កុំបិទទំព័រទូទាត់រហូតដល់ផ្ទាំងពណ៌បៃតងជោគជ័យបង្ហាញឡើង។')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ACCOUNT / AUTHENTICATION GUIDE */}
      <section id="account" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 space-y-8">
        <div className="space-y-1 text-center max-w-2xl mx-auto">
          <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            {tx('ACCOUNT & SECURITY', 'គណនី និងសុវត្ថិភាព')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {tx('Managing Your Customer Account', 'ការគ្រប់គ្រងគណនីអតិថិជន')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            {tx(
              'Sign in to easily view previous orders, download tax invoices, and save your delivery addresses.',
              'ចូលគណនីដើម្បីតាមដានការបញ្ជាទិញ មើលវិក្កយបត្រ និងរក្សាទុកអាសយដ្ឋានដឹកជញ្ជូនរហ័ស។'
            )}
          </p>
        </div>

        {/* 3 Key Auth Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Register */}
          <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 space-y-4 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <User size={22} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {tx('1. Create an Account', '១. ការចុះឈ្មោះ (Register)')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                {tx(
                  'Create an account using your email address and a secure password. Registration takes under 15 seconds.',
                  'បង្កើតគណនីដោយប្រើអាសយដ្ឋានអ៊ីមែល និងពាក្យសម្ងាត់សុវត្ថិភាពរបស់អ្នក ត្រឹមតែរយៈពេល ១៥ វិនាទី។'
                )}
              </p>
            </div>
            <Link
              to="/register"
              className="inline-flex items-center gap-1 text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <span>{tx('Go to Register page →', 'ទៅកាន់ទំព័រចុះឈ្មោះ →')}</span>
            </Link>
          </div>

          {/* 2. Login & Google Sign In */}
          <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 space-y-4 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Lock size={22} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {tx('2. Sign In & Google Auth', '២. ចូលគណនី និង Google')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                {tx(
                  'Sign in to access your account with email/password. You can also sign in seamlessly using your official Google account.',
                  'ចូលគណនីរបស់អ្នកដើម្បីប្រើប្រាស់មុខងារពេញលេញ។ អ្នកក៏អាចចូលប្រើប្រាស់តាមរយៈគណនី Google របស់អ្នកបានយ៉ាងរហ័សផងដែរ។'
                )}
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-xs font-black text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              <span>{tx('Sign in to your account →', 'ចូលគណនីឥឡូវនេះ →')}</span>
            </Link>
          </div>

          {/* 3. Forgot Password */}
          <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 space-y-4 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <KeyRound size={22} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {tx('3. Forgot Password', '៣. ភ្លេចពាក្យសម្ងាត់')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                {tx(
                  'Lost your access? Enter your email address to receive an official reset link directly into your mailbox.',
                  'បាត់ពាក្យសម្ងាត់? គ្រាន់តែបញ្ចូលអ៊ីមែលរបស់អ្នកដើម្បីទទួលបានតំណភ្ជាប់កំណត់ពាក្យសម្ងាត់ថ្មីក្នុងប្រអប់សំបុត្រ។'
                )}
              </p>
            </div>
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-1 text-xs font-black text-amber-600 dark:text-amber-400 hover:underline"
            >
              <span>{tx('Reset password flow →', 'កំណត់ពាក្យសម្ងាត់ឡើងវិញ →')}</span>
            </Link>
          </div>
        </div>

        {/* Forgot Password Flow Representation */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-6 sm:p-8 space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
            {tx('PASSWORD RECOVERY LIFECYCLE', 'លំដាប់លំដោយនៃការកំណត់ពាក្យសម្ងាត់ឡើងវិញ')}
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
            {[
              { step: '1', en: 'Forgot Password', km: 'ចុច Forgot' },
              { step: '2', en: 'Enter Email', km: 'បញ្ចូលអ៊ីមែល' },
              { step: '3', en: 'Receive Email', km: 'ទទួលបានអ៊ីមែល' },
              { step: '4', en: 'Open Reset Link', km: 'បើកតំណភ្ជាប់' },
              { step: '5', en: 'New Password', km: 'បង្កើតពាក្យថ្មី' },
              { step: '6', en: 'Sign In', km: 'ចូលគណនីជោគជ័យ' }
            ].map((st, i) => (
              <div key={i} className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                <span className="font-mono text-xs font-black text-slate-400 block mb-1">
                  Step {st.step}
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {tx(st.en, st.km)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. IMPORTANT THINGS TO REMEMBER (SAFETY / TIPS) */}
      <section id="rules" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 space-y-8">
        <div className="rounded-3xl border border-amber-200/80 dark:border-amber-950/60 bg-amber-50/40 dark:bg-amber-950/20 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-xs">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {tx('Important Things to Remember', 'ចំណុចសំខាន់ៗដែលត្រូវចងចាំ')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                {tx('Essential advice for safe and smooth shopping.', 'ការណែនាំសំខាន់ៗដើម្បីសុវត្ថិភាព និងភាពងាយស្រួលក្នុងការទិញទំនិញ។')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {[
              {
                en: 'Check your order before payment.',
                km: 'ពិនិត្យការបញ្ជាទិញរបស់អ្នកមុនពេលបង់ប្រាក់។'
              },
              {
                en: 'Check the payment amount before confirming.',
                km: 'ពិនិត្យចំនួនទឹកប្រាក់មុនពេលបញ្ជាក់ការទូទាត់។'
              },
              {
                en: 'Do not close the payment page too early.',
                km: 'កុំបិទទំព័រទូទាត់លឿនពេក។'
              },
              {
                en: 'Wait for payment confirmation.',
                km: 'រង់ចាំការបញ្ជាក់ការទូទាត់។'
              },
              {
                en: 'Do not share your password with anyone.',
                km: 'កុំចែករំលែកពាក្យសម្ងាត់របស់អ្នកជាមួយនរណាម្នាក់ឡើយ។'
              },
              {
                en: 'Use your own banking application to make payment.',
                km: 'ប្រើកម្មវិធីធនាគារផ្ទាល់ខ្លួនរបស់អ្នកសម្រាប់ការទូទាត់។'
              },
              {
                en: 'Contact support if your payment was deducted but the order remains pending.',
                km: 'ទាក់ទង Support ប្រសិនបើប្រាក់ត្រូវបានកាត់ ប៉ុន្តែការបញ្ជាទិញនៅតែបង្ហាញថាកំពុងរង់ចាំ។'
              }
            ].map((tip, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 mt-0.5">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                  {tx(tip.en, tip.km)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. TROUBLESHOOTING & FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 space-y-8">
        <div className="space-y-1 text-center max-w-2xl mx-auto">
          <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            {tx('TROUBLESHOOTING & FAQ', 'សំណួរញឹកញាប់ និងការដោះស្រាយបញ្ហា')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {tx('Frequently Asked Questions', 'សំណួរដែលសួរញឹកញាប់')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            {tx(
              'Encountering an issue? Find instant answers to common questions below.',
              'មានចម្ងល់ ឬជួបបញ្ហាអ្វីមួយ? ស្វែងរកចម្លើយរហ័សនៅខាងក្រោម។'
            )}
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqData.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 dark:text-white cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850/60 transition"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{item.q}</span>
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-emerald-600' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed border-t border-slate-100 dark:border-slate-800 animate-slide-down">
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. FINAL CALL TO ACTION (CTA) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24">
        <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-gradient-to-br from-slate-900 via-[#18181B] to-slate-950 text-white p-8 sm:p-12 md:p-16 text-center space-y-6 shadow-2xl relative overflow-hidden">
          {/* Subtle glow accent */}
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

          <div className="relative max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
              {tx('Ready to get started?', 'ត្រៀមខ្លួនរួចរាល់ក្នុងការចាប់ផ្តើមហើយឬនៅ?')}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-300 font-medium leading-relaxed">
              {tx(
                'Browse our products and complete your first order with Mart System.',
                'ចាប់ផ្តើមស្វែងរកផលិតផល និងបញ្ជាទិញតាមរយៈ Mart System។'
              )}
            </p>
          </div>

          <div className="relative flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link
              to="/shop"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3.5 text-xs sm:text-sm font-black shadow-lg shadow-emerald-600/30 active:scale-95 transition cursor-pointer"
            >
              <ShoppingBag size={16} />
              <span>{tx('Browse Products', 'ស្វែងរកទំនិញ')}</span>
            </Link>

            <a
              href="tel:0968782196"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-slate-700 bg-white/10 hover:bg-white/15 backdrop-blur-xs text-white px-7 py-3.5 text-xs sm:text-sm font-black active:scale-95 transition cursor-pointer"
            >
              <Phone size={15} />
              <span>{tx('Contact Support (096 878 2196)', 'ទាក់ទង Support (096 878 2196)')}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
