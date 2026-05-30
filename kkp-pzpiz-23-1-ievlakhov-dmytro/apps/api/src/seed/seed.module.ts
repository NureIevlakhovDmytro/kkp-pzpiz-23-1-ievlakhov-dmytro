import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppSettingsEntity } from '../entities/app-settings.entity';
import { CurrencyEntity } from '../entities/currency.entity';
import { UnitEntity } from '../entities/unit.entity';
import { WriteOffReasonEntity } from '../entities/write-off-reason.entity';
import { MasterDataSeeder } from './master-data.seeder';

@Module({
  imports: [
    TypeOrmModule.forFeature([WriteOffReasonEntity, CurrencyEntity, AppSettingsEntity, UnitEntity]),
  ],
  providers: [MasterDataSeeder],
})
export class SeedModule {}
