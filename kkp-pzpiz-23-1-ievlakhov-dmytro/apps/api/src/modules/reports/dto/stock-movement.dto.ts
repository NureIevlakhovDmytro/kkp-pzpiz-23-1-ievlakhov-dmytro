import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class StockMovementQueryDto {
  @IsDateString() from: string;
  @IsDateString() to: string;
  @IsOptional() @IsUUID() productId?: string;
  @IsOptional() @IsUUID() locationId?: string;
}
