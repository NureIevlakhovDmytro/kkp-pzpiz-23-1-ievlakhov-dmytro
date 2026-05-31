'use client';
import { useTranslation } from 'react-i18next';
import type { StockLevelDto } from '@app/shared';
import { PageHeader } from '@/components/data/page-header';
import { DataTable, type Column } from '@/components/data/data-table';
import { StatusBadge } from '@/components/data/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLookups } from '@/lib/use-lookups';
import { useLowStock, useStock } from './use-stock';
import { FefoWidget } from './fefo-widget';

export function StockPage() {
  const { t } = useTranslation();
  const { productName, locationName, products, locations } = useLookups();
  const { data: stock, isLoading } = useStock();
  const { data: low } = useLowStock();

  const columns: Column<StockLevelDto>[] = [
    { key: 'product', header: t('batches.product'), cell: (s) => productName[s.productId] ?? s.productId },
    { key: 'location', header: t('stock.location'), cell: (s) => locationName[s.locationId] ?? s.locationId },
    { key: 'quantity', header: t('stock.quantity'), className: 'text-right', cell: (s) => <span className="nums font-medium">{s.quantity}</span> },
    { key: 'expiry', header: t('batches.expiry'), cell: (s) => (
      <span className="flex items-center gap-2"><span className="nums">{s.expiryDate ?? '—'}</span>{s.isExpired && <StatusBadge tone="danger">{t('batches.expired')}</StatusBadge>}</span>
    ) },
  ];

  return (
    <>
      <PageHeader title={t('stock.title')} description={t('stock.subtitle')} />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1 border-warning/40">
          <CardHeader><CardTitle className="text-base text-[hsl(var(--warning))]">{t('stock.lowTitle')}</CardTitle></CardHeader>
          <CardContent>
            {!low || low.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('stock.lowEmpty')}</p>
            ) : (
              <ul className="space-y-2">
                {low.map((l) => (
                  <li key={l.productId} className="flex items-center justify-between text-sm">
                    <span>{l.productName}</span>
                    <span className="nums"><span className="text-danger">{l.totalQuantity}</span> / {l.minStock}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <div className="lg:col-span-2"><FefoWidget products={products} locations={locations} /></div>
      </div>
      <div className="mt-4">
        <DataTable
          columns={columns}
          rows={(stock ?? []).map((s) => ({ ...s, id: `${s.batchId}-${s.locationId}` }))}
          loading={isLoading}
          empty={t('common.empty')}
        />
      </div>
    </>
  );
}
