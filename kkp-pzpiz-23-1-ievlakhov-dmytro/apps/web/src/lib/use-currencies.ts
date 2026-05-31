import { useQuery } from '@tanstack/react-query';
import type { CurrencyDto, Paginated } from '@app/shared';
import { apiFetch } from './api-client';
import { listQuery } from './pagination';

export function useCurrencies() {
  const query = useQuery({
    queryKey: ['currencies'],
    queryFn: () => apiFetch<Paginated<CurrencyDto>>(`/currencies${listQuery()}`),
  });
  const items = query.data?.items ?? [];
  const currencyName = Object.fromEntries(items.map((c) => [c.id, c.code]));
  const options = items.map((c) => ({ value: c.id, label: c.symbol ? `${c.code} (${c.symbol})` : c.code }));
  return { items, options, currencyName, isLoading: query.isLoading };
}
