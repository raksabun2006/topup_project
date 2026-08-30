import { useEffect, useState } from 'react';
import { formatCurrency, formatDate } from '../../utils/format';
import { env } from '../../config/env';
import { customerApi } from '../../api/customerApi';
import { useAuth } from '../../context/AuthContext';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * បង្ហាញទិន្នន័យពី SaleResponseDto ដោយផ្ទាល់
 * សម្រាប់ Customer Receipt (showTaxDiscount = false) មិនបង្ហាញ Tax និង Discount ឡើយ។
 * សម្រាប់ Staff / Admin (showTaxDiscount = true) បង្ហាញ Subtotal, Tax, Discount ពេញលេញ។
 */
export default function Receipt({ sale, showTaxDiscount = false }) {
  const { isAuthenticated } = useAuth();
  const [names, setNames] = useState({});

  const shouldShowTaxDiscount = showTaxDiscount || (isAuthenticated && (sale?.discount > 0 || sale?.tax > 0));

  useEffect(() => {
    if (!sale) return;
    const customerId = sale.customer && UUID_RE.test(sale.customer) ? sale.customer : null;
    if (!customerId) return;

    let cancelled = false;
    customerApi.getById(customerId)
      .then((c) => { if (!cancelled) setNames({ [customerId]: c.name }); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [sale]);

  if (!sale) return null;

  return (
    <div id="receipt-print-area" className="mx-auto max-w-sm bg-white dark:bg-slate-900 p-6 text-slate-900 dark:text-slate-100 print:bg-white print:text-black">
      <div className="text-center">
        <p className="text-lg font-bold print:text-black">{env.appName}</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 print:text-slate-600">វិក្កយបត្រ / Receipt</p>
      </div>

      <div className="mt-4 space-y-1 border-y border-dashed border-slate-300 dark:border-slate-700 py-3 text-xs print:border-slate-300">
        <div className="flex justify-between">
          <span className="text-slate-500 dark:text-slate-400 print:text-slate-600">លេខវិក្កយបត្រ</span>
          <span className="font-mono font-medium">{sale.invoiceNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500 dark:text-slate-400 print:text-slate-600">កាលបរិច្ឆេទ</span>
          <span>{formatDate(sale.createdAt)}</span>
        </div>
        {sale.cashier && (
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400 print:text-slate-600">អ្នកគិតលុយ</span>
            <span>{sale.cashierName ?? sale.cashier}</span>
          </div>
        )}
        {sale.customer && (
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400 print:text-slate-600">អតិថិជន</span>
            <span>{names[sale.customer] ?? sale.customer}</span>
          </div>
        )}
      </div>

      <table className="mt-3 w-full text-xs">
        <thead>
          <tr className="border-b border-slate-300 dark:border-slate-700 text-left text-slate-500 dark:text-slate-400 print:border-slate-300 print:text-slate-600">
            <th className="pb-1 font-medium">ទំនិញ</th>
            <th className="pb-1 text-center font-medium">ចំនួន</th>
            <th className="pb-1 text-right font-medium">សរុប</th>
          </tr>
        </thead>
        <tbody>
          {(sale.items ?? []).map((item) => (
            <tr key={item.id} className="border-b border-dotted border-slate-200 dark:border-slate-800 print:border-slate-200">
              <td className="py-1.5 pr-2">
                <div className="font-medium text-slate-900 dark:text-white print:text-black">{item.productName}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 print:text-slate-600">
                  {formatCurrency(item.unitPrice)} × {item.quantity}
                </div>
              </td>
              <td className="py-1.5 text-center font-medium">{item.quantity}</td>
              <td className="py-1.5 text-right font-semibold">{formatCurrency(item.lineTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-3 space-y-1 border-t border-dashed border-slate-300 dark:border-slate-700 pt-3 text-xs print:border-slate-300">
        {shouldShowTaxDiscount ? (
          <>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400 print:text-slate-600">សរុបរង</span>
              <span>{formatCurrency(sale.subtotal)}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 print:text-slate-600">បញ្ចុះតម្លៃ</span>
                <span>-{formatCurrency(sale.discount)}</span>
              </div>
            )}
            {sale.tax > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 print:text-slate-600">ពន្ធ</span>
                <span>{formatCurrency(sale.tax)}</span>
              </div>
            )}
            <div className="mt-1 flex justify-between border-t border-slate-300 dark:border-slate-700 pt-1.5 text-sm font-bold print:border-slate-300">
              <span>សរុប</span>
              <span>{formatCurrency(sale.total)}</span>
            </div>
          </>
        ) : (
          /* Customer Receipt: Only final payable amount */
          <div className="flex items-center justify-between py-1 text-sm font-bold">
            <span className="text-slate-900 dark:text-white print:text-black">ចំនួនត្រូវបង់:</span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400 print:text-black">{formatCurrency(sale.total)}</span>
          </div>
        )}
      </div>

      <div className="mt-4 text-center text-[10px] text-slate-500 dark:text-slate-400 space-y-1 print:text-slate-600">
        <p>ស្ថានភាព៖ {sale.status} · ការបង់ប្រាក់៖ {sale.paymentStatus}</p>
        <p className="font-medium">Gateway: Bakong</p>
        <p className="mt-2 text-slate-600 dark:text-slate-300 print:text-slate-700">សូមអរគុណសម្រាប់ការគាំទ្រ!</p>
      </div>
    </div>
  );
}