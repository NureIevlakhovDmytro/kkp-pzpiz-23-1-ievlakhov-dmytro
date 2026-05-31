import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { makeQueryClient } from '@/lib/query-client';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'uk' } }),
}));
vi.mock('@/lib/use-lookups', () => ({
  useLookups: () => ({
    locationName: { l1: 'Склад' },
    supplierName: { s1: 'Постач.' },
    productName: {},
    products: [],
    locations: [],
    suppliers: [],
  }),
}));
vi.mock('./use-receipts', () => ({
  useReceipts: () => ({
    data: {
      items: [
        {
          id: '1',
          number: 'REC-000001',
          date: '2026-05-30',
          supplierId: 's1',
          locationId: 'l1',
          status: 'POSTED',
          reversesId: null,
          lines: [],
        },
      ],
      total: 1,
      page: 1,
      limit: 100,
    },
    isLoading: false,
  }),
  useReceiptMutations: () => ({
    post: { mutateAsync: vi.fn(), isPending: false },
    reverse: { mutateAsync: vi.fn() },
  }),
}));
vi.mock('./receipt-form', () => ({ ReceiptForm: () => null }));
vi.mock('./receipt-detail', () => ({ ReceiptDetail: () => null }));

describe('ReceiptsPage', () => {
  it('lists receipts with number and location', async () => {
    const { ReceiptsPage } = await import('./receipts-page');
    render(
      <QueryClientProvider client={makeQueryClient()}>
        <ReceiptsPage />
      </QueryClientProvider>,
    );
    expect(await screen.findByText('REC-000001')).toBeInTheDocument();
    expect(screen.getByText('Склад')).toBeInTheDocument();
  });
});
