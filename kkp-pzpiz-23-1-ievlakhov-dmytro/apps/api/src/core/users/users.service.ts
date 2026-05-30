import { randomUUID } from 'node:crypto';

import { ErrorCode, Locale, Role } from '@app/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PasswordService } from '../auth/password.service';
import { AppException } from '../common/api-exception';
import { paginate, PaginationQueryDto } from '../common/dto/pagination.dto';
import { UserEntity } from '../database/entities/user.entity';

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

  toDto(u: UserEntity) {
    return {
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      role: u.role,
      locale: u.locale,
      isActive: u.isActive,
      anonymizedAt: u.anonymizedAt ? u.anonymizedAt.toISOString() : null,
    };
  }

  async listUsers(q: PaginationQueryDto, role?: Role, isActive?: boolean) {
    const where: Record<string, unknown> = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive;
    const [items, total] = await this.repo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (q.page - 1) * q.limit,
      take: q.limit,
    });
    return paginate(
      items.map((u) => this.toDto(u)),
      total,
      q,
    );
  }

  async getUser(id: string): Promise<UserEntity> {
    const u = await this.repo.findOne({ where: { id } });
    if (!u) throw new AppException(ErrorCode.NOT_FOUND, 'User not found');
    return u;
  }

  async createUser(data: {
    email: string;
    fullName: string;
    password: string;
    role: Role;
    locale?: Locale;
  }): Promise<UserEntity> {
    if (await this.repo.findOne({ where: { email: data.email } })) {
      throw new AppException(ErrorCode.CONFLICT, 'Email already in use');
    }
    return this.repo.save(
      this.repo.create({
        email: data.email,
        fullName: data.fullName,
        passwordHash: await this.passwords.hash(data.password),
        role: data.role,
        locale: data.locale ?? Locale.UK,
        isActive: true,
      }),
    );
  }

  async adminUpdate(
    id: string,
    patch: { fullName?: string; role?: Role; locale?: Locale; isActive?: boolean },
  ): Promise<UserEntity> {
    const u = await this.getUser(id);
    if (patch.fullName !== undefined) u.fullName = patch.fullName;
    if (patch.role !== undefined) u.role = patch.role;
    if (patch.locale !== undefined) u.locale = patch.locale;
    if (patch.isActive !== undefined) u.isActive = patch.isActive;
    return this.repo.save(u);
  }

  /** GDPR-style erasure: keep the row (FKs survive) but obfuscate PII and deactivate. */
  async anonymize(id: string): Promise<UserEntity> {
    const u = await this.getUser(id);
    u.email = `anonymized-${u.id}@deleted.local`;
    u.fullName = 'Anonymized User';
    u.passwordHash = await this.passwords.hash(randomUUID());
    u.isActive = false;
    u.anonymizedAt = new Date();
    return this.repo.save(u);
  }

  /** Export the subject own personal data (НФВ-3 right of access). */
  exportData(u: UserEntity) {
    return {
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      role: u.role,
      locale: u.locale,
      isActive: u.isActive,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    };
  }
}
