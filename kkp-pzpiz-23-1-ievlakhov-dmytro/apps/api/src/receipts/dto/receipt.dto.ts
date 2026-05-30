import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class CreateReceiptLineDto {
  @IsUUID() productId: string;
  @IsString() @MinLength(1) batchNumber: string;
  @IsOptional() @IsDateString() expiryDate?: string;
  @IsNumber() @IsPositive() quantity: number;
  @IsNumber() @Min(0) unitCost: number;
  @IsUUID() currencyId: string;
}

export class CreateReceiptDto {
  @IsOptional() @IsUUID() supplierId?: string;
  @IsUUID() locationId: string;
  @IsDateString() date: string;
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => CreateReceiptLineDto)
  lines: CreateReceiptLineDto[];
}

export class ReceiptFilterDto {
  @IsOptional() @IsDateString() from?: string;
  @IsOptional() @IsDateString() to?: string;
  @IsOptional() @IsUUID() supplierId?: string;
  @IsOptional() @IsUUID() locationId?: string;
  @IsOptional() @IsString() status?: string;
}
