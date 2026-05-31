'use client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InventoryStatus } from '@app/shared';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EntitySelect } from '@/components/data/entity-select';
import { StatusBadge } from '@/components/data/status-badge';
import { useInventoryList, useInventoryReport } from '@/features/inventory/use-inventory';

export function InventoryReport() {
  const { t } = useTranslation();
  const { data: list } = useInventoryList();
  const [id, setId] = useState('');
  const { data: report } = useInventoryReport(id, !!id);
  const completed = (list?.items ?? []).filter((i) => i.status === InventoryStatus.COMPLETED);
  const options = completed.map((i) => ({ value: i.id, label: i.number }));

  return (
    <div className="space-y-4">
      <div className="max-w-sm space-y-1.5">
        <Label>{t('reports.selectInventory')}</Label>
        <EntitySelect value={id} onChange={setId} placeholder="—" options={options} />
      </div>
      {report && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-danger/40">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                {t('reports.shortages')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="nums text-3xl text-danger">{report.shortageCount}</span>
              <div className="text-sm text-muted-foreground">
                {t('reports.shortageTotal')}: <span className="nums">{report.shortageTotalBase}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="border-info/40">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                {t('reports.surpluses')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="nums text-3xl text-info">{report.surplusCount}</span>
              <div className="text-sm text-muted-foreground">
                {t('reports.surplusTotal')}: <span className="nums">{report.surplusTotalBase}</span>
              </div>
            </CardContent>
          </Card>
          {report.rateMissing && (
            <StatusBadge tone="warning">{t('reports.rateMissing')}</StatusBadge>
          )}
        </div>
      )}
    </div>
  );
}
