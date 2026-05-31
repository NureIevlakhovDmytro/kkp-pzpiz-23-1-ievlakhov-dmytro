'use client';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ReceiptDto } from '@app/shared';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/data/page-header';
import { DataTable, type Column } from '@/components/data/data-table';
import { DocStatusBadge } from '@/components/data/doc-status-badge';
import { useLookups } from '@/lib/use-lookups';
import { useReceipts } from './use-receipts';
import { ReceiptForm } from './receipt-form';
import { ReceiptDetail } from './receipt-detail';

export function ReceiptsPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useReceipts();
  const { locationName, supplierName } = useLookups();
  const [formOpen, setFormOpen] = useState(false);
  const [detail, setDetail] = useState<ReceiptDto | null>(null);

  const columns: Column<ReceiptDto>[] = [
    {
      key: 'number',
      header: t('receipts.number'),
      cell: (d) => (
        <button className="nums text-primary hover:underline" onClick={() => setDetail(d)}>
          {d.number}
        </button>
      ),
    },
    { key: 'date', header: t('receipts.date'), cell: (d) => <span className="nums">{d.date}</span> },
    {
      key: 'supplier',
      header: t('receipts.supplier'),
      cell: (d) => (d.supplierId ? (supplierName[d.supplierId] ?? '—') : '—'),
    },
    { key: 'location', header: t('receipts.location'), cell: (d) => locationName[d.locationId] ?? '—' },
    {
      key: 'status',
      header: t('receipts.status'),
      cell: (d) => (
        <DocStatusBadge status={d.status} labels={{ posted: t('receipts.posted'), reversed: t('receipts.reversed') }} />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={t('receipts.title')}
        description={t('receipts.subtitle')}
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t('receipts.new')}
          </Button>
        }
      />
      <DataTable columns={columns} rows={data?.items ?? []} loading={isLoading} empty={t('common.empty')} />
      <ReceiptForm open={formOpen} onClose={() => setFormOpen(false)} />
      <ReceiptDetail doc={detail} onClose={() => setDetail(null)} />
    </>
  );
}
