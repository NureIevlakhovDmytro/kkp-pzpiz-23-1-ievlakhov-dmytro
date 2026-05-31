'use client';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { EntitySelect } from '@/components/data/entity-select';
import { PageHeader } from '@/components/data/page-header';
import { ApiError } from '@/lib/api-client';
import { useSettings, useSettingsMutation, useCurrencies } from './use-settings';
import { CurrenciesPanel } from './currencies-panel';
import { ExchangeRatesPanel } from './exchange-rates-panel';
import { MaintenancePanel } from './maintenance-panel';

export function SettingsPage() {
  const { t } = useTranslation();
  const { data } = useSettings();
  const save = useSettingsMutation();
  const { data: currencies } = useCurrencies();
  const [form, setForm] = useState({
    nearExpiryDays: 7,
    lowStockCheckEnabled: true,
    nearExpiryCheckEnabled: true,
    baseCurrencyId: '',
    backupSchedule: '',
  });
  useEffect(() => {
    if (data)
      setForm({
        nearExpiryDays: data.nearExpiryDays,
        lowStockCheckEnabled: data.lowStockCheckEnabled,
        nearExpiryCheckEnabled: data.nearExpiryCheckEnabled,
        baseCurrencyId: data.baseCurrencyId,
        backupSchedule: data.backupSchedule ?? '',
      });
  }, [data]);
  const currencyOptions = (currencies?.items ?? []).map((c) => ({ value: c.id, label: c.code }));

  async function onSave() {
    try {
      await save.mutateAsync({
        nearExpiryDays: Number(form.nearExpiryDays),
        lowStockCheckEnabled: form.lowStockCheckEnabled,
        nearExpiryCheckEnabled: form.nearExpiryCheckEnabled,
        baseCurrencyId: form.baseCurrencyId,
        backupSchedule: form.backupSchedule || null,
      });
      toast.success(t('settings.save'));
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Error');
    }
  }

  return (
    <>
      <PageHeader title={t('settings.title')} description={t('settings.subtitle')} />
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">{t('settings.tabGeneral')}</TabsTrigger>
          <TabsTrigger value="currencies">{t('settings.tabCurrencies')}</TabsTrigger>
          <TabsTrigger value="rates">{t('settings.tabRates')}</TabsTrigger>
          <TabsTrigger value="maintenance">{t('settings.tabMaintenance')}</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="mt-4">
          <Card>
            <CardContent className="max-w-lg space-y-4 pt-6">
              <div className="space-y-1.5">
                <Label>{t('settings.nearExpiryDays')}</Label>
                <Input
                  type="number"
                  className="nums"
                  value={form.nearExpiryDays}
                  onChange={(e) => setForm((s) => ({ ...s, nearExpiryDays: Number(e.target.value) }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>{t('settings.lowStockCheck')}</Label>
                <Switch
                  checked={form.lowStockCheckEnabled}
                  onCheckedChange={(v) => setForm((s) => ({ ...s, lowStockCheckEnabled: v }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>{t('settings.nearExpiryCheck')}</Label>
                <Switch
                  checked={form.nearExpiryCheckEnabled}
                  onCheckedChange={(v) => setForm((s) => ({ ...s, nearExpiryCheckEnabled: v }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t('settings.baseCurrency')}</Label>
                <EntitySelect
                  value={form.baseCurrencyId}
                  onChange={(v) => setForm((s) => ({ ...s, baseCurrencyId: v }))}
                  options={currencyOptions}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t('settings.backupSchedule')}</Label>
                <Input
                  value={form.backupSchedule}
                  onChange={(e) => setForm((s) => ({ ...s, backupSchedule: e.target.value }))}
                  placeholder="0 2 * * *"
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={() => void onSave()} disabled={save.isPending}>
                  {t('settings.save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="currencies" className="mt-4">
          <CurrenciesPanel />
        </TabsContent>
        <TabsContent value="rates" className="mt-4">
          <ExchangeRatesPanel />
        </TabsContent>
        <TabsContent value="maintenance" className="mt-4">
          <MaintenancePanel />
        </TabsContent>
      </Tabs>
    </>
  );
}
