import { ErrorCode } from '@app/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AppException } from '../common/api-exception';
import { paginate,PaginationQueryDto } from '../common/dto/pagination.dto';
import { BatchEntity } from '../entities/batch.entity';

export interface BatchFilter {
  productId?: string;
  supplierId?: string;
  expiryFrom?: string;
  expiryTo?: string;
  expired?: boolean;
}

@Injectable()
export class BatchesService {
  constructor(@InjectRepository(BatchEntity) private readonly repo: Repository<BatchEntity>) {}

  async list(q: PaginationQueryDto, f: BatchFilter) {
    const qb = this.repo.createQueryBuilder('b').orderBy('b.received_date', 'DESC').addOrderBy('b.id', 'ASC');
    if (f.productId) qb.andWhere('b.product_id = :productId', { productId: f.productId });
    if (f.supplierId) qb.andWhere('b.supplier_id = :supplierId', { supplierId: f.supplierId });
    if (f.expiryFrom) qb.andWhere('b.expiry_date >= :expiryFrom', { expiryFrom: f.expiryFrom });
    if (f.expiryTo) qb.andWhere('b.expiry_date <= :expiryTo', { expiryTo: f.expiryTo });
    if (f.expired === true) qb.andWhere('b.expiry_date IS NOT NULL AND b.expiry_date < CURRENT_DATE');
    qb.skip((q.page - 1) * q.limit).take(q.limit);
    const [items, total] = await qb.getManyAndCount();
    return paginate(items, total, q);
  }

  async getById(id: string): Promise<BatchEntity> {
    const batch = await this.repo.findOne({ where: { id } });
    if (!batch) throw new AppException(ErrorCode.NOT_FOUND, 'Batch not found');
    return batch;
  }

  /** Batches expiring within `days` (today .. today+days), excluding already-expired. */
  async expiring(days: number): Promise<BatchEntity[]> {
    return this.repo
      .createQueryBuilder('b')
      .where('b.expiry_date IS NOT NULL')
      .andWhere('b.expiry_date >= CURRENT_DATE')
      .andWhere("b.expiry_date <= (CURRENT_DATE + (:days || ' days')::interval)", { days })
      .orderBy('b.expiry_date', 'ASC')
      .getMany();
  }
}
