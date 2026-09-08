import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { env } from '../../config/env';

export default function GoogleLoginButton({
  onSuccess,
  onError,
  disabled = false,
  text = 'Continue with Google',
}) {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const hiddenBtnContainerRef = useRef(null);

  const clientId = env.googleClientId;

  // Dynamically load Google Identity Services client script
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.google?.accounts?.id) {
      setScriptLoaded(true);
      return;
    }

    const existingScript = document.getElementById('google-gsi-client');
    if (existingScript) {
      existingScript.addEventListener('load', () => setScriptLoaded(true));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-client';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      console.warn('Failed to load Google Identity Services SDK');
    };
    document.head.appendChild(script);
  }, []);

  // Initialize Google Identity Services when script & clientId are ready
  useEffect(() => {
    if (!scriptLoaded || !clientId || !window.google?.accounts?.id) return;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          if (!response?.credential) {
            onError?.('Google sign in was cancelled.');
            return;
          }

          setLoading(true);
          try {
            await onSuccess?.(response.credential);
          } catch (err) {
            onError?.(err);
          } finally {
            setLoading(false);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Render official Google button into hidden container to trigger native popup reliably
      if (hiddenBtnContainerRef.current) {
        window.google.accounts.id.renderButton(hiddenBtnContainerRef.current, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
        });
      }
    } catch (e) {
      console.warn('Google Identity initialization error:', e);
    }
  }, [scriptLoaded, clientId, onSuccess, onError]);

  const handleCustomClick = () => {
    if (disabled || loading) return;

    if (!clientId || clientId.includes('your-google-client-id')) {
      onError?.('Google Client ID is not configured. Please add VITE_GOOGLE_CLIENT_ID to your .env file.');
      return;
    }

    if (!window.google?.accounts?.id) {
      onError?.('Google Sign-In is initializing. Please try again in a moment.');
      return;
    }

    try {
      // First attempt: click the native rendered Google button inside hidden container
      if (hiddenBtnContainerRef.current) {
        const nativeBtn = hiddenBtnContainerRef.current.querySelector('div[role="button"]');
        if (nativeBtn) {
          nativeBtn.click();
          return;
        }
      }

      // Fallback: trigger One-Tap prompt
      setLoading(true);
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment() || notification.isDismissedMoment()) {
          setLoading(false);
          const reason = notification.getDismissedReason?.();
          if (reason && reason !== 'credential_returned') {
            onError?.('Google sign in was cancelled.');
          }
        }
      });
    } catch (err) {
      setLoading(false);
      console.error('Error invoking Google Identity Services:', err);
      onError?.('Unable to connect to Google. Please try again.');
    }
  };

  return (
    <div className="w-full relative">
      {/* Hidden container for native Google button to ensure 1-click popup compatibility */}
      <div ref={hiddenBtnContainerRef} className="hidden" aria-hidden="true" tabIndex={-1} />

      <button
        type="button"
        onClick={handleCustomClick}
        disabled={disabled || loading}
        aria-label={text}
        className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-2xs hover:shadow-xs transition active:scale-[0.99] disabled:opacity-60 cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin text-blue-600 dark:text-blue-400" />
            <span>Connecting to Google...</span>
          </>
        ) : (
          <>
            {/* Official Multi-colored Google "G" Icon */}
            <svg className="h-4.5 w-4.5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{text}</span>
          </>
        )}
      </button>
    </div>
  );
}
