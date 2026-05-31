import type { LoginResponse, MeDto } from '@app/shared';
import { router } from 'expo-router';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { apiFetch, setUnauthorizedHandler } from '@/lib/api-client';
import { clearToken, getToken, setToken } from '@/lib/token-store';
import i18n from '@/i18n';

interface AuthState {
  user: MeDto | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MeDto | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!(await getToken())) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await apiFetch<MeDto>('/auth/me');
      setUser(me);
      void i18n.changeLanguage(me.locale);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      router.replace('/(auth)/login');
    });
    // Bootstrap the session on mount; refresh() updates state asynchronously after I/O.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
    return () => setUnauthorizedHandler(null);
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await apiFetch<LoginResponse>('/auth/login', {
        method: 'POST',
        body: { email, password },
        auth: false,
      });
      await setToken(res.token);
      await refresh();
    },
    [refresh],
  );

  const logout = useCallback(async () => {
    await clearToken();
    setUser(null);
    router.replace('/(auth)/login');
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
