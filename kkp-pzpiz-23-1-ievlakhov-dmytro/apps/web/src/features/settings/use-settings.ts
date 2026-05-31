import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  settingsApi,
  type CurrencyInput,
  type RateInput,
  type UpdateSettingsInput,
} from './settings.api';

export function useSettings() {
  return useQuery({ queryKey: ['settings'], queryFn: () => settingsApi.get() });
}
export function useSettingsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateSettingsInput) => settingsApi.update(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });
}
export function useCurrencies() {
  return useQuery({ queryKey: ['currencies'], queryFn: () => settingsApi.currencies() });
}
export function useCurrencyMutations() {
  const qc = useQueryClient();
  const invalidate = () => void qc.invalidateQueries({ queryKey: ['currencies'] });
  return {
    create: useMutation({
      mutationFn: (b: CurrencyInput) => settingsApi.createCurrency(b),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: (v: { id: string; body: Partial<CurrencyInput> }) =>
        settingsApi.updateCurrency(v.id, v.body),
      onSuccess: invalidate,
    }),
  };
}
export function useRates(currencyId?: string) {
  return useQuery({
    queryKey: ['rates', currencyId ?? 'all'],
    queryFn: () => settingsApi.rates(currencyId),
  });
}
export function useRateMutations() {
  const qc = useQueryClient();
  const invalidate = () => void qc.invalidateQueries({ queryKey: ['rates'] });
  return {
    create: useMutation({
      mutationFn: (b: RateInput) => settingsApi.createRate(b),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) => settingsApi.deleteRate(id),
      onSuccess: invalidate,
    }),
  };
}
