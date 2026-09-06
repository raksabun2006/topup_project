/**
 * Supermarket POS Scanner Audio Utility
 * Ultra-low latency sound synthesis using the Web Audio API.
 * Replicates commercial supermarket laser scanners (Zebra/Honeywell/Datalogic).
 * Completely self-contained, fire-and-forget, zero blocking.
 */

let audioCtx = null;

/**
 * Initialize / unlock the Web Audio context on user gesture (e.g. click "Scan Barcode")
 */
export function initAudioContext() {
  if (typeof window === 'undefined') return null;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/**
 * Professional supermarket scanner success beep (crystal clear 1850Hz chime, ~75ms)
 * Instant, short, professional, not annoying, distinct in noisy checkout counters.
 */
export function playBeepSound() {
  try {
    const ctx = initAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1850, now); // Classic POS frequency

    // Extremely fast attack (< 3ms) and clean, crisp decay (~75ms)
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.35, now + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  } catch {
    // Non-blocking fire-and-forget
  }
}

/**
 * Supermarket product not found warning sound (distinct low double-tone buzz, ~140ms)
 */
export function playErrorSound() {
  try {
    const ctx = initAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.setValueAtTime(220, now + 0.07);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.015);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  } catch {
    // Non-blocking
  }
}

/**
 * Invalid barcode format short error blip (240Hz, ~80ms)
 */
export function playInvalidBarcodeSound() {
  try {
    const ctx = initAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(240, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.01);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.085);
  } catch {
    // Non-blocking
  }
}
