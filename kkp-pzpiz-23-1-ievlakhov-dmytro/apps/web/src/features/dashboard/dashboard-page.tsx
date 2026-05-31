'use client';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/data/page-header';
import { useDashboard } from './use-dashboard';

export function DashboardPage() {
  const { t } = useTranslation();
  const { low, expiring, recentWriteOffs } = useDashboard();

  return (
    <>
      <PageHeader title={t('nav.dashboard')} description={t('dashboard.subtitle')} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-danger/40">
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-sm text-muted-foreground">{t('dashboard.criticalStock')}</CardTitle><AlertTriangle className="h-4 w-4 text-danger" /></CardHeader>
          <CardContent><span className="nums text-3xl text-danger">{low.data?.length ?? '—'}</span> <span className="text-sm text-muted-foreground">{t('dashboard.units')}</span></CardContent>
        </Card>
        <Card className="border-warning/40">
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-sm text-muted-foreground">{t('dashboard.nearExpiry')}</CardTitle><Clock className="h-4 w-4 text-[hsl(var(--warning))]" /></CardHeader>
          <CardContent><span className="nums text-3xl text-[hsl(var(--warning))]">{expiring.data?.length ?? '—'}</span> <span className="text-sm text-muted-foreground">{t('dashboard.batches')}</span></CardContent>
        </Card>
      </div>
      <Card className="mt-4">
        <CardHeader><CardTitle className="text-base">{t('dashboard.recentWriteOffs')}</CardTitle></CardHeader>
        <CardContent>
          {(recentWriteOffs.data?.items.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">{t('dashboard.noData')}</p>
          ) : (
            <ul className="divide-y divide-border/60">
              {recentWriteOffs.data?.items.map((w) => (
                <li key={w.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="nums">{w.number}</span>
                  <span className="nums text-muted-foreground">{w.date}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}
