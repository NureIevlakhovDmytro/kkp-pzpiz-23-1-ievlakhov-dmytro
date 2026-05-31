import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { makeQueryClient } from '@/lib/query-client';

vi.mock('@/features/auth/auth-context', () => ({
  useAuth: () => ({ user: { role: 'ADMIN', fullName: 'A B' } }),
}));
vi.mock('./use-products', () => ({
  useProducts: () => ({
    data: {
      items: [
        {
          id: '1',
          name: 'Молоко',
          sku: 'MLK',
          minStock: 5,
          isActive: true,
          unitId: 'u',
          categoryId: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 50,
    },
    isLoading: false,
  }),
  useProductMutations: () => ({ archive: { mutateAsync: vi.fn() } }),
}));
vi.mock('./product-form', () => ({ ProductForm: () => null }));

function wrap(ui: ReactNode) {
  return <QueryClientProvider client={makeQueryClient()}>{ui}</QueryClientProvider>;
}

describe('ProductsTable', () => {
  it('renders products and the admin create action', async () => {
    const { ProductsTable } = await import('./products-table');
    render(wrap(<ProductsTable />));
    expect(screen.getByText('Молоко')).toBeInTheDocument();
    expect(screen.getByText('Створити')).toBeInTheDocument();
    expect(screen.getByText('Активний')).toBeInTheDocument();
  });
});
