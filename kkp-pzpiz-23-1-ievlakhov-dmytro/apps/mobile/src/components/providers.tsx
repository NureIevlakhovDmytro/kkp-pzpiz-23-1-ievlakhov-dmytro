import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AuthProvider } from '@/features/auth/auth-context';
import i18n from '@/i18n';
import { getStoredLang } from '@/lib/lang-store';
import { makeQueryClient } from '@/lib/query-client';

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = useRef(makeQueryClient()).current;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void (async () => {
      const stored = await getStoredLang();
      if (stored) await i18n.changeLanguage(stored);
      setReady(true);
    })();
  }, []);

  if (!ready) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
