import type { FefoSuggestionDto, LowStockDto, StockLevelDto } from '@app/shared';
import { apiFetch } from '@/lib/api-client';

export const stockApi = {
  list: (productId?: string, locationId?: string) => {
    const q = new URLSearchParams();
    if (productId) q.set('productId', productId);
    if (locationId) q.set('locationId', locationId);
    const qs = q.toString();
    return apiFetch<StockLevelDto[]>(`/stock${qs ? `?${qs}` : ''}`);
  },
  low: () => apiFetch<LowStockDto[]>('/stock/low'),
  fefo: (productId: string, locationId: string, quantity: number) =>
    apiFetch<FefoSuggestionDto>(
      `/stock/fefo-suggestion?productId=${productId}&locationId=${locationId}&quantity=${quantity}`,
    ),
};
