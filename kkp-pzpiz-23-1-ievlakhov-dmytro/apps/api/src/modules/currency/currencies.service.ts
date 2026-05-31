import { ErrorCode } from '@app/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AppException } from '../../core/common/api-exception';
import { paginate, PaginationQueryDto } from '../../core/common/dto/pagination.dto';
import { AppSettingsEntity } from '../../core/database/entities/app-settings.entity';
import { BatchEntity } from '../../core/database/entities/batch.entity';
import { CurrencyEntity } from '../../core/database/entities/currency.entity';
import { ExchangeRateEntity } from '../../core/database/entities/exchange-rate.entity';
import { ReceiptLineEntity } from '../../core/database/entities/receipt-line.entity';
import { CreateCurrencyDto, UpdateCurrencyDto } from './dto/currency.dto';

@Injectable()
export class CurrenciesService {
  constructor(
    @InjectRepository(CurrencyEntity) private readonly repo: Repository<CurrencyEntity>,
  ) {}

  async list(q: PaginationQueryDto) {
    const [items, total] = await this.repo.findAndCount({
      skip: (q.page - 1) * q.limit,
      take: q.limit,
      order: { code: 'ASC' },
    });
    return paginate(items, total, q);
  }

  async getById(id: string): Promise<CurrencyEntity> {
    const c = await this.repo.findOne({ where: { id } });
    if (!c) throw new AppException(ErrorCode.NOT_FOUND, 'Currency not found');
    return c;
  }

  async create(dto: CreateCurrencyDto): Promise<CurrencyEntity> {
    const code = dto.code.toUpperCase();
    if (await this.repo.findOne({ where: { code } })) {
      throw new AppException(ErrorCode.CONFLICT, 'Currency code already exists');
    }
    return this.repo.save(this.repo.create({ code, name: dto.name, symbol: dto.symbol ?? null }));
  }

  async update(id: string, dto: UpdateCurrencyDto): Promise<CurrencyEntity> {
    const c = await this.getById(id);
    Object.assign(c, dto);
    return this.repo.save(c);
  }

  async remove(id: string): Promise<void> {
    await this.getById(id);
    const m = this.repo.manager;
    const settings = await m.findOne(AppSettingsEntity, { where: {} });
    if (settings?.baseCurrencyId === id) {
      throw new AppException(ErrorCode.CONFLICT, 'Cannot delete the base currency');
    }
    const refs =
      (await m.count(BatchEntity, { where: { currencyId: id } })) +
      (await m.count(ReceiptLineEntity, { where: { currencyId: id } })) +
      (await m.count(ExchangeRateEntity, { where: { currencyId: id } }));
    if (refs > 0) {
      throw new AppException(ErrorCode.CONFLICT, 'Currency is in use and cannot be deleted');
    }
    await this.repo.delete(id);
  }
}
