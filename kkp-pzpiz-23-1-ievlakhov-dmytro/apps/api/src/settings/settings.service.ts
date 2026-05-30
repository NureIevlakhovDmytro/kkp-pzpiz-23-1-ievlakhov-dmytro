import { ErrorCode } from '@app/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AppException } from '../common/api-exception';
import { AppSettingsEntity } from '../entities/app-settings.entity';
import { BatchEntity } from '../entities/batch.entity';
import { CurrencyEntity } from '../entities/currency.entity';
import { UpdateSettingsDto } from './dto/settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(AppSettingsEntity) private readonly repo: Repository<AppSettingsEntity>,
    @InjectRepository(CurrencyEntity) private readonly currencies: Repository<CurrencyEntity>,
    @InjectRepository(BatchEntity) private readonly batches: Repository<BatchEntity>,
  ) {}

  async get(): Promise<AppSettingsEntity> {
    const s = await this.repo.findOne({ where: { id: 1 } });
    if (!s) throw new AppException(ErrorCode.NOT_FOUND, 'Settings not initialized');
    return s;
  }

  async update(dto: UpdateSettingsDto): Promise<AppSettingsEntity> {
    const s = await this.get();
    if (dto.baseCurrencyId && dto.baseCurrencyId !== s.baseCurrencyId) {
      const c = await this.currencies.findOne({ where: { id: dto.baseCurrencyId } });
      if (!c) throw new AppException(ErrorCode.NOT_FOUND, 'Base currency not found');
      const batchCount = await this.batches.count();
      if (batchCount > 0) {
        throw new AppException(
          ErrorCode.CONFLICT,
          'Base currency is frozen after the first valued operation',
        );
      }
      s.baseCurrencyId = dto.baseCurrencyId;
    }
    if (dto.nearExpiryDays !== undefined) s.nearExpiryDays = dto.nearExpiryDays;
    if (dto.lowStockCheckEnabled !== undefined) s.lowStockCheckEnabled = dto.lowStockCheckEnabled;
    if (dto.nearExpiryCheckEnabled !== undefined)
      s.nearExpiryCheckEnabled = dto.nearExpiryCheckEnabled;
    if (dto.backupSchedule !== undefined) s.backupSchedule = dto.backupSchedule;
    return this.repo.save(s);
  }
}
