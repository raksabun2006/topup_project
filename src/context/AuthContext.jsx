import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authClient } from '../config/authClient';
import { usersApi } from '../api/userApi';

const AuthContext = createContext(null);

export function normalizeRole(rawRole) {
  if (!rawRole || typeof rawRole !== 'string') return 'CUSTOMER';
  const clean = rawRole.toUpperCase().replace(/^ROLE_/, '').trim();
  if (clean === 'ADMIN') return 'ADMIN';
  if (clean === 'STAFF' || clean === 'MANAGER' || clean === 'CASHIER') return 'STAFF';
  return 'CUSTOMER';
}

export function getRoleDashboardPath(role) {
  const norm = normalizeRole(role);
  if (norm === 'ADMIN') return '/admin/dashboard';
  if (norm === 'STAFF') return '/staff/dashboard';
  return '/customer/dashboard';
}

function buildUserObject(profileData = {}, fallbackClaims = {}) {
  const rawRole = profileData.role || fallbackClaims.role || fallbackClaims.roles?.[0] || 'CUSTOMER';
  const role = normalizeRole(rawRole);
  
  const rawRoles = Array.isArray(profileData.roles)
    ? [...profileData.roles]
    : (fallbackClaims.roles || (fallbackClaims.realm_access?.roles ? [...fallbackClaims.realm_access.roles] : [rawRole]));

  const roles = Array.from(new Set(rawRoles.map(normalizeRole)));
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
    rawRole,
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
        const updatedUser = buildUserObject(profile, claims);
        setUser(updatedUser);
        return updatedUser;
      }
    } catch {
      // Profile fetch can fallback to login claims
    }
    return initialUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      localStorage.removeItem('pos_cart');
      localStorage.removeItem('cart');
      localStorage.removeItem('mart_customer_orders');
    } catch {
      // ignore
    }
    await authClient.logout();
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const role = user?.role || 'CUSTOMER';
  const isAdmin = role === 'ADMIN';
  const isStaff = role === 'STAFF' || role === 'ADMIN';
  const isCustomer = role === 'CUSTOMER';
  const isManagerOrAdmin = isAdmin || user?.rawRole?.toUpperCase()?.includes('MANAGER');

  const token = authClient.getAccessToken();

  // Resolve clean display role name
  const displayRole = isAdmin ? 'Admin' : role === 'STAFF' ? 'Staff' : 'Customer';

  const value = {
    user,
    role,
    token,
    loading,
    login,
    logout,
    refreshProfile,
    isAuthenticated,
    isAdmin,
    isStaff,
    isCustomer,
    isManagerOrAdmin,
    displayRole,
    getDashboardPath: () => getRoleDashboardPath(role),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

