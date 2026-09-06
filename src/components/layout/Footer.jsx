import { Link } from 'react-router-dom';
import { Store, Phone, Mail, MapPin, Truck, ShieldCheck, QrCode } from 'lucide-react';
import { env } from '../../config/env';

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: About */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              About
            </h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li><Link to="/shop" className="hover:text-black dark:hover:text-white transition">Our Store</Link></li>
              <li><Link to="/categories" className="hover:text-black dark:hover:text-white transition">All Categories</Link></li>
              <li><Link to="/orders" className="hover:text-black dark:hover:text-white transition">Track Orders</Link></li>
            </ul>
          </div>

          {/* Col 2: Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Support
            </h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li><a href="tel:0968782196" className="hover:text-black dark:hover:text-white transition">Contact Us: 0968782196</a></li>
              <li><a href="mailto:raksabun2006@gmail.com" className="hover:text-black dark:hover:text-white transition">Email Support</a></li>
              <li><span className="text-slate-400">Delivery: $1.50 Express</span></li>
              <li><span className="text-slate-400">Payment: Bakong KHQR</span></li>
            </ul>
          </div>

          {/* Col 3: Customer Portal */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Customer
            </h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li><Link to="/account" className="hover:text-black dark:hover:text-white transition">My Account</Link></li>
              <li><Link to="/cart" className="hover:text-black dark:hover:text-white transition">Shopping Bag</Link></li>
              <li><Link to="/checkout" className="hover:text-black dark:hover:text-white transition">Checkout</Link></li>
              <li><Link to="/orders" className="hover:text-black dark:hover:text-white transition">Purchase History</Link></li>
            </ul>
          </div>

          {/* Col 4: Social Media */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Social Media
            </h4>
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://t.me"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#18181B] text-white hover:bg-black transition shadow-xs text-xs font-bold"
                aria-label="Telegram"
              >
                TG
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#18181B] text-white hover:bg-black transition shadow-xs text-xs font-bold"
                aria-label="Facebook"
              >
                f
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#18181B] text-white hover:bg-black transition shadow-xs text-xs font-bold"
                aria-label="Instagram"
              >
                ig
              </a>
            </div>
            <p className="text-[11px] text-slate-400 pt-1">
              Follow us for daily flash deals and fresh arrivals.
            </p>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Terms */}
        <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-semibold text-slate-400">
          <p>© {new Date().getFullYear()} {env.appName || 'Mart System'}. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <span>Terms of Service</span>
            <span>•</span>
            <span>Privacy Policy</span>
            <span>•</span>
            <span className="text-emerald-600 font-bold">Bakong KHQR Verified</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
