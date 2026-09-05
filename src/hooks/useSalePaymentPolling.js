import { useState, useEffect, useRef, useCallback } from 'react';
import { salePaymentApi } from '../api/salePaymentApi';
import { getErrorMessage } from '../api/client';
import { env } from '../config/env';

const TERMINAL_SUCCESS = ['PAID', 'SUCCESS', 'COMPLETED'];
const TERMINAL_FAILURE = ['FAILED', 'EXPIRED', 'CANCELLED'];

export function useSalePaymentPolling(saleId, enabled) {
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState('');

  const timerRef = useRef(null);
  const aliveRef = useRef(false);
  const inFlightRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    aliveRef.current = false;
    inFlightRef.current = false;
    clearTimer();
  }, [clearTimer]);

  const poll = useCallback(async () => {
    if (!aliveRef.current || inFlightRef.current) return;
    inFlightRef.current = true;

    try {
      const result = await salePaymentApi.checkStatus(saleId);
      if (!aliveRef.current) return;

      if (result) {
        setPayment((prev) => {
          if (!prev) return result;
          return {
            ...prev,
            ...result,
            // Preserve all QR & identification data across status updates
            qrString: prev.qrString || result.qrString || null,
            qr: prev.qr || result.qr || null,
            md5: prev.md5 || result.md5 || null,
            billNumber: prev.billNumber || result.billNumber || null,
            invoiceNumber: prev.invoiceNumber || result.invoiceNumber || null,
            expiresAt: prev.expiresAt || result.expiresAt || null,
            merchantName: prev.merchantName || result.merchantName || null,
            amount: prev.amount ?? result.amount,
            currency: prev.currency || result.currency,
            paymentId: prev.paymentId || result.paymentId,
            saleId: prev.saleId || result.saleId,
          };
        });
        setError('');

        const statusUpper = String(result.status || '').toUpperCase();
        const paymentStatusUpper = String(result.paymentStatus || '').toUpperCase();
        const isPaid =
          result.paid === true ||
          TERMINAL_SUCCESS.includes(statusUpper) ||
          TERMINAL_SUCCESS.includes(paymentStatusUpper);
        const isFailure =
          TERMINAL_FAILURE.includes(statusUpper) ||
          TERMINAL_FAILURE.includes(paymentStatusUpper);

        // Stop polling immediately on terminal states
        if (isPaid || isFailure) {
          stop();
          return;
        }
      }

      // Schedule next check only after current response has completed
      if (aliveRef.current) {
        clearTimer();
        const interval = env.paymentPollIntervalMs || 3000;
        timerRef.current = setTimeout(() => {
          poll();
        }, interval);
      }
    } catch (err) {
      if (!aliveRef.current) return;
      const httpStatus = err?.response?.status;
      console.warn('Payment polling notice:', httpStatus, err?.message);

      // Stop polling on explicit authentication or forbidden errors
      if (httpStatus === 401 || httpStatus === 403) {
        setError(getErrorMessage(err));
        stop();
        return;
      }

      // For temporary errors (5xx, timeouts, network glitch):
      // Keep state as PENDING and schedule next poll
      if (aliveRef.current) {
        clearTimer();
        const interval = env.paymentPollIntervalMs || 3000;
        timerRef.current = setTimeout(() => {
          poll();
        }, interval);
      }
    } finally {
      inFlightRef.current = false;
    }
  }, [saleId, stop, clearTimer]);

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


