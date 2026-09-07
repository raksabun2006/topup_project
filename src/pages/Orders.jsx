import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Receipt, CheckCircle2, Clock, Eye, ShoppingBag, ArrowRight,
  Package, Search, Filter, Truck, Store, Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getCustomerOrders, saveCustomerOrder } from '../components/pos/CustomerOrdersModal';
import { orderApi } from '../api/orderApi';
import SaleSuccessModal from '../components/pos/SaleSuccessModal';
import { formatCurrency, formatDate } from '../utils/format';
import SEO from '../components/SEO';

export default function Orders() {
  const { isAuthenticated, user } = useAuth();
  const [orders, setOrders] = useState(getCustomerOrders);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('ALL'); // 'ALL', 'COMPLETED', 'PENDING'
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const local = getCustomerOrders();
    setOrders(local);

    if (isAuthenticated) {
      setLoading(true);
      orderApi.getMyOrders()
        .then((remoteOrders) => {
          if (Array.isArray(remoteOrders) && remoteOrders.length > 0) {
            // Merge remote orders with local orders
            const map = new Map();
            local.forEach((o) => map.set(o.id || o.invoiceNumber, o));
            remoteOrders.forEach((ro) => {
              const key = ro.id || ro.orderNumber || ro.invoiceNumber;
              const normalized = {
                id: ro.id,
                orderId: ro.id,
                orderNumber: ro.orderNumber || (ro.id ? `ORD-${ro.id.slice(0, 8).toUpperCase()}` : 'ORD'),
                invoiceNumber: ro.invoiceNumber || ro.orderNumber || (ro.id ? `INV-${ro.id.slice(0, 8).toUpperCase()}` : 'INV'),
                total: Number(ro.finalTotal ?? ro.total ?? ro.amount ?? 0),
                subtotal: Number(ro.subtotal ?? ro.itemsTotal ?? 0),
                discount: Number(ro.discount ?? 0),
                deliveryFee: Number(ro.deliveryFee ?? (ro.deliveryMethod === 'PICKUP' ? 0.00 : 1.50)),
                deliveryMethod: typeof ro.deliveryMethod === 'string' ? ro.deliveryMethod : ro.deliveryMethod?.name || 'DELIVERY',
                itemsCount: ro.items?.reduce((sum, i) => sum + (i.quantity || 1), 0) || ro.itemCount || 1,
                items: ro.items || ro.orderItems || [],
                paymentMethod: typeof ro.paymentMethod === 'string' ? ro.paymentMethod : ro.paymentMethod?.name || 'KHQR',
                paymentStatus: typeof ro.paymentStatus === 'string' ? ro.paymentStatus : typeof ro.status === 'string' ? ro.status : 'PAID',
                status: typeof ro.status === 'string' ? ro.status : 'COMPLETED',
                createdAt: ro.createdAt || ro.orderDate || new Date().toISOString(),
                rawOrder: ro,
              };
              map.set(key, normalized);
            });
            const merged = Array.from(map.values()).sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            setOrders(merged);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
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
        (o.orderNumber || '').toLowerCase().includes(q) ||
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
              placeholder="Search order # / invoice #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent px-2 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && orders.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        )}

        {/* Orders List */}
        {filtered.length === 0 && !loading ? (
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
              const deliveryMethod = (order.deliveryMethod || 'DELIVERY').toUpperCase();
              const deliveryFee = Number(order.deliveryFee ?? (deliveryMethod === 'PICKUP' ? 0.00 : 1.50));
              const discount = Number(order.discount || 0);
              const subtotal = Number(order.subtotal || Math.max(0, totalAmount - deliveryFee + discount));

              return (
                <div
                  key={order.id || order.invoiceNumber}
                  className="rounded-3xl bg-[#F7F7F8] dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 sm:p-6 space-y-4 transition-all hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                        #{order.orderNumber || order.invoiceNumber || order.id}
                      </span>
                      
                      {/* Delivery Badge */}
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        deliveryMethod === 'DELIVERY'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {deliveryMethod === 'DELIVERY' ? <Truck size={10} /> : <Store size={10} />}
                        <span>{deliveryMethod}</span>
                      </span>

                      {/* Payment Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          isPaid
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                        }`}
                      >
                        {isPaid ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                        <span>{isPaid ? 'Paid' : 'Pending'}</span>
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
                          {it.product?.name || it.name || it.productName || 'Product'} × {it.quantity || 1}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {formatCurrency((it.product?.price || it.unitPrice || it.price || 0) * (it.quantity || 1))}
                        </span>
                      </div>
                    ))}
                    {itemsList.length > 3 && (
                      <p className="text-[10px] font-semibold text-slate-400">
                        + {itemsList.length - 3} more items
                      </p>
                    )}
                  </div>

                  {/* Pricing Breakdown & Actions */}
                  <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <div>
                        <span>Subtotal: </span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{formatCurrency(subtotal)}</span>
                      </div>
                      {discount > 0 && (
                        <div>
                          <span>Discount: </span>
                          <span className="font-bold text-emerald-600">-{formatCurrency(discount)}</span>
                        </div>
                      )}
                      <div>
                        <span>Delivery: </span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {deliveryFee > 0 ? formatCurrency(deliveryFee) : 'Free ($0.00)'}
                        </span>
                      </div>
                      <div className="w-full sm:w-auto pt-1 sm:pt-0">
                        <span className="text-[11px] text-slate-400 block sm:inline font-semibold mr-1">Total:</span>
                        <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                          {formatCurrency(totalAmount)}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedReceipt(order)}
                      className="flex items-center justify-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 transition cursor-pointer shadow-2xs shrink-0"
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
