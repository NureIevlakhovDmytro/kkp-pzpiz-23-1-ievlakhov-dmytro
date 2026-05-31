'use client';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/data/page-header';
import { LossStructureReport } from './loss-structure-report';
import { InventoryReport } from './inventory-report';

export function ReportsPage() {
  const { t } = useTranslation();
  return (
    <>
      <PageHeader title={t('reports.title')} description={t('reports.subtitle')} />
      <Tabs defaultValue="loss">
        <TabsList>
          <TabsTrigger value="loss">{t('reports.lossStructure')}</TabsTrigger>
          <TabsTrigger value="inventory">{t('reports.inventoryReport')}</TabsTrigger>
        </TabsList>
        <TabsContent value="loss" className="mt-4">
          <LossStructureReport />
        </TabsContent>
        <TabsContent value="inventory" className="mt-4">
          <InventoryReport />
        </TabsContent>
      </Tabs>
    </>
  );
}
