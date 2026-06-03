import { useMutation, useQuery } from '@tanstack/react-query';
import { stockApi } from './stock.api';

export function useStock(productId?: string, locationId?: string) {
  return useQuery({ queryKey: ['stock', productId, locationId], queryFn: () => stockApi.list(productId, locationId) });
}

export function useLowStock() {
  return useQuery({ queryKey: ['stock', 'low'], queryFn: () => stockApi.low() });
}

export function useFefo() {
  return useMutation({
    mutationFn: (v: { productId: string; locationId: string; quantity: number }) =>
      stockApi.fefo(v.productId, v.locationId, v.quantity),
  });
}
