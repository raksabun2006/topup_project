import { useState, useEffect, useRef, useCallback } from 'react';
import { paymentApi } from '../api/paymentApi';
import { getErrorMessage } from '../api/client';
import { env } from '../config/env';

export function usePaymentPolling(orderId, enabled) {
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState('');
  const [timedOut, setTimedOut] = useState(false);

  const timerRef = useRef(null);
  const startedAtRef = useRef(null);
  const aliveRef = useRef(false);
  const pollStartedForRef = useRef(null);
  const isFinal = (status) =>
    ['PAID', 'FAILED', 'EXPIRED', 'REFUNDED'].includes(status);

  const stop = useCallback(() => {
    aliveRef.current = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const poll = useCallback(async () => {
    try {
      const result = await paymentApi.checkStatus(orderId);
      if (!aliveRef.current) return;
      setPayment(result);

      if (isFinal(result.status)) {
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
  }, [orderId, stop]);

  useEffect(() => {
    if (!enabled || !orderId) return;

    // React.StrictMode ហៅ effect នេះពីរដងក្នុងរបៀប dev - ការពារកុំឲ្យ
    // poll() (checkStatus ដែលហៅ Bakong ផ្ទាល់) ចេញពីរដងព្រមៗគ្នា។
    // pollStartedForRef មិនត្រូវបាន reset ដោយ cleanup ទេ ដូច្នេះ
    // StrictMode ហៅលើកទី ២ នឹងឃើញ session កំពុងរត់ស្រាប់ ហើយរំលង
    // ការហៅ poll() ថ្មី តែនៅតែ "ស្តារ" aliveRef ដើម្បីលទ្ធផលពី
    // request ដើមអាចត្រូវបានទទួល។
    if (pollStartedForRef.current !== orderId) {
      pollStartedForRef.current = orderId;
      startedAtRef.current = Date.now();
      poll();
    }
    aliveRef.current = true;

    return stop;
  }, [enabled, orderId, poll, stop]);

  return { payment, error, timedOut, setPayment };
}