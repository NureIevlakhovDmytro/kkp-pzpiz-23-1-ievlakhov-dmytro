import { useQuery } from '@tanstack/react-query';
import { reportsApi } from './reports.api';

export function useLossStructure(from: string, to: string, enabled: boolean) {
  return useQuery({
    queryKey: ['reports', 'loss', from, to],
    queryFn: () => reportsApi.lossStructure(from, to),
    enabled,
  });
}

export function useInventoryList() {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: () => reportsApi.inventoryList(),
  });
}

export function useInventoryReport(id: string, enabled: boolean) {
  return useQuery({
    queryKey: ['reports', 'inventory', id],
    queryFn: () => reportsApi.inventory(id),
    enabled,
  });
}
