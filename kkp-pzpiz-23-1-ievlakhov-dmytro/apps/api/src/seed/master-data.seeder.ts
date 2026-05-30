import { WriteOffReasonCode } from '@app/shared';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AppSettingsEntity } from '../entities/app-settings.entity';
import { CurrencyEntity } from '../entities/currency.entity';
import { UnitEntity } from '../entities/unit.entity';
import { WriteOffReasonEntity } from '../entities/write-off-reason.entity';

const REASONS: { code: WriteOffReasonCode; nameUk: string; nameEn: string }[] = [
  { code: WriteOffReasonCode.SPOILAGE, nameUk: 'Псування', nameEn: 'Spoilage' },
  { code: WriteOffReasonCode.OVERPRODUCTION, nameUk: 'Перевиробництво', nameEn: 'Overproduction' },
  {
    code: WriteOffReasonCode.RECEIVING_ERROR,
    nameUk: 'Помилка приймання',
    nameEn: 'Receiving error',
  },
  { code: WriteOffReasonCode.BREAKAGE, nameUk: 'Бій', nameEn: 'Breakage' },
  { code: WriteOffReasonCode.SHORTAGE, nameUk: 'Недостача', nameEn: 'Shortage' },
];

const UNITS: { code: string; name: string }[] = [
  { code: 'kg', name: 'Кілограм' },
  { code: 'l', name: 'Літр' },
  { code: 'pcs', name: 'Штука' },
];

@Injectable()
export class MasterDataSeeder implements OnModuleInit {
  private readonly logger = new Logger(MasterDataSeeder.name);
  constructor(
    @InjectRepository(WriteOffReasonEntity)
    private readonly reasons: Repository<WriteOffReasonEntity>,
    @InjectRepository(CurrencyEntity) private readonly currencies: Repository<CurrencyEntity>,
    @InjectRepository(AppSettingsEntity) private readonly settings: Repository<AppSettingsEntity>,
    @InjectRepository(UnitEntity) private readonly units: Repository<UnitEntity>,
  ) {}

  async onModuleInit(): Promise<void> {
    for (const r of REASONS) {
      if (!(await this.reasons.findOne({ where: { code: r.code } })))
        await this.reasons.save(this.reasons.create(r));
    }
    for (const u of UNITS) {
      if (!(await this.units.findOne({ where: { code: u.code, isActive: true } }))) {
        await this.units.save(this.units.create({ code: u.code, name: u.name, isActive: true }));
      }
    }
    let base = await this.currencies.findOne({ where: { code: 'UAH' } });
    base ??= await this.currencies.save(
      this.currencies.create({ code: 'UAH', name: 'Українська гривня', symbol: '₴' }),
    );
    if (!(await this.settings.findOne({ where: { id: 1 } }))) {
      await this.settings.save(this.settings.create({ id: 1, baseCurrencyId: base.id }));
      this.logger.log('Seeded app_settings + base currency UAH');
    }
  }
}
