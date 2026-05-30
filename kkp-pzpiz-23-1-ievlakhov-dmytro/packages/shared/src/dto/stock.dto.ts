import { DocumentStatus } from '../enums';

export interface BatchDto {
  id: string;
  productId: string;
  batchNumber: string;
  expiryDate: string | null;
  receivedDate: string;
  unitCost: number;
  currencyId: string;
  supplierId: string | null;
  isExpired: boolean;
}

export interface StockLevelDto {
  batchId: string;
  locationId: string;
  productId: string;
  quantity: number;
  expiryDate: string | null;
  isExpired: boolean;
}

export interface LowStockDto {
  productId: string;
  productName: string;
  totalQuantity: number;
  minStock: number;
}

export interface FefoAllocationDto {
  batchId: string;
  allocated: number;
}

export interface FefoSuggestionDto {
  productId: string;
  locationId: string;
  requested: number;
  allocated: number;
  shortfall: number;
  allocations: FefoAllocationDto[];
}

export interface ReceiptLineDto {
  id: string;
  productId: string;
  batchId: string;
  batchNumber: string;
  expiryDate: string | null;
  quantity: number;
  unitCost: number;
  currencyId: string;
}

export interface ReceiptDto {
  id: string;
  number: string;
  supplierId: string | null;
  locationId: string;
  date: string;
  status: DocumentStatus;
  reversesId: string | null;
  lines: ReceiptLineDto[];
}
