import { Locale } from '@app/shared';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail() email: string;
  @IsString() @MinLength(1) password: string;
}

export class UpdateMeDto {
  @IsOptional() @IsString() @MinLength(1) fullName?: string;
  @IsOptional() @IsEnum(Locale) locale?: Locale;
}

export class ChangePasswordDto {
  @IsString() @MinLength(1) oldPassword: string;
  @IsString() @MinLength(8) newPassword: string;
}
