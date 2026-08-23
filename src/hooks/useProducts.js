import { useState, useEffect, useCallback, useRef } from 'react';
import { productApi } from '../api/productApi';
import { getErrorMessage } from '../api/client';

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

  // ប្តូរ category ត្រូវត្រឡប់ទៅទំព័រ 1 វិញ
  useEffect(() => {
    setPage(0);
  }, [category]);

  // ស្តុកប្រែប្រួលបន្ទាប់ពីលក់ជោគជ័យ - ទាញយកទំព័រនេះឡើងវិញស្ងាត់ៗ
  // (គ្មាន loading spinner) ដើម្បីកុំឲ្យក្រឡាទំនិញលោតបន្ទាប់ពីគិតលុយរួច។
  const isFirstReloadSignal = useRef(true);
  useEffect(() => {
    if (isFirstReloadSignal.current) {
      isFirstReloadSignal.current = false;
      return;
    }
    productApi.list({ category, page, size: PAGE_SIZE }).then(setPageData).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadSignal]);

  return {
    products: pageData?.content ?? [],
    totalPages: pageData?.totalPages ?? 0,
    totalElements: pageData?.totalElements ?? 0,
    page,
    setPage,
    loading,
    error,
    reload: load,
  };
}
