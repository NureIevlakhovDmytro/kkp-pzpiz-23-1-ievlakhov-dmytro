import { useQuery } from '@tanstack/react-query';
import { stockApi } from './stock.api';

export function useStock(productId?: string, locationId?: string) {
  return useQuery({ queryKey: ['stock', productId, locationId], queryFn: () => stockApi.list(productId, locationId) });
}

export function useLowStock() {
  return useQuery({ queryKey: ['stock', 'low'], queryFn: () => stockApi.low() });
}
