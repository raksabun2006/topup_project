import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authClient } from '../config/authClient';
import { usersApi } from '../api/userApi';

const AuthContext = createContext(null);

function buildUserObject(profileData = {}, fallbackClaims = {}) {
  const role = profileData.role || fallbackClaims.role || 'USER';
  const roles = Array.isArray(profileData.roles)
    ? [...profileData.roles]
    : (fallbackClaims.roles || (fallbackClaims.realm_access?.roles ? [...fallbackClaims.realm_access.roles] : [role]));

  if (role && !roles.includes(role)) {
    roles.push(role);
  }

  return {
    keycloakId: profileData.keycloakId || fallbackClaims.sub || fallbackClaims.id || '',
    sub: profileData.keycloakId || fallbackClaims.sub || fallbackClaims.id || '',
    id: profileData.id || profileData.keycloakId || fallbackClaims.id || fallbackClaims.sub || '',
    username: profileData.username || fallbackClaims.username || fallbackClaims.preferred_username || '',
    email: profileData.email || fallbackClaims.email || '',
    displayName: profileData.displayName || fallbackClaims.displayName || fallbackClaims.name || profileData.username || '',
    name: profileData.displayName || fallbackClaims.name || fallbackClaims.displayName || profileData.username || '',
    phoneNumber: profileData.phoneNumber || fallbackClaims.phoneNumber || '',
    avatarUrl: profileData.avatarUrl || fallbackClaims.avatarUrl || '',
    status: profileData.status || 'ACTIVE',
    role,
    roles,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Sync profile details from /users/me
  const refreshProfile = useCallback(async () => {
    try {
      const me = await usersApi.me();
      if (me) {
        setUser((prev) => buildUserObject(me, prev || {}));
        return me;
      }
    } catch (err) {
      console.warn('Failed to refresh user profile:', err);
      // If token is invalid / 401, trigger session expired
      if (err.response?.status === 401) {
        authClient.triggerSessionExpired();
      }
    }
    return null;
  }, []);

  // Restore session and hydrate current user on initial load / refresh
  useEffect(() => {
    authClient.setOnSessionExpired(() => {
      setIsAuthenticated(false);
      setUser(null);
    });

    const initAuth = async () => {
      try {
        const claims = await authClient.restoreSession();
        if (claims) {
          setIsAuthenticated(true);
          const initialUser = buildUserObject({}, claims);
          setUser(initialUser);

          // Hydrate user profile from GET /users/me
          try {
            const profile = await usersApi.me();
            if (profile) {
              setUser(buildUserObject(profile, claims));
            }
          } catch (profileErr) {
            console.warn('Could not fetch user profile on init:', profileErr);
            if (profileErr.response?.status === 401) {
              authClient.triggerSessionExpired();
            }
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (err) {
        console.error('Session initialization error:', err);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (username, password) => {
    const claims = await authClient.login(username, password);
    setIsAuthenticated(true);
    const initialUser = buildUserObject({}, claims);
    setUser(initialUser);

    try {
      const profile = await usersApi.me();
      if (profile) {
        setUser(buildUserObject(profile, claims));
      }
    } catch {
      // Profile fetch can fallback to login claims
    }
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
    refreshProfile,
    isAuthenticated,
    isAdmin: !!(user?.role === 'ADMIN' || user?.roles?.includes('ADMIN')),
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
