import { ErrorCode, LoginResponse, MeDto } from '@app/shared';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AppException } from '../common/api-exception';
import { UserEntity } from '../database/entities/user.entity';
import { UsersService } from '../users/users.service';
import { PasswordService } from './password.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly passwords: PasswordService,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string): Promise<LoginResponse> {
    const user = await this.users.findByEmail(email);
    if (!user || !user.isActive || !(await this.passwords.verify(password, user.passwordHash))) {
      throw new AppException(ErrorCode.UNAUTHORIZED, 'Invalid credentials');
    }
    const token = await this.jwt.signAsync({ sub: user.id, email: user.email, role: user.role });
    return { token };
  }

  toMe(user: UserEntity): MeDto {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      locale: user.locale,
    };
  }
}
