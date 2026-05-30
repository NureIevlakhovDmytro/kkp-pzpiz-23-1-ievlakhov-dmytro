import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppSettingsEntity } from '../entities/app-settings.entity';
import { CurrencyEntity } from '../entities/currency.entity';
import { AppException } from '../common/api-exception';
import { ErrorCode } from '@app/shared';
import { UpdateSettingsDto } from './dto/settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(AppSettingsEntity) private readonly repo: Repository<AppSettingsEntity>,
    @InjectRepository(CurrencyEntity) private readonly currencies: Repository<CurrencyEntity>,
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
      // NOTE: spec §2 makes base currency immutable after the first valued operation.
      // No valued operations exist yet (no batches/receipts in this plan), so switching is allowed here.
      // The "freeze after first valued op" guard is added in Plan 3/4 when batches exist.
      s.baseCurrencyId = dto.baseCurrencyId;
    }
    if (dto.nearExpiryDays !== undefined) s.nearExpiryDays = dto.nearExpiryDays;
    if (dto.lowStockCheckEnabled !== undefined) s.lowStockCheckEnabled = dto.lowStockCheckEnabled;
    if (dto.nearExpiryCheckEnabled !== undefined) s.nearExpiryCheckEnabled = dto.nearExpiryCheckEnabled;
    if (dto.backupSchedule !== undefined) s.backupSchedule = dto.backupSchedule;
    return this.repo.save(s);
  }
}
