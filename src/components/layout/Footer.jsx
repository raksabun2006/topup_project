import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { env } from '../../config/env';

function FacebookIcon({ size = 16, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ size = 16, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TelegramIcon({ size = 16, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
    </svg>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const brandName = env.appName || 'Mart System';

  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-sans transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Main 4-Column Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Column 1: ABOUT */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              About
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <Link
                  to="/shop"
                  className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                >
                  Our Store
                </Link>
              </li>
              <li>
                <Link
                  to="/categories"
                  className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                >
                  All Categories
                </Link>
              </li>
              <li>
                <Link
                  to="/orders"
                  className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                >
                  Track Orders
                </Link>
              </li>
              <li>
                <Link
                  to="/shop"
                  className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: SUPPORT */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Support
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <a
                  href="tel:0968782196"
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
                >
                  Contact: 0968782196
                </a>
              </li>
              <li>
                <a
                  href="mailto:raksabun2006@gmail.com"
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition truncate block"
                >
                  Email: raksabun2006@gmail.com
                </a>
              </li>
              <li className="text-slate-600 dark:text-slate-400">
                Delivery: $1.50 Express
              </li>
              <li className="text-slate-600 dark:text-slate-400">
                Payment: Bakong KHQR
              </li>
              <li>
                <Link
                  to="/guide"
                  className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                >
                  User Guide (របៀបប្រើប្រាស់)
                </Link>
              </li>
              <li>
                <Link
                  to="/orders"
                  className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                >
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: CUSTOMER */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Customer
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <Link
                  to="/account"
                  className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                >
                  My Account
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                >
                  Shopping Bag
                </Link>
              </li>
              <li>
                <Link
                  to="/checkout"
                  className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                >
                  Checkout
                </Link>
              </li>
              <li>
                <Link
                  to="/orders"
                  className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                >
                  Purchase History
                </Link>
              </li>
              <li>
                <Link
                  to="/orders"
                  className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                >
                  Order Tracking
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: CONTACT & SOCIAL MEDIA */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Contact &amp; Social Media
            </h4>

            {/* Direct Contact Info */}
            <div className="space-y-2.5 text-xs font-medium">
              <a
                href="tel:0968782196"
                className="block text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
              >
                0968782196
              </a>

              <a
                href="mailto:raksabun2006@gmail.com"
                className="block text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition truncate"
              >
                raksabun2006@gmail.com
              </a>

              <a
                href="https://www.facebook.com/bun.raksa.intelcorei5"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                Facebook Profile
              </a>
            </div>

            {/* Social Action Buttons */}
            <div className="pt-1 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Follow Us
              </span>
              <div className="flex items-center gap-2.5">
                {/* Facebook Button */}
                <a
                  href="https://www.facebook.com/bun.raksa.intelcorei5"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-[#1877F2] hover:text-white dark:hover:bg-[#1877F2] dark:hover:text-white transition-all shadow-2xs hover:scale-105 active:scale-95"
                  aria-label="Facebook Page"
                  title="Visit our Facebook"
                >
                  <FacebookIcon size={16} />
                </a>

                {/* Telegram Button */}
                <a
                  href="https://t.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-[#229ED9] hover:text-white dark:hover:bg-[#229ED9] dark:hover:text-white transition-all shadow-2xs hover:scale-105 active:scale-95"
                  aria-label="Telegram Channel"
                  title="Join our Telegram"
                >
                  <TelegramIcon size={16} />
                </a>

                {/* Instagram Button */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-gradient-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] hover:text-white dark:hover:text-white transition-all shadow-2xs hover:scale-105 active:scale-95"
                  aria-label="Instagram Profile"
                  title="Follow on Instagram"
                >
                  <InstagramIcon size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Terms & Verified Badge */}
        <div className="mt-12 pt-6 border-t border-slate-200/70 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <p>© {currentYear} {brandName}. All Rights Reserved.</p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[11px]">
            <span className="hover:text-slate-900 dark:hover:text-white transition cursor-pointer">
              Terms of Service
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="hover:text-slate-900 dark:hover:text-white transition cursor-pointer">
              Privacy Policy
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <div className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-900/40 rounded-full px-2.5 py-0.5 font-bold shadow-2xs">
              <CheckCircle2 size={13} className="shrink-0" />
              <span>Bakong KHQR Verified</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
