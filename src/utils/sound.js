/**
 * Supermarket POS Scanner Audio Utility
 * Ultra-low latency sound synthesis using the Web Audio API.
 * Replicates commercial supermarket laser scanners (Zebra/Honeywell/Datalogic).
 * Completely self-contained, fire-and-forget, zero blocking.
 */

let audioCtx = null;
let isAudioUnlocked = false;

/**
 * Get or create the singleton Web Audio context
 */
export function getAudioContext() {
  if (typeof window === 'undefined') return null;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/**
 * Check if the AudioContext is running and unlocked
 */
export function isAudioRunning() {
  return !!audioCtx && audioCtx.state === 'running';
}

/**
 * Explicitly unlock the Web Audio context on user gesture (e.g. click "Start Scanner").
 * Spec:
 * 1. Create AudioContext if it does not exist.
 * 2. Call audioContext.resume().
 * 3. Play a 1ms silent buffer to force mobile Safari & Chrome to unlock hardware audio.
 * 4. Verify AudioContext.state === "running".
 */
export async function unlockAudioContext() {
  const ctx = getAudioContext();
  if (!ctx) return false;

  try {
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    // Play a silent 1ms buffer to force mobile iOS/Android Safari & Chrome to unlock hardware audio output
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);

    if (ctx.state === 'running') {
      isAudioUnlocked = true;
    }
  } catch (err) {
    console.warn('Web Audio unlock failed:', err);
  }

  const unlocked = ctx.state === 'running';
  isAudioUnlocked = unlocked;

  console.log('[Audio] state:', ctx?.state);
  console.log('[Audio] unlocked:', isAudioUnlocked);

  return unlocked;
}

/**
 * Initialize / unlock the Web Audio context on user gesture
 */
export function initAudioContext() {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

/**
 * Professional supermarket scanner success beep (crystal clear 1850Hz chime, ~75ms)
 * Instant, short, professional, not annoying, distinct in noisy checkout counters.
 */
export function playBeepSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1850, now); // Classic POS frequency

    // Extremely fast attack (< 3ms) and clean, crisp decay (~75ms)
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.4, now + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  } catch {
    // Non-blocking fire-and-forget
  }
}

export const playBarcodeBeep = playBeepSound;

/**
 * Supermarket product not found warning sound (distinct low double-tone buzz, ~140ms)
 */
export function playErrorSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

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

export const playBarcodeError = playErrorSound;

/**
 * Invalid barcode format short error blip (240Hz, ~80ms)
 */
export function playInvalidBarcodeSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

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
