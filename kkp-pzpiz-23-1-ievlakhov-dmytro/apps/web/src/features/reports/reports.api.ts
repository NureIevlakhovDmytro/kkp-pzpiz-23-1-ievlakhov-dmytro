import type {
  InventoryCountDto,
  InventoryReportDto,
  LossStructureReportDto,
  Paginated,
} from '@app/shared';
import { apiFetch } from '@/lib/api-client';

export const reportsApi = {
  lossStructure: (from: string, to: string) =>
    apiFetch<LossStructureReportDto>(`/reports/loss-structure?from=${from}&to=${to}`),
  inventory: (id: string) => apiFetch<InventoryReportDto>(`/reports/inventory/${id}`),
  inventoryList: () => apiFetch<Paginated<InventoryCountDto>>('/inventory-counts?page=1&limit=100'),
};
