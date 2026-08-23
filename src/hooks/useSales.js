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
      const data = await saleApi.list();
      // ថ្មីៗនៅលើគេ - backend ត្រឡប់តាមលំដាប់បង្កើត មិនប្រាកដ sort ទេ
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
