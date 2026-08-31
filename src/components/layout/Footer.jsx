import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 transition-colors duration-200">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-center md:justify-between">
          {/* Left Column: Branding & Marketing Message */}
          <div className="space-y-2.5">
            <Link to="/" className="inline-block text-base sm:text-lg font-bold text-slate-900 dark:text-white transition hover:text-emerald-600 dark:hover:text-emerald-400">
              Mart System
            </Link>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
              ប្រព័ន្ធគ្រប់គ្រងហាង និង POS ទំនើបសម្រាប់អាជីវកម្ម
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md">
              គ្រប់គ្រងការលក់ ទំនិញ ស្តុក និងទូទាត់ប្រាក់តាម Bakong KHQR បានយ៉ាងរហ័ស និងមានសុវត្ថិភាព។
            </p>
            <nav aria-label="Footer quick links" className="flex items-center gap-4 pt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Link to="/pos" className="hover:underline">ចំណុចលក់ (POS)</Link>
              <span>•</span>
              <Link to="/products" className="hover:underline">ទំនិញ (Products)</Link>
            </nav>
          </div>

          {/* Right Column: Contact Details & CTA */}
          <div className="flex flex-col md:items-end space-y-3.5">
            <div className="space-y-1.5 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 md:justify-end">
                <span className="font-semibold text-slate-900 dark:text-slate-200">Phone:</span>
                <a
                  href="tel:0968782196"
                  className="font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline transition"
                >
                  0968782196
                </a>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 md:justify-end">
                <span className="font-semibold text-slate-900 dark:text-slate-200">Email:</span>
                <a
                  href="mailto:raksabun2006@gmail.com"
                  className="font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline break-all transition"
                >
                  raksabun2006@gmail.com
                </a>
              </div>
            </div>

            <div>
              <a
                href="mailto:raksabun2006@gmail.com?subject=សំណើធ្វើ%20System%20សម្រាប់អាជីវកម្ម"
                className="inline-flex items-center justify-center rounded-xl bg-emerald-600 dark:bg-emerald-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 active:scale-95"
              >
                ទំនាក់ទំនងខ្ញុំ
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Divider */}
        <div className="mt-8 border-t border-slate-100 dark:border-slate-800/80 pt-6 text-center text-xs text-slate-500 dark:text-slate-500">
          <p>© 2026 Mart System. រក្សាសិទ្ធិគ្រប់យ៉ាងដោយ Bun Raksa។</p>
        </div>
      </div>
    </footer>
  );
}
