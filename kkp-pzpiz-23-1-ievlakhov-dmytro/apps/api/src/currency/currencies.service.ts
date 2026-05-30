import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurrencyEntity } from '../entities/currency.entity';
import { AppException } from '../common/api-exception';
import { ErrorCode } from '@app/shared';
import { PaginationQueryDto, paginate } from '../common/dto/pagination.dto';
import { CreateCurrencyDto, UpdateCurrencyDto } from './dto/currency.dto';

@Injectable()
export class CurrenciesService {
  constructor(@InjectRepository(CurrencyEntity) private readonly repo: Repository<CurrencyEntity>) {}

  async list(q: PaginationQueryDto) {
    const [items, total] = await this.repo.findAndCount({ skip: (q.page - 1) * q.limit, take: q.limit, order: { code: 'ASC' } });
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
}
