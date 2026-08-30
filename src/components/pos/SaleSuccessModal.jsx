import { CheckCircle, Printer, Plus, ShoppingBag } from 'lucide-react';
import Receipt from './Receipt';
import { useAuth } from '../../context/AuthContext';

export default function SaleSuccessModal({ sale, onNewSale }) {
  const { isAuthenticated } = useAuth();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4 backdrop-blur-sm animate-fade-in print:bg-white print:p-0 print:backdrop-blur-none">
      <div className="max-h-[92vh] w-full max-w-md flex flex-col overflow-hidden rounded-t-3xl sm:rounded-2xl border border-slate-300 bg-white shadow-2xl animate-slide-up sm:animate-scale-in print:max-h-none print:overflow-visible print:rounded-none print:border-0 print:shadow-none">
        <div className="flex shrink-0 flex-col items-center gap-1.5 sm:gap-2 border-b border-slate-200 p-4 sm:p-6 text-center print:hidden">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle size={28} className="sm:w-8 sm:h-8" />
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900">🎉 ការទូទាត់បានជោគជ័យ!</h2>
          <p className="text-xs sm:text-sm font-bold text-slate-700">Invoice: {sale.invoiceNumber}</p>
          <p className="text-[11px] sm:text-xs text-slate-500">
            ការបញ្ជាទិញរបស់អ្នកត្រូវបានបញ្ជាក់។ សូមអរគុណសម្រាប់ការគាំទ្រ។
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Receipt sale={sale} showTaxDiscount={isAuthenticated} />
        </div>

        <div className="shrink-0 flex gap-2.5 sm:gap-3 border-t border-slate-200 p-3.5 sm:p-5 print:hidden bg-white">
          <button
            onClick={() => window.print()}
            className="flex flex-1 items-center justify-center gap-1.5 sm:gap-2 rounded-xl border border-slate-300 bg-slate-50 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-100"
          >
            <Printer size={15} />
            បោះពុម្ព
          </button>
          <button
            onClick={onNewSale}
            className="flex flex-1 items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-emerald-600 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-500 active:scale-[0.98]"
          >
            {isAuthenticated ? (
              <>
                <Plus size={15} />
                <span>ការលក់ថ្មី</span>
              </>
            ) : (
              <>
                <ShoppingBag size={15} />
                <span>ទិញបន្ត (Shop Again)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
