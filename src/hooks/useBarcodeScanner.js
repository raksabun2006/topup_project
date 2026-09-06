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
export function useBarcodeScanner(onScan, { enabled = true, maxInterval = 60, minLength = 3 } = {}) {
  const strokesRef = useRef([]); // [{ char, time, target }]
  const onScanRef = useRef(onScan);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e) => {
      // Ignore system modifier keys (Ctrl+C, Alt+Tab, Cmd+V, etc.)
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      const now = Date.now();
      const target = e.target;
      const isFormInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if (e.key === 'Enter') {
        const strokes = strokesRef.current;
        strokesRef.current = [];

        if (strokes.length >= minLength) {
          // Calculate interval statistics between consecutive keys
          let totalInterval = 0;
          let maxGap = 0;
          for (let i = 1; i < strokes.length; i++) {
            const gap = strokes[i].time - strokes[i - 1].time;
            totalInterval += gap;
            if (gap > maxGap) maxGap = gap;
          }
          const avgInterval = strokes.length > 1 ? totalInterval / (strokes.length - 1) : 0;

          // Hardware scanners emit characters at hardware keyboard speed (typically 5ms - 40ms).
          // If average interval is <= maxInterval (60ms) and maxGap is under 120ms, it is a barcode scan.
          // If not in an input, even a slightly looser threshold applies.
          const isScanner = !isFormInput
            ? avgInterval <= 100 || strokes.length >= 6
            : avgInterval <= maxInterval && maxGap <= 130;

          if (isScanner) {
            const scannedCode = strokes.map((s) => s.char).join('').trim();
            if (scannedCode.length >= minLength) {
              e.preventDefault();
              e.stopPropagation();

              // If the scanner inadvertently pumped text into an input field (e.g. search bar),
              // revert the barcode text from the input so the cashier's field stays clean
              if (isFormInput && typeof target.value === 'string') {
                if (target.value.endsWith(scannedCode)) {
                  target.value = target.value.slice(0, -scannedCode.length);
                  target.dispatchEvent(new Event('input', { bubbles: true }));
                }
              }

              onScanRef.current?.(scannedCode);
              return;
            }
          }
        }
        return;
      }

      // Record printable single characters
      if (e.key.length === 1) {
        const strokes = strokesRef.current;
        const lastStroke = strokes[strokes.length - 1];

        // If gap between this keystroke and last keystroke is too large for a scanner, clear previous buffer
        if (lastStroke && now - lastStroke.time > 180) {
          strokesRef.current = [];
        }

        strokesRef.current.push({
          char: e.key,
          time: now,
          target,
        });

        // Cap buffer memory
        if (strokesRef.current.length > 100) {
          strokesRef.current.shift();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [enabled, maxInterval, minLength]);
}
