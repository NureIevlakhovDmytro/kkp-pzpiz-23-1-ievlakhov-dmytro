'use client';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { WriteOffDto, BatchDto, Paginated } from '@app/shared';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/data/page-header';
import { DataTable, type Column } from '@/components/data/data-table';
import { DocStatusBadge } from '@/components/data/doc-status-badge';
import { apiFetch } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';
import { useWriteOffReasons, useWriteOffs } from './use-write-offs';
import { WriteOffForm } from './write-off-form';
import { WriteOffDetail } from './write-off-detail';

export function WriteOffsPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useWriteOffs();
  const { data: reasons } = useWriteOffReasons();
  const batchesQ = useQuery({ queryKey: ['batches', 'forSelect'], queryFn: () => apiFetch<Paginated<BatchDto>>('/batches?limit=300') });
  const [formOpen, setFormOpen] = useState(false);
  const [detail, setDetail] = useState<WriteOffDto | null>(null);

  const reasonName = Object.fromEntries((reasons ?? []).map((r) => [r.id, r.nameUk]));
  const batchOptions = (batchesQ.data?.items ?? []).map((b) => ({ value: b.id, label: b.batchNumber }));

  const columns: Column<WriteOffDto>[] = [
    { key: 'number', header: t('writeOffs.number'), cell: (d) => <button className="nums text-primary hover:underline" onClick={() => setDetail(d)}>{d.number}</button> },
    { key: 'date', header: t('writeOffs.date'), cell: (d) => <span className="nums">{d.date}</span> },
    { key: 'reason', header: t('writeOffs.reason'), cell: (d) => reasonName[d.reasonId] ?? '—' },
    { key: 'status', header: t('writeOffs.status'), cell: (d) => <DocStatusBadge status={d.status} labels={{ posted: t('writeOffs.posted'), reversed: t('writeOffs.reversed') }} /> },
  ];

  return (
    <>
      <PageHeader title={t('writeOffs.title')} description={t('writeOffs.subtitle')}
        actions={<Button onClick={() => setFormOpen(true)}><Plus className="mr-2 h-4 w-4" />{t('writeOffs.new')}</Button>} />
      <DataTable columns={columns} rows={data?.items ?? []} loading={isLoading} empty={t('common.empty')} />
      <WriteOffForm open={formOpen} onClose={() => setFormOpen(false)} batches={batchOptions} />
      <WriteOffDetail doc={detail} onClose={() => setDetail(null)} />
    </>
  );
}
