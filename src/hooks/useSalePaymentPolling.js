import { useState, useEffect, useRef, useCallback } from 'react';
import { salePaymentApi } from '../api/salePaymentApi';
import { getErrorMessage } from '../api/client';
import { env } from '../config/env';

export const TERMINAL_SUCCESS = ['PAID', 'SUCCESS', 'COMPLETED'];
export const TERMINAL_FAILURE = ['FAILED', 'EXPIRED', 'CANCELLED', 'REFUNDED'];

// Strict polling cadence requirements:
// 1. First check: 10 seconds after creation
// 2. Subsequent checks: 12 seconds
// 3. RATE_LIMITED (429): 30 seconds backoff
// 4. Temporary server/network error retry: 12 seconds
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
  const isPausedRef = useRef(false);
  const abortControllerRef = useRef(null);
  const paymentStateRef = useRef('PENDING');
  paymentStateRef.current = paymentState;

  const saleIdRef = useRef(saleId);
  saleIdRef.current = saleId;

  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Single function to abort any in-flight request and clear scheduled timers
  const stop = useCallback(() => {
    aliveRef.current = false;
    inFlightRef.current = false;
    isPausedRef.current = false;
    setIsChecking(false);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch {
        // ignore
      }
      abortControllerRef.current = null;
    }
  }, []);

  const scheduleNext = useCallback((delayMs) => {
    // Clear any previous timer to ensure only ONE active timer exists
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!aliveRef.current || isPausedRef.current) return;

    // Never schedule if already in terminal state
    if (
      TERMINAL_SUCCESS.includes(paymentStateRef.current) ||
      TERMINAL_FAILURE.includes(paymentStateRef.current)
    ) {
      return;
    }

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      checkPaymentRef.current?.(false);
    }, delayMs);
  }, []);

  const checkPayment = useCallback(
    async (isManual = false) => {
      const currentSaleId = saleIdRef.current;
      if (!currentSaleId || (!aliveRef.current && !isManual)) return;

      // In-flight concurrency lock: Do NOT initiate new request if one is in progress
      if (inFlightRef.current) {
        console.log(`[useSalePaymentPolling] Request already in-flight for saleId ${currentSaleId}, ignoring trigger.`);
        return;
      }

      // Terminal state guard: Stop immediately if already terminal
      if (
        TERMINAL_SUCCESS.includes(paymentStateRef.current) ||
        TERMINAL_FAILURE.includes(paymentStateRef.current)
      ) {
        stop();
        return;
      }

      // If user manually triggered check, clear pending scheduled timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      // Create new AbortController for this request
      if (abortControllerRef.current) {
        try {
          abortControllerRef.current.abort();
        } catch {
          // ignore
        }
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      inFlightRef.current = true;
      setIsChecking(true);
      setPaymentState((prev) => (TERMINAL_SUCCESS.includes(prev) ? prev : 'CHECKING'));

      try {
        console.log(`[useSalePaymentPolling] GET /api/v1/sales/${currentSaleId}/payment/status (cadence: ${isManual ? 'manual' : 'polling'})`);
        const result = await salePaymentApi.checkStatus(currentSaleId, {
          ...optionsRef.current,
          signal: controller.signal,
        });

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

          // 1. Handle RATE_LIMITED from backend body (30s backoff)
          if (isRateLimited) {
            console.warn(`[useSalePaymentPolling] RATE_LIMITED received for saleId ${currentSaleId}. Backing off for 30s.`);
            setPaymentState('RATE_LIMITED');
            setStatusMessage(
              result.message ||
              'មិនអាចពិនិត្យស្ថានភាពការទូទាត់បានជាបណ្តោះអាសន្ន។ កំពុងផ្ទៀងផ្ទាត់ការទូទាត់... សូមរង់ចាំបន្តិច'
            );
            setPayment((prev) => (prev ? { ...prev, ...result } : result));
            scheduleNext(RATE_LIMIT_BACKOFF_MS);
            return;
          }

          const isPaid =
            result.paid === true ||
            (typeof result.isPaid === 'function' && result.isPaid()) ||
            TERMINAL_SUCCESS.includes(rawStatus);

          const isFailure = TERMINAL_FAILURE.includes(rawStatus);

          // Update payment data while preserving QR and identification details
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
              saleId: currentSaleId,
            };
          });

          // 2. Stop immediately on terminal success
          if (isPaid) {
            console.log(`[useSalePaymentPolling] Payment SUCCESS reached (${rawStatus}), stopping polling.`);
            setPaymentState('PAID');
            setStatusMessage('');
            setError('');
            stop();
            return;
          }

          // 3. Stop immediately on terminal failure
          if (isFailure) {
            console.log(`[useSalePaymentPolling] Terminal failure reached (${rawStatus}), stopping polling.`);
            setPaymentState(rawStatus);
            setStatusMessage(result.message || '');
            stop();
            return;
          }

          // 4. Still PENDING: reset checking notices and schedule next check in 12s
          setPaymentState('PENDING');
          setStatusMessage('');
          setError('');
          scheduleNext(POLL_INTERVAL_MS);
        }
      } catch (err) {
        if (!aliveRef.current || salePaymentApi.isCancel(err)) {
          // Request was aborted cleanly, ignore
          return;
        }

        const httpStatus = err?.response?.status;
        const responseData = err?.response?.data;
        const isRateLimitHttp =
          httpStatus === 429 ||
          responseData?.status === 'RATE_LIMITED' ||
          responseData?.code === 'RATE_LIMITED';

        console.warn(`[useSalePaymentPolling] Notice for saleId ${currentSaleId}:`, httpStatus, err?.message);

        // Terminal auth errors (401 / 403)
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

        // Handle 500, 502, 503, Network Error, Timeout:
        // Do NOT show Payment Failed. Keep QR displayed, retry after 12s
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
    [stop, scheduleNext]
  );

  const checkPaymentRef = useRef(checkPayment);
  checkPaymentRef.current = checkPayment;

  // Manual trigger for user "Check Payment" button clicks
  const checkNow = useCallback(() => {
    return checkPaymentRef.current?.(true);
  }, []);

  // Polling lifecycle + Page Visibility API
  useEffect(() => {
    if (!enabled || !saleId) {
      stop();
      return;
    }

    // Clean up any existing timer or in-flight request before starting
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    aliveRef.current = true;
    inFlightRef.current = false;
    isPausedRef.current = document.hidden;
    setPaymentState('PENDING');

    // Handle Page Visibility: pause when hidden, resume & check immediately when visible
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('[useSalePaymentPolling] Tab hidden: Pausing polling timer.');
        isPausedRef.current = true;
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      } else {
        console.log('[useSalePaymentPolling] Tab visible: Resuming polling, checking once immediately.');
        isPausedRef.current = false;
        // Trigger immediate check when returning to tab, then resume 12s interval
        if (aliveRef.current && !inFlightRef.current) {
          checkPaymentRef.current?.(false);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial poll runs after 10s if tab is currently visible
    if (!document.hidden) {
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        checkPaymentRef.current?.(false);
      }, FIRST_POLL_DELAY_MS);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stop();
    };
  }, [enabled, saleId, stop]);

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
