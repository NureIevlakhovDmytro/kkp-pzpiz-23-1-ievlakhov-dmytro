import type {
  AppSettingsDto,
  CurrencyDto,
  ExchangeRateDto,
  ImportResultDto,
  Paginated,
} from '@app/shared';
import { apiFetch } from '@/lib/api-client';
import { listQuery } from '@/lib/pagination';

export interface UpdateSettingsInput {
  nearExpiryDays?: number;
  lowStockCheckEnabled?: boolean;
  nearExpiryCheckEnabled?: boolean;
  baseCurrencyId?: string;
  backupSchedule?: string | null;
}
export interface CurrencyInput {
  code: string;
  name: string;
  symbol?: string;
}
export interface RateInput {
  currencyId: string;
  rateToBase: number;
  effectiveDate: string;
}

export const settingsApi = {
  get: () => apiFetch<AppSettingsDto>('/admin/settings'),
  update: (body: UpdateSettingsInput) =>
    apiFetch<AppSettingsDto>('/admin/settings', { method: 'PATCH', body }),
  currencies: () => apiFetch<Paginated<CurrencyDto>>(`/currencies${listQuery()}`),
  createCurrency: (body: CurrencyInput) =>
    apiFetch<CurrencyDto>('/currencies', { method: 'POST', body }),
  updateCurrency: (id: string, body: Partial<CurrencyInput>) =>
    apiFetch<CurrencyDto>(`/currencies/${id}`, { method: 'PATCH', body }),
  rates: (currencyId?: string) =>
    apiFetch<Paginated<ExchangeRateDto>>(
      `/exchange-rates${listQuery(currencyId ? { currencyId } : undefined)}`,
    ),
  createRate: (body: RateInput) =>
    apiFetch<ExchangeRateDto>('/exchange-rates', { method: 'POST', body }),
  deleteRate: (id: string) =>
    apiFetch<{ status: string }>(`/exchange-rates/${id}`, { method: 'DELETE' }),
  backup: () => apiFetch<{ status: string }>('/admin/backup', { method: 'POST' }),
  exportUrl: (entity: string, format: string) => `/admin/export?entity=${entity}&format=${format}`,
  import: (body: { entity: string; format: string; payload: string }) =>
    apiFetch<ImportResultDto>('/admin/import', { method: 'POST', body }),
};
