import { useState, useCallback, useEffect } from 'react';
import { RefreshCw, Loader2, CheckCircle, XCircle, AlertCircle, Wifi } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { getErrorMessage } from '../../api/client';

/**
 * ត្រូវការតែពេលធ្វើតេស្ត Bakong QR payment មិនដំណើរការ (ឧ. quota
 * developer token អស់ ១០០ សំណើ/ថ្ងៃ, credential ខុស, ឬ network block)។
 * ត្រូវការ ADMIN token - នឹងបង្ហាញ error បើអ្នកប្រើមិនមែន admin។
 */
function truthy(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return ['true', 'ok', 'success', 'connected', 'up'].includes(value.toLowerCase());
  return null;
}

export default function BakongDiagnostics() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
  const isHealthy = statusEntry ? truthy(statusEntry[1]) : null;

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-ink-900 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-5">
        <h2 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
          <Wifi size={18} className="text-emerald-600 dark:text-emerald-400" />
          Bakong Connectivity Check
        </h2>
        <button
          onClick={check}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-ink-950 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 shadow-sm transition hover:border-emerald-500/40 hover:text-slate-900 dark:hover:text-white disabled:opacity-50"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
          ពិនិត្យម្តងទៀត
        </button>
      </div>

      <div className="p-6">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Loader2 size={16} className="animate-spin" />
            កំពុងពិនិត្យ...
          </div>
        )}

        {!loading && error && (
          <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 dark:bg-rose-950/30 p-3 text-sm text-rose-700 dark:text-rose-400">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">មិនអាចពិនិត្យបានទេ</p>
              <p className="mt-0.5 text-xs">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && result && (
          <div>
            {isHealthy !== null && (
              <div
                className={`mb-4 flex items-center gap-2 rounded-xl border p-3 text-sm font-medium ${
                  isHealthy
                    ? 'border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                    : 'border-rose-500/30 bg-rose-500/10 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                }`}
              >
                {isHealthy ? <CheckCircle size={16} /> : <XCircle size={16} />}
                {isHealthy ? 'Bakong អាចភ្ជាប់បាន' : 'Bakong មិនអាចភ្ជាប់បានទេ'}
              </div>
            )}

            {entries.length > 0 ? (
              <div className="space-y-1.5 rounded-xl bg-ink-950 dark:bg-slate-800/80 p-4 text-sm">
                {entries.map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-4">
                    <span className="shrink-0 text-slate-500 dark:text-slate-400">{key}</span>
                    <span className="break-all text-right font-mono text-xs text-slate-700 dark:text-slate-200">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">Server ត្រឡប់មកវិញដោយគ្មានទិន្នន័យលម្អិត។</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
