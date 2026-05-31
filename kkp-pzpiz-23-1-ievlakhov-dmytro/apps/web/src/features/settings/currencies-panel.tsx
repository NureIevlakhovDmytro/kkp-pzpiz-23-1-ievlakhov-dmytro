'use client';
import { useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { CurrencyDto } from '@app/shared';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataTable, type Column } from '@/components/data/data-table';
import { ConfirmDialog } from '@/components/data/confirm-dialog';
import { ApiError } from '@/lib/api-client';
import { useCurrencies } from '@/lib/use-currencies';
import { useCurrencyMutations } from './use-settings';

export function CurrenciesPanel() {
  const { t } = useTranslation();
  const { items, isLoading } = useCurrencies();
  const { create, update, remove } = useCurrencyMutations();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CurrencyDto | null>(null);
  const [toDelete, setToDelete] = useState<CurrencyDto | null>(null);
  const [form, setForm] = useState({ code: '', name: '', symbol: '' });

  async function onSubmit() {
    try {
      if (editing) {
        await update.mutateAsync({
          id: editing.id,
          body: { name: form.name, symbol: form.symbol || undefined },
        });
      } else {
        await create.mutateAsync({
          code: form.code.toUpperCase(),
          name: form.name,
          symbol: form.symbol || undefined,
        });
      }
      toast.success(t('common.save'));
      setForm({ code: '', name: '', symbol: '' });
      setEditing(null);
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Error');
    }
  }

  async function onDelete() {
    if (!toDelete) return;
    try {
      await remove.mutateAsync(toDelete.id);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Error');
    }
    setToDelete(null);
  }

  const columns: Column<CurrencyDto>[] = [
    { key: 'code', header: t('settings.code'), cell: (c) => <span className="nums">{c.code}</span> },
    { key: 'name', header: t('settings.name'), cell: (c) => c.name },
    { key: 'symbol', header: t('settings.symbol'), cell: (c) => c.symbol ?? '—' },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      cell: (c) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditing(c);
              setForm({ code: c.code, name: c.name, symbol: c.symbol ?? '' });
              setOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-danger" onClick={() => setToDelete(c)}>
            {t('settings.delete')}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setForm({ code: '', name: '', symbol: '' });
            setOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('settings.newCurrency')}
        </Button>
      </div>
      <DataTable columns={columns} rows={items} loading={isLoading} empty={t('common.empty')} />
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
            <DialogTitle>{editing ? t('common.edit') : t('settings.newCurrency')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>{t('settings.code')}</Label>
              <Input
                maxLength={3}
                disabled={!!editing}
                value={form.code}
                onChange={(e) => setForm((s) => ({ ...s, code: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t('settings.name')}</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t('settings.symbol')}</Label>
              <Input
                value={form.symbol}
                onChange={(e) => setForm((s) => ({ ...s, symbol: e.target.value }))}
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
                  !form.code || !form.name || create.isPending || update.isPending
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
        title={t('settings.deleteCurrencyConfirm')}
        confirmLabel={t('settings.delete')}
        onConfirm={() => void onDelete()}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
