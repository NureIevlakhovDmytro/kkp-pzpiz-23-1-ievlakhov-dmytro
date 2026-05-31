import { useQuery } from '@tanstack/react-query';
import type { CategoryDto, Paginated, ProductDto, StorageLocationDto, SupplierDto } from '@app/shared';
import { apiFetch } from './api-client';

function mapById<T extends { id: string }>(items: T[], label: (t: T) => string): Record<string, string> {
  return Object.fromEntries(items.map((i) => [i.id, label(i)]));
}

export function useLookups() {
  const products = useQuery({ queryKey: ['lookup', 'products'], queryFn: () => apiFetch<Paginated<ProductDto>>('/products?limit=500&includeInactive=true') });
  const locations = useQuery({ queryKey: ['lookup', 'locations'], queryFn: () => apiFetch<Paginated<StorageLocationDto>>('/storage-locations?limit=500&includeInactive=true') });
  const suppliers = useQuery({ queryKey: ['lookup', 'suppliers'], queryFn: () => apiFetch<Paginated<SupplierDto>>('/suppliers?limit=500&includeInactive=true') });
  const categories = useQuery({ queryKey: ['lookup', 'categories'], queryFn: () => apiFetch<Paginated<CategoryDto>>('/categories?limit=500&includeInactive=true') });
  return {
    productName: mapById(products.data?.items ?? [], (p) => p.name),
    locationName: mapById(locations.data?.items ?? [], (l) => l.name),
    supplierName: mapById(suppliers.data?.items ?? [], (s) => s.name),
    categoryName: mapById(categories.data?.items ?? [], (c) => c.name),
    products: products.data?.items ?? [],
    locations: locations.data?.items ?? [],
    suppliers: suppliers.data?.items ?? [],
  };
}
