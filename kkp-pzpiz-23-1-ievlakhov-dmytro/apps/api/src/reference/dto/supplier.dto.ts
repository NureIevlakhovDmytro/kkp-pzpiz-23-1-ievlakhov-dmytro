import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateSupplierDto {
  @IsString() @MinLength(1) name: string;
  @IsOptional() @IsString() contactInfo?: string;
}

export class UpdateSupplierDto {
  @IsOptional() @IsString() @MinLength(1) name?: string;
  @IsOptional() @IsString() contactInfo?: string;
}
