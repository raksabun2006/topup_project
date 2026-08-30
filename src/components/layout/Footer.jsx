import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-700">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-center md:justify-between">
          {/* Left Column: Branding & Marketing Message */}
          <div className="space-y-2.5">
            <Link to="/" className="inline-block text-base sm:text-lg font-bold text-slate-900 transition hover:text-emerald-600">
              Mart System
            </Link>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
              ត្រូវការធ្វើ System សម្រាប់អាជីវកម្មរបស់អ្នក?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md">
              ទំនាក់ទំនងមកខ្ញុំ ដើម្បីពិភាក្សា និងបង្កើត System តាមតម្រូវការរបស់អ្នក។
            </p>
          </div>

          {/* Right Column: Contact Details & CTA */}
          <div className="flex flex-col md:items-end space-y-3.5">
            <div className="space-y-1.5 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 md:justify-end">
                <span className="font-semibold text-slate-900">Phone:</span>
                <a
                  href="tel:0968782196"
                  className="font-medium text-emerald-600 hover:text-emerald-700 hover:underline transition"
                >
                  0968782196
                </a>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 md:justify-end">
                <span className="font-semibold text-slate-900">Email:</span>
                <a
                  href="mailto:raksabun2006@gmail.com"
                  className="font-medium text-emerald-600 hover:text-emerald-700 hover:underline break-all transition"
                >
                  raksabun2006@gmail.com
                </a>
              </div>
            </div>

            <div>
              <a
                href="mailto:raksabun2006@gmail.com?subject=សំណើធ្វើ%20System%20សម្រាប់អាជីវកម្ម"
                className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 active:scale-95"
              >
                ទំនាក់ទំនងខ្ញុំ
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Divider */}
        <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-500">
          <p>© 2026 Mart System. រក្សាសិទ្ធិគ្រប់យ៉ាងដោយ Bun Raksa។</p>
        </div>
      </div>
    </footer>
  );
}
