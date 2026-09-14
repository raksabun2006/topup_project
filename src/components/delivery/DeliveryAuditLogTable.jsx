import { ShieldCheck, User, ArrowRight, Clock, FileText } from 'lucide-react';
import DeliveryStatusBadge from './DeliveryStatusBadge';
import { formatDate } from '../../utils/format';
import { useLanguage } from '../../context/LanguageContext';

function sanitizeDetails(text) {
  if (!text || typeof text !== 'string') return '';
  // Mask any potential token/key patterns
  return text
    .replace(/(bearer\s+)[a-zA-Z0-9._-]+/gi, '$1[PROTECTED_TOKEN]')
    .replace(/(key\s*[:=]\s*)[a-zA-Z0-9._-]+/gi, '$1[PROTECTED_KEY]')
    .replace(/(secret\s*[:=]\s*)[a-zA-Z0-9._-]+/gi, '$1[PROTECTED_SECRET]');
}

export default function DeliveryAuditLogTable({ logs = [], loading = false }) {
  const { isKhmer } = useLanguage();

  if (loading) {
    return (
      <div className="space-y-3 py-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="py-8 px-4 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
        <ShieldCheck size={28} className="mx-auto text-slate-400 mb-2 opacity-60" />
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
          {isKhmer ? 'មិនទាន់មានកំណត់ត្រាប្រវត្តិនៅឡើយទេ' : 'No audit trail logs recorded yet.'}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <tr>
            <th className="px-4 py-3">{isKhmer ? 'សកម្មភាព & អ្នកអនុវត្ត' : 'Action & Actor'}</th>
            <th className="px-4 py-3">{isKhmer ? 'បម្រែបម្រួលស្ថានភាព' : 'Status Mutation'}</th>
            <th className="px-4 py-3">{isKhmer ? 'ព័ត៌មានលម្អិត / មូលហេតុ' : 'Details / Reason'}</th>
            <th className="px-4 py-3 text-right">{isKhmer ? 'កាលបរិច្ឆេទ & ម៉ោង' : 'Timestamp'}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
          {logs.map((log, idx) => {
            const formatAction = (act) => {
              if (!isKhmer) return act || 'STATUS_UPDATE';
              switch (String(act || '').toUpperCase()) {
                case 'STATUS_UPDATE': return 'កែប្រែស្ថានភាព (Status Update)';
                case 'ASSIGN_COURIER': return 'ចាត់ចែងក្រុមហ៊ុនដឹក (Courier)';
                case 'ASSIGN_DRIVER': return 'ចាត់ចែងអ្នកដឹក (Driver)';
                case 'CANCEL_DELIVERY': return 'បោះបង់ការដឹក (Cancel)';
                case 'CREATE_DELIVERY': return 'បង្កើតការដឹក (Create)';
                default: return act || 'កែប្រែស្ថានភាព';
              }
            };

            const formatActor = (act) => {
              if (!isKhmer) return act || 'SYSTEM';
              return act === 'SYSTEM' ? 'ប្រព័ន្ធស្វ័យប្រវត្តិ (SYSTEM)' : act || 'SYSTEM';
            };

            return (
              <tr key={log.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                      <ShieldCheck size={13} />
                    </div>
                    <div className="min-w-0">
                      <span className="font-extrabold text-slate-900 dark:text-white block truncate">
                        {formatAction(log.action)}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <User size={10} />
                        {formatActor(log.actor)}
                      </span>
                    </div>
                  </div>
                </td>

              <td className="px-4 py-3">
                {log.previousStatus || log.newStatus ? (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {log.previousStatus && (
                      <DeliveryStatusBadge status={log.previousStatus} size="xs" showDot={false} />
                    )}
                    {log.previousStatus && log.newStatus && (
                      <ArrowRight size={11} className="text-slate-400 shrink-0" />
                    )}
                    {log.newStatus && (
                      <DeliveryStatusBadge status={log.newStatus} size="xs" showDot={false} />
                    )}
                  </div>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </td>

              <td className="px-4 py-3 max-w-xs truncate text-slate-600 dark:text-slate-300">
                {log.details ? (
                  <span title={log.details} className="flex items-center gap-1">
                    <FileText size={11} className="text-slate-400 shrink-0" />
                    <span className="truncate">{sanitizeDetails(log.details)}</span>
                  </span>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </td>

              <td className="px-4 py-3 text-right text-slate-400 text-[11px] whitespace-nowrap">
                <span className="flex items-center justify-end gap-1">
                  <Clock size={11} />
                  {formatDate(log.createdAt, 'full')}
                </span>
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
