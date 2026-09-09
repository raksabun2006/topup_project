import AppRoutes from './routes/AppRoutes';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { GlobalScannerProvider } from './context/GlobalScannerContext';
import GlobalBarcodeScanner from './components/pos/GlobalBarcodeScanner';

export default function App() {
  return (
    <ErrorBoundary>
      <GlobalScannerProvider>
        <AppRoutes />
        <GlobalBarcodeScanner />
      </GlobalScannerProvider>
    </ErrorBoundary>
  );
}