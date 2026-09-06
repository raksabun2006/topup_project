import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Receipt, CheckCircle2, Clock, Eye, ShoppingBag, ArrowRight,
  Package, Search, Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getCustomerOrders } from '../components/pos/CustomerOrdersModal';
import SaleSuccessModal from '../components/pos/SaleSuccessModal';
import { formatCurrency, formatDate } from '../utils/format';
import SEO from '../components/SEO';

export default function Orders() {
  const { isAuthenticated, user } = useAuth();
  const [orders, setOrders] = useState(getCustomerOrders);
  const [tab, setTab] = useState('ALL'); // 'ALL', 'COMPLETED', 'PENDING'
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setOrders(getCustomerOrders());
  }, [isAuthenticated, user]);

  const filtered = useMemo(() => {
    let list = [...orders];

    if (tab === 'COMPLETED') {
      list = list.filter((o) => o.paymentStatus === 'PAID' || o.status === 'COMPLETED');
    } else if (tab === 'PENDING') {
      list = list.filter((o) => o.paymentStatus !== 'PAID' && o.status !== 'COMPLETED');
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((o) =>
        (o.invoiceNumber || '').toLowerCase().includes(q) ||
        (o.id || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [orders, tab, search]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-20">
      <SEO
        title="My Orders | Mart System"
        description="View your recent order receipts and history."
        canonical="/orders"
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              My Orders
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Review your purchase invoices and status
            </p>
          </div>

          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#18181B] px-5 py-2 text-xs font-bold text-white hover:bg-black transition shadow-xs"
          >
            <ShoppingBag size={14} />
            <span>Shop Again</span>
          </Link>
        </div>

        {/* Search & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 rounded-full bg-[#F7F7F8] dark:bg-slate-900 p-1 border border-slate-200/60 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setTab('ALL')}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                tab === 'ALL'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All ({orders.length})
            </button>
            <button
              type="button"
              onClick={() => setTab('COMPLETED')}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                tab === 'COMPLETED'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Completed
            </button>
            <button
              type="button"
              onClick={() => setTab('PENDING')}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                tab === 'PENDING'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Pending
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex items-center rounded-full bg-[#F7F7F8] dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 px-3 py-1.5 w-full sm:w-64">
            <Search size={14} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search invoice #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent px-2 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Orders List */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl bg-[#F7F7F8] dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
            <Receipt size={40} className="text-slate-300" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Orders Found</h3>
            <p className="text-xs text-slate-400 max-w-xs">
              You do not have any orders matching your selection.
            </p>
            <Link
              to="/shop"
              className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#18181B] text-white px-5 py-2 text-xs font-bold hover:bg-black"
            >
              <span>Explore Products</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => {
              const isPaid = order.paymentStatus === 'PAID' || order.status === 'COMPLETED';
              const itemsList = order.items || [];
              const totalAmount = order.total || order.finalTotal || order.totalAmount || 0;

              return (
                <div
                  key={order.id}
                  className="rounded-3xl bg-[#F7F7F8] dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 sm:p-6 space-y-4 transition-all hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                        #{order.invoiceNumber || order.id}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          isPaid
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {isPaid ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                        <span>{isPaid ? 'Completed' : 'Pending'}</span>
                      </span>
                    </div>

                    <span className="text-[11px] font-medium text-slate-400">
                      {formatDate(order.createdAt || order.saleDate || new Date())}
                    </span>
                  </div>

                  {/* Items summary */}
                  <div className="space-y-2">
                    {itemsList.slice(0, 3).map((it, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                        <span className="truncate max-w-[260px] sm:max-w-md font-medium">
                          {it.product?.name || it.name || 'Product'} × {it.quantity || 1}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {formatCurrency((it.product?.price || it.unitPrice || 0) * (it.quantity || 1))}
                        </span>
                      </div>
                    ))}
                    {itemsList.length > 3 && (
                      <p className="text-[10px] font-semibold text-slate-400">
                        + {itemsList.length - 3} more items
                      </p>
                    )}
                  </div>

                  {/* Actions & Total */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 dark:border-slate-800">
                    <div>
                      <span className="text-[11px] text-slate-400 block font-semibold">Total Paid</span>
                      <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                        {formatCurrency(totalAmount)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedReceipt(order)}
                      className="flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
                    >
                      <Eye size={13} />
                      <span>View Receipt</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sale / Invoice Receipt Modal */}
      {selectedReceipt && (
        <SaleSuccessModal
          sale={selectedReceipt.rawOrder || selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          onNewSale={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
}
