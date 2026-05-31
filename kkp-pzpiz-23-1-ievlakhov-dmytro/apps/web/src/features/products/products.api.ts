import type { Paginated, ProductDto } from '@app/shared';
import { apiFetch } from '@/lib/api-client';

export interface ProductInput {
  name: string;
  sku?: string;
  categoryId?: string;
  unitId: string;
  minStock?: number;
  shelfLifeDays?: number;
}

export const productsApi = {
  list: (page = 1, limit = 50) =>
    apiFetch<Paginated<ProductDto>>(`/products?page=${page}&limit=${limit}`),
  create: (body: ProductInput) =>
    apiFetch<ProductDto>('/products', { method: 'POST', body }),
  update: (id: string, body: Partial<ProductInput>) =>
    apiFetch<ProductDto>(`/products/${id}`, { method: 'PATCH', body }),
  archive: (id: string) =>
    apiFetch<{ status: string }>(`/products/${id}`, { method: 'DELETE' }),
};
