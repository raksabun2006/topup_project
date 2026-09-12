import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle, Search, QrCode, Truck, RefreshCw, Phone, MessageSquare,
  ChevronDown, ChevronUp, ShieldCheck, ShoppingBag, ExternalLink, MapPin,
  Clock, AlertCircle
} from 'lucide-react';
import SEO from '../components/SEO';

const FAQ_CATEGORIES = [
  {
    id: 'ordering',
    titleEn: 'How to Order',
    titleKm: 'របៀបបញ្ជាទិញទំនិញ',
    icon: ShoppingBag,
    faqs: [
      {
        qEn: 'How do I place an order on Mart System?',
        qKm: 'តើខ្ញុំអាចធ្វើការបញ្ជាទិញទំនិញដោយរបៀបណា?',
        aEn: 'Browse products from the Shop page, select your quantity, click "Add to Cart", then proceed to Checkout. Choose whether you prefer Home Delivery ($1.50) or Store Pickup ($0.00), fill your contact details, and scan the Bakong KHQR code to complete the order.',
        aKm: 'ជ្រើសរើសទំនិញពីទំព័រហាង (Shop) កំណត់ចំនួនដែលចង់បាន ចុច "ដាក់ចូលកន្ត្រក" ហើយចូលទៅកាន់ Checkout។ ជ្រើសរើសសេវាដឹកជញ្ជូនដល់ផ្ទះ ($1.50) ឬមកយកនៅហាងផ្ទាល់ (ឥតគិតថ្លៃ) បំពេញព័ត៌មានទំនាក់ទំនង រួចស្កេន Bakong KHQR ដើម្បីទូទាត់ប្រាក់។',
      },
      {
        qEn: 'Do I need an account to buy products?',
        qKm: 'តើខ្ញុំត្រូវការបង្កើតគណនីដើម្បីទិញទំនិញដែរឬទេ?',
        aEn: 'You can explore and add items to your cart as a guest. When checking out, creating an account or signing in takes less than 10 seconds and allows you to track real-time delivery status and save multiple delivery addresses.',
        aKm: 'អ្នកអាចរុករក និងដាក់ទំនិញក្នុងកន្ត្រកជាភ្ញៀវបាន។ នៅពេលទូទាត់ប្រាក់ ការបង្កើតគណនីចំណាយពេលមិនដល់ ១០ វិនាទីទេ ហើយអនុញ្ញាតឱ្យអ្នកតាមដានការដឹកជញ្ជូន និងរក្សាទុកអាសយដ្ឋានដឹកជញ្ជូនជាច្រើន។',
      },
    ],
  },
  {
    id: 'khqr',
    titleEn: 'Bakong KHQR Payment',
    titleKm: 'ការទូទាត់ Bakong KHQR',
    icon: QrCode,
    faqs: [
      {
        qEn: 'Which banking apps support Bakong KHQR?',
        qKm: 'តើកម្មវិធីធនាគារណាខ្លះអាចស្កេន Bakong KHQR បាន?',
        aEn: 'You can scan Bakong KHQR with any Cambodian banking app connected to the National Bank of Cambodia Bakong network, including ABA Mobile, ACLEDA mobile, Canadia Bank, Wing Bank, Sathapana Mobile, Chip Mong Bank, and over 50+ financial institutions.',
        aKm: 'លោកអ្នកអាចស្កេន Bakong KHQR ជាមួយគ្រប់កម្មវិធីធនាគារក្នុងប្រទេសកម្ពុជាដែលភ្ជាប់ប្រព័ន្ធបាគងរបស់ធនាគារជាតិនៃកម្ពុជា រួមមាន ABA Mobile, ACLEDA, Canadia, Wing, Sathapana, Chip Mong និងធនាគារជាង ៥០ ទៀត។',
      },
      {
        qEn: 'What happens if my payment does not confirm immediately?',
        qKm: 'ចុះបើខ្ញុំបានផ្ទេរប្រាក់ហើយ ប៉ុន្តែប្រព័ន្ធមិនទាន់បញ្ជាក់ភ្លាមៗ?',
        aEn: 'Our system automatically verifies payment status every 2.5 seconds. If network latency delays the confirmation, please do not close the window for 15 seconds. If money was deducted, our customer support team can manually verify using your transaction reference ID.',
        aKm: 'ប្រព័ន្ធរបស់យើងផ្ទៀងផ្ទាត់ការទូទាត់ដោយស្វ័យប្រវត្តរៀងរាល់ ២.៥ វិនាទីម្តង។ ប្រសិនបើមានបញ្ហាយឺតយ៉ាវនៃសេវាអ៊ីនធឺណិត សូមកុំបិទទំព័រទូទាត់ប្រហែល ១៥ វិនាទី។ ប្រសិនបើកាត់លុយហើយ ក្រុមការងារជំនួយអាចផ្ទៀងផ្ទាត់ដោយផ្ទាល់តាមរយៈលេខកូដប្រតិបត្តិការ (Transaction ID)។',
      },
    ],
  },
  {
    id: 'delivery',
    titleEn: 'Delivery & Pickup',
    titleKm: 'ការដឹកជញ្ជូន និងមកយកផ្ទាល់',
    icon: Truck,
    faqs: [
      {
        qEn: 'How long does doorstep delivery take?',
        qKm: 'តើការដឹកជញ្ជូនដល់ផ្ទះចំណាយពេលប៉ុន្មាន?',
        aEn: 'Express Doorstep Delivery in Phnom Penh typically takes 30 to 60 minutes depending on distance and traffic. Delivery fee is fixed at $1.50 USD.',
        aKm: 'ការដឹកជញ្ជូនរហ័សក្នុងរាជធានីភ្នំពេញជាទូទៅចំណាយពេលចន្លោះពី ៣០ ទៅ ៦០ នាទី អាស្រ័យលើចម្ងាយ។ ថ្លៃសេវាដឹកជញ្ជូនគឺថេរ $1.50 USD។',
      },
      {
        qEn: 'Where can I pick up my order in person?',
        qKm: 'តើខ្ញុំអាចមកយកទំនិញផ្ទាល់នៅទីតាំងណា?',
        aEn: 'Store pickup is available at Mart System Store (Open daily from 7:00 AM to 10:00 PM). Pickup is 100% free with no delivery surcharge.',
        aKm: 'លោកអ្នកអាចមកទទួលទំនិញនៅសាខាហាង Mart System (បើកដំណើរការរៀងរាល់ថ្ងៃ ម៉ោង ៧:០០ ព្រឹក ដល់ ១០:០០ យប់) ដោយមិនគិតថ្លៃសេវាដឹកជញ្ជូនឡើយ។',
      },
    ],
  },
  {
    id: 'returns',
    titleEn: 'Returns & Refunds',
    titleKm: 'ការប្តូរ និងសងប្រាក់វិញ',
    icon: RefreshCw,
    faqs: [
      {
        qEn: 'Can I exchange damaged or expired items?',
        qKm: 'តើខ្ញុំអាចប្តូរទំនិញដែលខូចខាត ឬផុតកំណត់បានទេ?',
        aEn: 'Yes. Mart System offers a 100% satisfaction guarantee. If an item arrives damaged, defective, or past its expiration date, please notify our team within 24 hours for a replacement or full refund.',
        aKm: 'បាទ/ចាស! Mart System ធានាគុណភាព ១០០%។ ប្រសិនបើទំនិញខូចខាត មានបញ្ហា ឬហួសកាលកំណត់ សូមទាក់ទងមកយើងខ្ញុំក្នុងរយៈពេល ២៤ ម៉ោង ដើម្បីប្តូរទំនិញថ្មី ឬសងប្រាក់វិញពេញចំនួន។',
      },
    ],
  },
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState('ordering-0');

  const filteredCategories = FAQ_CATEGORIES.map((cat) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return cat;
    const matching = cat.faqs.filter(
      (f) =>
        f.qEn.toLowerCase().includes(q) ||
        f.qKm.toLowerCase().includes(q) ||
        f.aEn.toLowerCase().includes(q) ||
        f.aKm.toLowerCase().includes(q)
    );
    return { ...cat, faqs: matching };
  }).filter((cat) => cat.faqs.length > 0);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-20 font-sans">
      <SEO
        title="Help Center & FAQs | Mart System"
        description="Find answers to ordering, Bakong KHQR payments, and delivery questions."
        canonical="/help"
      />

      {/* Hero Search Banner */}
      <div className="border-b border-slate-100 dark:border-slate-800 bg-radial from-emerald-50/50 dark:from-emerald-950/20 to-transparent py-12 px-4 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/25">
          <HelpCircle size={28} />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            មជ្ឈមណ្ឌលជំនួយ (Help Center)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            ស្វែងរកចម្លើយ និងដំណោះស្រាយសម្រាប់សំណួរទូទៅអំពីការបញ្ជាទិញ ការទូទាត់ប្រាក់ និងការដឹកជញ្ជូន។
          </p>
        </div>

        {/* Search input */}
        <div className="max-w-md mx-auto relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ស្វែងរកសំណួរ (Search help topics, KHQR, delivery...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-3 pl-11 pr-4 text-xs font-semibold text-slate-900 dark:text-white shadow-md focus:outline-none focus:border-emerald-600 transition"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-10">
        {/* Quick Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-3xl bg-[#F7F7F8] dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 space-y-2 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
              <Phone size={18} />
            </div>
            <h3 className="font-extrabold text-xs text-slate-900 dark:text-white">ទូរស័ព្ទផ្ទាល់ (Direct Call)</h3>
            <p className="text-[11px] text-slate-400">7:00 AM - 10:00 PM</p>
            <a href="tel:+85512345678" className="inline-block text-xs font-mono font-black text-emerald-600 hover:underline">
              +855 12 345 678
            </a>
          </div>

          <div className="rounded-3xl bg-[#F7F7F8] dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 space-y-2 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600">
              <MessageSquare size={18} />
            </div>
            <h3 className="font-extrabold text-xs text-slate-900 dark:text-white">ជំនួយអតិថិជន (Support Ticket)</h3>
            <p className="text-[11px] text-slate-400">Online 24/7 Response</p>
            <Link to="/account/support" className="inline-block text-xs font-black text-blue-600 hover:underline">
              ផ្ញើសំណើ (Open Ticket) →
            </Link>
          </div>

          <div className="rounded-3xl bg-[#F7F7F8] dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 space-y-2 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600">
              <MapPin size={18} />
            </div>
            <h3 className="font-extrabold text-xs text-slate-900 dark:text-white">ទីតាំងហាង (Store Location)</h3>
            <p className="text-[11px] text-slate-400">Phnom Penh, Cambodia</p>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              Open Daily
            </span>
          </div>
        </div>

        {/* FAQ Categories & Accordion */}
        <div className="space-y-8">
          {filteredCategories.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <div key={cat.id} className="space-y-3">
                <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
                    <IconComponent size={16} />
                  </div>
                  <div>
                    <h2 className="font-black text-sm text-slate-900 dark:text-white">
                      {cat.titleKm} ({cat.titleEn})
                    </h2>
                  </div>
                </div>

                <div className="space-y-2">
                  {cat.faqs.map((faq, idx) => {
                    const faqId = `${cat.id}-${idx}`;
                    const isOpen = openFaq === faqId;

                    return (
                      <div
                        key={idx}
                        className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-[#F7F7F8] dark:bg-slate-900 overflow-hidden transition-all"
                      >
                        <button
                          type="button"
                          onClick={() => setOpenFaq(isOpen ? null : faqId)}
                          className="w-full flex items-center justify-between p-4 text-left font-bold text-xs text-slate-900 dark:text-white cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                        >
                          <span className="pr-4">{faq.qKm} — {faq.qEn}</span>
                          {isOpen ? <ChevronUp size={16} className="shrink-0 text-slate-400" /> : <ChevronDown size={16} className="shrink-0 text-slate-400" />}
                        </button>

                        {isOpen && (
                          <div className="p-4 pt-0 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-200/40 dark:border-slate-800/60 space-y-2">
                            <p className="font-medium text-slate-800 dark:text-slate-200">{faq.aKm}</p>
                            <p className="text-slate-500 dark:text-slate-400 text-[11px]">{faq.aEn}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
