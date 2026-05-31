'use client';
import { useTranslation } from 'react-i18next';
import type { WriteOffDto } from '@app/shared';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DocStatusBadge } from '@/components/data/doc-status-badge';
import { ReverseButton } from '@/components/data/reverse-button';
import { DataTable, type Column } from '@/components/data/data-table';
import { DocumentStatus } from '@app/shared';
import { useLookups } from '@/lib/use-lookups';
import { useWriteOffMutations } from './use-write-offs';

export function WriteOffDetail({ doc, onClose }: { doc: WriteOffDto | null; onClose: () => void }) {
  const { t } = useTranslation();
  const { locationName } = useLookups();
  const { reverse } = useWriteOffMutations();
  if (!doc) return null;
  const columns: Column<WriteOffDto['lines'][number]>[] = [
    { key: 'batchId', header: t('writeOffs.batch'), cell: (l) => <span className="nums">{l.batchId.slice(0, 8)}…</span> },
    { key: 'locationId', header: t('writeOffs.location'), cell: (l) => locationName[l.locationId] ?? '—' },
    { key: 'quantity', header: t('writeOffs.quantity'), className: 'text-right', cell: (l) => <span className="nums">{l.quantity}</span> },
  ];
  return (
    <Dialog open={!!doc} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle className="flex items-center gap-3"><span className="nums">{doc.number}</span><DocStatusBadge status={doc.status} labels={{ posted: t('writeOffs.posted'), reversed: t('writeOffs.reversed') }} /></DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground"><span className="nums">{doc.date}</span></div>
          <DataTable columns={columns} rows={doc.lines} />
          {doc.status === DocumentStatus.POSTED && (
            <div className="flex justify-end">
              <ReverseButton label={t('writeOffs.reverse')} confirmTitle={t('writeOffs.reverseConfirm')} onReverse={async () => { await reverse.mutateAsync(doc.id); onClose(); }} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
