/** ត្រូវផ្គូផ្គងនឹង enum SaleResponseDto.status របស់ backend ។ */
const STATUS_STYLES = {
  PENDING:   { label: 'កំពុងរង់ចាំ', class: 'bg-amber-500/10 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-500/30 dark:border-amber-500/40' },
  COMPLETED: { label: 'បញ្ចប់',      class: 'bg-emerald-500/10 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 dark:border-emerald-500/40' },
  CANCELLED: { label: 'បោះបង់',      class: 'bg-slate-500/10 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-500/30 dark:border-slate-700' },
  REFUNDED:  { label: 'សងប្រាក់វិញ', class: 'bg-sky-500/10 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-500/30 dark:border-sky-500/40' },
};

export function SaleStatusBadge({ status }) {
  const style = STATUS_STYLES[status] ?? {
    label: status,
    class: 'bg-slate-500/10 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-500/30 dark:border-slate-700',
  };

  return (
    <span className={`inline-block rounded-lg border px-2.5 py-1 text-xs font-medium ${style.class}`}>
      {style.label}
    </span>
  );
}

/** PaymentStatus enum: PENDING, PAID, FAILED, REFUNDED */
const PAYMENT_STATUS_STYLES = {
  PAID:     { label: 'បង់ប្រាក់រួច', class: 'bg-emerald-500/10 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 dark:border-emerald-500/40' },
  FAILED:   { label: 'បង់ប្រាក់បរាជ័យ', class: 'bg-rose-500/10 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-500/30 dark:border-rose-500/40' },
  REFUNDED: { label: 'សងប្រាក់វិញ', class: 'bg-sky-500/10 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-500/30 dark:border-sky-500/40' },
};

export function PaymentStatusBadge({ status }) {
  const style = PAYMENT_STATUS_STYLES[status] ?? {
    label: status || 'មិនទាន់បង់',
    class: 'bg-amber-500/10 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-500/30 dark:border-amber-500/40',
  };

  return (
    <span className={`inline-block rounded-lg border px-2.5 py-1 text-xs font-medium ${style.class}`}>
      {style.label}
    </span>
  );
}
