'use client';
import { useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
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
  const { create, update, remove } = useRateMutations();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ExchangeRateDto | null>(null);
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [form, setForm] = useState({
    currencyId: '',
    rateToBase: 0,
    effectiveDate: today(),
  });

  async function onSubmit() {
    try {
      if (editing) {
        await update.mutateAsync({
          id: editing.id,
          body: { rateToBase: Number(form.rateToBase), effectiveDate: form.effectiveDate },
        });
      } else {
        await create.mutateAsync({
          currencyId: form.currencyId,
          rateToBase: Number(form.rateToBase),
          effectiveDate: form.effectiveDate,
        });
      }
      toast.success(t('common.save'));
      setEditing(null);
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
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditing(r);
              setForm({
                currencyId: r.currencyId,
                rateToBase: r.rateToBase,
                effectiveDate: r.effectiveDate,
              });
              setOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-danger"
            onClick={() => setToDelete(r.id)}
          >
            {t('settings.delete')}
          </Button>
        </div>
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
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setForm({ currencyId: '', rateToBase: 0, effectiveDate: today() });
            setOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('settings.newRate')}
        </Button>
      </div>
      <DataTable columns={columns} rows={data?.items ?? []} loading={isLoading} empty={t('common.empty')} />
      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (!o) {
            setOpen(false);
            setEditing(null);
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing ? t('common.edit') : t('settings.newRate')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>{t('settings.filterCurrency')}</Label>
              <EntitySelect
                value={form.currencyId}
                onChange={(v) => setForm((s) => ({ ...s, currencyId: v }))}
                options={currencyOptions}
                disabled={!!editing}
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
              <Button
                variant="ghost"
                onClick={() => {
                  setOpen(false);
                  setEditing(null);
                }}
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={() => void onSubmit()}
                disabled={
                  !form.currencyId ||
                  !(form.rateToBase > 0) ||
                  create.isPending ||
                  update.isPending
                }
              >
                {editing ? t('common.save') : t('common.create')}
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
