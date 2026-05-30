import { ErrorCode } from '@app/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AppException } from '../common/api-exception';
import { AppSettingsEntity } from '../entities/app-settings.entity';
import { ExchangeRateEntity } from '../entities/exchange-rate.entity';
import { pickRate } from './rate';

export interface ConversionResult {
  base: number;
  rateMissing: boolean;
}

@Injectable()
export class CurrencyConverterService {
  constructor(
    @InjectRepository(ExchangeRateEntity) private readonly rates: Repository<ExchangeRateEntity>,
    @InjectRepository(AppSettingsEntity) private readonly settings: Repository<AppSettingsEntity>,
  ) {}

  async baseCurrencyId(): Promise<string> {
    const s = await this.settings.findOne({ where: { id: 1 } });
    if (!s) throw new AppException(ErrorCode.NOT_FOUND, 'Settings not initialized');
    return s.baseCurrencyId;
  }

  /** Convert `amount` in `currencyId` to base currency using the rate effective on `date`. Base currency = identity. */
  async convert(
    amount: number,
    currencyId: string,
    date: string,
    baseCurrencyId: string,
  ): Promise<ConversionResult> {
    if (currencyId === baseCurrencyId) return { base: amount, rateMissing: false };
    const rows = await this.rates.find({ where: { currencyId } });
    const rate = pickRate(rows, date);
    if (rate === null) return { base: 0, rateMissing: true };
    return { base: amount * rate, rateMissing: false };
  }
}
