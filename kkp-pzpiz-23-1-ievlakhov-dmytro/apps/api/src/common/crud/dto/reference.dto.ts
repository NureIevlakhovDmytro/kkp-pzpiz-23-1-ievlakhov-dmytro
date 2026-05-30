import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateNamedDto {
  @IsString() @MinLength(1) name: string;
}

export class UpdateNamedDto {
  @IsOptional() @IsString() @MinLength(1) name?: string;
}

/** ?includeInactive=true (ADMIN) — accepts "true"/"1". */
export class IncludeInactiveQuery {
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === '1' || value === true)
  @IsBoolean()
  includeInactive = false;
}
