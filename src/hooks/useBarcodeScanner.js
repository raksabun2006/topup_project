import { useEffect, useRef } from 'react';

/**
 * Hook to listen for hardware USB/Bluetooth barcode scanners.
 * Hardware scanners typically emulate keyboard strokes sent in rapid succession (< 50ms)
 * followed by an Enter key event.
 *
 * @param {Function} onScan - Callback when a hardware barcode scan is detected: (barcode) => void
 * @param {Object} options
 * @param {boolean} options.enabled - Whether hardware scanner listening is active
 * @param {number} options.maxInterval - Max milliseconds between keystrokes (default: 50ms)
 * @param {number} options.minLength - Minimum length of valid barcode (default: 3)
 */
export function useBarcodeScanner(onScan, { enabled = true, maxInterval = 50, minLength = 3 } = {}) {
  const bufferRef = useRef('');
  const lastKeyTimeRef = useRef(0);
  const onScanRef = useRef(onScan);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e) => {
      // Ignore system modifier keys
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      const now = Date.now();
      const timeDiff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      // If user is typing in a regular form input and speed is human (> 80ms), let standard input happen
      const target = e.target;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if (e.key === 'Enter') {
        const code = bufferRef.current.trim();
        const bufferLength = code.length;

        // If buffered characters arrived rapidly and meet minimum length
        if (bufferLength >= minLength) {
          e.preventDefault();
          e.stopPropagation();
          onScanRef.current?.(code);
        }

        // Reset buffer
        bufferRef.current = '';
        return;
      }

      // Only printable single characters (numbers, letters, dashes)
      if (e.key.length === 1) {
        // If interval is larger than scanner threshold and not starting fresh, reset buffer
        if (timeDiff > maxInterval && bufferRef.current.length > 0) {
          bufferRef.current = '';
        }

        // If focus is in standard text field and typing is normal human speed, do not capture
        if (isInput && timeDiff > maxInterval) {
          return;
        }

        bufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [enabled, maxInterval, minLength]);
}
