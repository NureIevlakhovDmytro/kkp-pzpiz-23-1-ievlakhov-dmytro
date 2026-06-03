import type { FefoSuggestionDto, Paginated, WriteOffDto, WriteOffReasonDto } from '@app/shared';
import { apiFetch } from '@/lib/api-client';
import { listQuery } from '@/lib/pagination';

export interface WriteOffLineInput { batchId: string; locationId: string; quantity: number; }
export interface WriteOffInput { date: string; reasonId: string; comment?: string; lines: WriteOffLineInput[]; }

export const writeOffsApi = {
  list: () => apiFetch<Paginated<WriteOffDto>>(`/write-offs${listQuery()}`),
  get: (id: string) => apiFetch<WriteOffDto>(`/write-offs/${id}`),
  reasons: () => apiFetch<WriteOffReasonDto[]>('/write-off-reasons'),
  fefo: (productId: string, locationId: string, quantity: number) =>
    apiFetch<FefoSuggestionDto>(`/stock/fefo-suggestion?productId=${productId}&locationId=${locationId}&quantity=${quantity}`),
  post: (body: WriteOffInput, idempotencyKey: string) =>
    apiFetch<WriteOffDto>('/write-offs', { method: 'POST', body, headers: { 'Idempotency-Key': idempotencyKey } }),
  reverse: (id: string) => apiFetch<WriteOffDto>(`/write-offs/${id}/reverse`, { method: 'POST' }),
};
