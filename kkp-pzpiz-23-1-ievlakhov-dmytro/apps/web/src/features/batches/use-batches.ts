import { useQuery } from '@tanstack/react-query';
import { batchesApi, type BatchFilter } from './batches.api';

export function useBatches(filter: BatchFilter) {
  return useQuery({ queryKey: ['batches', filter], queryFn: () => batchesApi.list(filter) });
}
export function useExpiring(days: number, enabled: boolean) {
  return useQuery({ queryKey: ['batches', 'expiring', days], queryFn: () => batchesApi.expiring(days), enabled });
}
