import { IsInt, IsNumber, IsOptional, IsString, IsUUID, Min, MinLength } from 'class-validator';

export class CreateProductDto {
  @IsString() @MinLength(1) name: string;
  @IsOptional() @IsString() sku?: string;
  @IsOptional() @IsUUID() categoryId?: string;
  @IsUUID() unitId: string;
  @IsOptional() @IsNumber() @Min(0) minStock?: number;
  @IsOptional() @IsInt() @Min(0) shelfLifeDays?: number;
}

export class UpdateProductDto {
  @IsOptional() @IsString() @MinLength(1) name?: string;
  @IsOptional() @IsString() sku?: string;
  @IsOptional() @IsUUID() categoryId?: string;
  @IsOptional() @IsNumber() @Min(0) minStock?: number;
  @IsOptional() @IsInt() @Min(0) shelfLifeDays?: number;
}
