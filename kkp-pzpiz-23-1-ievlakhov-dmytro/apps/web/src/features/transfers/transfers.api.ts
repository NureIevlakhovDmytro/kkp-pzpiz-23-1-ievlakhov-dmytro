import type { Paginated, TransferDto } from '@app/shared';
import { apiFetch } from '@/lib/api-client';
import { listQuery } from '@/lib/pagination';

export interface TransferLineInput {
  batchId: string;
  quantity: number;
}
export interface TransferInput {
  fromLocationId: string;
  toLocationId: string;
  date: string;
  lines: TransferLineInput[];
}

export const transfersApi = {
  list: () => apiFetch<Paginated<TransferDto>>(`/transfers${listQuery()}`),
  get: (id: string) => apiFetch<TransferDto>(`/transfers/${id}`),
  post: (body: TransferInput, idempotencyKey: string) =>
    apiFetch<TransferDto>('/transfers', { method: 'POST', body, headers: { 'Idempotency-Key': idempotencyKey } }),
  reverse: (id: string) => apiFetch<TransferDto>(`/transfers/${id}/reverse`, { method: 'POST' }),
};
