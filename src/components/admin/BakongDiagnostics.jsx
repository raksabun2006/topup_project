import { useState } from 'react';
import { Stethoscope, RefreshCw, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { getErrorMessage } from '../../api/client';

/** "khqrConfigured" / "khqr_configured" -> "Khqr Configured" */
function prettifyKey(key) {
  const spaced = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/_/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function DiagnosticValue({ value }) {
  if (value === null || value === undefined || value === '') {
    return <span className="text-slate-500">—</span>;
  }

  if (typeof value === 'boolean') {
    return value ? (
      <span className="inline-flex items-center gap-1.5 text-emerald-400">
        <CheckCircle2 size={15} /> បាទ/ចាស
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 text-rose-400">
        <XCircle size={15} /> ទេ
      </span>
    );
  }

  if (typeof value === 'object') {
    return (
      <pre className="max-w-full overflow-x-auto rounded-lg bg-ink-950 px-3 py-2 text-xs text-slate-300">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  return <span className="font-medium text-white">{String(value)}</span>;
}

export function BakongDiagnostics() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const runCheck = async () => {
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
  };

  const entries = result ? Object.entries(result) : [];

  return (
    <div className="mt-6 rounded-2xl border border-purple-900/30 bg-ink-900 shadow-sm">
      <div className="flex items-center justify-between border-b border-purple-900/30 px-6 py-5">
        <div className="flex items-center gap-2">
          <Stethoscope size={18} className="text-purple-400" />
          <h2 className="font-semibold text-white">ការធ្វើរោគវិនិច្ឆ័យ Bakong</h2>
        </div>
        <button
          onClick={runCheck}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-purple-900/40 bg-ink-950 px-3.5 py-1.5 text-sm text-slate-300 shadow-sm transition hover:border-purple-500/40 hover:text-white disabled:opacity-60"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          ពិនិត្យ
        </button>
      </div>

      <div className="p-6">
        {!result && !loading && !error && (
          <p className="text-sm text-slate-400">
            ចុច "ពិនិត្យ" ដើម្បីផ្ទៀងផ្ទាត់ការកំណត់រចនាសម្ព័ន្ធ Bakong (merchant ID, API key, ល។)។
          </p>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Loader2 size={16} className="animate-spin text-purple-400" />
            កំពុងពិនិត្យ...
          </div>
        )}

        {!loading && error && (
          <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-sm text-rose-300">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {!loading && !error && result && entries.length === 0 && (
          <p className="text-sm text-slate-400">Backend មិនបានត្រឡប់ព័ត៌មានអ្វីទេ។</p>
        )}

        {!loading && !error && entries.length > 0 && (
          <div className="divide-y divide-purple-900/20">
            {entries.map(([key, value]) => (
              <div key={key} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <span className="text-sm text-slate-400">{prettifyKey(key)}</span>
                <DiagnosticValue value={value} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
