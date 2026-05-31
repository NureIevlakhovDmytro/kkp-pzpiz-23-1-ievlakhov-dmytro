import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { makeQueryClient } from '@/lib/query-client';

vi.mock('@/features/auth/auth-context', () => ({ useAuth: () => ({ user: { role: 'ADMIN' } }) }));
vi.mock('@/lib/use-crud', () => ({
  useCrud: () => ({
    list: { data: { items: [{ id: '1', name: 'Молочні', isActive: true }], total: 1, page: 1, limit: 200 }, isLoading: false },
    create: { mutateAsync: vi.fn() }, update: { mutateAsync: vi.fn() }, archive: { mutateAsync: vi.fn() },
  }),
}));

describe('ReferenceCrud', () => {
  it('renders rows and the admin create button', async () => {
    const { ReferenceCrud } = await import('./reference-crud');
    render(
      <QueryClientProvider client={makeQueryClient()}>
        <ReferenceCrud resource="categories" t={(k) => k} fields={[{ name: 'name', labelKey: 'reference.name', required: true }]} columns={[{ key: 'name', header: 'Name' }]} />
      </QueryClientProvider>,
    );
    expect(screen.getByText('Молочні')).toBeInTheDocument();
    expect(screen.getByText('common.create')).toBeInTheDocument();
  });
});
