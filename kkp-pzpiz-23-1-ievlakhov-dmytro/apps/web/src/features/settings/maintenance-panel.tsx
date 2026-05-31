'use client';
import { useState } from 'react';
import { Download, DatabaseBackup } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EntitySelect } from '@/components/data/entity-select';
import { ApiError, apiUrl } from '@/lib/api-client';
import { getToken } from '@/lib/token-store';
import { settingsApi } from './settings.api';

const ENTITIES = ['categories', 'units', 'suppliers', 'storage-locations', 'currencies'];

export function MaintenancePanel() {
  const { t } = useTranslation();
  const [entity, setEntity] = useState('categories');
  const [format, setFormat] = useState('json');
  const [payload, setPayload] = useState('');

  async function runBackup() {
    try {
      await settingsApi.backup();
      toast.success(t('settings.backupStarted'));
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Error');
    }
  }
  async function download() {
    try {
      const res = await fetch(apiUrl(settingsApi.exportUrl(entity, format)), {
        headers: { Authorization: `Bearer ${getToken() ?? ''}` },
      });
      if (!res.ok) {
        toast.error('Error');
        return;
      }
      const text = await res.text();
      const blob = new Blob([text], {
        type: format === 'csv' ? 'text/csv' : 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${entity}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Error');
    }
  }
  async function runImport() {
    try {
      const res = await settingsApi.import({ entity, format, payload });
      toast.success(`${t('settings.importDone')}: ${res.created + res.updated}`);
      setPayload('');
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Error');
    }
  }
  const entityOptions = ENTITIES.map((e) => ({ value: e, label: e }));
  const formatOptions = [
    { value: 'json', label: 'JSON' },
    { value: 'csv', label: 'CSV' },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('settings.runBackup')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => void runBackup()}>
            <DatabaseBackup className="mr-2 h-4 w-4" />
            {t('settings.runBackup')}
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t('settings.export')} / {t('settings.import')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t('settings.entity')}</Label>
              <EntitySelect value={entity} onChange={setEntity} options={entityOptions} />
            </div>
            <div className="space-y-1.5">
              <Label>{t('settings.format')}</Label>
              <EntitySelect value={format} onChange={setFormat} options={formatOptions} />
            </div>
          </div>
          <Button variant="outline" onClick={() => void download()}>
            <Download className="mr-2 h-4 w-4" />
            {t('settings.download')}
          </Button>
          <div className="space-y-1.5">
            <Label>{t('settings.payload')}</Label>
            <Textarea rows={4} value={payload} onChange={(e) => setPayload(e.target.value)} />
          </div>
          <Button onClick={() => void runImport()} disabled={!payload}>
            {t('settings.runImport')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
