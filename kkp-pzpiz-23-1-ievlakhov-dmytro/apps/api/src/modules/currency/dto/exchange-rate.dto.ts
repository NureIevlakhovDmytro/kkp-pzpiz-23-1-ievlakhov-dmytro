import { IsDateString, IsNumber, IsOptional, IsPositive, IsUUID } from 'class-validator';

export class CreateExchangeRateDto {
  @IsUUID() currencyId: string;
  @IsNumber() @IsPositive() rateToBase: number;
  @IsDateString() effectiveDate: string;
}

export class UpdateExchangeRateDto {
  @IsOptional() @IsNumber() @IsPositive() rateToBase?: number;
  @IsOptional() @IsDateString() effectiveDate?: string;
}

export class RateFilterDto {
  @IsOptional() @IsUUID() currencyId?: string;
}
