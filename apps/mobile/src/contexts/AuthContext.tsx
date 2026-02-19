import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { User } from '../api/auth';
import * as authApi from '../api/auth';
import { AuthApiError } from '../api/auth';
import * as authStorage from '../lib/authStorage';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  sessionExpired: boolean;
  clearSessionExpired: () => void;
  refreshUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  const refreshSession = useCallback(async () => {
    const tokens = await authStorage.getTokens();
    if (!tokens) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const result = await authApi.check(tokens.accessToken);
      setUser(result.user);
    } catch (err) {
      if (err instanceof AuthApiError && err.status === 401) {
        try {
          const refreshed = await authApi.refresh(tokens.refreshToken);
          await authStorage.storeTokens(refreshed.accessToken, refreshed.refreshToken);
          const checkResult = await authApi.check(refreshed.accessToken);
          setUser(checkResult.user);
        } catch {
          await authStorage.clearTokens();
          setUser(null);
          setSessionExpired(true);
        }
      } else {
        await authStorage.clearTokens();
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await authApi.login(email, password);
      await authStorage.storeTokens(result.accessToken, result.refreshToken);
      setUser(result.user);
    },
    []
  );

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      const result = await authApi.signup(name, email, password);
      await authStorage.storeTokens(result.accessToken, result.refreshToken);
      setUser(result.user);
    },
    []
  );

  const logout = useCallback(async () => {
    await authStorage.clearTokens();
    setUser(null);
    setSessionExpired(false);
  }, []);

  const refreshUser = useCallback(async () => {
    const tokens = await authStorage.getTokens();
    if (!tokens?.accessToken) return;
    try {
      const result = await authApi.check(tokens.accessToken);
      setUser(result.user);
    } catch {
      // Session may have expired; leave user as is to avoid unexpected logout
    }
  }, []);

  const clearSessionExpired = useCallback(() => setSessionExpired(false), []);

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    sessionExpired,
    clearSessionExpired,
    refreshUser,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
