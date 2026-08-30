import { useState, useEffect, useRef, useCallback } from 'react';
import { salePaymentApi } from '../api/salePaymentApi';
import { getErrorMessage } from '../api/client';
import { env } from '../config/env';

const TERMINAL_STATUSES = ['PAID', 'COMPLETED', 'SUCCESS', 'FAILED', 'EXPIRED', 'REFUNDED', 'CANCELLED'];

export function useSalePaymentPolling(saleId, enabled) {
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState('');

  const timerRef = useRef(null);
  const aliveRef = useRef(false);

  const stop = useCallback(() => {
    aliveRef.current = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const poll = useCallback(async () => {
    if (!aliveRef.current) return;
    try {
      const result = await salePaymentApi.checkStatus(saleId);
      if (!aliveRef.current) return;
      setPayment(result);
      setError('');

      const statusUpper = result?.status ? String(result.status).toUpperCase() : '';

      // Stop polling on terminal statuses
      if (TERMINAL_STATUSES.includes(statusUpper)) {
        stop();
        return;
      }

      // Schedule next poll in 3000ms
      timerRef.current = setTimeout(poll, env.paymentPollIntervalMs);
    } catch (err) {
      if (!aliveRef.current) return;
      const httpStatus = err?.response?.status;
      console.warn('Payment polling notice:', httpStatus, err?.message);

      // Stop polling on authentication or resource-not-found errors
      if (httpStatus === 401 || httpStatus === 403 || httpStatus === 404) {
        setError(getErrorMessage(err));
        stop();
        return;
      }

      // For 502/503 (provider busy) or temporary network glitches, continue retrying
      timerRef.current = setTimeout(poll, env.paymentPollIntervalMs);
    }
  }, [saleId, stop]);

  useEffect(() => {
    if (!enabled || !saleId) {
      stop();
      return;
    }
    aliveRef.current = true;
    poll();
    return stop;
  }, [enabled, saleId, poll, stop]);

  return { payment, error, setPayment, stop };
}
