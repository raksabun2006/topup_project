import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, AlertCircle, ArrowLeft, Printer, XCircle, RotateCcw } from 'lucide-react';
import { useSale } from '../hooks/useSales';
import { useAuth } from '../context/AuthContext';
import { saleApi } from '../api/saleApi';
import { getErrorMessage } from '../api/client';
import Receipt from '../components/pos/Receipt';
import { SaleStatusBadge, PaymentStatusBadge } from '../components/ui/SaleStatusBadge';

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
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error || !sale) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <AlertCircle size={40} className="mx-auto mb-4 text-rose-700" />
        <p className="mb-6 text-rose-700">{error || 'រកមិនឃើញការលក់នេះទេ'}</p>
        <Link to="/sales" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
          ត្រឡប់ទៅប្រវត្តិការលក់
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link
        to="/sales"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft size={16} />
        ត្រឡប់ក្រោយ
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{sale.invoiceNumber}</h1>
          <div className="mt-2 flex items-center gap-2">
            <SaleStatusBadge status={sale.status} />
            <PaymentStatusBadge status={sale.paymentStatus} />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-ink-900 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-emerald-500/40 hover:text-slate-900"
          >
            <Printer size={15} />
            បោះពុម្ព
          </button>
          {sale.paymentStatus === 'PAID' && sale.status === 'COMPLETED' ? (
            isAdmin && (
              <button
                onClick={handleRefund}
                disabled={refunding}
                className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/5 px-4 py-2 text-sm font-medium text-rose-700 shadow-sm transition hover:bg-rose-500/10 disabled:opacity-50"
              >
                {refunding ? <Loader2 size={15} className="animate-spin" /> : <RotateCcw size={15} />}
                សងប្រាក់វិញ
              </button>
            )
          ) : (sale.status === 'PENDING' || sale.status === 'COMPLETED') ? (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/5 px-4 py-2 text-sm font-medium text-rose-700 shadow-sm transition hover:bg-rose-500/10 disabled:opacity-50"
            >
              {cancelling ? <Loader2 size={15} className="animate-spin" /> : <XCircle size={15} />}
              បោះបង់
            </button>
          ) : null}
        </div>
      </div>

      {cancelError && (
        <p className="mb-4 text-sm text-rose-700">{cancelError}</p>
      )}
      {refundError && (
        <p className="mb-4 text-sm text-rose-700">{refundError}</p>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
        <Receipt sale={sale} showTaxDiscount={true} />
      </div>
    </div>
  );
}
