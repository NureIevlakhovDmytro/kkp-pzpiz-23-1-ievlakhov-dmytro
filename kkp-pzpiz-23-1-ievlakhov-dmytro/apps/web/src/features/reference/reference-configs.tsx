'use client';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/data/page-header';
import { RequireAdmin } from '@/components/auth/require-admin';
import { ReferenceCrud } from './reference-crud';

export function ReferenceTabs() {
  const { t } = useTranslation();
  return (
    <RequireAdmin>
      <PageHeader title={t('reference.title')} description={t('reference.subtitle')} />
      <Tabs defaultValue="categories">
        <TabsList>
          <TabsTrigger value="categories">{t('reference.categories')}</TabsTrigger>
          <TabsTrigger value="units">{t('reference.units')}</TabsTrigger>
          <TabsTrigger value="suppliers">{t('reference.suppliers')}</TabsTrigger>
          <TabsTrigger value="locations">{t('reference.locations')}</TabsTrigger>
        </TabsList>
        <TabsContent value="categories" className="mt-4">
          <ReferenceCrud
            resource="categories"
            t={t}
            fields={[{ name: 'name', labelKey: 'reference.name', required: true }]}
            columns={[{ key: 'name', header: t('reference.name') }]}
          />
        </TabsContent>
        <TabsContent value="units" className="mt-4">
          <ReferenceCrud
            resource="units"
            t={t}
            fields={[
              { name: 'code', labelKey: 'reference.code', required: true },
              { name: 'name', labelKey: 'reference.name', required: true },
            ]}
            columns={[
              { key: 'code', header: t('reference.code') },
              { key: 'name', header: t('reference.name') },
            ]}
          />
        </TabsContent>
        <TabsContent value="suppliers" className="mt-4">
          <ReferenceCrud
            resource="suppliers"
            t={t}
            fields={[
              { name: 'name', labelKey: 'reference.name', required: true },
              { name: 'contactInfo', labelKey: 'reference.contact' },
            ]}
            columns={[
              { key: 'name', header: t('reference.name') },
              { key: 'contactInfo', header: t('reference.contact') },
            ]}
          />
        </TabsContent>
        <TabsContent value="locations" className="mt-4">
          <ReferenceCrud
            resource="storage-locations"
            t={t}
            fields={[
              { name: 'name', labelKey: 'reference.name', required: true },
              { name: 'description', labelKey: 'reference.description' },
            ]}
            columns={[
              { key: 'name', header: t('reference.name') },
              { key: 'description', header: t('reference.description') },
            ]}
          />
        </TabsContent>
      </Tabs>
    </RequireAdmin>
  );
}
