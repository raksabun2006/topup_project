import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 mb-4">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">មានបញ្ហាក្នុងការបង្ហាញផ្ទាំងនេះ</h2>
          <p className="max-w-md text-sm text-slate-500 dark:text-slate-400 mb-4">
            សូមអភ័យទោស មានបញ្ហាបច្ចេកទេសបន្តិចបន្តួចបានកើតឡើង។ សូមចុចប៊ូតុងខាងក្រោមដើម្បីដំណើរការឡើងវិញ។
          </p>
          {this.state.error && (
            <div className="mb-6 max-w-lg overflow-auto rounded-xl bg-slate-950 p-3 text-left font-mono text-xs text-rose-400 border border-rose-900/50">
              <p className="font-bold">{String(this.state.error?.message || this.state.error)}</p>
              {this.state.error?.stack && (
                <pre className="mt-2 text-[10px] text-slate-400 whitespace-pre-wrap">{this.state.error.stack}</pre>
              )}
            </div>
          )}
          <button
            onClick={this.handleReload}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-500 active:scale-95"
          >
            <RefreshCw size={16} />
            ដំណើរការទំព័រឡើងវិញ (Reload)
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
