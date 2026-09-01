import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, AlertCircle, ArrowLeft, Printer, XCircle, RotateCcw, Receipt as ReceiptIcon } from 'lucide-react';
import { useSale } from '../hooks/useSales';
import { useAuth } from '../context/AuthContext';
import { saleApi } from '../api/saleApi';
import { getErrorMessage } from '../api/client';
import Receipt from '../components/pos/Receipt';
import { SaleStatusBadge, PaymentStatusBadge } from '../components/ui/SaleStatusBadge';
import SEO from '../components/SEO';

export default function SaleDetail() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const { sale, loading, error, setSale } = useSale(id);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [refunding, setRefunding] = useState(false);
  const [refundError, setRefundError] = useState('');

  const handleCancel = async () => {
    if (!window.confirm('តើអ្នកពិតជាចង់បោះបង់ការលក់នេះមែនទេ?')) return;
    setCancelling(true);
    setCancelError('');
    try {
      setSale(await saleApi.cancel(id));
    } catch (err) {
      setCancelError(getErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  };

  // Sale ដែលបានបង់ប្រាក់រួច (paymentStatus: PAID) - cancel() បដិសេធជាមួយ
  // 400 ដូច្នេះត្រូវប្រើ refund() ជំនួសវិញ (ADMIN role ប៉ុណ្ណោះ)។
  const handleRefund = async () => {
    const reason = window.prompt('មូលហេតុសងប្រាក់វិញ (មិនចាំបាច់):') ?? undefined;
    if (reason === undefined) return;
    setRefunding(true);
    setRefundError('');
    try {
      setSale(await saleApi.refund(id, reason.trim() || undefined));
    } catch (err) {
      setRefundError(getErrorMessage(err));
    } finally {
      setRefunding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Loader2 size={36} className="animate-spin text-emerald-600" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">កំពុងទាញយកព័ត៌មានវិក្កយបត្រ...</p>
      </div>
    );
  }

  if (error || !sale) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center animate-fade-in">
        <AlertCircle size={44} className="mx-auto mb-3 text-rose-600 dark:text-rose-400" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">រកមិនឃើញការលក់នេះទេ</h3>
        <p className="mt-1 mb-6 text-xs text-rose-600 dark:text-rose-400">{error || 'វិក្កយបត្រនេះប្រហែលជាត្រូវបានលុប ឬមិនមានក្នុងប្រព័ន្ធ'}</p>
        <Link
          to="/dashboard/sales"
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/30 transition hover:bg-emerald-500"
        >
          <ArrowLeft size={14} />
          ត្រឡប់ទៅប្រវត្តិការលក់
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 animate-fade-in">
      <SEO
        title={sale?.invoiceNumber ? `វិក្កយបត្រ ${sale.invoiceNumber} | Mart System` : 'ព័ត៌មានលម្អិតការលក់ | Mart System'}
        robots="noindex, nofollow"
      />

      <div className="flex items-center justify-between">
        <Link
          to="/dashboard/sales"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-2xs transition hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-emerald-600"
        >
          <ArrowLeft size={14} />
          <span>ត្រឡប់ទៅប្រវត្តិការលក់</span>
        </Link>
      </div>

      {/* Invoice Details Banner */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ReceiptIcon size={24} />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-mono font-black text-slate-900 dark:text-white">
                {sale.invoiceNumber}
              </h1>
              <div className="mt-1.5 flex items-center gap-2">
                <SaleStatusBadge status={sale.status} />
                <PaymentStatusBadge status={sale.paymentStatus} />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs transition hover:border-emerald-500 hover:text-emerald-600 active:scale-95"
            >
              <Printer size={15} />
              <span>បោះពុម្ព</span>
            </button>

            {sale.paymentStatus === 'PAID' && sale.status === 'COMPLETED' ? (
              isAdmin && (
                <button
                  onClick={handleRefund}
                  disabled={refunding}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-50 dark:bg-rose-950/30 px-3.5 py-2 text-xs font-bold text-rose-700 dark:text-rose-400 shadow-2xs transition hover:bg-rose-100 dark:hover:bg-rose-900/40 disabled:opacity-50 active:scale-95"
                >
                  {refunding ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                  <span>សងប្រាក់វិញ</span>
                </button>
              )
            ) : (sale.status === 'PENDING' || sale.status === 'COMPLETED') ? (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-50 dark:bg-rose-950/30 px-3.5 py-2 text-xs font-bold text-rose-700 dark:text-rose-400 shadow-2xs transition hover:bg-rose-100 dark:hover:bg-rose-900/40 disabled:opacity-50 active:scale-95"
              >
                {cancelling ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                <span>បោះបង់ការលក់</span>
              </button>
            ) : null}
          </div>
        </div>

        {cancelError && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400">
            {cancelError}
          </div>
        )}
        {refundError && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400">
            {refundError}
          </div>
        )}
      </div>

      {/* Receipt Display Area */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <Receipt sale={sale} showTaxDiscount={true} />
      </div>
    </div>
  );
}
