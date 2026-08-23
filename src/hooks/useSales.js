import { useState, useEffect, useCallback } from 'react';
import { saleApi } from '../api/saleApi';
import { getErrorMessage } from '../api/client';

export function useSales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // size ធំមួយ (មិនមែន pagination UI ពិត) ដើម្បីទាញយក sale ទាំងអស់ម្តងតែម្តង
      // ព្រោះ dashboard/របាយការណ៍ត្រូវការសរុបលើ sale ទាំងអស់ មិនមែនតែទំព័រតែមួយទេ។
      const { sales: data } = await saleApi.list({ page: 0, size: 1000, sort: 'createdAt,desc' });
      // ថ្មីៗនៅលើគេ - sort ត្រង់នេះជា fallback បើ sort param មិនត្រូវបានគោរព
      setSales([...(data ?? [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { sales, loading, error, reload: load };
}

export function useSale(id) {
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      setSale(await saleApi.getById(id));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return { sale, loading, error, reload: load, setSale };
}
