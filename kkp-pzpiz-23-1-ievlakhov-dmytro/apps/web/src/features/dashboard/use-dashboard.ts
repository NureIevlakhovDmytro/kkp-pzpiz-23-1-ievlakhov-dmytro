import { useQuery } from '@tanstack/react-query';
import type { BatchDto, LowStockDto, Paginated, WriteOffDto } from '@app/shared';
import { apiFetch } from '@/lib/api-client';

export function useDashboard() {
  const low = useQuery({ queryKey: ['stock', 'low'], queryFn: () => apiFetch<LowStockDto[]>('/stock/low') });
  const expiring = useQuery({ queryKey: ['batches', 'expiring', 7], queryFn: () => apiFetch<BatchDto[]>('/batches/expiring?days=7') });
  const recentWriteOffs = useQuery({ queryKey: ['write-offs', 'recent'], queryFn: () => apiFetch<Paginated<WriteOffDto>>('/write-offs?page=1&limit=5') });
  return { low, expiring, recentWriteOffs };
}
