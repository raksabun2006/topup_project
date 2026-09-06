import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, RefreshCw, Zap, ZapOff, AlertCircle, ShieldAlert } from 'lucide-react';

const SUPPORTED_FORMATS = [
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.CODE_39,
  Html5QrcodeSupportedFormats.CODE_93,
  Html5QrcodeSupportedFormats.ITF,
  Html5QrcodeSupportedFormats.QR_CODE,
];

/**
 * BarcodeScanner Component
 * Live camera barcode scanner with permission handling, viewfinder frame,
 * animated laser line, camera switcher, torch toggle, and scan debouncing.
 */
export default function BarcodeScanner({
  onDetect,
  onSwitchToManual,
  isPaused = false,
  cooldownMs = 1200,
}) {
  const [status, setStatus] = useState('initializing'); // 'initializing' | 'ready' | 'permission_denied' | 'no_camera' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [cameras, setCameras] = useState([]);
  const [activeCameraId, setActiveCameraId] = useState(null);
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [justScanned, setJustScanned] = useState(false);

  const scannerRef = useRef(null);
  const lastScanRef = useRef({ code: '', time: 0 });
  const isMountedRef = useRef(true);
  const readerIdRef = useRef(`barcode-reader-${Math.random().toString(36).slice(2, 9)}`);

  // Detect decoded barcode with smart per-barcode cooldown
  const handleDecoded = useCallback(
    (decodedText) => {
      const code = String(decodedText || '').trim();
      if (!code) return;

      const now = Date.now();
      const isSameCode = lastScanRef.current.code === code;
      const elapsed = now - lastScanRef.current.time;

      // If the SAME barcode is visible, ignore repeats within 700ms
      if (isSameCode && elapsed < 700) {
        return;
      }

      // If DIFFERENT barcode, only minimal debouncing (150ms) to allow rapid-fire scanning
      if (!isSameCode && elapsed < 150) {
        return;
      }

      lastScanRef.current = { code, time: now };

      // Flash frame green visually
      setJustScanned(true);
      setTimeout(() => {
        if (isMountedRef.current) setJustScanned(false);
      }, 280);

      onDetect(code);
    },
    [onDetect]
  );

  // Initialize and start scanner
  useEffect(() => {
    isMountedRef.current = true;
    let html5QrCode = null;

    const startCamera = async () => {
      setStatus('initializing');
      setErrorMessage('');

      try {
        // Enumerate video devices
        let devices = [];
        try {
          devices = await Html5Qrcode.getCameras();
        } catch (camErr) {
          console.warn('Failed to enumerate cameras:', camErr);
        }

        if (!isMountedRef.current) return;

        if (devices && devices.length > 0) {
          setCameras(devices);
        }

        const elementId = readerIdRef.current;
        const readerElement = document.getElementById(elementId);
        if (!readerElement) return;

        html5QrCode = new Html5Qrcode(elementId, {
          formatsToSupport: SUPPORTED_FORMATS,
          verbose: false,
        });
        scannerRef.current = html5QrCode;

        // Configuration optimized for 1D & 2D retail barcodes
        const config = {
          fps: 15,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            // Rectangular wide box optimized for horizontal 1D barcodes
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const width = Math.floor(Math.min(viewfinderWidth * 0.85, 340));
            const height = Math.floor(Math.min(minEdge * 0.55, 200));
            return { width: Math.max(width, 220), height: Math.max(height, 140) };
          },
          aspectRatio: 1.333333,
        };

        // Determine camera to use
        let cameraConfig = { facingMode: 'environment' };
        if (activeCameraId) {
          cameraConfig = { deviceId: { exact: activeCameraId } };
        } else if (devices && devices.length > 0) {
          // Prefer environment/back camera if found in device label
          const backCam = devices.find((d) => /back|rear|environment/i.test(d.label));
          const chosenCam = backCam || devices[devices.length - 1];
          cameraConfig = chosenCam.id;
          setActiveCameraId(chosenCam.id);
        }

        await html5QrCode.start(
          cameraConfig,
          config,
          (decodedText) => handleDecoded(decodedText),
          () => {
            // Frame scan without barcode - ignore
          }
        );

        if (!isMountedRef.current) {
          if (html5QrCode.isScanning) {
            await html5QrCode.stop().catch(() => {});
          }
          return;
        }

        setStatus('ready');

        // Check torch / flashlight capability
        try {
          const capabilities = html5QrCode.getRunningTrackCapabilities?.();
          if (capabilities && capabilities.torch) {
            setHasTorch(true);
          }
        } catch {
          setHasTorch(false);
        }
      } catch (err) {
        if (!isMountedRef.current) return;
        console.error('Camera startup error:', err);

        const errorStr = String(err?.message || err || '').toLowerCase();
        if (
          errorStr.includes('notallowed') ||
          errorStr.includes('permission') ||
          errorStr.includes('denied')
        ) {
          setStatus('permission_denied');
        } else if (
          errorStr.includes('notfound') ||
          errorStr.includes('no camera') ||
          errorStr.includes('devices not found')
        ) {
          setStatus('no_camera');
        } else {
          setStatus('error');
          setErrorMessage(err?.message || 'មិនអាចបើកកាមេរ៉ាបានទេ');
        }
      }
    };

    startCamera();

    return () => {
      isMountedRef.current = false;
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().then(() => {
            try {
              scannerRef.current?.clear();
            } catch {
              // ignore
            }
          }).catch(() => {});
        } else {
          try {
            scannerRef.current.clear();
          } catch {
            // ignore
          }
        }
        scannerRef.current = null;
      }
    };
  }, [activeCameraId, handleDecoded]);

  // Toggle Torch/Flash
  const toggleTorch = async () => {
    if (!scannerRef.current || !hasTorch) return;
    try {
      const nextTorch = !torchOn;
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: nextTorch }],
      });
      setTorchOn(nextTorch);
    } catch (e) {
      console.warn('Torch toggle error:', e);
    }
  };

  // Switch between available cameras
  const switchCamera = () => {
    if (!cameras || cameras.length <= 1) return;
    const currentIndex = cameras.findIndex((c) => c.id === activeCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    setActiveCameraId(cameras[nextIndex].id);
  };

  return (
    <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-black">
      {/* HTML5 QR Code Video Viewport */}
      <div
        id={readerIdRef.current}
        className="w-full aspect-[4/3] max-h-[360px] sm:max-h-[420px] overflow-hidden bg-black flex items-center justify-center"
      />

      {/* Permission Denied State */}
      {status === 'permission_denied' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/95 p-6 text-center text-white backdrop-blur-xs">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 mb-3 border border-rose-500/30">
            <ShieldAlert size={30} />
          </div>
          <h4 className="text-base font-bold text-white mb-1">
            ត្រូវការការអនុញ្ញាតប្រើកាមេរ៉ា
          </h4>
          <p className="text-xs text-slate-300 max-w-xs mb-5 leading-relaxed">
            Camera access is required to scan barcodes. Please allow camera permission in your browser settings.
          </p>
          {onSwitchToManual && (
            <button
              type="button"
              onClick={onSwitchToManual}
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition active:scale-95 cursor-pointer"
            >
              វាយបញ្ចូល Barcode ដោយផ្ទាល់ (Manual Entry)
            </button>
          )}
        </div>
      )}

      {/* No Camera Found State */}
      {status === 'no_camera' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/95 p-6 text-center text-white backdrop-blur-xs">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 mb-3 border border-amber-500/30">
            <AlertCircle size={30} />
          </div>
          <h4 className="text-base font-bold text-white mb-1">
            រកមិនឃើញឧបករណ៍កាមេរ៉ា
          </h4>
          <p className="text-xs text-slate-300 max-w-xs mb-5 leading-relaxed">
            No camera device detected on this system. You can use manual entry or a hardware USB scanner.
          </p>
          {onSwitchToManual && (
            <button
              type="button"
              onClick={onSwitchToManual}
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition active:scale-95 cursor-pointer"
            >
              វាយបញ្ចូល Barcode ដោយផ្ទាល់ (Manual Entry)
            </button>
          )}
        </div>
      )}

      {/* General Camera Error */}
      {status === 'error' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/95 p-6 text-center text-white backdrop-blur-xs">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 mb-3 border border-rose-500/30">
            <AlertCircle size={30} />
          </div>
          <h4 className="text-base font-bold text-white mb-1">
            មានបញ្ហាក្នុងការបើកកាមេរ៉ា
          </h4>
          <p className="text-xs text-slate-300 max-w-xs mb-4 leading-relaxed">
            {errorMessage || 'Something went wrong while initializing the camera.'}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveCameraId(activeCameraId ? null : 'environment')}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
            >
              ព្យាយាមម្តងទៀត (Retry)
            </button>
            {onSwitchToManual && (
              <button
                type="button"
                onClick={onSwitchToManual}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition"
              >
                វាយបញ្ចូល Barcode
              </button>
            )}
          </div>
        </div>
      )}

      {/* Camera Initializing Spinner */}
      {status === 'initializing' && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/85 text-white">
          <RefreshCw size={28} className="animate-spin text-emerald-400 mb-2.5" />
          <p className="text-xs font-semibold text-slate-200">
            កំពុងបើកកាមេរ៉ា...
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Initializing camera preview...
          </p>
        </div>
      )}

      {/* Viewfinder Target Reticle Overlay when Camera is Active */}
      {status === 'ready' && (
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center">
          {/* Central Target Box with Corner Brackets & Laser */}
          <div
            className={`relative w-[78%] max-w-[320px] h-[160px] sm:h-[180px] rounded-2xl border-2 transition-all duration-150 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] ${
              justScanned
                ? 'border-emerald-400 bg-emerald-500/20 shadow-[0_0_20px_rgba(52,211,153,0.8),0_0_0_9999px_rgba(0,0,0,0.45)] scale-[1.02]'
                : 'border-emerald-400/40'
            }`}
          >
            {/* Corner Indicators */}
            <div className="absolute -top-1 -left-1 h-5 w-5 rounded-tl-lg border-t-3 border-l-3 border-emerald-400" />
            <div className="absolute -top-1 -right-1 h-5 w-5 rounded-tr-lg border-t-3 border-r-3 border-emerald-400" />
            <div className="absolute -bottom-1 -left-1 h-5 w-5 rounded-bl-lg border-b-3 border-l-3 border-emerald-400" />
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-br-lg border-b-3 border-r-3 border-emerald-400" />

            {/* Subtle Crosshair Guide in center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-40">
              <div className="absolute top-0 bottom-0 left-1/2 w-[1.5px] -translate-x-1/2 bg-emerald-300" />
              <div className="absolute left-0 right-0 top-1/2 h-[1.5px] -translate-y-1/2 bg-emerald-300" />
            </div>

            {/* Red / Emerald Laser Scan Line */}
            <div className="absolute inset-x-2 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_8px_rgba(244,63,94,0.9)] animate-scanner-laser" />
          </div>

          {/* Guide Prompt Text with Supermarket Ready Status */}
          <div className="mt-3.5 flex items-center gap-1.5 rounded-full bg-black/75 px-3.5 py-1 text-[11px] font-semibold text-slate-200 backdrop-blur-md shadow-sm border border-white/10">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>🟢 កំពុងស្កេន (Ready for next scan)</span>
          </div>
        </div>
      )}

      {/* Floating Camera Controls (Switch Camera / Torch) */}
      {status === 'ready' && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
          {hasTorch && (
            <button
              type="button"
              onClick={toggleTorch}
              className={`flex h-9 w-9 items-center justify-center rounded-xl backdrop-blur-md transition active:scale-90 ${
                torchOn
                  ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/40'
                  : 'bg-black/60 text-white hover:bg-black/80'
              }`}
              title={torchOn ? 'បិទពិល (Torch Off)' : 'បើកពិល (Torch On)'}
            >
              {torchOn ? <Zap size={16} /> : <ZapOff size={16} />}
            </button>
          )}

          {cameras && cameras.length > 1 && (
            <button
              type="button"
              onClick={switchCamera}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/60 text-white backdrop-blur-md hover:bg-black/80 transition active:scale-90"
              title="ប្តូរកាមេរ៉ា (Switch Camera)"
            >
              <RefreshCw size={15} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
