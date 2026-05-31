'use client';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EntitySelect } from '@/components/data/entity-select';
import { LinesEditor } from '@/components/data/lines-editor';
import { ApiError } from '@/lib/api-client';
import { useLookups } from '@/lib/use-lookups';
import { useCurrencies } from '@/lib/use-currencies';
import { useReceiptMutations } from './use-receipts';
import type { ReceiptInput } from './receipts.api';

interface FormValues {
  supplierId: string;
  locationId: string;
  date: string;
  lines: {
    productId: string;
    batchNumber: string;
    expiryDate: string;
    quantity: number;
    unitCost: number;
    currencyId: string;
  }[];
}

export function ReceiptForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const { products, locations, suppliers } = useLookups();
  const { options: currencyOptions, items: currencies } = useCurrencies();
  const { post } = useReceiptMutations();
  const defaultCurrency = currencies[0]?.id ?? '';
  const { register, control, handleSubmit, watch, setValue, reset } = useForm<FormValues>({
    defaultValues: {
      supplierId: '',
      locationId: '',
      date: new Date().toISOString().slice(0, 10),
      lines: [{ productId: '', batchNumber: '', expiryDate: '', quantity: 0, unitCost: 0, currencyId: defaultCurrency }],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'lines' });

  async function onSubmit(values: FormValues) {
    if (!values.locationId) {
      toast.error(t('receipts.location'));
      return;
    }
    const body: ReceiptInput = {
      supplierId: values.supplierId || undefined,
      locationId: values.locationId,
      date: values.date,
      lines: values.lines
        .filter((l) => l.productId && l.batchNumber && l.quantity > 0 && l.currencyId)
        .map((l) => ({
          productId: l.productId,
          batchNumber: l.batchNumber,
          expiryDate: l.expiryDate || undefined,
          quantity: Number(l.quantity),
          unitCost: Number(l.unitCost),
          currencyId: l.currencyId,
        })),
    };
    if (body.lines.length === 0) {
      toast.error(t('receipts.product'));
      return;
    }
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
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('receipts.new')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>{t('receipts.date')}</Label>
              <Input type="date" {...register('date')} />
            </div>
            <div className="space-y-1.5">
              <Label>{t('receipts.location')} *</Label>
              <EntitySelect
                value={watch('locationId')}
                onChange={(v) => setValue('locationId', v)}
                placeholder="—"
                options={locations.map((l) => ({ value: l.id, label: l.name }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t('receipts.supplier')}</Label>
              <EntitySelect
                value={watch('supplierId')}
                onChange={(v) => setValue('supplierId', v)}
                placeholder="—"
                options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
              />
            </div>
          </div>
          <LinesEditor
            count={fields.length}
            onAdd={() =>
              append({ productId: '', batchNumber: '', expiryDate: '', quantity: 0, unitCost: 0, currencyId: defaultCurrency })
            }
            onRemove={remove}
            addLabel={t('receipts.addLine')}
            renderRow={(i) => (
              <div className="grid w-full gap-2 sm:grid-cols-6">
                <EntitySelect
                  value={watch(`lines.${i}.productId`)}
                  onChange={(v) => setValue(`lines.${i}.productId`, v)}
                  placeholder={t('receipts.product')}
                  options={products.map((p) => ({ value: p.id, label: p.name }))}
                />
                <Input placeholder={t('receipts.batchNumber')} {...register(`lines.${i}.batchNumber`)} />
                <Input type="date" {...register(`lines.${i}.expiryDate`)} />
                <Input
                  type="number"
                  step="0.001"
                  className="nums"
                  placeholder={t('receipts.quantity')}
                  {...register(`lines.${i}.quantity`, { valueAsNumber: true })}
                />
                <Input
                  type="number"
                  step="0.01"
                  className="nums"
                  placeholder={t('receipts.unitCost')}
                  {...register(`lines.${i}.unitCost`, { valueAsNumber: true })}
                />
                <EntitySelect
                  value={watch(`lines.${i}.currencyId`)}
                  onChange={(v) => setValue(`lines.${i}.currencyId`, v)}
                  placeholder={t('receipts.currency')}
                  options={currencyOptions}
                />
              </div>
            )}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={post.isPending}>
              {t('common.save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
