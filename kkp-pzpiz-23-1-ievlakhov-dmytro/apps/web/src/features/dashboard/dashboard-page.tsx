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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t('dashboard.criticalStock')}</span>
            <span className="rounded-md bg-danger/10 p-1.5 text-danger">
              <AlertTriangle className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 nums text-3xl font-semibold tracking-tight">{low.data?.length ?? '—'}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t('dashboard.units')}</p>
        </div>
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t('dashboard.nearExpiry')}</span>
            <span className="rounded-md bg-warning/10 p-1.5 text-warning">
              <Clock className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 nums text-3xl font-semibold tracking-tight">{expiring.data?.length ?? '—'}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t('dashboard.batches')}</p>
        </div>
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">{t('dashboard.recentWriteOffs')}</CardTitle>
        </CardHeader>
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
