'use client';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import type { InventoryCountDto } from '@app/shared';
import { InventoryStatus } from '@app/shared';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/data/page-header';
import { DataTable, type Column } from '@/components/data/data-table';
import { StatusBadge } from '@/components/data/status-badge';
import { EntitySelect } from '@/components/data/entity-select';
import { ApiError } from '@/lib/api-client';
import { useLookups } from '@/lib/use-lookups';
import { toast } from 'sonner';
import { useInventoryList, useInventoryMutations } from './use-inventory';

export function InventoryPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data, isLoading } = useInventoryList();
  const { locationName, locations } = useLookups();
  const { create } = useInventoryMutations();
  const [open, setOpen] = useState(false);
  const [locationId, setLocationId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  async function onCreate() {
    try {
      const inv = await create.mutateAsync({ locationId, date });
      setOpen(false);
      router.push(`/inventory/${inv.id}`);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Error');
    }
  }

  const columns: Column<InventoryCountDto>[] = [
    { key: 'number', header: t('inventory.number'), cell: (d) => <button className="nums text-primary hover:underline" onClick={() => router.push(`/inventory/${d.id}`)}>{d.number}</button> },
    { key: 'location', header: t('inventory.location'), cell: (d) => locationName[d.locationId] ?? '—' },
    { key: 'date', header: t('inventory.date'), cell: (d) => <span className="nums">{d.date}</span> },
    { key: 'status', header: t('inventory.status'), cell: (d) => <StatusBadge tone={d.status === InventoryStatus.COMPLETED ? 'active' : 'warning'}>{d.status === InventoryStatus.COMPLETED ? t('inventory.completed') : t('inventory.draft')}</StatusBadge> },
  ];

  return (
    <>
      <PageHeader title={t('inventory.title')} description={t('inventory.subtitle')}
        actions={<Button onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" />{t('inventory.new')}</Button>} />
      <DataTable columns={columns} rows={data?.items ?? []} loading={isLoading} empty={t('common.empty')} />
      <Dialog open={open} onOpenChange={(o) => !o && setOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{t('inventory.new')}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>{t('inventory.location')}</Label>
              <EntitySelect value={locationId} onChange={setLocationId} options={locations.map((l) => ({ value: l.id, label: l.name }))} /></div>
            <div className="space-y-1.5"><Label>{t('inventory.date')}</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            <div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setOpen(false)}>{t('common.cancel')}</Button><Button onClick={() => void onCreate()} disabled={!locationId || create.isPending}>{t('common.create')}</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
