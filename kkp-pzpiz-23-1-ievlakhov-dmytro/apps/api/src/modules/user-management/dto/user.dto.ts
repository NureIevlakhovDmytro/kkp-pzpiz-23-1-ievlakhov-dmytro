import { Locale, Role } from '@app/shared';
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail() email: string;
  @IsString() @MinLength(1) fullName: string;
  @IsString() @MinLength(8) password: string;
  @IsEnum(Role) role: Role;
  @IsOptional() @IsEnum(Locale) locale?: Locale;
}

export class UpdateUserDto {
  @IsOptional() @IsString() @MinLength(1) fullName?: string;
  @IsOptional() @IsEnum(Role) role?: Role;
  @IsOptional() @IsEnum(Locale) locale?: Locale;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class UserFilterDto {
  @IsOptional() @IsEnum(Role) role?: Role;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
