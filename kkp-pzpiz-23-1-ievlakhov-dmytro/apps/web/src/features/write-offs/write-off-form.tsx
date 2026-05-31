'use client';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { EntitySelect } from '@/components/data/entity-select';
import { LinesEditor } from '@/components/data/lines-editor';
import { ApiError } from '@/lib/api-client';
import { useLookups } from '@/lib/use-lookups';
import { today } from '@/lib/date';
import { useWriteOffMutations, useWriteOffReasons } from './use-write-offs';
import { writeOffsApi, type WriteOffInput } from './write-offs.api';

interface FormValues { date: string; reasonId: string; comment: string; lines: { batchId: string; locationId: string; quantity: number }[]; }

export function WriteOffForm({ open, onClose, batches }: { open: boolean; onClose: () => void; batches: { value: string; label: string }[] }) {
  const { t } = useTranslation();
  const { products, locations } = useLookups();
  const { data: reasons } = useWriteOffReasons();
  const { post } = useWriteOffMutations();
  const { register, control, handleSubmit, watch, setValue, reset } = useForm<FormValues>({
    defaultValues: { date: today(), reasonId: '', comment: '', lines: [{ batchId: '', locationId: '', quantity: 0 }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'lines' });
  const [fefo, setFefo] = useState({ productId: '', locationId: '', quantity: '10' });

  async function runFefo() {
    if (!fefo.productId || !fefo.locationId) return;
    const res = await writeOffsApi.fefo(fefo.productId, fefo.locationId, Number(fefo.quantity));
    if (res.allocations.length === 0) {
      toast.warning(`${t('writeOffs.shortfallWarn')}: ${res.shortfall}`);
      return;
    }
    setValue('lines', res.allocations.map((a) => ({ batchId: a.batchId, locationId: fefo.locationId, quantity: a.allocated })));
    if (res.shortfall > 0) toast.warning(`${t('writeOffs.shortfallWarn')}: ${res.shortfall}`);
  }

  async function onSubmit(values: FormValues) {
    if (!values.reasonId) { toast.error(t('writeOffs.reason')); return; }
    const body: WriteOffInput = { date: values.date, reasonId: values.reasonId, comment: values.comment || undefined, lines: values.lines.filter((l) => l.batchId && l.locationId && l.quantity > 0) };
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
        <DialogHeader><DialogTitle>{t('writeOffs.new')}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>{t('writeOffs.date')}</Label><Input type="date" {...register('date')} /></div>
            <div className="space-y-1.5">
              <Label>{t('writeOffs.reason')} *</Label>
              <EntitySelect value={watch('reasonId')} onChange={(v) => setValue('reasonId', v)} placeholder="—"
                options={(reasons ?? []).map((r) => ({ value: r.id, label: r.nameUk }))} />
            </div>
          </div>
          <div className="space-y-1.5"><Label>{t('writeOffs.comment')}</Label><Textarea {...register('comment')} rows={2} /></div>

          <div className="rounded-md border border-info/40 bg-info/5 p-3">
            <p className="mb-2 text-sm font-medium text-info">{t('writeOffs.fefoHelper')}</p>
            <div className="grid gap-2 sm:grid-cols-4">
              <EntitySelect value={fefo.productId} onChange={(v) => setFefo((s) => ({ ...s, productId: v }))} placeholder={t('writeOffs.product')} options={products.map((p) => ({ value: p.id, label: p.name }))} />
              <EntitySelect value={fefo.locationId} onChange={(v) => setFefo((s) => ({ ...s, locationId: v }))} placeholder={t('writeOffs.location')} options={locations.map((l) => ({ value: l.id, label: l.name }))} />
              <Input type="number" className="nums" value={fefo.quantity} onChange={(e) => setFefo((s) => ({ ...s, quantity: e.target.value }))} />
              <Button type="button" variant="secondary" onClick={() => void runFefo()} disabled={!fefo.productId || !fefo.locationId}>{t('writeOffs.fill')}</Button>
            </div>
          </div>

          <LinesEditor
            count={fields.length}
            onAdd={() => append({ batchId: '', locationId: '', quantity: 0 })}
            onRemove={remove}
            addLabel={t('writeOffs.addLine')}
            renderRow={(i) => (
              <>
                <EntitySelect value={watch(`lines.${i}.batchId`)} onChange={(v) => setValue(`lines.${i}.batchId`, v)} placeholder={t('writeOffs.batch')} options={batches} />
                <EntitySelect value={watch(`lines.${i}.locationId`)} onChange={(v) => setValue(`lines.${i}.locationId`, v)} placeholder={t('writeOffs.location')} options={locations.map((l) => ({ value: l.id, label: l.name }))} />
                <Input type="number" step="0.001" className="nums" placeholder={t('writeOffs.quantity')} {...register(`lines.${i}.quantity`, { valueAsNumber: true })} />
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
