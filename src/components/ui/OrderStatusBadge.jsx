/**
 * ពណ៌ត្រូវអានបានភ្លាមៗ: បៃតង = ជោគជ័យ, ក្រហម = បរាជ័យ,
 * លឿង = រង់ចាំ, ស្វាយ = កំពុងដំណើរការ។ ថ្នាំពណ៌ translucent
 * (bg-*-500/10) សម្រាប់ផ្ទៃខាងក្រោយងងឹតរបស់កម្មវិធី។
 *
 * ឈ្មោះទាំងនេះត្រូវផ្គូផ្គងនឹង enum OrderStatus របស់ backend។
 * PENDING (មិនមែន PENDING_PAYMENT) ក៏ត្រូវបានប្រើសម្រាប់ enum
 * TopUpStatus ដែរ ព្រោះ badge នេះប្រើសម្រាប់ស្ថានភាពទាំងពីរ។
 */
const STATUS_STYLES = {
  PENDING_PAYMENT: { label: 'រង់ចាំបង់ប្រាក់', class: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  PENDING:         { label: 'កំពុងរង់ចាំ',     class: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  PAID:            { label: 'បង់ប្រាក់រួច',    class: 'bg-sky-500/10 text-sky-400 border-sky-500/30' },
  PROCESSING:      { label: 'កំពុងបញ្ជូន',     class: 'bg-purple-500/10 text-purple-300 border-purple-500/30' },
  SUCCESS:         { label: 'ជោគជ័យ',        class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  FAILED:          { label: 'បរាជ័យ',         class: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
  REFUNDED:        { label: 'សងប្រាក់វិញ',    class: 'bg-slate-500/10 text-slate-400 border-slate-500/30' },
  CANCELLED:       { label: 'បោះបង់',         class: 'bg-slate-500/10 text-slate-400 border-slate-500/30' },
};

export function OrderStatusBadge({ status }) {
  const style = STATUS_STYLES[status] ?? {
    label: status,
    class: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  };

  return (
    <span className={`inline-block rounded-lg border px-2.5 py-1 text-xs font-medium ${style.class}`}>
      {style.label}
    </span>
  );
}