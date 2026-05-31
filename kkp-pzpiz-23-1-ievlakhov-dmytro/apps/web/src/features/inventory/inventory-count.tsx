'use client';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { InventoryStatus } from '@app/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/data/status-badge';
import { ConfirmDialog } from '@/components/data/confirm-dialog';
import { PageHeader } from '@/components/data/page-header';
import { ApiError } from '@/lib/api-client';
import { useInventory, useInventoryMutations, useInventoryReport } from './use-inventory';

export function InventoryCount({ id }: { id: string }) {
  const { t } = useTranslation();
  const { data: inv, isLoading } = useInventory(id);
  const isCompleted = inv?.status === InventoryStatus.COMPLETED;
  const { patch, complete } = useInventoryMutations(id);
  const { data: report } = useInventoryReport(id, !!isCompleted);
  const [actuals, setActuals] = useState<Record<string, string>>({});
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    if (inv) setActuals(Object.fromEntries(inv.lines.map((l) => [l.batchId, l.actualQty === null ? '' : String(l.actualQty)])));
  }, [inv]);

  if (isLoading || !inv) return <p className="text-muted-foreground">{t('common.loading')}</p>;
  const draft = inv.status === InventoryStatus.DRAFT;

  async function save() {
    const counts = inv!.lines
      .filter((l) => actuals[l.batchId] !== '' && actuals[l.batchId] !== undefined)
      .map((l) => ({ batchId: l.batchId, actualQty: Number(actuals[l.batchId]) }));
    try {
      await patch.mutateAsync(counts);
      toast.success(t('common.save'));
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Error');
    }
  }
  async function doComplete() {
    try {
      await complete.mutateAsync();
      toast.success(t('inventory.completed'));
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Error');
    } finally {
      setConfirm(false);
    }
  }

  return (
    <>
      <PageHeader title={`${t('inventory.title')} ${inv.number}`}
        actions={<StatusBadge tone={isCompleted ? 'active' : 'warning'}>{isCompleted ? t('inventory.completed') : t('inventory.draft')}</StatusBadge>} />
      {isCompleted && report && (
        <Card className="mb-4">
          <CardHeader><CardTitle className="text-base">{t('inventory.result')}</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-3 text-sm">
            <StatusBadge tone="danger">{t('inventory.shortages')}: <span className="nums ml-1">{report.shortageCount}</span> · <span className="nums">{report.shortageTotalBase}</span></StatusBadge>
            <StatusBadge tone="info">{t('inventory.surpluses')}: <span className="nums ml-1">{report.surplusCount}</span> · <span className="nums">{report.surplusTotalBase}</span></StatusBadge>
          </CardContent>
        </Card>
      )}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('writeOffs.batch')}</TableHead>
              <TableHead className="text-right">{t('inventory.expected')}</TableHead>
              <TableHead className="text-right">{t('inventory.actual')}</TableHead>
              <TableHead className="text-right">{t('inventory.discrepancy')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inv.lines.map((l) => {
              const actual = actuals[l.batchId];
              const disc = actual === '' || actual === undefined ? null : Number(actual) - l.expectedQty;
              return (
                <TableRow key={l.id}>
                  <TableCell className="nums">{l.batchId.slice(0, 8)}…</TableCell>
                  <TableCell className="nums text-right">{l.expectedQty}</TableCell>
                  <TableCell className="text-right">
                    {draft
                      ? <Input type="number" step="0.001" className="nums ml-auto w-28 text-right" value={actual ?? ''} onChange={(e) => setActuals((s) => ({ ...s, [l.batchId]: e.target.value }))} />
                      : <span className="nums">{l.actualQty ?? '—'}</span>}
                  </TableCell>
                  <TableCell className={`nums text-right ${disc != null && disc < 0 ? 'text-danger' : disc != null && disc > 0 ? 'text-info' : ''}`}>
                    {disc != null ? (disc > 0 ? `+${disc}` : disc) : (l.discrepancy ?? '—')}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {draft && (
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => void save()} disabled={patch.isPending}>{t('inventory.save')}</Button>
          <Button onClick={() => setConfirm(true)} disabled={complete.isPending}>{t('inventory.complete')}</Button>
        </div>
      )}
      <ConfirmDialog open={confirm} title={t('inventory.completeConfirm')} confirmLabel={t('inventory.complete')} onConfirm={() => void doComplete()} onCancel={() => setConfirm(false)} />
    </>
  );
}
