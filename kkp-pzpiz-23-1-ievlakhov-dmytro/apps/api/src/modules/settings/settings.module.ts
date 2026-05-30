import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppSettingsEntity } from '../../core/database/entities/app-settings.entity';
import { BatchEntity } from '../../core/database/entities/batch.entity';
import { CurrencyEntity } from '../../core/database/entities/currency.entity';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
  imports: [TypeOrmModule.forFeature([AppSettingsEntity, CurrencyEntity, BatchEntity])],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
