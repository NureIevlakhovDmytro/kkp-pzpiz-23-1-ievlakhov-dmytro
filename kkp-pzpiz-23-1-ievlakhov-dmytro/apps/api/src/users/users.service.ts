import { Locale } from '@app/shared';
import { ErrorCode } from '@app/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PasswordService } from '../auth/password.service';
import { AppException } from '../common/api-exception';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity) private readonly repo: Repository<UserEntity>,
    private readonly passwords: PasswordService,
  ) {}

  findByEmail(email: string): Promise<UserEntity | null> {
    return this.repo.findOne({ where: { email } });
  }

  async findActiveById(id: string): Promise<UserEntity> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user?.isActive) throw new AppException(ErrorCode.NOT_FOUND, 'User not found');
    return user;
  }

  async updateProfile(
    id: string,
    patch: { fullName?: string; locale?: Locale },
  ): Promise<UserEntity> {
    const user = await this.findActiveById(id);
    if (patch.fullName !== undefined) user.fullName = patch.fullName;
    if (patch.locale !== undefined) user.locale = patch.locale;
    return this.repo.save(user);
  }

  async changePassword(id: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.findActiveById(id);
    if (!(await this.passwords.verify(oldPassword, user.passwordHash))) {
      throw new AppException(ErrorCode.BUSINESS_RULE, 'Old password is incorrect');
    }
    user.passwordHash = await this.passwords.hash(newPassword);
    await this.repo.save(user);
  }
}
