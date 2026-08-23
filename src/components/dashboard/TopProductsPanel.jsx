import { useMemo } from 'react';
import { Package } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

const MAX_ITEMS = 5;

/**
 * ផលិតផលលក់ដាច់បំផុត - គណនានៅ client ពី sale.items របស់ sale ដែលបានបង់
 * ប្រាក់ពិត (COMPLETED + PAID)។ productId/productName ត្រូវបានផ្តល់មក
 * ដោយផ្ទាល់ក្នុង SaleItemResponseDto - មិនចាំបាច់ទាញ product catalog មក
 * ដោយឡែកទៀតទេ (មិនដូច CategoryRevenuePie ដែលនៅតែត្រូវការ category ដែល
 * មិនមាននៅក្នុង sale item)។
 */
export default function TopProductsPanel({ sales, loading }) {
  const top = useMemo(() => {
    const totals = new Map();
    sales
      .filter((s) => s.status === 'COMPLETED' && s.paymentStatus === 'PAID')
      .forEach((sale) => {
        (sale.items ?? []).forEach((item) => {
          const entry = totals.get(item.productId) ?? {
            id: item.productId,
            name: item.productName || 'ផលិតផលមិនស្គាល់',
            quantity: 0,
            revenue: 0,
          };
          entry.quantity += item.quantity || 0;
          entry.revenue += item.lineTotal || 0;
          totals.set(item.productId, entry);
        });
      });
    return Array.from(totals.values()).sort((a, b) => b.revenue - a.revenue).slice(0, MAX_ITEMS);
  }, [sales]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-ink-900 shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="flex items-center gap-2 font-semibold text-slate-900">
          <Package size={18} className="text-emerald-600" />
          ផលិតផលលក់ដាច់
        </h2>
      </div>

      {loading && (
        <div className="space-y-3 p-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-ink-800" />
          ))}
        </div>
      )}

      {!loading && top.length === 0 && (
        <p className="p-8 text-center text-sm text-slate-500">មិនទាន់មានទិន្នន័យលក់គ្រប់គ្រាន់ទេ</p>
      )}

      {!loading && top.length > 0 && (
        <ul className="divide-y divide-slate-200">
          {top.map((p, i) => (
            <li key={p.id} className="flex items-center justify-between gap-3 px-6 py-3.5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-700">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-700">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.quantity} បានលក់</p>
                </div>
              </div>
              <span className="shrink-0 text-sm font-semibold text-slate-900">{formatCurrency(p.revenue)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
