import type { InventoryCountDto, InventoryReportDto, Paginated } from '@app/shared';
import { apiFetch } from '@/lib/api-client';
import { listQuery } from '@/lib/pagination';

export interface CreateInventoryInput { locationId: string; date: string; }
export interface CountEntry { batchId: string; actualQty: number; }

export const inventoryApi = {
  list: () => apiFetch<Paginated<InventoryCountDto>>(`/inventory-counts${listQuery()}`),
  get: (id: string) => apiFetch<InventoryCountDto>(`/inventory-counts/${id}`),
  create: (body: CreateInventoryInput) => apiFetch<InventoryCountDto>('/inventory-counts', { method: 'POST', body }),
  patch: (id: string, counts: CountEntry[]) =>
    apiFetch<InventoryCountDto>(`/inventory-counts/${id}`, { method: 'PATCH', body: { counts } }),
  complete: (id: string) => apiFetch<InventoryCountDto>(`/inventory-counts/${id}/complete`, { method: 'POST' }),
  report: (id: string) => apiFetch<InventoryReportDto>(`/reports/inventory/${id}`),
};
