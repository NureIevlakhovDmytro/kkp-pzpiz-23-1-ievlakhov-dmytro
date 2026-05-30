import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppSettingsEntity } from '../../core/database/entities/app-settings.entity';
import { CurrencyEntity } from '../../core/database/entities/currency.entity';
import { UnitEntity } from '../../core/database/entities/unit.entity';
import { WriteOffReasonEntity } from '../../core/database/entities/write-off-reason.entity';
import { MasterDataSeeder } from './master-data.seeder';

@Module({
  imports: [
    TypeOrmModule.forFeature([WriteOffReasonEntity, CurrencyEntity, AppSettingsEntity, UnitEntity]),
  ],
  providers: [MasterDataSeeder],
})
export class SeedModule {}
