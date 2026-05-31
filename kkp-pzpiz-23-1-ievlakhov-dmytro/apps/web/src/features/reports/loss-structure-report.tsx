'use client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, type Column } from '@/components/data/data-table';
import { StatusBadge } from '@/components/data/status-badge';
import { today, daysAgo } from '@/lib/date';
import { useLossStructure } from './use-reports';
import type { LossStructureRowDto } from '@app/shared';

export function LossStructureReport() {
  const { t, i18n } = useTranslation();
  const [from, setFrom] = useState(daysAgo(30));
  const [to, setTo] = useState(today());
  const [range, setRange] = useState<{ from: string; to: string } | null>({
    from: daysAgo(30),
    to: today(),
  });
  const { data, isLoading } = useLossStructure(range?.from ?? '', range?.to ?? '', !!range);

  const label = (r: LossStructureRowDto) => (i18n.language === 'en' ? r.nameEn : r.nameUk);
  const rows = data?.rows ?? [];
  const chartData = rows.map((r) => ({ name: label(r), value: r.totalBase }));

  const columns: Column<LossStructureRowDto>[] = [
    { key: 'reason', header: t('reports.reason'), cell: (r) => label(r) },
    {
      key: 'amount',
      header: t('reports.amount'),
      className: 'text-right',
      cell: (r) => <span className="nums">{r.totalBase}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label>{t('reports.from')}</Label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>{t('reports.to')}</Label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <Button onClick={() => setRange({ from, to })}>{t('reports.build')}</Button>
      </div>
      {data?.rateMissing && (
        <StatusBadge tone="warning">{t('reports.rateMissing')}</StatusBadge>
      )}
      {isLoading ? (
        <p className="text-muted-foreground">{t('common.loading')}</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('reports.noData')}</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('reports.lossStructure')}</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    contentStyle={{
                      background: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 8,
                      color: 'hsl(var(--popover-foreground))',
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t('reports.total')}: <span className="nums">{data?.total}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} rows={rows} getRowKey={(r) => r.reasonId} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
