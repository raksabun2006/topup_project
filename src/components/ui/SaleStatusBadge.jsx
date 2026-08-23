/** ត្រូវផ្គូផ្គងនឹង enum SaleResponseDto.status របស់ backend ។ */
const STATUS_STYLES = {
  PENDING:   { label: 'កំពុងរង់ចាំ', class: 'bg-amber-500/10 text-amber-700 border-amber-500/30' },
  COMPLETED: { label: 'បញ្ចប់',      class: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30' },
  CANCELLED: { label: 'បោះបង់',      class: 'bg-slate-500/10 text-slate-500 border-slate-500/30' },
  REFUNDED:  { label: 'សងប្រាក់វិញ', class: 'bg-sky-500/10 text-sky-700 border-sky-500/30' },
};

export function SaleStatusBadge({ status }) {
  const style = STATUS_STYLES[status] ?? {
    label: status,
    class: 'bg-slate-500/10 text-slate-500 border-slate-500/30',
  };

  return (
    <span className={`inline-block rounded-lg border px-2.5 py-1 text-xs font-medium ${style.class}`}>
      {style.label}
    </span>
  );
}

/** paymentStatus ជា string សេរីនៅ backend (គ្មាន enum កំណត់) - POS នេះផ្ញើ PAID/UNPAID ប៉ុណ្ណោះ */
export function PaymentStatusBadge({ status }) {
  const isPaid = status === 'PAID';
  const cls = isPaid
    ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30'
    : 'bg-amber-500/10 text-amber-700 border-amber-500/30';

  return (
    <span className={`inline-block rounded-lg border px-2.5 py-1 text-xs font-medium ${cls}`}>
      {isPaid ? 'បង់ប្រាក់រួច' : status || 'មិនទាន់បង់'}
    </span>
  );
}
