import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CurrencyEntity } from '../entities/currency.entity';
import { WriteOffReasonEntity } from '../entities/write-off-reason.entity';
import { CurrenciesController } from './currencies.controller';
import { CurrenciesService } from './currencies.service';
import { WriteOffReasonsController } from './write-off-reasons.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CurrencyEntity, WriteOffReasonEntity])],
  controllers: [CurrenciesController, WriteOffReasonsController],
  providers: [CurrenciesService],
  exports: [CurrenciesService],
})
export class CurrencyModule {}
