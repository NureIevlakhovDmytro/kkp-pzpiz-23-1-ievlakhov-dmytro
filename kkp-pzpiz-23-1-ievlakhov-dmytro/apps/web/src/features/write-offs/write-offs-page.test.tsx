import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { makeQueryClient } from '@/lib/query-client';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'uk' } }) }));
vi.mock('./use-write-offs', () => ({
  useWriteOffs: () => ({ data: { items: [{ id: '1', number: 'WO-000001', date: '2026-05-30', reasonId: 'r1', status: 'POSTED', reversesId: null, lines: [] }], total: 1, page: 1, limit: 100 }, isLoading: false }),
  useWriteOffReasons: () => ({ data: [{ id: 'r1', code: 'SPOILAGE', nameUk: 'Псування', nameEn: 'Spoilage' }] }),
  useWriteOffMutations: () => ({ post: { mutateAsync: vi.fn(), isPending: false }, reverse: { mutateAsync: vi.fn() } }),
}));
vi.mock('./write-off-form', () => ({ WriteOffForm: () => null }));
vi.mock('./write-off-detail', () => ({ WriteOffDetail: () => null }));
vi.mock('@/lib/api-client', () => ({ apiFetch: vi.fn().mockResolvedValue({ items: [], total: 0, page: 1, limit: 300 }), ApiError: class {} }));

describe('WriteOffsPage', () => {
  it('lists write-offs with number, reason and status', async () => {
    const { WriteOffsPage } = await import('./write-offs-page');
    render(<QueryClientProvider client={makeQueryClient()}><WriteOffsPage /></QueryClientProvider>);
    expect(await screen.findByText('WO-000001')).toBeInTheDocument();
    expect(screen.getByText('Псування')).toBeInTheDocument();
  });
});
