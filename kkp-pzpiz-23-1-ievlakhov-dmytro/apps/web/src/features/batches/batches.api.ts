import type { BatchDto, Paginated } from '@app/shared';
import { apiFetch } from '@/lib/api-client';

export interface BatchFilter { productId?: string; expired?: boolean; }

export const batchesApi = {
  list: (f: BatchFilter) => {
    const q = new URLSearchParams({ limit: '200' });
    if (f.productId) q.set('productId', f.productId);
    if (f.expired) q.set('expired', 'true');
    return apiFetch<Paginated<BatchDto>>(`/batches?${q.toString()}`);
  },
  expiring: (days: number) => apiFetch<BatchDto[]>(`/batches/expiring?days=${days}`),
};
