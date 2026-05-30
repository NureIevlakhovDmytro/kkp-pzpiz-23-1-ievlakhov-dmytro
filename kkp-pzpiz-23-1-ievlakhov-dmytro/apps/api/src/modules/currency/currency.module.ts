import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppSettingsEntity } from '../../core/database/entities/app-settings.entity';
import { CurrencyEntity } from '../../core/database/entities/currency.entity';
import { ExchangeRateEntity } from '../../core/database/entities/exchange-rate.entity';
import { WriteOffReasonEntity } from '../../core/database/entities/write-off-reason.entity';
import { CurrenciesController } from './currencies.controller';
import { CurrenciesService } from './currencies.service';
import { CurrencyConverterService } from './currency-converter.service';
import { ExchangeRatesController } from './exchange-rates.controller';
import { ExchangeRatesService } from './exchange-rates.service';
import { WriteOffReasonsController } from './write-off-reasons.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CurrencyEntity,
      WriteOffReasonEntity,
      ExchangeRateEntity,
      AppSettingsEntity,
    ]),
  ],
  controllers: [CurrenciesController, WriteOffReasonsController, ExchangeRatesController],
  providers: [CurrenciesService, ExchangeRatesService, CurrencyConverterService],
  exports: [CurrenciesService, CurrencyConverterService],
})
export class CurrencyModule {}
