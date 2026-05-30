import type { WriteOffReasonCode } from '../enums';

export interface CategoryDto {
  id: string;
  name: string;
  isActive: boolean;
}
export interface UnitDto {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}
export interface SupplierDto {
  id: string;
  name: string;
  contactInfo: string | null;
  isActive: boolean;
}
export interface StorageLocationDto {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export interface ProductDto {
  id: string;
  name: string;
  sku: string | null;
  categoryId: string | null;
  unitId: string;
  minStock: number;
  shelfLifeDays: number | null;
  isActive: boolean;
}

export interface CurrencyDto {
  id: string;
  code: string;
  name: string;
  symbol: string | null;
}
export interface WriteOffReasonDto {
  id: string;
  code: WriteOffReasonCode;
  nameUk: string;
  nameEn: string;
}

export interface AppSettingsDto {
  nearExpiryDays: number;
  lowStockCheckEnabled: boolean;
  nearExpiryCheckEnabled: boolean;
  baseCurrencyId: string;
  backupSchedule: string | null;
}
