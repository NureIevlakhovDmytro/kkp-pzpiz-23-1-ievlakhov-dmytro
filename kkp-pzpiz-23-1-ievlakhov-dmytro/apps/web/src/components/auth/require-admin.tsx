'use client';
import type { ReactNode } from 'react';
import { Role } from '@app/shared';
import { useAuth } from '@/features/auth/auth-context';

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (user?.role !== Role.ADMIN) {
    return <p className="text-sm text-muted-foreground">Доступ лише для адміністратора.</p>;
  }
  return <>{children}</>;
}
