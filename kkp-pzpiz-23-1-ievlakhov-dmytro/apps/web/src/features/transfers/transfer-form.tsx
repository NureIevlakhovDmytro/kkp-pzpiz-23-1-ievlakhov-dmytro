'use client';
import { useFieldArray, useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import type { BatchDto, Paginated } from '@app/shared';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EntitySelect } from '@/components/data/entity-select';
import { LinesEditor } from '@/components/data/lines-editor';
import { ApiError, apiFetch } from '@/lib/api-client';
import { useLookups } from '@/lib/use-lookups';
import { listQuery } from '@/lib/pagination';
import { today } from '@/lib/date';
import { useTransferMutations } from './use-transfers';
import type { TransferInput } from './transfers.api';

interface FormValues {
  fromLocationId: string;
  toLocationId: string;
  date: string;
  lines: { batchId: string; quantity: number }[];
}

export function TransferForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const { locations } = useLookups();
  const { post } = useTransferMutations();
  const batchesQ = useQuery({ queryKey: ['batches', 'forSelect'], queryFn: () => apiFetch<Paginated<BatchDto>>(`/batches${listQuery()}`) });
  const batchOptions = (batchesQ.data?.items ?? []).map((b) => ({ value: b.id, label: b.batchNumber }));
  const { register, control, handleSubmit, watch, setValue, reset } = useForm<FormValues>({
    defaultValues: { fromLocationId: '', toLocationId: '', date: today(), lines: [{ batchId: '', quantity: 0 }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'lines' });

  async function onSubmit(values: FormValues) {
    if (!values.fromLocationId || !values.toLocationId) { toast.error(t('transfers.from')); return; }
    if (values.fromLocationId === values.toLocationId) { toast.error(t('transfers.sameLocation')); return; }
    const body: TransferInput = {
      fromLocationId: values.fromLocationId, toLocationId: values.toLocationId, date: values.date,
      lines: values.lines.filter((l) => l.batchId && l.quantity > 0).map((l) => ({ batchId: l.batchId, quantity: Number(l.quantity) })),
    };
    if (body.lines.length === 0) { toast.error(t('transfers.batch')); return; }
    try {
      await post.mutateAsync({ body, key: crypto.randomUUID() });
      toast.success(t('common.save'));
      reset();
      onClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Error');
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>{t('transfers.new')}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5"><Label>{t('transfers.date')}</Label><Input type="date" {...register('date')} /></div>
            <div className="space-y-1.5"><Label>{t('transfers.from')} *</Label>
              <EntitySelect value={watch('fromLocationId')} onChange={(v) => setValue('fromLocationId', v)} placeholder="—" options={locations.map((l) => ({ value: l.id, label: l.name }))} /></div>
            <div className="space-y-1.5"><Label>{t('transfers.to')} *</Label>
              <EntitySelect value={watch('toLocationId')} onChange={(v) => setValue('toLocationId', v)} placeholder="—" options={locations.map((l) => ({ value: l.id, label: l.name }))} /></div>
          </div>
          <LinesEditor
            count={fields.length}
            onAdd={() => append({ batchId: '', quantity: 0 })}
            onRemove={remove}
            addLabel={t('transfers.addLine')}
            renderRow={(i) => (
              <>
                <EntitySelect value={watch(`lines.${i}.batchId`)} onChange={(v) => setValue(`lines.${i}.batchId`, v)} placeholder={t('transfers.batch')} options={batchOptions} />
                <Input type="number" step="0.001" className="nums" placeholder={t('transfers.quantity')} {...register(`lines.${i}.quantity`, { valueAsNumber: true })} />
              </>
            )}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
            <Button type="submit" disabled={post.isPending}>{t('common.save')}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
