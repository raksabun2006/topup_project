import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authClient } from '../config/authClient';

const AuthContext = createContext(null);

function userFromClaims(claims) {
  if (!claims) return null;
  return {
    sub: claims.sub,
    username: claims.preferred_username,
    email: claims.email,
    name: claims.name,
    roles: claims.realm_access?.roles ?? [],
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // loading ចាំបាច់ណាស់: ដោយគ្មានវា ProtectedRoute បញ្ជូនអ្នកប្រើ
  // ទៅ /login មួយភ្លែតមុនពេល restoreSession() ដឹងថាមាន refresh token ចាស់។
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authClient.setOnSessionExpired(() => {
      setIsAuthenticated(false);
      setUser(null);
    });

    authClient
      .restoreSession()
      .then((claims) => {
        setIsAuthenticated(!!claims);
        setUser(userFromClaims(claims));
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username, password) => {
    const claims = await authClient.login(username, password);
    setIsAuthenticated(true);
    setUser(userFromClaims(claims));
  }, []);

  const logout = useCallback(async () => {
    await authClient.logout();
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
    isAdmin: !!user?.roles.includes('ADMIN'),
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
