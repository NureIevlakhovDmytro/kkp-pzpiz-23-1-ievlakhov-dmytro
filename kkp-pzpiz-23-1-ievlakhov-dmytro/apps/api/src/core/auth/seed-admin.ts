import { Locale, Role } from '@app/shared';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { loadConfig } from '../config/env';
import { UserEntity } from '../database/entities/user.entity';
import { PasswordService } from './password.service';

@Injectable()
export class AdminSeeder implements OnModuleInit {
  private readonly logger = new Logger(AdminSeeder.name);
  constructor(
    @InjectRepository(UserEntity) private readonly repo: Repository<UserEntity>,
    private readonly passwords: PasswordService,
  ) {}

  async onModuleInit(): Promise<void> {
    const cfg = loadConfig();
    const existing = await this.repo.findOne({ where: { email: cfg.admin.email } });
    if (existing) return;
    await this.repo.save(
      this.repo.create({
        email: cfg.admin.email,
        passwordHash: await this.passwords.hash(cfg.admin.password),
        fullName: cfg.admin.name,
        role: Role.ADMIN,
        locale: Locale.UK,
        isActive: true,
      }),
    );
    this.logger.log(`Seeded ADMIN user ${cfg.admin.email}`);
  }
}
