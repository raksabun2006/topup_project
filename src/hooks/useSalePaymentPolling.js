import { useState, useEffect, useRef, useCallback } from 'react';
import { salePaymentApi } from '../api/salePaymentApi';
import { getErrorMessage } from '../api/client';
import { env } from '../config/env';

const FINAL_STATUSES = ['PAID', 'FAILED', 'EXPIRED', 'REFUNDED', 'CANCELLED'];

export function useSalePaymentPolling(saleId, enabled) {
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState('');
  const [timedOut, setTimedOut] = useState(false);

  const timerRef = useRef(null);
  const startedAtRef = useRef(null);
  const aliveRef = useRef(false);

  const stop = useCallback(() => {
    aliveRef.current = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const poll = useCallback(async () => {
    try {
      const result = await salePaymentApi.checkStatus(saleId);
      if (!aliveRef.current) return;
      setPayment(result);

      if (FINAL_STATUSES.includes(result.status)) {
        stop();
        return;
      }
      const elapsed = Date.now() - startedAtRef.current;
      if (elapsed >= env.paymentTimeoutMs) {
        setTimedOut(true);
        stop();
        return;
      }
      timerRef.current = setTimeout(poll, env.paymentPollIntervalMs);
    } catch (err) {
      if (!aliveRef.current) return;
      setError(getErrorMessage(err));
      stop();
    }
  }, [saleId, stop]);

  useEffect(() => {
    if (!enabled || !saleId) return;
    aliveRef.current = true;
    startedAtRef.current = Date.now();
    poll();
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, saleId]);

  return { payment, error, timedOut, setPayment };
}
