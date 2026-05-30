import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUnitDto {
  @IsString() @MinLength(1) code: string;
  @IsString() @MinLength(1) name: string;
}

export class UpdateUnitDto {
  @IsOptional() @IsString() @MinLength(1) code?: string;
  @IsOptional() @IsString() @MinLength(1) name?: string;
}
