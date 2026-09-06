import { CheckCircle2, Printer, ShoppingBag, X, FileText, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Receipt from './Receipt';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function SaleSuccessModal({ sale, onNewSale, onClose }) {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (onNewSale) {
      onNewSale();
    }
  };

  const handleViewOrders = () => {
    handleClose();
    navigate('/orders');
  };

  const handleContinueShopping = () => {
    if (onNewSale) {
      onNewSale();
    } else {
      handleClose();
      navigate('/shop');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4 backdrop-blur-sm animate-fade-in print:bg-white print:p-0 print:backdrop-blur-none">
      <div className="max-h-[94vh] w-full max-w-2xl flex flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shadow-2xl animate-slide-up sm:animate-scale-in print:max-h-none print:overflow-visible print:rounded-none print:border-0 print:shadow-none print:bg-white">
        
        {/* Top Header bar with Close Button */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 px-5 py-3.5 sm:px-6 print:hidden">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={16} />
            </span>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                បង្កាន់ដៃបញ្ជាទិញ (Order Receipt)
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5">
          <Receipt
            sale={sale}
            showTaxDiscount={true}
            mode={isAuthenticated ? 'ecommerce' : 'ecommerce'}
            showSuccessBadge={true}
          />
        </div>

        {/* Bottom Actions Bar */}
        <div className="shrink-0 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 sm:gap-3 border-t border-slate-200 dark:border-slate-800 p-3.5 sm:p-5 print:hidden bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex flex-1 sm:flex-initial items-center justify-center gap-1.5 sm:gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 shadow-2xs transition hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
          >
            <Printer size={15} />
            <span>បោះពុម្ព (Print)</span>
          </button>

          <div className="flex flex-1 items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleViewOrders}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 shadow-2xs transition hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
            >
              <FileText size={15} />
              <span>ការបញ្ជាទិញ (Orders)</span>
            </button>

            <button
              type="button"
              onClick={handleContinueShopping}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-600/25 transition active:scale-[0.98] cursor-pointer"
            >
              <ShoppingBag size={15} />
              <span>ទិញបន្ត (Shop)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
