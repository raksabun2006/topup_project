import { useState, useEffect, useCallback, useMemo } from 'react';
import { adminProductApi } from '../api/adminProductApi';
import { productApi } from '../api/productApi';
import { saleApi } from '../api/saleApi';
import { inventoryApi } from '../api/inventoryApi';

const STORAGE_KEY = 'mart_read_notification_ids';

function getStoredReadIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveStoredReadIds(idsSet) {
  try {
    // Keep at most 200 IDs to avoid unbounded growth
    const arr = Array.from(idsSet).slice(-200);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  } catch {
    // localStorage might be blocked or full
  }
}

export function useNotifications({ pollIntervalMs = 45000 } = {}) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [readIds, setReadIds] = useState(getStoredReadIds);

  const fetchNotifications = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      const items = [];

      // 1. Fetch Products for Out-of-Stock and Low-Stock notifications
      try {
        let products = [];
        try {
          const res = await adminProductApi.list({ page: 0, size: 100 });
          products = res?.content || (Array.isArray(res) ? res : []);
        } catch {
          const res = await productApi.list({ page: 0, size: 100 });
          products = res?.content || (Array.isArray(res) ? res : []);
        }

        products.forEach((p) => {
          const stock = p.stockQuantity ?? 0;
          if (stock <= 0) {
            items.push({
              id: `stock-out-${p.id}`,
              type: 'out_of_stock',
              category: 'stock',
              severity: 'danger',
              title: 'អស់ពីស្តុក (Out of Stock)',
              message: `ទំនិញ "${p.name}" បានអស់ពីស្តុកហើយ (0 ក្នុងស្តុក)`,
              link: '/dashboard/products',
              timestamp: p.updatedAt || p.createdAt || new Date().toISOString(),
              meta: { product: p.name, stock, sku: p.sku },
            });
          } else if (stock <= 10) {
            items.push({
              id: `stock-low-${p.id}`,
              type: 'low_stock',
              category: 'stock',
              severity: 'warning',
              title: 'ស្តុកជិតអស់ (Low Stock)',
              message: `ទំនិញ "${p.name}" នៅសល់ត្រឹម ${stock} ប៉ុណ្ណោះ`,
              link: '/dashboard/products',
              timestamp: p.updatedAt || p.createdAt || new Date().toISOString(),
              meta: { product: p.name, stock, sku: p.sku },
            });
          }
        });
      } catch (err) {
        console.warn('Product notification check notice:', err?.message);
      }

      // 2. Fetch Inventory low-stock API if items not yet captured
      try {
        const invList = await inventoryApi.lowStock();
        if (Array.isArray(invList)) {
          invList.forEach((inv) => {
            const id = `inv-low-${inv.id}`;
            if (!items.some((it) => it.id === id || it.meta?.product === inv.product)) {
              items.push({
                id,
                type: 'low_stock',
                category: 'stock',
                severity: 'warning',
                title: 'ស្តុកជិតអស់ (Low Stock Alert)',
                message: `ទំនិញ "${inv.product}" នៅសល់ ${inv.quantity}/${inv.minimumStock || 10}`,
                link: '/dashboard/products',
                timestamp: inv.updatedAt || new Date().toISOString(),
                meta: { product: inv.product, stock: inv.quantity },
              });
            }
          });
        }
      } catch (err) {
        console.warn('Inventory lowStock API notice:', err?.message);
      }

      // 3. Fetch Sales for Pending payment notifications and recent completed transactions
      try {
        const salesRes = await saleApi.list({ page: 0, size: 25, sort: 'createdAt,desc' });
        const salesList = salesRes?.sales || [];

        salesList.forEach((sale) => {
          const isPending =
            sale.paymentStatus === 'PENDING' ||
            sale.status === 'PENDING' ||
            sale.paymentStatus === 'PENDING_PAYMENT';

          if (isPending) {
            items.push({
              id: `sale-pending-${sale.id}`,
              type: 'pending_payment',
              category: 'sales',
              severity: 'info',
              title: 'រង់ចាំការទូទាត់ (Pending Payment)',
              message: `វិក្កយបត្រ #${sale.invoiceNumber || sale.id?.slice(0, 8)} សរុប $${Number(sale.total || 0).toFixed(2)} កំពុងរង់ចាំទូទាត់`,
              link: `/dashboard/sales/${sale.id}`,
              timestamp: sale.createdAt || new Date().toISOString(),
              meta: {
                invoiceNumber: sale.invoiceNumber,
                total: sale.total,
                cashier: sale.cashierName || sale.cashier,
              },
            });
          }
        });
      } catch (err) {
        console.warn('Sales notification check notice:', err?.message);
      }

      // Sort: newest timestamp first, with danger/warning priority
      items.sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime() || 0;
        const timeB = new Date(b.timestamp).getTime() || 0;
        return timeB - timeA;
      });

      setNotifications(items);
    } finally {
      setLoading(false);
      if (isManualRefresh) setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Periodic background polling
  useEffect(() => {
    if (!pollIntervalMs || pollIntervalMs <= 0) return;
    const interval = setInterval(() => {
      fetchNotifications();
    }, pollIntervalMs);
    return () => clearInterval(interval);
  }, [fetchNotifications, pollIntervalMs]);

  // Mark a single notification as read
  const markAsRead = useCallback((id) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveStoredReadIds(next);
      return next;
    });
  }, []);

  // Mark all currently fetched notifications as read
  const markAllAsRead = useCallback(() => {
    setReadIds((prev) => {
      const next = new Set(prev);
      notifications.forEach((n) => next.add(n.id));
      saveStoredReadIds(next);
      return next;
    });
  }, [notifications]);

  // Clear or dismiss all
  const clearAll = useCallback(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  // Processed notifications with read state
  const enrichedNotifications = useMemo(() => {
    return notifications.map((n) => ({
      ...n,
      isRead: readIds.has(n.id),
    }));
  }, [notifications, readIds]);

  const unreadCount = useMemo(() => {
    return enrichedNotifications.filter((n) => !n.isRead).length;
  }, [enrichedNotifications]);

  const stockCount = useMemo(() => {
    return enrichedNotifications.filter((n) => n.category === 'stock' && !n.isRead).length;
  }, [enrichedNotifications]);

  const salesCount = useMemo(() => {
    return enrichedNotifications.filter((n) => n.category === 'sales' && !n.isRead).length;
  }, [enrichedNotifications]);

  return {
    notifications: enrichedNotifications,
    unreadCount,
    stockCount,
    salesCount,
    totalCount: notifications.length,
    loading,
    refreshing,
    refresh: () => fetchNotifications(true),
    markAsRead,
    markAllAsRead,
    clearAll,
  };
}
