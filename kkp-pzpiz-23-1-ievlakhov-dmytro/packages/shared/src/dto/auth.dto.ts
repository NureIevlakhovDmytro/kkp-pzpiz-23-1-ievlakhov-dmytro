import { Locale, Role } from '../enums';

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface MeDto {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  locale: Locale;
}

export interface UpdateMeDto {
  fullName?: string;
  locale?: Locale;
}

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}
