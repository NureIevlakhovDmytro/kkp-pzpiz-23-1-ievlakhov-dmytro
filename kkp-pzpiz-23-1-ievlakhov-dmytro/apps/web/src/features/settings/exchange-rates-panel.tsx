'use client';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { ExchangeRateDto } from '@app/shared';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataTable, type Column } from '@/components/data/data-table';
import { EntitySelect } from '@/components/data/entity-select';
import { ConfirmDialog } from '@/components/data/confirm-dialog';
import { ApiError } from '@/lib/api-client';
import { useCurrencies } from '@/lib/use-currencies';
import { today } from '@/lib/date';
import { useRates, useRateMutations } from './use-settings';

const ALL = '__all__';

export function ExchangeRatesPanel() {
  const { t } = useTranslation();
  const { options: currencyOptions, currencyName } = useCurrencies();
  const [filter, setFilter] = useState(ALL);
  const { data, isLoading } = useRates(filter === ALL ? undefined : filter);
  const { create, remove } = useRateMutations();
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [form, setForm] = useState({
    currencyId: '',
    rateToBase: 0,
    effectiveDate: today(),
  });

  async function onCreate() {
    try {
      await create.mutateAsync({
        currencyId: form.currencyId,
        rateToBase: Number(form.rateToBase),
        effectiveDate: form.effectiveDate,
      });
      toast.success(t('common.save'));
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Error');
    }
  }

  const columns: Column<ExchangeRateDto>[] = [
    {
      key: 'currency',
      header: t('settings.filterCurrency'),
      cell: (r) => <span className="nums">{currencyName[r.currencyId] ?? '—'}</span>,
    },
    {
      key: 'rate',
      header: t('settings.rate'),
      className: 'text-right',
      cell: (r) => <span className="nums">{r.rateToBase}</span>,
    },
    {
      key: 'date',
      header: t('settings.effectiveDate'),
      cell: (r) => <span className="nums">{r.effectiveDate}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      cell: (r) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-danger"
          onClick={() => setToDelete(r.id)}
        >
          {t('settings.delete')}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div className="w-48 space-y-1.5">
          <Label>{t('settings.filterCurrency')}</Label>
          <EntitySelect
            value={filter}
            onChange={setFilter}
            options={[{ value: ALL, label: t('notifications.all') }, ...currencyOptions]}
          />
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('settings.newRate')}
        </Button>
      </div>
      <DataTable columns={columns} rows={data?.items ?? []} loading={isLoading} empty={t('common.empty')} />
      <Dialog open={open} onOpenChange={(o) => !o && setOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('settings.newRate')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>{t('settings.filterCurrency')}</Label>
              <EntitySelect
                value={form.currencyId}
                onChange={(v) => setForm((s) => ({ ...s, currencyId: v }))}
                options={currencyOptions}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t('settings.rate')}</Label>
              <Input
                type="number"
                step="0.0001"
                className="nums"
                value={form.rateToBase}
                onChange={(e) => setForm((s) => ({ ...s, rateToBase: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t('settings.effectiveDate')}</Label>
              <Input
                type="date"
                value={form.effectiveDate}
                onChange={(e) => setForm((s) => ({ ...s, effectiveDate: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button
                onClick={() => void onCreate()}
                disabled={!form.currencyId || !(form.rateToBase > 0) || create.isPending}
              >
                {t('common.create')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={!!toDelete}
        title={t('settings.deleteRateConfirm')}
        confirmLabel={t('settings.delete')}
        onConfirm={() => {
          if (toDelete) remove.mutate(toDelete);
          setToDelete(null);
        }}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
