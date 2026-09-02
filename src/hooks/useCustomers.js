import { useState, useEffect, useCallback } from 'react';
import { customerApi } from '../api/customerApi';
import { getErrorMessage } from '../api/client';

/** Backend គ្មាន search param ទេ - ត្រូវទាញទាំងអស់ហើយ filter នៅ client */
export function useCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await customerApi.list();
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.content)
        ? res.content
        : [];
      setCustomers(list);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { customers, loading, error, reload: load };
}
