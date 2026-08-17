import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { tokenStorage, setAuthFailureHandler } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // loading ចាំបាច់ណាស់: ដោយគ្មានវា ProtectedRoute បញ្ជូនអ្នកប្រើ
  // ទៅ /login មួយភ្លែតមុនពេល /users/me ត្រឡប់មកវិញ។
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
  }, []);

  // អនុញ្ញាតឱ្យ interceptor ហៅ logout ពេល refresh បរាជ័យ។
  useEffect(() => {
    setAuthFailureHandler(logout);
  }, [logout]);

  // ពេលបើកទំព័រឡើងវិញ token នៅក្នុង localStorage តែ user state
  // ទទេ។ ទាញ profile ដើម្បីស្តារវា។
  useEffect(() => {
    const token = tokenStorage.getAccess();
    if (!token) {
      setLoading(false);
      return;
    }

    authApi.me()
      .then(setUser)
      .catch(() => {
        // Token មិនត្រឹមត្រូវ ឬផុតកំណត់ហើយ refresh ក៏បរាជ័យ។
        tokenStorage.clear();
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    await authApi.login(credentials);
    const profile = await authApi.me();
    setUser(profile);
    return profile;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth ត្រូវប្រើក្នុង AuthProvider');
  }
  return context;
}