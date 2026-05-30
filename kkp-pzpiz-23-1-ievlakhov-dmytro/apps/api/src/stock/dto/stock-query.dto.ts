import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsPositive, IsUUID, Min } from 'class-validator';

const toBool = ({ value }: { value: unknown }) => value === 'true' || value === '1' || value === true;

export class StockQueryDto {
  @IsOptional() @IsUUID() productId?: string;
  @IsOptional() @IsUUID() locationId?: string;
  @IsOptional() @Transform(toBool) @IsBoolean() expired?: boolean;
}

export class FefoSuggestionQueryDto {
  @IsUUID() productId: string;
  @IsUUID() locationId: string;
  @Type(() => Number) @IsPositive() quantity: number;
}

export class ExpiringQueryDto {
  @Type(() => Number) @IsInt() @Min(0) days: number;
}
