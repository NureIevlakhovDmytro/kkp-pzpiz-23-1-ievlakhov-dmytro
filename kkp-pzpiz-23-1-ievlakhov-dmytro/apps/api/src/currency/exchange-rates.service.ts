import { ErrorCode } from '@app/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AppException } from '../common/api-exception';
import { paginate, PaginationQueryDto } from '../common/dto/pagination.dto';
import { ExchangeRateEntity } from '../entities/exchange-rate.entity';
import { CreateExchangeRateDto, UpdateExchangeRateDto } from './dto/exchange-rate.dto';

@Injectable()
export class ExchangeRatesService {
  constructor(
    @InjectRepository(ExchangeRateEntity) private readonly repo: Repository<ExchangeRateEntity>,
  ) {}

  async list(q: PaginationQueryDto, currencyId?: string) {
    const where = currencyId ? { currencyId } : {};
    const [items, total] = await this.repo.findAndCount({
      where,
      order: { effectiveDate: 'DESC' },
      skip: (q.page - 1) * q.limit,
      take: q.limit,
    });
    return paginate(items, total, q);
  }

  async create(dto: CreateExchangeRateDto): Promise<ExchangeRateEntity> {
    if (
      await this.repo.findOne({
        where: { currencyId: dto.currencyId, effectiveDate: dto.effectiveDate },
      })
    ) {
      throw new AppException(
        ErrorCode.CONFLICT,
        'A rate for this currency and date already exists',
      );
    }
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateExchangeRateDto): Promise<ExchangeRateEntity> {
    const rate = await this.repo.findOne({ where: { id } });
    if (!rate) throw new AppException(ErrorCode.NOT_FOUND, 'Exchange rate not found');
    Object.assign(rate, dto);
    return this.repo.save(rate);
  }

  async remove(id: string): Promise<void> {
    const rate = await this.repo.findOne({ where: { id } });
    if (!rate) throw new AppException(ErrorCode.NOT_FOUND, 'Exchange rate not found');
    await this.repo.remove(rate);
  }
}
