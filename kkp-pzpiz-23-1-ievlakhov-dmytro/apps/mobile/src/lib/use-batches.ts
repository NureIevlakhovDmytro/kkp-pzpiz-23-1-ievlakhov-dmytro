import type { BatchDto, Paginated } from '@app/shared';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from './api-client';
import { listQuery } from './pagination';
import { useLookups } from './use-lookups';

/** Resolves batch ids to "Product · BATCH-NO". */
export function useBatchLabels() {
  const { productName } = useLookups();
  const query = useQuery({
    queryKey: ['lookup', 'batches'],
    queryFn: () => apiFetch<Paginated<BatchDto>>(`/batches${listQuery()}`),
  });
  const items = query.data?.items ?? [];
  const batchLabel: Record<string, string> = {};
  for (const b of items) {
    const product = productName[b.productId];
    batchLabel[b.id] = product ? `${product} · ${b.batchNumber}` : b.batchNumber;
  }
  return { batchLabel, batches: items };
}
