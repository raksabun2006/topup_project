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
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 mb-4">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">មានបញ្ហាក្នុងការបង្ហាញផ្ទាំងនេះ</h2>
          <p className="max-w-md text-sm text-slate-500 mb-6">
            សូមអភ័យទោស មានបញ្ហាបច្ចេកទេសបន្តិចបន្តួចបានកើតឡើង។ សូមចុចប៊ូតុងខាងក្រោមដើម្បីដំណើរការឡើងវិញ។
          </p>
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
