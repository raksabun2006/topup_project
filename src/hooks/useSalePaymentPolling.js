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
  const inFlightRef = useRef(false);

  const stop = useCallback(() => {
    aliveRef.current = false;
    inFlightRef.current = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const poll = useCallback(async () => {
    if (!aliveRef.current || inFlightRef.current) return;
    inFlightRef.current = true;

    try {
      const result = await salePaymentApi.checkStatus(saleId);
      if (!aliveRef.current) return;

      setPayment((prev) => {
        if (!prev) return result;
        return {
          ...prev,
          ...result,
          qrString: prev.qrString || result?.qrString || null,
          qr: prev.qr || result?.qr || null,
          billNumber: prev.billNumber || result?.billNumber || null,
          expiresAt: prev.expiresAt || result?.expiresAt || null,
          merchantName: prev.merchantName || result?.merchantName || null,
        };
      });
      setError('');


      const statusUpper = result?.status ? String(result.status).toUpperCase() : '';
      const isPaid =
        result?.paid === true ||
        statusUpper === 'PAID' ||
        statusUpper === 'SUCCESS' ||
        statusUpper === 'COMPLETED';

      // Stop immediately when payment is confirmed or has reached a terminal status
      if (isPaid || TERMINAL_STATUSES.includes(statusUpper)) {
        stop();
        return;
      }

      // Schedule next poll interval (2-3 seconds)
      if (aliveRef.current) {
        if (timerRef.current) clearTimeout(timerRef.current);
        const interval = env.paymentPollIntervalMs || 3000;
        timerRef.current = setTimeout(() => {
          inFlightRef.current = false;
          poll();
        }, interval);
      }
    } catch (err) {
      if (!aliveRef.current) return;
      const httpStatus = err?.response?.status;
      console.warn('Payment polling notice:', httpStatus, err?.message);

      // Stop polling on explicit authentication or resource-not-found errors
      if (httpStatus === 401 || httpStatus === 403 || httpStatus === 404) {
        setError(getErrorMessage(err));
        stop();
        return;
      }

      // For temporary provider busy (502/503), timeouts, or network glitches:
      // Keep status as PENDING and retry after poll interval
      if (aliveRef.current) {
        if (timerRef.current) clearTimeout(timerRef.current);
        const interval = env.paymentPollIntervalMs || 3000;
        timerRef.current = setTimeout(() => {
          inFlightRef.current = false;
          poll();
        }, interval);
      }
    } finally {
      inFlightRef.current = false;
    }
  }, [saleId, stop]);

  useEffect(() => {
    if (!enabled || !saleId) {
      stop();
      return;
    }

    aliveRef.current = true;
    inFlightRef.current = false;
    poll();

    return () => {
      stop();
    };
  }, [enabled, saleId, poll, stop]);

  return { payment, error, setPayment, stop };
}

