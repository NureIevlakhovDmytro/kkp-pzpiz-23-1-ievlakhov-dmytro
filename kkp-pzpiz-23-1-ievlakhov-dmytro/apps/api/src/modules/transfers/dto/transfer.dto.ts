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
  ValidateNested,
} from 'class-validator';

export class CreateTransferLineDto {
  @IsUUID() batchId: string;
  @IsNumber() @IsPositive() quantity: number;
}

export class CreateTransferDto {
  @IsUUID() fromLocationId: string;
  @IsUUID() toLocationId: string;
  @IsDateString() date: string;
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateTransferLineDto)
  lines: CreateTransferLineDto[];
}

export class TransferFilterDto {
  @IsOptional() @IsDateString() from?: string;
  @IsOptional() @IsDateString() to?: string;
  @IsOptional() @IsUUID() locationId?: string;
  @IsOptional() @IsString() status?: string;
}
