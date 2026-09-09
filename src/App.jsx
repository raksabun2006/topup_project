import AppRoutes from './routes/AppRoutes';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { GlobalScannerProvider } from './context/GlobalScannerContext';
import GlobalBarcodeScanner from './components/pos/GlobalBarcodeScanner';
import CreativeWelcomeLoader from './components/welcome/CreativeWelcomeLoader';

export default function App() {
  return (
    <ErrorBoundary>
      <GlobalScannerProvider>
        <CreativeWelcomeLoader />
        <AppRoutes />
        <GlobalBarcodeScanner />
      </GlobalScannerProvider>
    </ErrorBoundary>
  );
}