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

/** PaymentStatus enum: PENDING, PAID, FAILED, REFUNDED */
const PAYMENT_STATUS_STYLES = {
  PAID:     { label: 'បង់ប្រាក់រួច', class: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30' },
  FAILED:   { label: 'បង់ប្រាក់បរាជ័យ', class: 'bg-rose-500/10 text-rose-700 border-rose-500/30' },
  REFUNDED: { label: 'សងប្រាក់វិញ', class: 'bg-sky-500/10 text-sky-700 border-sky-500/30' },
};

export function PaymentStatusBadge({ status }) {
  const style = PAYMENT_STATUS_STYLES[status] ?? {
    label: status || 'មិនទាន់បង់',
    class: 'bg-amber-500/10 text-amber-700 border-amber-500/30',
  };

  return (
    <span className={`inline-block rounded-lg border px-2.5 py-1 text-xs font-medium ${style.class}`}>
      {style.label}
    </span>
  );
}
