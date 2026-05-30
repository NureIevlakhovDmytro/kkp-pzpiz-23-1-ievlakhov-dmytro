import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNumber,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateInventoryDto {
  @IsUUID() locationId: string;
  @IsDateString() date: string;
}

export class CountLineDto {
  @IsUUID() batchId: string;
  @IsNumber() @Min(0) actualQty: number;
}

export class PatchInventoryDto {
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => CountLineDto)
  counts: CountLineDto[];
}
