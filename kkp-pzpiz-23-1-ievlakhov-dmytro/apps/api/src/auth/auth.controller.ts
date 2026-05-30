import { Locale } from '@app/shared';
import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { CurrentUser, JwtUser, Public } from './decorators';

class LoginBody {
  @IsEmail() email: string;
  @IsString() @MinLength(1) password: string;
}
class UpdateMeBody {
  @IsOptional() @IsString() @MinLength(1) fullName?: string;
  @IsOptional() @IsEnum(Locale) locale?: Locale;
}
class ChangePasswordBody {
  @IsString() @MinLength(1) oldPassword: string;
  @IsString() @MinLength(8) newPassword: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UsersService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  login(@Body() body: LoginBody) {
    return this.auth.login(body.email, body.password);
  }

  @ApiBearerAuth()
  @Post('logout')
  logout() {
    // Stateless JWT: client discards the token. Endpoint exists for symmetry/audit.
    return { status: 'ok' };
  }

  @ApiBearerAuth()
  @Get('me')
  async me(@CurrentUser() u: JwtUser) {
    return this.auth.toMe(await this.users.findActiveById(u.id));
  }

  @ApiBearerAuth()
  @Patch('me')
  async updateMe(@CurrentUser() u: JwtUser, @Body() body: UpdateMeBody) {
    return this.auth.toMe(await this.users.updateProfile(u.id, body));
  }

  @ApiBearerAuth()
  @Post('change-password')
  async changePassword(@CurrentUser() u: JwtUser, @Body() body: ChangePasswordBody) {
    await this.users.changePassword(u.id, body.oldPassword, body.newPassword);
    return { status: 'ok' };
  }
}
