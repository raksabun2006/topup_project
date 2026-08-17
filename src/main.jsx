import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);