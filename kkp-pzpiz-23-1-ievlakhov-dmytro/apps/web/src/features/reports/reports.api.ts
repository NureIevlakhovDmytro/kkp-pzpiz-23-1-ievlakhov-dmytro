import type { LossStructureReportDto } from '@app/shared';
import { apiFetch } from '@/lib/api-client';

export const reportsApi = {
  lossStructure: (from: string, to: string) =>
    apiFetch<LossStructureReportDto>(`/reports/loss-structure?from=${from}&to=${to}`),
};
