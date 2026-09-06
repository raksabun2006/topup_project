import { useState, useEffect, useCallback } from 'react';
import { discountApi } from '../api/discountApi';
import { getErrorMessage } from '../api/client';

/**
 * Public hook to fetch currently active promotions from backend.
 * GET /api/v1/discounts/active
 */
export function useActiveDiscounts() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchActive = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await discountApi.getActiveDiscounts();
      const list = Array.isArray(data) ? data : data?.content || [];
      setDiscounts(list);
    } catch (err) {
      // Graceful error handling for active discounts (e.g. if 404 or backend empty)
      console.warn('Active promotions notice:', err);
      setError(getErrorMessage(err));
      setDiscounts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActive();
  }, [fetchActive]);

  return {
    discounts,
    loading,
    error,
    reload: fetchActive,
  };
}

/**
 * Admin hook to manage promotions with JWT authentication.
 * Supports CRUD and status toggle.
 */
export function useAdminDiscounts(params = {}) {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDiscounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await discountApi.getDiscounts(params);
      const list = Array.isArray(data) ? data : data?.content || [];
      setDiscounts(list);
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      setDiscounts([]);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchDiscounts();
  }, [fetchDiscounts]);

  const createDiscount = async (discountData) => {
    const res = await discountApi.createDiscount(discountData);
    await fetchDiscounts();
    return res;
  };

  const updateDiscount = async (id, discountData) => {
    const res = await discountApi.updateDiscount(id, discountData);
    await fetchDiscounts();
    return res;
  };

  const deleteDiscount = async (id) => {
    const res = await discountApi.deleteDiscount(id);
    await fetchDiscounts();
    return res;
  };

  const updateDiscountStatus = async (id, status) => {
    const res = await discountApi.updateDiscountStatus(id, status);
    await fetchDiscounts();
    return res;
  };

  return {
    discounts,
    loading,
    error,
    reload: fetchDiscounts,
    createDiscount,
    updateDiscount,
    deleteDiscount,
    updateDiscountStatus,
  };
}
