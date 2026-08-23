import { useEffect, useState } from 'react';
import { formatCurrency, formatDate } from '../../utils/format';
import { env } from '../../config/env';
import { productApi } from '../../api/productApi';
import { customerApi } from '../../api/customerApi';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * បង្ហាញទិន្នន័យពី SaleResponseDto ដោយផ្ទាល់ - នេះជា "transaction" ដ៏ពិត
 * ព្រោះ backend មិនមាន entity Transaction ដាច់ដោយឡែកទេ (invoiceNumber
 * គឺជាលេខយោង, subtotal/discount/tax/total ជាតម្លៃចុងក្រោយពី backend)។
 *
 * sale.customer/item.product ដែលទាញយកមកវិញ តាមពិតជា UUID reference
 * (មិនមែនឈ្មោះ display ដូចធ្លាប់សន្មតទេ) - ដូច្នេះត្រូវទាញឈ្មោះមកជំនួស
 * តាម id ដែលឃើញ (មិនប៉ះពាល់ករណីមានឈ្មោះមកស្រាប់ ព្រោះ UUID_RE មិនផ្គូផ្គង)។
 */
export default function Receipt({ sale }) {
  const [names, setNames] = useState({});

  useEffect(() => {
    if (!sale) return;
    const productIds = [...new Set((sale.items ?? []).map((i) => i.product).filter((v) => UUID_RE.test(v)))];
    const customerId = sale.customer && UUID_RE.test(sale.customer) ? sale.customer : null;
    if (productIds.length === 0 && !customerId) return;

    let cancelled = false;
    Promise.all([
      ...productIds.map((id) => productApi.getById(id).then((p) => [id, p.name]).catch(() => [id, null])),
      ...(customerId ? [customerApi.getById(customerId).then((c) => [customerId, c.name]).catch(() => [customerId, null])] : []),
    ]).then((pairs) => {
      if (!cancelled) setNames(Object.fromEntries(pairs.filter(([, name]) => name)));
    });
    return () => { cancelled = true; };
  }, [sale]);

  if (!sale) return null;

  return (
    <div id="receipt-print-area" className="mx-auto max-w-sm bg-white p-6 text-slate-900">
      <div className="text-center">
        <p className="text-lg font-bold">{env.appName}</p>
        <p className="mt-1 text-xs text-slate-500">វិក្កយបត្រ / Receipt</p>
      </div>

      <div className="mt-4 space-y-1 border-y border-dashed border-slate-300 py-3 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-500">លេខវិក្កយបត្រ</span>
          <span className="font-mono font-medium">{sale.invoiceNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">កាលបរិច្ឆេទ</span>
          <span>{formatDate(sale.createdAt)}</span>
        </div>
        {sale.cashier && (
          <div className="flex justify-between">
            <span className="text-slate-500">អ្នកគិតលុយ</span>
            <span>{sale.cashier}</span>
          </div>
        )}
        {sale.customer && (
          <div className="flex justify-between">
            <span className="text-slate-500">អតិថិជន</span>
            <span>{names[sale.customer] ?? sale.customer}</span>
          </div>
        )}
      </div>

      <table className="mt-3 w-full text-xs">
        <thead>
          <tr className="border-b border-slate-300 text-left text-slate-500">
            <th className="pb-1 font-medium">ទំនិញ</th>
            <th className="pb-1 text-center font-medium">ចំនួន</th>
            <th className="pb-1 text-right font-medium">សរុប</th>
          </tr>
        </thead>
        <tbody>
          {(sale.items ?? []).map((item) => (
            <tr key={item.id} className="border-b border-dotted border-slate-200">
              <td className="py-1.5 pr-2">
                {names[item.product] ?? item.product}
                <div className="text-[10px] text-slate-500">
                  {formatCurrency(item.unitPrice)} × {item.quantity}
                </div>
              </td>
              <td className="py-1.5 text-center">{item.quantity}</td>
              <td className="py-1.5 text-right">{formatCurrency(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-3 space-y-1 border-t border-dashed border-slate-300 pt-3 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-500">សរុបរង</span>
          <span>{formatCurrency(sale.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">បញ្ចុះតម្លៃ</span>
          <span>-{formatCurrency(sale.discount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">ពន្ធ</span>
          <span>{formatCurrency(sale.tax)}</span>
        </div>
        <div className="mt-1 flex justify-between border-t border-slate-300 pt-1.5 text-sm font-bold">
          <span>សរុប</span>
          <span>{formatCurrency(sale.total)}</span>
        </div>
      </div>

      <div className="mt-4 text-center text-[10px] text-slate-500">
        <p>ស្ថានភាព៖ {sale.status} · ការបង់ប្រាក់៖ {sale.paymentStatus}</p>
        <p className="mt-2">សូមអរគុណសម្រាប់ការគាំទ្រ!</p>
      </div>
    </div>
  );
}
