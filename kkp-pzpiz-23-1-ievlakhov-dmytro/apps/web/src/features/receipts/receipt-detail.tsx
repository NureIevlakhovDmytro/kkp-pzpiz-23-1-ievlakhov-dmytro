'use client';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import type { ReceiptDto } from '@app/shared';
import { DocumentStatus } from '@app/shared';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DocStatusBadge } from '@/components/data/doc-status-badge';
import { ReverseButton } from '@/components/data/reverse-button';
import { DataTable, type Column } from '@/components/data/data-table';
import { useLookups } from '@/lib/use-lookups';
import { useCurrencies } from '@/lib/use-currencies';
import { useReceiptMutations } from './use-receipts';
import { receiptsApi } from './receipts.api';

export function ReceiptDetail({ doc, onClose }: { doc: ReceiptDto | null; onClose: () => void }) {
  const { t } = useTranslation();
  const { productName } = useLookups();
  const { currencyName } = useCurrencies();
  const { reverse } = useReceiptMutations();
  const { data: full } = useQuery({
    queryKey: ['receipts', doc?.id],
    queryFn: () => receiptsApi.get(doc!.id),
    enabled: !!doc,
  });
  if (!doc) return null;
  const lines = full?.lines ?? [];
  const columns: Column<ReceiptDto['lines'][number]>[] = [
    { key: 'productId', header: t('receipts.product'), cell: (l) => productName[l.productId] ?? '—' },
    {
      key: 'batchNumber',
      header: t('receipts.batchNumber'),
      cell: (l) => <span className="nums">{l.batchNumber}</span>,
    },
    {
      key: 'expiryDate',
      header: t('receipts.expiry'),
      cell: (l) => <span className="nums">{l.expiryDate ?? '—'}</span>,
    },
    {
      key: 'quantity',
      header: t('receipts.quantity'),
      className: 'text-right',
      cell: (l) => <span className="nums">{l.quantity}</span>,
    },
    {
      key: 'unitCost',
      header: t('receipts.unitCost'),
      className: 'text-right',
      cell: (l) => (
        <span className="nums">
          {l.unitCost} {currencyName[l.currencyId] ?? ''}
        </span>
      ),
    },
  ];
  return (
    <Dialog open={!!doc} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="nums">{doc.number}</span>
            <DocStatusBadge
              status={doc.status}
              labels={{ posted: t('receipts.posted'), reversed: t('receipts.reversed') }}
            />
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            <span className="nums">{doc.date}</span>
          </div>
          <DataTable columns={columns} rows={lines} />
          {doc.status === DocumentStatus.POSTED && (
            <div className="flex justify-end">
              <ReverseButton
                label={t('receipts.reverse')}
                confirmTitle={t('receipts.reverseConfirm')}
                onReverse={async () => {
                  await reverse.mutateAsync(doc.id);
                  onClose();
                }}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
