import { IsOptional, IsString, Length, MinLength } from 'class-validator';

export class CreateCurrencyDto {
  @IsString() @Length(3, 3) code: string;     // ISO 4217
  @IsString() @MinLength(1) name: string;
  @IsOptional() @IsString() symbol?: string;
}

export class UpdateCurrencyDto {
  @IsOptional() @IsString() @MinLength(1) name?: string;
  @IsOptional() @IsString() symbol?: string;
}
