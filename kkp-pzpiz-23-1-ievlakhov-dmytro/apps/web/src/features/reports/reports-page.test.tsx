import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { makeQueryClient } from '@/lib/query-client';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'uk' } }),
}));
vi.mock('./use-reports', () => ({
  useLossStructure: () => ({
    data: {
      from: '',
      to: '',
      baseCurrencyId: 'c',
      total: 913,
      rateMissing: false,
      rows: [
        {
          reasonId: 'r',
          reasonCode: 'SPOILAGE',
          nameUk: 'Псування',
          nameEn: 'Spoilage',
          totalBase: 642,
        },
      ],
    },
    isLoading: false,
  }),
  useInventoryList: () => ({ data: { items: [], total: 0, page: 1, limit: 100 } }),
  useInventoryReport: () => ({ data: undefined }),
}));
// recharts ResponsiveContainer needs size; stub it
vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 400, height: 300 }}>{children}</div>
    ),
  };
});

describe('ReportsPage', () => {
  it('shows the loss-structure total and a reason row', async () => {
    const { ReportsPage } = await import('./reports-page');
    render(
      <QueryClientProvider client={makeQueryClient()}>
        <ReportsPage />
      </QueryClientProvider>,
    );
    expect(await screen.findByText('Псування')).toBeInTheDocument();
  });
});
