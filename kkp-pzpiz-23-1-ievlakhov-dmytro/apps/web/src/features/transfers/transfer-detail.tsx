'use client';
import { useTranslation } from 'react-i18next';
import type { TransferDto } from '@app/shared';
import { DocumentStatus } from '@app/shared';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DocStatusBadge } from '@/components/data/doc-status-badge';
import { ReverseButton } from '@/components/data/reverse-button';
import { DataTable, type Column } from '@/components/data/data-table';
import { useLookups } from '@/lib/use-lookups';
import { useTransferMutations } from './use-transfers';

export function TransferDetail({ doc, onClose }: { doc: TransferDto | null; onClose: () => void }) {
  const { t } = useTranslation();
  const { locationName } = useLookups();
  const { reverse } = useTransferMutations();
  if (!doc) return null;
  const columns: Column<TransferDto['lines'][number]>[] = [
    { key: 'batchId', header: t('transfers.batch'), cell: (l) => <span className="nums">{l.batchId.slice(0, 8)}…</span> },
    { key: 'quantity', header: t('transfers.quantity'), className: 'text-right', cell: (l) => <span className="nums">{l.quantity}</span> },
  ];
  return (
    <Dialog open={!!doc} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle className="flex items-center gap-3"><span className="nums">{doc.number}</span><DocStatusBadge status={doc.status} labels={{ posted: t('transfers.posted'), reversed: t('transfers.reversed') }} /></DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            <span className="nums">{doc.date}</span> · {locationName[doc.fromLocationId] ?? '—'} → {locationName[doc.toLocationId] ?? '—'}
          </div>
          <DataTable columns={columns} rows={doc.lines} />
          {doc.status === DocumentStatus.POSTED && (
            <div className="flex justify-end">
              <ReverseButton label={t('transfers.reverse')} confirmTitle={t('transfers.reverseConfirm')} onReverse={async () => { await reverse.mutateAsync(doc.id); onClose(); }} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
