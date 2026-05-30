import type { DocumentStatus, InventoryStatus, WriteOffReasonCode } from '../enums';

export interface WriteOffLineDto {
  id: string;
  batchId: string;
  locationId: string;
  quantity: number;
}

export interface WriteOffDto {
  id: string;
  number: string;
  date: string;
  reasonId: string;
  comment: string | null;
  status: DocumentStatus;
  reversesId: string | null;
  lines: WriteOffLineDto[];
}

export interface InventoryCountLineDto {
  id: string;
  batchId: string;
  expectedQty: number;
  actualQty: number | null;
  discrepancy: number | null;
}

export interface InventoryCountDto {
  id: string;
  number: string;
  locationId: string;
  date: string;
  status: InventoryStatus;
  adjustmentId: string | null;
  lines: InventoryCountLineDto[];
}

export interface StockAdjustmentLineDto {
  id: string;
  batchId: string;
  locationId: string;
  delta: number;
  reasonId: string | null;
}

export interface StockAdjustmentDto {
  id: string;
  number: string;
  date: string;
  inventoryId: string;
  lines: StockAdjustmentLineDto[];
}

export interface ExchangeRateDto {
  id: string;
  currencyId: string;
  rateToBase: number;
  effectiveDate: string;
}

export interface LossStructureRowDto {
  reasonId: string;
  reasonCode: WriteOffReasonCode;
  nameUk: string;
  nameEn: string;
  totalBase: number;
}

export interface LossStructureReportDto {
  from: string;
  to: string;
  baseCurrencyId: string;
  rows: LossStructureRowDto[];
  total: number;
  rateMissing: boolean;
}

export interface InventoryReportDto {
  inventoryId: string;
  number: string;
  locationId: string;
  date: string;
  status: InventoryStatus;
  shortageCount: number;
  surplusCount: number;
  shortageTotalBase: number;
  surplusTotalBase: number;
  rateMissing: boolean;
}
