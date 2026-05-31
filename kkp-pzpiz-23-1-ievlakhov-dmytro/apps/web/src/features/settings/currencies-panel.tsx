'use client';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { CurrencyDto } from '@app/shared';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataTable, type Column } from '@/components/data/data-table';
import { ApiError } from '@/lib/api-client';
import { useCurrencies } from '@/lib/use-currencies';
import { useCurrencyMutations } from './use-settings';

export function CurrenciesPanel() {
  const { t } = useTranslation();
  const { items, isLoading } = useCurrencies();
  const { create } = useCurrencyMutations();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', symbol: '' });

  async function onCreate() {
    try {
      await create.mutateAsync({
        code: form.code.toUpperCase(),
        name: form.name,
        symbol: form.symbol || undefined,
      });
      toast.success(t('common.save'));
      setForm({ code: '', name: '', symbol: '' });
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Error');
    }
  }

  const columns: Column<CurrencyDto>[] = [
    { key: 'code', header: t('settings.code'), cell: (c) => <span className="nums">{c.code}</span> },
    { key: 'name', header: t('settings.name'), cell: (c) => c.name },
    { key: 'symbol', header: t('settings.symbol'), cell: (c) => c.symbol ?? '—' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('settings.newCurrency')}
        </Button>
      </div>
      <DataTable columns={columns} rows={items} loading={isLoading} empty={t('common.empty')} />
      <Dialog open={open} onOpenChange={(o) => !o && setOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('settings.newCurrency')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>{t('settings.code')}</Label>
              <Input
                maxLength={3}
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
              <Button variant="ghost" onClick={() => setOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button
                onClick={() => void onCreate()}
                disabled={!form.code || !form.name || create.isPending}
              >
                {t('common.create')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
