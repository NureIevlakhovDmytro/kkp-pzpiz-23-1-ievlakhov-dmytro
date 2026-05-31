import type { Paginated, ReceiptDto } from '@app/shared';
import { apiFetch } from '@/lib/api-client';
import { listQuery } from '@/lib/pagination';

export interface ReceiptLineInput {
  productId: string;
  batchNumber: string;
  expiryDate?: string;
  quantity: number;
  unitCost: number;
  currencyId: string;
}
export interface ReceiptInput {
  supplierId?: string;
  locationId: string;
  date: string;
  lines: ReceiptLineInput[];
}

export const receiptsApi = {
  list: () => apiFetch<Paginated<ReceiptDto>>(`/receipts${listQuery()}`),
  get: (id: string) => apiFetch<ReceiptDto>(`/receipts/${id}`),
  post: (body: ReceiptInput, idempotencyKey: string) =>
    apiFetch<ReceiptDto>('/receipts', { method: 'POST', body, headers: { 'Idempotency-Key': idempotencyKey } }),
  reverse: (id: string) => apiFetch<ReceiptDto>(`/receipts/${id}/reverse`, { method: 'POST' }),
};
