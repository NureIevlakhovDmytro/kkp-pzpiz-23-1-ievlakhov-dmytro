'use client';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/data/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const { t } = useTranslation();
  return (
    <>
      <PageHeader title={t('nav.dashboard')} description={t('dashboard.subtitle')} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {['lowStock', 'nearExpiry', 'recentOps'].map((k) => (
          <Card key={k}>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">{t(`dashboard.${k}`)}</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="nums text-3xl">—</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
