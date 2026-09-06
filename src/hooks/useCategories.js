import { useState, useEffect, useCallback } from 'react';
import { categoryApi } from '../api/categoryApi';
import { getErrorMessage } from '../api/client';
import { DEFAULT_CATEGORIES } from '../constants/categories';

export function useCategories() {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await categoryApi.list();
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.content)
        ? res.content
        : [];
      if (list && list.length > 0) {
        setCategories(list);
      } else {
        setCategories(DEFAULT_CATEGORIES);
      }
    } catch (err) {
      setError(getErrorMessage(err));
      setCategories(DEFAULT_CATEGORIES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { categories, loading, error, reload: load };
}

