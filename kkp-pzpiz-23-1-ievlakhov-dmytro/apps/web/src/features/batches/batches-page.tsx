'use client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { BatchDto } from '@app/shared';
import { PageHeader } from '@/components/data/page-header';
import { DataTable, type Column } from '@/components/data/data-table';
import { StatusBadge } from '@/components/data/status-badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLookups } from '@/lib/use-lookups';
import { useBatches } from './use-batches';

export function BatchesPage() {
  const { t } = useTranslation();
  const { products, productName, supplierName } = useLookups();
  const [productId, setProductId] = useState<string | undefined>();
  const [expired, setExpired] = useState(false);
  const { data, isLoading } = useBatches({ productId, expired });

  const columns: Column<BatchDto>[] = [
    { key: 'batchNumber', header: t('batches.batchNumber'), cell: (b) => <span className="nums">{b.batchNumber}</span> },
    { key: 'product', header: t('batches.product'), cell: (b) => productName[b.productId] ?? b.productId },
    { key: 'expiry', header: t('batches.expiry'), cell: (b) => (
      <span className="flex items-center gap-2">
        <span className="nums">{b.expiryDate ?? '—'}</span>
        {b.isExpired && <StatusBadge tone="danger">{t('batches.expired')}</StatusBadge>}
      </span>
    ) },
    { key: 'received', header: t('batches.received'), cell: (b) => <span className="nums">{b.receivedDate}</span> },
    { key: 'cost', header: t('batches.cost'), className: 'text-right', cell: (b) => <span className="nums">{b.unitCost}</span> },
    { key: 'supplier', header: t('batches.supplier'), cell: (b) => (b.supplierId ? supplierName[b.supplierId] ?? '—' : '—') },
  ];

  return (
    <>
      <PageHeader title={t('batches.title')} description={t('batches.subtitle')} />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Select value={productId ?? 'all'} onValueChange={(v) => setProductId(v === 'all' ? undefined : v)}>
          <SelectTrigger className="w-56"><SelectValue placeholder={t('batches.filterProduct')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('batches.filterProduct')}</SelectItem>
            {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant={expired ? 'default' : 'outline'} size="sm" onClick={() => setExpired((v) => !v)}>{t('batches.onlyExpired')}</Button>
      </div>
      <DataTable columns={columns} rows={data?.items ?? []} loading={isLoading} empty={t('common.empty')} />
    </>
  );
}
