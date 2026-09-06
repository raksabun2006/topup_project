import { useState, useEffect } from 'react';
import { X, Receipt, ShoppingBag, ArrowRight, CheckCircle2, Clock, Eye, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/format';
import { saleApi } from '../../api/saleApi';

const CUSTOMER_ORDERS_STORAGE_KEY = 'mart_customer_orders';

export function saveCustomerOrder(order) {
  try {
    const raw = localStorage.getItem(CUSTOMER_ORDERS_STORAGE_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    const normalized = {
      id: order.id || order.saleId,
      invoiceNumber: order.invoiceNumber || order.billNumber || `INV-${String(Date.now()).slice(-4)}`,
      total: order.total || order.amount,
      itemsCount: order.items?.reduce((sum, i) => sum + (i.quantity || 1), 0) || order.itemCount || 1,
      paymentMethod: order.paymentMethod || 'KHQR',
      paymentStatus: order.paymentStatus || 'PAID',
      status: order.status || 'COMPLETED',
      createdAt: order.createdAt || new Date().toISOString(),
      rawOrder: order,
    };
    const updated = [normalized, ...existing.filter((o) => o.id !== normalized.id)].slice(0, 30);
    localStorage.setItem(CUSTOMER_ORDERS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Could not save customer order:', err);
  }
}

export function getCustomerOrders() {
  try {
    const raw = localStorage.getItem(CUSTOMER_ORDERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearCustomerOrders() {
  try {
    localStorage.removeItem(CUSTOMER_ORDERS_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export default function CustomerOrdersModal({ onClose, onViewReceipt }) {
  const [orders, setOrders] = useState(getCustomerOrders);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    setOrders(getCustomerOrders());
  }, []);

  const handleInspect = async (order) => {
    if (onViewReceipt) {
      if (order.rawOrder) {
        onViewReceipt(order.rawOrder);
      } else {
        try {
          setLoading(true);
          const fresh = await saleApi.getById(order.id, { isGuest: true });
          onViewReceipt(fresh);
        } catch {
          onViewReceipt(order);
        } finally {
          setLoading(false);
        }
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl animate-slide-up sm:animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#009F6B] text-white shadow-xs">
              <Receipt size={18} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#172033] dark:text-white">ការបញ្ជាទិញរបស់ខ្ញុំ</h3>
              <p className="text-xs text-[#667085] dark:text-slate-400">ប្រវត្តិការទិញទំនិញ (My Orders)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mb-3">
                <ShoppingBag size={28} />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">មិនទាន់មានការបញ្ជាទិញឡើយ</h4>
              <p className="mt-1 text-xs text-slate-400 max-w-xs">
                រាល់ការទិញទំនិញ និងវិក្កយបត្ររបស់អ្នក នឹងត្រូវបានកត់ត្រានៅទីនេះ។
              </p>
            </div>
          ) : (
            orders.map((order) => {
              const isPaid = order.paymentStatus === 'PAID' || order.status === 'COMPLETED';
              return (
                <div
                  key={order.id || order.invoiceNumber}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 shadow-2xs hover:border-[#009F6B]/50 transition"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs sm:text-sm font-black text-[#172033] dark:text-white">
                        #{order.invoiceNumber}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          isPaid
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-[#009F6B] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200'
                        }`}
                      >
                        {isPaid ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                        <span>{isPaid ? 'ជោគជ័យ' : 'កំពុងដំណើរការ'}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-slate-400">
                      <span>{order.itemsCount} មុខទំនិញ</span>
                      <span>·</span>
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-700">
                    <div className="text-left sm:text-right">
                      <span className="text-sm sm:text-base font-black text-[#009F6B] dark:text-emerald-400">
                        {formatCurrency(order.total)}
                      </span>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">
                        {order.paymentMethod || 'KHQR'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleInspect(order)}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-[#009F6B] hover:text-white hover:border-[#009F6B] dark:hover:bg-emerald-600 transition active:scale-95 cursor-pointer"
                    >
                      <Eye size={13} />
                      <span>វិក្កយបត្រ</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            បិទ
          </button>
        </div>
      </div>
    </div>
  );
}
