import { CheckCircle, Printer, Plus } from 'lucide-react';
import Receipt from './Receipt';

export default function SaleSuccessModal({ sale, onNewSale }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in print:bg-white print:p-0 print:backdrop-blur-none">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-300 bg-white shadow-2xl animate-scale-in print:max-h-none print:overflow-visible print:rounded-none print:border-0 print:shadow-none">
        <div className="flex flex-col items-center gap-2 border-b border-slate-200 p-6 text-center print:hidden">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-xl font-black text-slate-900">🎉 ការទូទាត់បានជោគជ័យ!</h2>
          <p className="text-sm font-bold text-slate-700">Invoice: {sale.invoiceNumber}</p>
          <p className="text-xs text-slate-500">
            ការបញ្ជាទិញរបស់អ្នកត្រូវបានបញ្ជាក់។ សូមអរគុណសម្រាប់ការគាំទ្រ។
          </p>
        </div>

        <Receipt sale={sale} />

        <div className="flex gap-3 border-t border-slate-200 p-6 print:hidden">
          <button
            onClick={() => window.print()}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-50 py-2.5 text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-100"
          >
            <Printer size={16} />
            បោះពុម្ព
          </button>
          <button
            onClick={onNewSale}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-500"
          >
            <Plus size={16} />
            ការលក់ថ្មី
          </button>
        </div>
      </div>
    </div>
  );
}
