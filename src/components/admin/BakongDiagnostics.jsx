import { useState, useCallback, useEffect } from 'react';
import { RefreshCw, Loader2, CheckCircle, XCircle, AlertCircle, Wifi, ChevronDown, ChevronUp } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { getErrorMessage } from '../../api/client';

function truthy(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return ['true', 'ok', 'success', 'connected', 'up'].includes(value.toLowerCase());
  return null;
}

export default function BakongDiagnostics() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const check = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setResult(await adminApi.checkBakong());
    } catch (err) {
      setError(getErrorMessage(err));
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  const entries = result && typeof result === 'object' ? Object.entries(result) : [];
  const statusEntry = entries.find(([k]) => /status|connected|ok|success|healthy/i.test(k));
  const isHealthy = statusEntry ? truthy(statusEntry[1]) : (result && !error);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden transition-all">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Wifi size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Bakong KHQR Gateway
              </h2>
              {loading ? (
                <span className="flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                  <Loader2 size={10} className="animate-spin" /> កំពុងពិនិត្យ
                </span>
              ) : isHealthy ? (
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/40 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> ដំណើរការធម្មតា
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200/60 dark:border-rose-800/40 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> មានបញ្ហា
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              ការតភ្ជាប់សេវាទូទាត់ QR កូដ Bakong
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={check}
            disabled={loading}
            className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 transition cursor-pointer"
            title="ពិនិត្យម្តងទៀត"
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
            <span className="hidden xs:inline">តេស្ត</span>
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-slate-100 dark:border-slate-800 p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-900/50 animate-fade-in">
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 dark:bg-rose-950/30 p-3 text-xs sm:text-sm text-rose-700 dark:text-rose-400">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-bold">មិនអាចភ្ជាប់ទៅកាន់ Bakong បានទេ</p>
                <p className="mt-0.5 text-xs text-rose-600 dark:text-rose-400">{error}</p>
              </div>
            </div>
          )}

          {!error && result && (
            <div>
              <div
                className={`mb-3 flex items-center gap-2 rounded-xl border p-2.5 text-xs sm:text-sm font-bold ${
                  isHealthy
                    ? 'border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                    : 'border-rose-500/30 bg-rose-500/10 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                }`}
              >
                {isHealthy ? <CheckCircle size={16} /> : <XCircle size={16} />}
                {isHealthy ? 'Bakong API អាចភ្ជាប់បានដោយជោគជ័យ' : 'Bakong API មិនអាចឆ្លើយតបបានទេ'}
              </div>

              {entries.length > 0 ? (
                <div className="space-y-1 rounded-xl bg-white dark:bg-slate-800 p-3 text-xs border border-slate-200/80 dark:border-slate-700">
                  {entries.map(([key, value]) => (
                    <div key={key} className="flex justify-between gap-4 py-1 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                      <span className="font-semibold text-slate-500 dark:text-slate-400">{key}</span>
                      <span className="break-all text-right font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">Server ត្រឡប់មកវិញដោយគ្មានទិន្នន័យបន្ថែម។</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

