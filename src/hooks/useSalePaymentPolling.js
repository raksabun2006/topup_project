import { useState, useEffect, useRef, useCallback } from 'react';
import { salePaymentApi } from '../api/salePaymentApi';
import { getErrorMessage } from '../api/client';
import { env } from '../config/env';

const TERMINAL_SUCCESS = ['PAID', 'SUCCESS', 'COMPLETED'];
const TERMINAL_FAILURE = ['FAILED', 'EXPIRED', 'CANCELLED', 'REFUNDED'];

export function useSalePaymentPolling(saleId, enabled, options = {}) {
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState('');

  const intervalRef = useRef(null);
  const aliveRef = useRef(false);
  const inFlightRef = useRef(false);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const stop = useCallback(() => {
    aliveRef.current = false;
    inFlightRef.current = false;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const checkPayment = useCallback(async () => {
    if (!aliveRef.current || inFlightRef.current || !saleId) return;
    inFlightRef.current = true;

    try {
      console.log(`[useSalePaymentPolling] Polling payment status for saleId:`, saleId);
      const result = await salePaymentApi.checkStatus(saleId, optionsRef.current);
      if (!aliveRef.current) return;

      if (result) {
        console.log(`[useSalePaymentPolling] Received result:`, {
          saleIdUsedForPolling: saleId,
          saleIdFromBackend: result.saleId,
          paymentIdFromBackend: result.paymentId,
          status: result.status,
          paymentStatus: result.paymentStatus,
          paid: result.paid,
        });

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
            paymentId: result.paymentId || prev.paymentId || null,
            saleId: saleId, // Always strictly preserve the original saleId
          };
        });
        setError('');

        const statusUpper = String(
          result.paymentStatus ||
          result.status ||
          (typeof result.getPaymentStatus === 'function' ? result.getPaymentStatus() : '') ||
          ''
        ).toUpperCase();

        const isPaid =
          result.paid === true ||
          (typeof result.isPaid === 'function' && result.isPaid()) ||
          TERMINAL_SUCCESS.includes(statusUpper);

        const isFailure = TERMINAL_FAILURE.includes(statusUpper);

        // Stop polling immediately on terminal states
        if (isPaid || isFailure) {
          console.log(`[useSalePaymentPolling] Terminal status reached (${statusUpper}), stopping.`);
          stop();
          return;
        }
      }
    } catch (err) {
      if (!aliveRef.current) return;
      const httpStatus = err?.response?.status;
      console.warn(`[useSalePaymentPolling] Notice for saleId ${saleId}:`, httpStatus, err?.message);

      // Stop polling on authentication or forbidden errors
      if (httpStatus === 401 || httpStatus === 403) {
        setError(getErrorMessage(err));
        stop();
        return;
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

    // Clean up any existing interval before starting a new one
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    aliveRef.current = true;
    inFlightRef.current = false;

    // Check payment immediately
    checkPayment();

    // Polling every 2.5–3 seconds using exactly ONE interval
    const pollInterval = env.paymentPollIntervalMs || 2500;
    const interval = setInterval(checkPayment, pollInterval);
    intervalRef.current = interval;

    return () => {
      clearInterval(interval);
      if (intervalRef.current === interval) {
        intervalRef.current = null;
      }
      aliveRef.current = false;
      inFlightRef.current = false;
    };
  }, [enabled, saleId, checkPayment, stop]);

  return { payment, error, setPayment, stop };
}
