import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { productApi } from '../api/productApi';
import { getErrorMessage } from '../api/client';
import { DEFAULT_PRODUCTS } from '../constants/products';

const PAGE_SIZE = 24;

export function useProducts({ category, reloadSignal } = {}) {
  const [pageData, setPageData] = useState(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await productApi.list({ category, page, size: PAGE_SIZE });
      setPageData(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [category, page]);

  useEffect(() => {
    load();
  }, [load]);

  // Reset to page 0 on category change
  useEffect(() => {
    setPage(0);
  }, [category]);

  const isFirstReloadSignal = useRef(true);
  useEffect(() => {
    if (isFirstReloadSignal.current) {
      isFirstReloadSignal.current = false;
      return;
    }
    productApi.list({ category, page, size: PAGE_SIZE }).then(setPageData).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadSignal]);

  const resolvedProducts = useMemo(() => {
    const list = pageData?.content;
    if (Array.isArray(list) && list.length > 0) {
      return list;
    }
    if (category) {
      return DEFAULT_PRODUCTS.filter((p) => p.category?.toLowerCase() === category.toLowerCase());
    }
    return DEFAULT_PRODUCTS;
  }, [pageData?.content, category]);

  const totalCount = (pageData?.totalElements && pageData.totalElements > 0)
    ? pageData.totalElements
    : resolvedProducts.length;

  return {
    products: resolvedProducts,
    totalPages: pageData?.totalPages || Math.ceil(resolvedProducts.length / PAGE_SIZE) || 1,
    totalElements: totalCount,
    page,
    setPage,
    loading,
    error,
    reload: load,
  };
}

