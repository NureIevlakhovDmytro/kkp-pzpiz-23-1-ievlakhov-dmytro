import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateLocationDto {
  @IsString() @MinLength(1) name: string;
  @IsOptional() @IsString() description?: string;
}

export class UpdateLocationDto {
  @IsOptional() @IsString() @MinLength(1) name?: string;
  @IsOptional() @IsString() description?: string;
}
