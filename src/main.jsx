import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import App from './App.jsx';
import './index.css';

/**
 * លំដាប់សំខាន់: BrowserRouter ត្រូវនៅខាងក្រៅ AuthProvider ព្រោះ
 * ProtectedRoute ប្រើ useNavigate និង useLocation ដែលត្រូវការ
 * router context។
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);