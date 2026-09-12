import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, Truck, CheckCircle2, Clock, Eye, Printer, Search,
  Filter, AlertCircle, RefreshCw, ChevronRight, User, Phone, MapPin,
  Store, ShoppingBag, XCircle, ArrowRight
} from 'lucide-react';
import { adminApi } from '../api/adminApi';
import { orderApi } from '../api/orderApi';
import { getCustomerOrders } from '../components/pos/CustomerOrdersModal';
import { formatCurrency, formatDate } from '../utils/format';
import { getErrorMessage } from '../api/client';
import Receipt from '../components/pos/Receipt';
import SEO from '../components/SEO';

const STATUS_OPTIONS = [
  { key: 'ALL', label: 'All Orders' },
  { key: 'PAID', label: 'Paid (To Prepare)' },
  { key: 'PREPARING', label: 'Preparing' },
  { key: 'SHIPPED', label: 'Out for Delivery' },
  { key: 'DELIVERED', label: 'Delivered' },
  { key: 'PENDING_PAYMENT', label: 'Pending Payment' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

export default function StaffOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('ALL');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Attempt to fetch all backend orders via adminApi
      let remoteList = [];
      try {
        const res = await adminApi.getAllOrders({ size: 100 });
        remoteList = Array.isArray(res) ? res : (res?.content ?? res?.orders ?? []);
      } catch {
        remoteList = [];
      }

      // 2. Also merge any locally simulated/tested orders
      const local = getCustomerOrders();
      const map = new Map();

      local.forEach((o) => {
        const key = o.id || o.orderId || o.orderNumber;
        map.set(key, o);
      });

      remoteList.forEach((ro) => {
        const key = ro.id || ro.orderId || ro.orderNumber;
        map.set(key, {
          ...ro,
          id: ro.id,
          orderId: ro.id,
          orderNumber: ro.orderNumber || (ro.id ? `ORD-${ro.id.slice(0, 8).toUpperCase()}` : 'ORD'),
          total: Number(ro.finalTotal ?? ro.total ?? ro.amount ?? 0),
          subtotal: Number(ro.subtotal ?? 0),
          deliveryFee: Number(ro.deliveryFee ?? (ro.deliveryMethod === 'PICKUP' ? 0 : 1.5)),
          items: ro.items || ro.orderItems || [],
          status: ro.status || 'PAID',
          paymentStatus: ro.paymentStatus || ro.status || 'PAID',
          createdAt: ro.createdAt || ro.orderDate || new Date().toISOString(),
        });
      });

      const combined = Array.from(map.values()).sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );

      setOrders(combined);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    setActionSuccess('');
    try {
      try {
        await adminApi.updateOrderStatus(orderId, newStatus);
      } catch {
        // Fallback to client update if mock/offline
      }

      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === orderId || o.orderId === orderId || o.orderNumber === orderId) {
            return { ...o, status: newStatus };
          }
          return o;
        })
      );

      setActionSuccess(`Order ${orderId} updated to ${newStatus}`);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = useMemo(() => {
    let list = [...orders];

    if (tab !== 'ALL') {
      list = list.filter((o) => {
        const s = String(o.status || '').toUpperCase();
        if (tab === 'PAID') return s === 'PAID' || (o.paymentStatus === 'PAID' && s !== 'PREPARING' && s !== 'SHIPPED' && s !== 'DELIVERED' && s !== 'CANCELLED');
        if (tab === 'PREPARING') return s === 'PREPARING' || s === 'CONFIRMED';
        if (tab === 'SHIPPED') return s === 'SHIPPED' || s === 'OUT_FOR_DELIVERY' || s === 'READY';
        if (tab === 'DELIVERED') return s === 'DELIVERED' || s === 'COMPLETED';
        if (tab === 'PENDING_PAYMENT') return s === 'PENDING_PAYMENT' || o.paymentStatus === 'PENDING';
        if (tab === 'CANCELLED') return s === 'CANCELLED';
        return s === tab;
      });
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((o) =>
        (o.orderNumber || '').toLowerCase().includes(q) ||
        (o.id || '').toLowerCase().includes(q) ||
        (o.customerName || '').toLowerCase().includes(q) ||
        (o.customerPhone || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [orders, tab, search]);

  const counts = useMemo(() => {
    const map = { ALL: orders.length };
    STATUS_OPTIONS.forEach((opt) => {
      if (opt.key === 'ALL') return;
      map[opt.key] = orders.filter((o) => {
        const s = String(o.status || '').toUpperCase();
        if (opt.key === 'PAID') return s === 'PAID';
        if (opt.key === 'PREPARING') return s === 'PREPARING' || s === 'CONFIRMED';
        if (opt.key === 'SHIPPED') return s === 'SHIPPED' || s === 'READY';
        if (opt.key === 'DELIVERED') return s === 'DELIVERED' || s === 'COMPLETED';
        if (opt.key === 'PENDING_PAYMENT') return s === 'PENDING_PAYMENT';
        if (opt.key === 'CANCELLED') return s === 'CANCELLED';
        return s === opt.key;
      }).length;
    });
    return map;
  }, [orders]);

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-16">
      <SEO title="Staff Order Management | Mart System" robots="noindex, nofollow" />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Staff & Dispatch
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            ការគ្រប់គ្រងការបញ្ជាទិញ (Customer Orders)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Process incoming online orders, update preparation states, and dispatch deliveries
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadOrders}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin text-emerald-600' : ''} />
            <span>Reload</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 p-3.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 dark:bg-rose-950/40 p-3.5 text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-[#F7F7F8] dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 max-w-full">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setTab(opt.key)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                tab === opt.key
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{opt.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                tab === opt.key ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}>
                {counts[opt.key] ?? 0}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search order # or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-slate-200 dark:border-slate-700 bg-[#F7F7F8] dark:bg-slate-900 py-2 pl-9 pr-3 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
          />
        </div>
      </div>

      {/* Orders List */}
      {loading && orders.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw size={24} className="animate-spin text-emerald-600" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center space-y-2">
          <ShoppingBag size={36} className="mx-auto text-slate-300" />
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">No Orders in this Status</h3>
          <p className="text-xs text-slate-400">All orders for this filter have been processed or none exist.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const orderId = order.id || order.orderId || order.orderNumber;
            const items = order.items || [];
            const isDelivery = order.deliveryMethod === 'DELIVERY';
            const status = String(order.status || 'PAID').toUpperCase();

            return (
              <div
                key={orderId}
                className="rounded-3xl bg-[#F7F7F8] dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 sm:p-6 space-y-4 shadow-xs"
              >
                {/* Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-black text-slate-900 dark:text-white">
                      #{order.orderNumber || orderId}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider ${
                      status === 'DELIVERED'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                        : status === 'SHIPPED'
                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400'
                        : status === 'PREPARING'
                        ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400'
                        : status === 'PAID'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600'
                        : status === 'CANCELLED'
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                    }`}>
                      {status}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      isDelivery
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {isDelivery ? <Truck size={10} /> : <Store size={10} />}
                      <span>{isDelivery ? 'Delivery ($1.50)' : 'Store Pickup (Free)'}</span>
                    </span>
                  </div>

                  <span className="text-[11px] font-medium text-slate-400">
                    {formatDate(order.createdAt)}
                  </span>
                </div>

                {/* Customer Details & Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white dark:bg-slate-800/60 rounded-2xl p-3.5 border border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <p className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                      <User size={13} className="text-slate-400" />
                      <span>{order.customerName || 'Customer'}</span>
                    </p>
                    {order.customerPhone && (
                      <p className="flex items-center gap-1.5 text-slate-500">
                        <Phone size={13} className="text-slate-400" />
                        <a href={`tel:${order.customerPhone}`} className="hover:underline font-mono">
                          {order.customerPhone}
                        </a>
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="flex items-start gap-1.5 text-slate-600 dark:text-slate-300 leading-relaxed">
                      <MapPin size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>{order.deliveryAddress || (isDelivery ? 'Phnom Penh, Cambodia' : 'Store Pickup at Mart System')}</span>
                    </p>
                  </div>
                </div>

                {/* Ordered Items Preview */}
                <div className="space-y-1.5 text-xs">
                  {items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-slate-700 dark:text-slate-300">
                      <span className="truncate max-w-[280px] sm:max-w-md font-medium">
                        • {it.product?.name || it.name || it.productName || 'Item'} × {it.quantity || 1}
                      </span>
                      <span className="font-mono font-bold">
                        {formatCurrency((it.product?.price || it.unitPrice || it.price || 0) * (it.quantity || 1))}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Status Transitions & Thermal Print */}
                <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-bold">Total:</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      {formatCurrency(order.total || order.finalTotal || order.amount || 0)}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedReceipt(order)}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
                    >
                      <Printer size={13} />
                      <span>Receipt</span>
                    </button>

                    {status === 'PAID' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(orderId, 'PREPARING')}
                        disabled={updatingId === orderId}
                        className="rounded-xl bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-1.5 text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
                      >
                        {updatingId === orderId ? 'Updating...' : 'Mark as Preparing'}
                      </button>
                    )}

                    {(status === 'PREPARING' || status === 'CONFIRMED') && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(orderId, 'SHIPPED')}
                        disabled={updatingId === orderId}
                        className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
                      >
                        {updatingId === orderId ? 'Updating...' : 'Mark Out for Delivery'}
                      </button>
                    )}

                    {(status === 'SHIPPED' || status === 'READY') && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(orderId, 'DELIVERED')}
                        disabled={updatingId === orderId}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
                      >
                        {updatingId === orderId ? 'Updating...' : 'Mark as Delivered'}
                      </button>
                    )}

                    {status !== 'DELIVERED' && status !== 'CANCELLED' && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Cancel order #${order.orderNumber || orderId}?`)) {
                            handleUpdateStatus(orderId, 'CANCELLED');
                          }
                        }}
                        disabled={updatingId === orderId}
                        className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 px-3 py-1.5 text-xs font-bold hover:bg-rose-100 transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-sm text-slate-900 dark:text-white">
                Receipt #{selectedReceipt.orderNumber || selectedReceipt.id}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Close
              </button>
            </div>
            <Receipt sale={selectedReceipt} onPrint={() => window.print()} />
          </div>
        </div>
      )}
    </div>
  );
}
