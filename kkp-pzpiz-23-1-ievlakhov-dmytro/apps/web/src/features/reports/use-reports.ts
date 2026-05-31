import { useQuery } from '@tanstack/react-query';
import { reportsApi } from './reports.api';

export function useLossStructure(from: string, to: string, enabled: boolean) {
  return useQuery({
    queryKey: ['reports', 'loss', from, to],
    queryFn: () => reportsApi.lossStructure(from, to),
    enabled,
  });
}
