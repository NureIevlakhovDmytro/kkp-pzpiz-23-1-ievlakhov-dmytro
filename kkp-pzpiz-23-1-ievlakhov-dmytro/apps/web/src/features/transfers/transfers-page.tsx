'use client';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TransferDto } from '@app/shared';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/data/page-header';
import { DataTable, type Column } from '@/components/data/data-table';
import { DocStatusBadge } from '@/components/data/doc-status-badge';
import { useLookups } from '@/lib/use-lookups';
import { useTransfers } from './use-transfers';
import { TransferForm } from './transfer-form';
import { TransferDetail } from './transfer-detail';

export function TransfersPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useTransfers();
  const { locationName } = useLookups();
  const [formOpen, setFormOpen] = useState(false);
  const [detail, setDetail] = useState<TransferDto | null>(null);

  const columns: Column<TransferDto>[] = [
    { key: 'number', header: t('transfers.number'), cell: (d) => <button className="nums text-primary hover:underline" onClick={() => setDetail(d)}>{d.number}</button> },
    { key: 'date', header: t('transfers.date'), cell: (d) => <span className="nums">{d.date}</span> },
    { key: 'from', header: t('transfers.from'), cell: (d) => locationName[d.fromLocationId] ?? '—' },
    { key: 'to', header: t('transfers.to'), cell: (d) => locationName[d.toLocationId] ?? '—' },
    { key: 'status', header: t('transfers.status'), cell: (d) => <DocStatusBadge status={d.status} labels={{ posted: t('transfers.posted'), reversed: t('transfers.reversed') }} /> },
  ];

  return (
    <>
      <PageHeader title={t('transfers.title')} description={t('transfers.subtitle')}
        actions={<Button onClick={() => setFormOpen(true)}><Plus className="mr-2 h-4 w-4" />{t('transfers.new')}</Button>} />
      <DataTable columns={columns} rows={data?.items ?? []} loading={isLoading} empty={t('common.empty')} />
      <TransferForm open={formOpen} onClose={() => setFormOpen(false)} />
      <TransferDetail doc={detail} onClose={() => setDetail(null)} />
    </>
  );
}
