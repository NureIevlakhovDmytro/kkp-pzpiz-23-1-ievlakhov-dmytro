import type { CurrencyDto, Paginated, ProductDto, StorageLocationDto, SupplierDto } from '@app/shared';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from './api-client';
import { listQuery } from './pagination';

function mapById<T extends { id: string }>(items: T[], label: (t: T) => string): Record<string, string> {
  return Object.fromEntries(items.map((i) => [i.id, label(i)]));
}

const LOOKUP_QUERY = listQuery({ includeInactive: 'true' });

export function useLookups() {
  const products = useQuery({
    queryKey: ['lookup', 'products'],
    queryFn: () => apiFetch<Paginated<ProductDto>>(`/products${LOOKUP_QUERY}`),
  });
  const locations = useQuery({
    queryKey: ['lookup', 'locations'],
    queryFn: () => apiFetch<Paginated<StorageLocationDto>>(`/storage-locations${LOOKUP_QUERY}`),
  });
  const suppliers = useQuery({
    queryKey: ['lookup', 'suppliers'],
    queryFn: () => apiFetch<Paginated<SupplierDto>>(`/suppliers${LOOKUP_QUERY}`),
  });
  const currencies = useQuery({
    queryKey: ['lookup', 'currencies'],
    queryFn: () => apiFetch<Paginated<CurrencyDto>>(`/currencies${LOOKUP_QUERY}`),
  });
  return {
    productName: mapById(products.data?.items ?? [], (p) => p.name),
    locationName: mapById(locations.data?.items ?? [], (l) => l.name),
    supplierName: mapById(suppliers.data?.items ?? [], (s) => s.name),
    currencyCode: mapById(currencies.data?.items ?? [], (c) => c.code),
    products: products.data?.items ?? [],
    locations: locations.data?.items ?? [],
    suppliers: suppliers.data?.items ?? [],
    currencies: currencies.data?.items ?? [],
  };
}
