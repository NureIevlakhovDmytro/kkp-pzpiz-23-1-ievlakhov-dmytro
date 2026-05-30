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

export class CreateWriteOffLineDto {
  @IsUUID() batchId: string;
  @IsUUID() locationId: string;
  @IsNumber() @IsPositive() quantity: number;
}

export class CreateWriteOffDto {
  @IsDateString() date: string;
  @IsUUID() reasonId: string;
  @IsOptional() @IsString() comment?: string;
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => CreateWriteOffLineDto)
  lines: CreateWriteOffLineDto[];
}

export class WriteOffFilterDto {
  @IsOptional() @IsDateString() from?: string;
  @IsOptional() @IsDateString() to?: string;
  @IsOptional() @IsUUID() reasonId?: string;
  @IsOptional() @IsString() status?: string;
}
