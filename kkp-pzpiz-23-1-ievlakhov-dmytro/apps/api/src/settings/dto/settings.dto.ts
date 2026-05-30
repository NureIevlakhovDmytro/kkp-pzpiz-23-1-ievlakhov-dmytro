import { IsBoolean, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional() @IsInt() @Min(0) nearExpiryDays?: number;
  @IsOptional() @IsBoolean() lowStockCheckEnabled?: boolean;
  @IsOptional() @IsBoolean() nearExpiryCheckEnabled?: boolean;
  @IsOptional() @IsUUID() baseCurrencyId?: string;
  @IsOptional() @IsString() backupSchedule?: string;
}
