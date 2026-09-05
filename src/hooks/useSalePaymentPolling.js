import { useState, useEffect, useRef, useCallback } from 'react';
import { salePaymentApi } from '../api/salePaymentApi';
import { getErrorMessage } from '../api/client';
import { env } from '../config/env';

export const TERMINAL_SUCCESS = ['PAID', 'SUCCESS', 'COMPLETED'];
export const TERMINAL_FAILURE = ['FAILED', 'EXPIRED', 'CANCELLED', 'REFUNDED'];

// Polling interval constants conforming strictly to specifications:
// 1. First check: ~10 seconds after creation
// 2. Subsequent checks: every 10–15 seconds (default 12s)
// 3. RATE_LIMITED backoff: 30 seconds
// 4. Temporary server/network error retry: 10–15 seconds (default 12s)
export const FIRST_POLL_DELAY_MS = 10000;
export const POLL_INTERVAL_MS = Number(env.paymentPollIntervalMs || 12000);
export const RATE_LIMIT_BACKOFF_MS = 30000;
export const ERROR_RETRY_DELAY_MS = 12000;

export function useSalePaymentPolling(saleId, enabled, options = {}) {
  const [payment, setPayment] = useState(null);
  const [paymentState, setPaymentState] = useState('PENDING');
  const [isChecking, setIsChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');

  const timerRef = useRef(null);
  const aliveRef = useRef(false);
  const inFlightRef = useRef(false);
  const paymentStateRef = useRef('PENDING');
  paymentStateRef.current = paymentState;

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const checkPaymentRef = useRef(null);

  const stop = useCallback(() => {
    aliveRef.current = false;
    inFlightRef.current = false;
    setIsChecking(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const scheduleNext = useCallback((delayMs) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!aliveRef.current) return;
    // Never schedule if already in terminal state
    if (
      TERMINAL_SUCCESS.includes(paymentStateRef.current) ||
      TERMINAL_FAILURE.includes(paymentStateRef.current)
    ) {
      return;
    }
    timerRef.current = setTimeout(() => {
      if (checkPaymentRef.current) {
        checkPaymentRef.current(false);
      }
    }, delayMs);
  }, []);

  const checkPayment = useCallback(
    async (isManual = false) => {
      // 1. Guard checks
      if ((!aliveRef.current && !isManual) || !saleId) return;

      // Concurrency lock: Ignore duplicate requests while one is already in-flight
      if (inFlightRef.current) {
        console.log(`[useSalePaymentPolling] Check ignored: Request already in-flight for saleId:`, saleId);
        return;
      }

      // Do not check if already in terminal state
      if (
        TERMINAL_SUCCESS.includes(paymentStateRef.current) ||
        TERMINAL_FAILURE.includes(paymentStateRef.current)
      ) {
        stop();
        return;
      }

      // If user triggered manual check, clear pending scheduled timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      inFlightRef.current = true;
      setIsChecking(true);
      setPaymentState((prev) => (TERMINAL_SUCCESS.includes(prev) ? prev : 'CHECKING'));

      try {
        console.log(`[useSalePaymentPolling] Polling payment status via GET /api/v1/sales/${saleId}/payment/status`);
        const result = await salePaymentApi.checkStatus(saleId, optionsRef.current);

        if (!aliveRef.current) return;

        if (result) {
          const rawStatus = String(
            result.paymentStatus ||
            result.status ||
            (typeof result.getPaymentStatus === 'function' ? result.getPaymentStatus() : '') ||
            ''
          ).trim().toUpperCase();

          const isRateLimited =
            rawStatus === 'RATE_LIMITED' ||
            result.raw?.status === 'RATE_LIMITED' ||
            result.data?.status === 'RATE_LIMITED';

          // 2. Handle RATE_LIMITED from backend
          if (isRateLimited) {
            console.warn(`[useSalePaymentPolling] RATE_LIMITED received for saleId ${saleId}. Backing off for 30s.`);
            setPaymentState('RATE_LIMITED');
            setStatusMessage(
              result.message ||
              'មិនអាចពិនិត្យស្ថានភាពការទូទាត់បានជាបណ្តោះអាសន្ន។ កំពុងផ្ទៀងផ្ទាត់ការទូទាត់... សូមរង់ចាំបន្តិច'
            );
            // Preserve existing QR and payment info
            setPayment((prev) => (prev ? { ...prev, ...result } : result));
            // Back off 30 seconds before next retry
            scheduleNext(RATE_LIMIT_BACKOFF_MS);
            return;
          }

          const isPaid =
            result.paid === true ||
            (typeof result.isPaid === 'function' && result.isPaid()) ||
            TERMINAL_SUCCESS.includes(rawStatus);

          const isFailure = TERMINAL_FAILURE.includes(rawStatus);

          // Update payment data preserving QR code and identifiers
          setPayment((prev) => {
            if (!prev) return result;
            return {
              ...prev,
              ...result,
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
              saleId: saleId,
            };
          });

          // 3. Stop immediately on terminal success (PAID / COMPLETED / SUCCESS)
          if (isPaid) {
            console.log(`[useSalePaymentPolling] Payment SUCCESS reached (${rawStatus}), stopping polling immediately.`);
            setPaymentState('PAID');
            setStatusMessage('');
            setError('');
            stop();
            return;
          }

          // 4. Stop immediately on terminal failure (FAILED / EXPIRED / CANCELLED / REFUNDED)
          if (isFailure) {
            console.log(`[useSalePaymentPolling] Terminal status reached (${rawStatus}), stopping polling.`);
            setPaymentState(rawStatus);
            setStatusMessage(result.message || '');
            stop();
            return;
          }

          // 5. Still PENDING: reset checking notices and schedule next check in 10–15s
          setPaymentState('PENDING');
          setStatusMessage('');
          setError('');
          scheduleNext(POLL_INTERVAL_MS);
        }
      } catch (err) {
        if (!aliveRef.current) return;
        const httpStatus = err?.response?.status;
        const responseData = err?.response?.data;
        const isRateLimitHttp =
          httpStatus === 429 ||
          responseData?.status === 'RATE_LIMITED' ||
          responseData?.code === 'RATE_LIMITED';

        console.warn(`[useSalePaymentPolling] Notice for saleId ${saleId}:`, httpStatus, err?.message);

        // Terminal auth errors
        if (httpStatus === 401 || httpStatus === 403) {
          setError(getErrorMessage(err));
          setPaymentState('ERROR');
          stop();
          return;
        }

        // Handle HTTP 429 / RATE_LIMITED error with 30s backoff
        if (isRateLimitHttp) {
          setPaymentState('RATE_LIMITED');
          setStatusMessage(
            responseData?.message ||
            'មិនអាចពិនិត្យស្ថានភាពការទូទាត់បានជាបណ្តោះអាសន្ន។ កំពុងផ្ទៀងផ្ទាត់ការទូទាត់... សូមរង់ចាំបន្តិច'
          );
          scheduleNext(RATE_LIMIT_BACKOFF_MS);
          return;
        }

        // 6. Handle 500, 502, 503, Network Error, Timeout:
        // DO NOT show Payment Failed. Show friendly status message and retry after delay.
        if (paymentStateRef.current !== 'PAID' && paymentStateRef.current !== 'COMPLETED') {
          setPaymentState('ERROR');
          setStatusMessage('កំពុងពិនិត្យការទូទាត់... សូមរង់ចាំបន្តិច។');
        }
        scheduleNext(ERROR_RETRY_DELAY_MS);
      } finally {
        inFlightRef.current = false;
        setIsChecking(false);
      }
    },
    [saleId, stop, scheduleNext]
  );

  checkPaymentRef.current = checkPayment;

  // Manual trigger for user "Check Payment" button clicks
  const checkNow = useCallback(() => {
    return checkPayment(true);
  }, [checkPayment]);

  useEffect(() => {
    if (!enabled || !saleId) {
      stop();
      return;
    }

    // Clean up any existing timer before starting
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    aliveRef.current = true;
    inFlightRef.current = false;
    setPaymentState('PENDING');

    // First check runs after ~10 seconds to give customer time to open banking app and scan
    timerRef.current = setTimeout(() => {
      checkPayment(false);
    }, FIRST_POLL_DELAY_MS);

    return () => {
      stop();
    };
  }, [enabled, saleId, stop, checkPayment]);

  return {
    payment,
    paymentState,
    isChecking,
    statusMessage,
    error,
    checkNow,
    setPayment,
    stop,
  };
}
